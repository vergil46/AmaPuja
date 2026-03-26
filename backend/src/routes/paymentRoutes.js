const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Pooja = require('../models/Pooja');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { alertCriticalIssue } = require('../services/monitoringService');

const router = express.Router();

const getRazorpayConfig = () => {
  const keyId = String(process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = String(process.env.RAZORPAY_KEY_SECRET || '').trim();
  return { keyId, keySecret };
};

const getRazorpayClient = () => {
  const { keyId, keySecret } = getRazorpayConfig();
  if (!keyId || !keySecret) return null;
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

const computePaymentAmount = (price, paymentOption) => {
  if (paymentOption === 'advance') return Math.round(price * 0.3);
  if (paymentOption === 'pay-after-pooja') return 0;
  return price;
};

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const normalizePhone = (value) => String(value || '').replace(/\D/g, '');

const canAccessBookingForPayment = (booking, reqUser, rawEmail, rawPhone) => {
  if (!booking) return false;

  if (reqUser?._id && booking.userId && String(booking.userId) === String(reqUser._id)) {
    return true;
  }

  const bookingEmail = normalizeEmail(booking.email);
  const bookingPhone = normalizePhone(booking.phone);

  if (reqUser) {
    const userEmail = normalizeEmail(reqUser.email);
    const userPhone = normalizePhone(reqUser.phone);
    if ((userEmail && bookingEmail === userEmail) || (userPhone && bookingPhone === userPhone)) {
      return true;
    }
  }

  const bodyEmail = normalizeEmail(rawEmail);
  const bodyPhone = normalizePhone(rawPhone);
  if ((bodyEmail && bookingEmail === bodyEmail) || (bodyPhone && bookingPhone === bodyPhone)) {
    return true;
  }

  return false;
};

const isRecentGuestBookingAllowed = async (booking, rawEmail, rawPhone) => {
  const hasIdentityInPayload = Boolean(normalizeEmail(rawEmail) || normalizePhone(rawPhone));
  if (hasIdentityInPayload) {
    return false;
  }

  const createdAtTime = new Date(booking?.createdAt || 0).getTime();
  if (!Number.isFinite(createdAtTime)) {
    return false;
  }

  const ageMs = Date.now() - createdAtTime;
  const withinGraceWindow = ageMs >= 0 && ageMs <= 30 * 60 * 1000;
  if (!withinGraceWindow) {
    return false;
  }

  const existingPaid = await Payment.exists({
    bookingId: booking._id,
    status: 'paid',
  });

  return !existingPaid;
};

const normalizeName = (value) => String(value || '').trim().toLowerCase();

const parseAmount = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const cleaned = String(value || '').replace(/[^\d.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildUnifiedAddOns = ({ selectedPackage, languagePricing, pooja }) => {
  const candidates = [
    ...(Array.isArray(selectedPackage?.addOns) ? selectedPackage.addOns : []),
    ...(Array.isArray(languagePricing?.addOns) ? languagePricing.addOns : []),
    ...(Array.isArray(pooja?.addOns) ? pooja.addOns : []),
  ];

  const byName = new Map();
  candidates.forEach((addon) => {
    const name = String(addon?.name || '').trim();
    const key = normalizeName(name);
    const price = parseAmount(addon?.price);
    if (!key) return;
    if (!byName.has(key)) {
      byName.set(key, { name, price });
    }
  });

  return Array.from(byName.values());
};

const recalculateBookingAmount = async (booking) => {
  const pooja = await Pooja.findById(booking.poojaId).lean();

  if (!pooja) {
    return {
      finalAmount: parseAmount(booking.finalAmount),
      paymentAmount: parseAmount(booking.paymentAmount),
    };
  }

  const normalizedLanguageKey = String(booking.priestPreference || '').trim().toLowerCase();

  const languagePricing =
    pooja.pricing &&
    typeof pooja.pricing === 'object' &&
    normalizedLanguageKey &&
    pooja.pricing[normalizedLanguageKey]
      ? pooja.pricing[normalizedLanguageKey]
      : null;

  const availablePackages =
    Array.isArray(languagePricing?.packages) && languagePricing.packages.length > 0
      ? languagePricing.packages
      : Array.isArray(pooja.packages)
      ? pooja.packages
      : [];

  const selectedPackage = availablePackages.find((pkg) => pkg.name === booking.package);

  if (!selectedPackage) {
    return {
      finalAmount: parseAmount(booking.finalAmount),
      paymentAmount: parseAmount(booking.paymentAmount),
    };
  }

  let finalAmount = parseAmount(selectedPackage.price);

  const availableAddOns = buildUnifiedAddOns({
    selectedPackage,
    languagePricing,
    pooja,
  });

  const selectedAddOns = Array.isArray(booking.selectedAddOns) ? booking.selectedAddOns : [];

  selectedAddOns.forEach((addonName) => {
    const addonKey = normalizeName(addonName);
    const matched = availableAddOns.find((addon) => normalizeName(addon.name) === addonKey);
    if (matched) {
      finalAmount += parseAmount(matched.price);
    }
  });

  if (!Number.isFinite(finalAmount) || finalAmount < 0) {
    finalAmount = parseAmount(booking.finalAmount);
  }

  const paymentAmount = computePaymentAmount(finalAmount, booking.paymentOption);

  return { finalAmount, paymentAmount };
};

router.post('/create-order', optionalAuth, async (req, res) => {
  try {
    const razorpay = getRazorpayClient();
    const { keyId } = getRazorpayConfig();

    if (!razorpay || !keyId) {
      return res.status(500).json({ message: 'Payment gateway is not configured on server' });
    }

    const {
      bookingId,
      finalAmount: requestedFinalAmount,
      customerEmail,
      customerPhone,
    } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const hasAccess = canAccessBookingForPayment(
      booking,
      req.user,
      customerEmail,
      customerPhone
    );

    const recentGuestAccess = hasAccess
      ? false
      : await isRecentGuestBookingAllowed(booking, customerEmail, customerPhone);

    if (!hasAccess && !recentGuestAccess) {
      return res.status(401).json({ message: 'Unauthorized payment request for this booking' });
    }

    const recalculated = await recalculateBookingAmount(booking);

    const normalizedFinalAmount = parseAmount(recalculated.finalAmount);
    const normalizedRequestedFinalAmount = parseAmount(requestedFinalAmount);
    const currentStoredFinalAmount = parseAmount(booking.finalAmount);

    const correctedFinalAmount = Math.max(
      normalizedFinalAmount,
      currentStoredFinalAmount,
      normalizedRequestedFinalAmount
    );

    const normalizedPaymentAmount = computePaymentAmount(correctedFinalAmount, booking.paymentOption);

    if (
      correctedFinalAmount !== parseAmount(booking.finalAmount) ||
      normalizedPaymentAmount !== parseAmount(booking.paymentAmount)
    ) {
      booking.finalAmount = correctedFinalAmount;
      booking.paymentAmount = normalizedPaymentAmount;
      await booking.save();
    }

    if (!['full', 'advance'].includes(booking.paymentOption)) {
      return res.status(400).json({ message: 'Only advance or full payment is supported' });
    }

    if (booking.paymentAmount <= 0) {
      return res.status(400).json({ message: 'No online payment required for this booking' });
    }

    const order = await razorpay.orders.create({
      amount: booking.paymentAmount * 100,
      currency: 'INR',
      receipt: `booking_${booking._id}`,
    });

    const payment = await Payment.create({
      bookingId,
      razorpayOrderId: order.id,
      amount: booking.paymentAmount,
      status: 'created',
    });

    return res.json({ order, payment, keyId });
  } catch (error) {
    await alertCriticalIssue({
      type: 'payment_order_creation_failed',
      title: 'Payment order creation failed',
      message: error?.message || 'Failed to create Razorpay order',
      metadata: {
        route: '/api/payments/create-order',
        bookingId: req?.body?.bookingId,
      },
      error,
    });
    return res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
});

router.post('/verify', optionalAuth, async (req, res) => {
  try {
    const { keySecret } = getRazorpayConfig();
    if (!keySecret) {
      return res.status(500).json({ message: 'Payment gateway is not configured on server' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'failed' }
      );

      await alertCriticalIssue({
        type: 'payment_verification_failed',
        title: 'Payment verification failed (signature mismatch)',
        message: 'Razorpay signature mismatch during payment verification',
        metadata: {
          route: '/api/payments/verify',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
        },
      });
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { paymentId: razorpay_payment_id, status: 'paid' },
      { new: true }
    );

    if (!payment) {
      await alertCriticalIssue({
        type: 'payment_verification_failed',
        title: 'Payment verification failed (missing record)',
        message: 'Payment record not found for verified Razorpay order',
        metadata: {
          route: '/api/payments/verify',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
        },
      });
      return res.status(404).json({ message: 'Payment record not found' });
    }

    await Booking.findByIdAndUpdate(payment.bookingId, {
      paymentStatus: 'paid',
      transactionId: razorpay_payment_id,
    });

    return res.json({ message: 'Payment verified', payment });
  } catch (error) {
    await Payment.findOneAndUpdate(
      { razorpayOrderId: req?.body?.razorpay_order_id },
      { status: 'failed' }
    );

    await alertCriticalIssue({
      type: 'payment_verification_failed',
      title: 'Payment verification failed (exception)',
      message: error?.message || 'Payment verification failed with server exception',
      metadata: {
        route: '/api/payments/verify',
        razorpayOrderId: req?.body?.razorpay_order_id,
        razorpayPaymentId: req?.body?.razorpay_payment_id,
      },
      error,
    });
    return res.status(500).json({ message: 'Payment verification failed' });
  }
});

router.get('/admin/all', protect, adminOnly, async (req, res) => {
  const payments = await Payment.find().populate('bookingId').sort({ createdAt: -1 });
  return res.json(payments);
});

module.exports = router;
