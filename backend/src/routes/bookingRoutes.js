const express = require('express');
const Booking = require('../models/Booking');
const Pooja = require('../models/Pooja');
const { protect, adminOnly } = require('../middleware/auth');
const { sendBookingConfirmationEmail } = require('../services/emailService');
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

router.post('/', async (req, res) => {
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

    if (!['full', 'advance', 'pay-after-pooja'].includes(paymentOption)) {
      return res.status(400).json({ message: 'Invalid payment option selected' });
    }

    const paymentAmount = computePaymentAmount(selectedPackage.price, paymentOption);

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
      paymentAmount,
      paymentStatus: paymentOption === 'pay-after-pooja' ? 'manual-pending' : 'pending',
    };
    // If user is logged in, associate userId
    if (req.user && req.user._id) {
      bookingData.userId = req.user._id;
    }
    const booking = await Booking.create(bookingData);

    // Send booking confirmation notifications (non-blocking)
    sendBookingCreatedNotifications({ booking, pooja }).then((result) => {
      if (result.emailSent) {
        console.log(`✅ Booking confirmation email sent to ${email}`);
      } else {
        console.warn(`⚠️ Could not send booking confirmation email to ${email}`);
      }

      if (result.smsSent) {
        console.log(`✅ Booking confirmation SMS sent to ${booking.phone}`);
      } else {
        console.warn(`⚠️ Could not send booking confirmation SMS to ${booking.phone}`);
      }

      if (result.whatsappSent) {
        console.log(`✅ Booking confirmation WhatsApp sent to ${booking.phone}`);
      } else {
        console.warn(`⚠️ Could not send booking confirmation WhatsApp to ${booking.phone}`);
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
  try {
    const { bookingStatus } = req.body;
    const booking = await Booking.findById(req.params.id).populate('poojaId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const previousStatus = booking.bookingStatus;
    booking.bookingStatus = bookingStatus;
    await booking.save();

    if (bookingStatus === 'confirmed') {
      sendBookingConfirmationEmail(booking, booking.poojaId).then((sent) => {
        if (sent) {
          console.log(`✅ Status update confirmation email sent to ${booking.email}`);
        }
      });
    }

    if (previousStatus !== 'completed' && bookingStatus === 'completed') {
      sendCompletionReviewNotifications({ booking, pooja: booking.poojaId }).then((result) => {
        if (result.emailSent) {
          console.log(`✅ Review request email sent to ${booking.email}`);
        } else {
          console.warn(`⚠️ Could not send review request email to ${booking.email}`);
        }

        if (result.smsSent) {
          console.log(`✅ Review request SMS sent to ${booking.phone}`);
        } else {
          console.warn(`⚠️ Could not send review request SMS to ${booking.phone}`);
        }

        if (result.whatsappSent) {
          console.log(`✅ Review request WhatsApp sent to ${booking.phone}`);
        } else {
          console.warn(`⚠️ Could not send review request WhatsApp to ${booking.phone}`);
        }
      }).catch((notifyError) => {
        console.error('❌ Review notification workflow failed:', notifyError.message || notifyError);
      });
    }

    return res.json(booking);
  } catch (error) {
    console.error('Update booking status error:', error);
    return res.status(500).json({ message: error.message || 'Failed to update booking status' });
  }
});

router.post('/:id/resend-review', protect, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('poojaId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.bookingStatus !== 'completed') {
      return res.status(400).json({ message: 'Review request can only be sent for completed bookings' });
    }

    const result = await sendCompletionReviewNotifications({ booking, pooja: booking.poojaId });

    return res.json({
      message: 'Review request sent',
      channels: result,
    });
  } catch (error) {
    console.error('Resend review request error:', error);
    return res.status(500).json({ message: error.message || 'Failed to resend review request' });
  }
});

module.exports = router;
