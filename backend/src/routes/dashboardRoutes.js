const express = require('express');
const Booking = require('../models/Booking');
const Enquiry = require('../models/Enquiry');
const Payment = require('../models/Payment');
const FunnelEvent = require('../models/FunnelEvent');
const { protect, adminOnly } = require('../middleware/auth');
const { sendTestTwilioNotifications } = require('../services/notificationService');

const router = express.Router();

router.post('/admin/test-twilio', protect, adminOnly, async (req, res) => {
  try {
    const to = String(req.body?.to || '').trim();
    const body = String(req.body?.body || '').trim();
    const contentSid = String(req.body?.contentSid || '').trim();
    const contentVariables = req.body?.contentVariables;

    if (!to) {
      return res.status(400).json({ message: 'Field "to" is required' });
    }

    const result = await sendTestTwilioNotifications({
      to,
      body,
      contentSid,
      contentVariables,
    });
    return res.json(result);
  } catch (error) {
    console.error('Twilio admin test failed:', error);
    return res.status(500).json({ message: 'Twilio test failed' });
  }
});

router.get('/admin/stats', protect, adminOnly, async (req, res) => {
  const requestedRange = String(req.query.range || 'all').toLowerCase();
  const allowedRanges = new Set(['7d', '30d', 'all']);
  const range = allowedRanges.has(requestedRange) ? requestedRange : 'all';

  const now = new Date();
  let fromDate = null;
  if (range === '7d') {
    fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (range === '30d') {
    fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const createdAtFilter = fromDate ? { createdAt: { $gte: fromDate } } : {};
  const hasCreatedAtFilter = Object.keys(createdAtFilter).length > 0;

  const bookingPipelinePrefix = hasCreatedAtFilter ? [{ $match: createdAtFilter }] : [];
  const paymentMatchFilter = {
    status: 'paid',
    ...(hasCreatedAtFilter ? createdAtFilter : {}),
  };
  const payAfterRevenueMatchFilter = {
    paymentOption: 'pay-after-pooja',
    bookingStatus: 'completed',
    ...(hasCreatedAtFilter ? createdAtFilter : {}),
  };

  const [
    totalBookings,
    totalEnquiries,
    totalPayments,
    revenueResult,
    payAfterRevenueResult,
    topServicesResult,
    bookingStatusBreakdown,
    funnelBreakdown,
  ] = await Promise.all([
    Booking.countDocuments(createdAtFilter),
    Enquiry.countDocuments(createdAtFilter),
    Payment.countDocuments(createdAtFilter),
    Payment.aggregate([{ $match: paymentMatchFilter }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Booking.aggregate([{ $match: payAfterRevenueMatchFilter }, { $group: { _id: null, total: { $sum: '$finalAmount' } } }]),
    Booking.aggregate([
      ...bookingPipelinePrefix,
      {
        $group: {
          _id: '$poojaId',
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: 'poojas',
          localField: '_id',
          foreignField: '_id',
          as: 'pooja',
        },
      },
      {
        $project: {
          _id: 0,
          service: {
            $ifNull: [{ $arrayElemAt: ['$pooja.title', 0] }, 'Unknown Service'],
          },
          total: 1,
        },
      },
    ]),
    Booking.aggregate([
      ...bookingPipelinePrefix,
      {
        $group: {
          _id: '$bookingStatus',
          total: { $sum: 1 },
        },
      },
    ]),
    FunnelEvent.aggregate([
      ...(hasCreatedAtFilter ? [{ $match: createdAtFilter }] : []),
      {
        $group: {
          _id: '$eventName',
          total: { $sum: 1 },
        },
      },
    ]),
  ]);

  const conversionRate = totalEnquiries > 0
    ? Number(((totalBookings / totalEnquiries) * 100).toFixed(1))
    : 0;

  const statusTotals = bookingStatusBreakdown.reduce(
    (accumulator, item) => {
      const key = String(item?._id || 'pending').toLowerCase();
      if (key === 'confirmed' || key === 'completed' || key === 'cancelled') {
        accumulator[key] += Number(item?.total || 0);
      } else {
        accumulator.pending += Number(item?.total || 0);
      }
      return accumulator;
    },
    { pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
  );

  const dropOffCandidates = [
    {
      stage: 'Requested → Confirmed',
      dropped: Math.max(statusTotals.pending + statusTotals.cancelled, 0),
    },
    {
      stage: 'Confirmed → Completed',
      dropped: Math.max(statusTotals.confirmed, 0),
    },
  ];

  const dropOffStage = dropOffCandidates.sort((left, right) => right.dropped - left.dropped)[0] || {
    stage: 'Requested → Confirmed',
    dropped: 0,
  };

  const funnel = funnelBreakdown.reduce(
    (accumulator, item) => {
      const key = String(item?._id || '');
      if (key in accumulator) {
        accumulator[key] = Number(item?.total || 0);
      }
      return accumulator;
    },
    {
      service_view: 0,
      form_started: 0,
      booking_submitted: 0,
      payment_success: 0,
      payment_failed: 0,
    }
  );

  const funnelRates = {
    formToBooking: funnel.form_started > 0
      ? Number(((funnel.booking_submitted / funnel.form_started) * 100).toFixed(1))
      : 0,
    bookingToPayment: funnel.booking_submitted > 0
      ? Number(((funnel.payment_success / funnel.booking_submitted) * 100).toFixed(1))
      : 0,
  };

  const onlineRevenue = Number(revenueResult[0]?.total || 0);
  const payAfterRevenue = Number(payAfterRevenueResult[0]?.total || 0);
  const totalRevenue = onlineRevenue + payAfterRevenue;

  return res.json({
    totalBookings,
    totalEnquiries,
    totalPayments,
    revenue: totalRevenue,
    revenueBreakdown: {
      onlinePaid: onlineRevenue,
      payAfterCompleted: payAfterRevenue,
    },
    conversionRate,
    topServices: topServicesResult,
    dropOffStage,
    range,
    funnel,
    funnelRates,
  });
});

module.exports = router;
