const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'test',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test',
});

router.post('/create-order', protect, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
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

    return res.json({ order, payment });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
});

router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { paymentId: razorpay_payment_id, status: 'paid' },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    await Booking.findByIdAndUpdate(payment.bookingId, {
      paymentStatus: 'paid',
      transactionId: razorpay_payment_id,
    });

    return res.json({ message: 'Payment verified', payment });
  } catch (error) {
    return res.status(500).json({ message: 'Payment verification failed' });
  }
});

router.get('/admin/all', protect, adminOnly, async (req, res) => {
  const payments = await Payment.find().populate('bookingId').sort({ createdAt: -1 });
  return res.json(payments);
});

module.exports = router;
