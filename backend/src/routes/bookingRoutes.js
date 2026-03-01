const express = require('express');
const Booking = require('../models/Booking');
const Pooja = require('../models/Pooja');
const { protect, adminOnly } = require('../middleware/auth');
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

/**
 * CREATE BOOKING
 */
router.post('/', async (req, res) => {
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
      specialNotes,
      paymentOption,
      selectedAddOns = [],
    } = req.body;

    if (
      !poojaId ||
      !packageName ||
      !name ||
      !phone ||
      !email ||
      !city ||
      !date ||
      !address
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

    const selectedPackage = pooja.packages.find(
      (pkg) => pkg.name === packageName
    );

    if (!selectedPackage) {
      return res.status(400).json({ message: 'Invalid package selected' });
    }

    let baseAmount = Number(selectedPackage.price || 0);

    if (Array.isArray(selectedAddOns) && selectedAddOns.length > 0 && Array.isArray(pooja.addOns)) {
      selectedAddOns.forEach((addonName) => {
        const addon = pooja.addOns.find((item) => item.name === addonName);
        if (addon) {
          baseAmount += Number(addon.price || 0);
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
      city,
      priestPreference,
      date,
      time,
      address,
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
  const bookings = await Booking.find({ userId: req.user._id })
    .populate('poojaId')
    .sort({ createdAt: -1 });

  return res.json(bookings);
});

/**
 * ADMIN: GET ALL BOOKINGS
 */
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  const bookings = await Booking.find()
    .populate('poojaId userId', 'title name email')
    .sort({ createdAt: -1 });

  return res.json(bookings);
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

  return res.json(bookings);
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