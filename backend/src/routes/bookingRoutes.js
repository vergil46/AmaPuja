const express = require('express');
const Booking = require('../models/Booking');
const Pooja = require('../models/Pooja');
const { protect, adminOnly } = require('../middleware/auth');
const { sendBookingConfirmationEmail } = require('../services/emailService');

const router = express.Router();

const computePaymentAmount = (price, paymentOption) => {
  if (paymentOption === 'advance-20') return Math.round(price * 0.2);
  if (paymentOption === 'advance-30') return Math.round(price * 0.3);
  if (paymentOption === 'pay-after-pooja') return 0;
  return price;
};

router.post('/', protect, async (req, res) => {
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
    } = req.body;

    const pooja = await Pooja.findById(poojaId);
    if (!pooja) {
      return res.status(404).json({ message: 'Pooja not found' });
    }

    const selectedPackage = pooja.packages.find((item) => item.name === packageName);
    if (!selectedPackage) {
      return res.status(400).json({ message: 'Invalid package selected' });
    }

    const paymentAmount = computePaymentAmount(selectedPackage.price, paymentOption);

    const booking = await Booking.create({
      userId: req.user._id,
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
      paymentAmount,
      paymentStatus: paymentOption === 'pay-after-pooja' ? 'manual-pending' : 'pending',
    });

    // Send booking confirmation email (non-blocking)
    sendBookingConfirmationEmail(booking, pooja, req.user).then((sent) => {
      if (sent) {
        console.log(`✅ Booking confirmation email sent to ${email}`);
      } else {
        console.warn(`⚠️ Could not send booking confirmation email to ${email}`);
      }
    });

    return res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({ message: error.message || 'Failed to create booking' });
  }
});

router.get('/my', protect, async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id }).populate('poojaId').sort({ createdAt: -1 });
  return res.json(bookings);
});

router.get('/admin/all', protect, adminOnly, async (req, res) => {
  const bookings = await Booking.find().populate('poojaId userId', 'title name email').sort({ createdAt: -1 });
  return res.json(bookings);
});

router.get('/admin/recent', protect, adminOnly, async (req, res) => {
  const limit = Number(req.query.limit || 10);
  const safeLimit = Number.isNaN(limit) ? 10 : Math.min(Math.max(limit, 1), 50);

  const bookings = await Booking.find()
    .populate('poojaId userId', 'title name email')
    .sort({ createdAt: -1 })
    .limit(safeLimit);

  return res.json(bookings);
});

router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  const { bookingStatus } = req.body;
  const booking = await Booking.findByIdAndUpdate(req.params.id, { bookingStatus }, { new: true }).populate('poojaId');

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  if (bookingStatus === 'confirmed') {
    sendBookingConfirmationEmail(booking, booking.poojaId).then((sent) => {
      if (sent) {
        console.log(`✅ Status update confirmation email sent to ${booking.email}`);
      }
    });
  }

  return res.json(booking);
});

module.exports = router;
