const express = require('express');
const FunnelEvent = require('../models/FunnelEvent');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const ALLOWED_EVENTS = new Set([
  'service_view',
  'form_started',
  'booking_submitted',
  'payment_success',
  'payment_failed',
]);

const getRangeDateFilter = (range) => {
  const normalized = String(range || '30d').toLowerCase();
  const now = Date.now();

  if (normalized === '7d') {
    return { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
  }

  if (normalized === 'all') {
    return {};
  }

  return { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
};

router.post('/track', async (req, res) => {
  try {
    const { eventName, sessionId, route, poojaId, metadata } = req.body || {};

    if (!ALLOWED_EVENTS.has(String(eventName || ''))) {
      return res.status(400).json({ message: 'Invalid event name' });
    }

    await FunnelEvent.create({
      eventName,
      sessionId: String(sessionId || '').trim().slice(0, 120),
      route: String(route || '').trim().slice(0, 200),
      poojaId: poojaId || undefined,
      metadata: metadata && typeof metadata === 'object' ? metadata : {},
    });

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Track funnel event error:', error);
    return res.status(500).json({ message: 'Failed to track event' });
  }
});

router.get('/admin/funnel', protect, adminOnly, async (req, res) => {
  const filter = getRangeDateFilter(req.query.range);

  const rows = await FunnelEvent.aggregate([
    ...(Object.keys(filter).length > 0 ? [{ $match: filter }] : []),
    {
      $group: {
        _id: '$eventName',
        total: { $sum: 1 },
      },
    },
  ]);

  const counts = rows.reduce(
    (acc, item) => {
      const key = String(item?._id || '');
      if (key in acc) {
        acc[key] = Number(item?.total || 0);
      }
      return acc;
    },
    {
      service_view: 0,
      form_started: 0,
      booking_submitted: 0,
      payment_success: 0,
      payment_failed: 0,
    }
  );

  const formToBooking = counts.form_started > 0 ? Number(((counts.booking_submitted / counts.form_started) * 100).toFixed(1)) : 0;
  const bookingToPayment = counts.booking_submitted > 0 ? Number(((counts.payment_success / counts.booking_submitted) * 100).toFixed(1)) : 0;

  return res.json({
    range: String(req.query.range || '30d').toLowerCase(),
    counts,
    rates: {
      formToBooking,
      bookingToPayment,
    },
  });
});

router.get('/admin/funnel-diagnostics', protect, adminOnly, async (req, res) => {
  const filter = getRangeDateFilter(req.query.range);
  const range = String(req.query.range || '30d').toLowerCase();

  const matchStage = Object.keys(filter).length > 0 ? [{ $match: filter }] : [];

  const [
    summaryRows,
    paymentFailureRows,
    recentFailures,
  ] = await Promise.all([
    FunnelEvent.aggregate([
      ...matchStage,
      {
        $group: {
          _id: '$eventName',
          total: { $sum: 1 },
        },
      },
    ]),
    FunnelEvent.aggregate([
      ...matchStage,
      { $match: { eventName: 'payment_failed' } },
      {
        $group: {
          _id: {
            $ifNull: ['$metadata.reason', 'unknown'],
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]),
    FunnelEvent.find({
      ...(Object.keys(filter).length > 0 ? filter : {}),
      eventName: 'payment_failed',
    })
      .select('sessionId route poojaId metadata createdAt')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
  ]);

  const summary = summaryRows.reduce(
    (acc, row) => {
      const key = String(row?._id || '');
      if (key in acc) {
        acc[key] = Number(row?.total || 0);
      }
      return acc;
    },
    {
      service_view: 0,
      form_started: 0,
      booking_submitted: 0,
      payment_success: 0,
      payment_failed: 0,
    }
  );

  const paymentFailureByReason = paymentFailureRows.map((row) => ({
    reason: String(row?._id || 'unknown'),
    total: Number(row?.total || 0),
  }));

  const paymentFailureRate = summary.booking_submitted > 0
    ? Number(((summary.payment_failed / summary.booking_submitted) * 100).toFixed(1))
    : 0;

  return res.json({
    range,
    summary,
    paymentFailureRate,
    paymentFailureByReason,
    recentFailures,
  });
});

module.exports = router;
