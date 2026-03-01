const express = require('express');
const Booking = require('../models/Booking');
const Enquiry = require('../models/Enquiry');
const Payment = require('../models/Payment');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/admin/stats', protect, adminOnly, async (req, res) => {
  const [totalBookings, totalEnquiries, totalPayments, revenueResult] = await Promise.all([
    Booking.countDocuments(),
    Enquiry.countDocuments(),
    Payment.countDocuments(),
    Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);

  return res.json({
    totalBookings,
    totalEnquiries,
    totalPayments,
    revenue: revenueResult[0]?.total || 0,
  });
});

module.exports = router;
