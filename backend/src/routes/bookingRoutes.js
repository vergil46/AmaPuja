const express = require('express');
const Booking = require('../models/Booking');
const Pooja = require('../models/Pooja');
const User = require('../models/User');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const {
  sendBookingCreatedNotifications,
  sendCompletionReviewNotifications,
} = require('../services/notificationService');

const router = express.Router();

const computePaymentAmount = (price, paymentOption) => {
  if (paymentOption === 'advance') return Math.round(price * 0.3);
  if (paymentOption === 'pay-after-pooja') return 0;
  return price;
};

const normalizeName = (value) => String(value || '').trim().toLowerCase();

const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const normalizePhone = (value) => String(value || '').replace(/\D/g, '');

const parseAmount = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const cleaned = String(value || '').replace(/[^\d.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const composeAddress = (addressDetails = {}) => {
  return [
    addressDetails.house,
    addressDetails.street,
    addressDetails.city,
    addressDetails.state,
    addressDetails.pincode,
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(', ');
};

const formatDateForPanditMessage = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return 'N/A';

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const buildPanditWhatsAppMessage = (booking) => {
  const poojaName = String(booking?.poojaId?.title || 'Pooja Service').trim();
  const bookingId = String(booking?._id || '').trim();
  const customerName = String(booking?.name || '').trim() || 'N/A';
  const customerPhone = String(booking?.phone || '').trim() || 'N/A';
  const poojaDate = formatDateForPanditMessage(booking?.date);
  const poojaTime = String(booking?.time || '').trim() || 'N/A';

  const addressFromParts = composeAddress(booking?.addressDetails || {});
  const location =
    String(booking?.address || '').trim() ||
    String(booking?.addressDetails?.formattedAddress || '').trim() ||
    addressFromParts ||
    'N/A';

  const selectedPackage = String(booking?.package || '').trim() || 'N/A';
  const addOns =
    Array.isArray(booking?.selectedAddOns) && booking.selectedAddOns.length > 0
      ? booking.selectedAddOns.filter(Boolean).join(', ')
      : 'None';
  const specialNotes = String(booking?.specialNotes || '').trim();

  const lines = [
    '📿 New Puja Booking',
    '',
    `Booking ID: ${bookingId}`,
    '',
    `Puja: ${poojaName}`,
    `Date: ${poojaDate}`,
    `Time: ${poojaTime}`,
    '',
    `Customer Name: ${customerName}`,
    `Phone: ${customerPhone}`,
    `Location: ${location}`,
    '',
    `Package: ${selectedPackage}`,
    `Add-ons: ${addOns}`,
  ];

  if (specialNotes) {
    lines.push(`Special Notes: ${specialNotes}`);
  }

  lines.push('', 'Please confirm your availability for this booking.', 'Thank you 🙏');

  return lines.join('\n');
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

const withBookingDefaults = (bookingDoc) => {
  const booking = typeof bookingDoc?.toObject === 'function' ? bookingDoc.toObject() : bookingDoc;
  return {
    ...booking,
    bookingStatus: booking?.bookingStatus || 'pending',
    paymentStatus: booking?.paymentStatus || 'pending',
    selectedAddOns: Array.isArray(booking?.selectedAddOns) ? booking.selectedAddOns : [],
  };
};

/**
 * CREATE BOOKING
 */
router.post('/', optionalAuth, async (req, res) => {
  console.log('REQ BODY:', req.body);

  try {
    const {
      poojaId,
      package: packageName,
      name,
      phone,
      email,
      city,
      priestPreference,
      date,
      time,
      address,
      addressDetails = {},
      coordinates = {},
      specialNotes,
      paymentOption,
      selectedAddOns = [],
    } = req.body;

    const resolvedAddressDetails = {
      house: String(addressDetails?.house || '').trim(),
      street: String(addressDetails?.street || '').trim(),
      city: String(addressDetails?.city || city || '').trim(),
      state: String(addressDetails?.state || '').trim(),
      pincode: String(addressDetails?.pincode || '').trim(),
      formattedAddress: String(addressDetails?.formattedAddress || '').trim(),
    };

    const composedAddress = composeAddress(resolvedAddressDetails);
    const resolvedAddress =
      String(address || '').trim() ||
      resolvedAddressDetails.formattedAddress ||
      composedAddress;

    const resolvedCity =
      String(city || '').trim() ||
      resolvedAddressDetails.city;

    const latitude = Number(coordinates?.latitude);
    const longitude = Number(coordinates?.longitude);

    const resolvedCoordinates = {
      latitude: Number.isFinite(latitude) ? latitude : null,
      longitude: Number.isFinite(longitude) ? longitude : null,
    };

    if (!resolvedAddressDetails.formattedAddress) {
      resolvedAddressDetails.formattedAddress = resolvedAddress;
    }

    if (
      !poojaId ||
      !packageName ||
      !name ||
      !phone ||
      !email ||
      !resolvedCity ||
      !date ||
      !resolvedAddress
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const pooja = await Pooja.findById(poojaId);
    if (!pooja) {
      return res.status(404).json({ message: 'Pooja not found' });
    }

    if (!['full', 'advance', 'pay-after-pooja'].includes(paymentOption)) {
      return res.status(400).json({ message: 'Invalid payment option selected' });
    }

    const normalizedLanguageKey = String(priestPreference || '').trim().toLowerCase();
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
        : pooja.packages;

    const selectedPackage = availablePackages.find(
      (pkg) => pkg.name === packageName
    );

    if (!selectedPackage) {
      return res.status(400).json({ message: 'Invalid package selected' });
    }

    let baseAmount = parseAmount(selectedPackage.price);

    const availableAddOns = buildUnifiedAddOns({
      selectedPackage,
      languagePricing,
      pooja,
    });

    if (Array.isArray(selectedAddOns) && selectedAddOns.length > 0 && availableAddOns.length > 0) {
      selectedAddOns.forEach((addonName) => {
        const addonKey = normalizeName(addonName);
        const addon = availableAddOns.find((item) => normalizeName(item.name) === addonKey);
        if (addon) {
          baseAmount += parseAmount(addon.price);
        }
      });
    }

    if (!baseAmount || isNaN(baseAmount) || baseAmount <= 0) {
      return res.status(400).json({ message: 'Invalid final amount calculated' });
    }

    const paymentAmount = computePaymentAmount(baseAmount, paymentOption);

    const bookingData = {
      poojaId,
      package: packageName,
      name,
      phone,
      email,
      city: resolvedCity,
      priestPreference,
      date,
      time,
      address: resolvedAddress,
      addressDetails: resolvedAddressDetails,
      coordinates: resolvedCoordinates,
      specialNotes,
      paymentOption,
      finalAmount: baseAmount,
      paymentAmount,
      selectedAddOns,
      paymentStatus:
        paymentOption === 'pay-after-pooja'
          ? 'manual-pending'
          : 'pending',
    };

    if (req.user && req.user._id) {
      bookingData.userId = req.user._id;
    } else {
      const emailToMatch = normalizeEmail(email);
      if (emailToMatch) {
        const existingUser = await User.findOne({
          email: new RegExp(`^${escapeRegex(emailToMatch)}$`, 'i'),
        }).select('_id');

        if (existingUser?._id) {
          bookingData.userId = existingUser._id;
        }
      }
    }

    const booking = await Booking.create(bookingData);

    // Send notifications (non-blocking)
    sendBookingCreatedNotifications({ booking, pooja })
      .then((result) => {
        console.log('Notification result:', result);
      })
      .catch((err) => {
        console.error('Notification error:', err);
      });

    return res.status(201).json(booking);

  } catch (error) {
    console.error('Create booking error:', error);
    return res
      .status(500)
      .json({ message: error.message || 'Failed to create booking' });
  }
});

/**
 * GET MY BOOKINGS
 */
router.get('/my', protect, async (req, res) => {
  const normalizedUserEmail = normalizeEmail(req.user.email);
  const normalizedUserPhone = normalizePhone(req.user.phone);

  const linkedBookings = await Booking.find({ userId: req.user._id })
    .populate('poojaId')
    .sort({ createdAt: -1 });

  const legacyCandidates = await Booking.find({
    $or: [{ userId: { $exists: false } }, { userId: null }],
  })
    .populate('poojaId')
    .sort({ createdAt: -1 });

  const recoveredLegacyBookings = legacyCandidates.filter((booking) => {
    const bookingEmail = normalizeEmail(booking.email);
    const bookingPhone = normalizePhone(booking.phone);
    return (
      (normalizedUserEmail && bookingEmail === normalizedUserEmail) ||
      (normalizedUserPhone && bookingPhone && bookingPhone === normalizedUserPhone)
    );
  });

  const bookingsMap = new Map();
  [...linkedBookings, ...recoveredLegacyBookings].forEach((booking) => {
    bookingsMap.set(String(booking._id), booking);
  });

  const bookings = Array.from(bookingsMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const unlinkedBookingIds = bookings
    .filter((booking) => !booking.userId)
    .map((booking) => booking._id);

  if (unlinkedBookingIds.length > 0) {
    await Booking.updateMany(
      { _id: { $in: unlinkedBookingIds } },
      { $set: { userId: req.user._id } }
    );
  }

  return res.json(bookings.map(withBookingDefaults));
});

/**
 * USER: CANCEL OWN BOOKING
 */
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isOwnerById = booking.userId && String(booking.userId) === String(req.user._id);
    const isOwnerByEmail = normalizeEmail(booking.email) === normalizeEmail(req.user.email);
    const isOwnerByPhone =
      normalizePhone(req.user.phone) &&
      normalizePhone(booking.phone) === normalizePhone(req.user.phone);

    if (!isOwnerById && !isOwnerByEmail && !isOwnerByPhone) {
      return res.status(403).json({ message: 'You can only cancel your own booking' });
    }

    const currentStatus = String(booking.bookingStatus || 'pending').toLowerCase();
    if (currentStatus === 'completed') {
      return res.status(400).json({ message: 'Completed booking cannot be cancelled' });
    }

    if (currentStatus === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    booking.bookingStatus = 'cancelled';
    await booking.save();

    return res.json(withBookingDefaults(booking));
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res
      .status(500)
      .json({ message: error.message || 'Failed to cancel booking' });
  }
});

/**
 * ADMIN: GET ALL BOOKINGS
 */
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  const bookings = await Booking.find()
    .populate('poojaId userId', 'title name email')
    .sort({ createdAt: -1 });

  return res.json(bookings.map(withBookingDefaults));
});

/**
 * ADMIN: GET RECENT BOOKINGS
 */
router.get('/admin/recent', protect, adminOnly, async (req, res) => {
  const limit = Number(req.query.limit || 10);
  const safeLimit = Number.isNaN(limit)
    ? 10
    : Math.min(Math.max(limit, 1), 50);

  const bookings = await Booking.find()
    .populate('poojaId userId', 'title name email')
    .sort({ createdAt: -1 })
    .limit(safeLimit);

  return res.json(bookings.map(withBookingDefaults));
});

/**
 * ADMIN: UPDATE BOOKING STATUS
 */
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { bookingStatus } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('poojaId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.bookingStatus = bookingStatus;
    await booking.save();

    return res.json(booking);

  } catch (error) {
    console.error('Update booking status error:', error);
    return res
      .status(500)
      .json({ message: error.message || 'Failed to update booking status' });
  }
});

/**
 * ADMIN: GET PANDIT WHATSAPP MESSAGE
 */
router.get('/:id/pandit-message', protect, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('poojaId', 'title');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const message = buildPanditWhatsAppMessage(booking);

    return res.json({
      bookingId: String(booking._id),
      message,
      whatsappShareUrl: `https://wa.me/?text=${encodeURIComponent(message)}`,
    });
  } catch (error) {
    console.error('Get pandit message error:', error);
    return res
      .status(500)
      .json({ message: error.message || 'Failed to generate pandit message' });
  }
});

/**
 * ADMIN: RESEND REVIEW REQUEST
 */
router.post('/:id/resend-review', protect, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('poojaId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.bookingStatus !== 'completed') {
      return res.status(400).json({
        message: 'Review request can only be sent for completed bookings',
      });
    }

    const result = await sendCompletionReviewNotifications({
      booking,
      pooja: booking.poojaId,
    });

    return res.json({
      message: 'Review request sent',
      channels: result,
    });

  } catch (error) {
    console.error('Resend review request error:', error);
    return res
      .status(500)
      .json({ message: error.message || 'Failed to resend review request' });
  }
});

module.exports = router;