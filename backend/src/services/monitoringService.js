const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const OpsEvent = require('../models/OpsEvent');
const { sendOpsAlertEmail, sendDailyOpsSummaryEmail } = require('./emailService');

const DAILY_CHECK_MS = Number(process.env.DAILY_SUMMARY_CHECK_MS || 15 * 60 * 1000);
const DAILY_HOUR_UTC = Number(process.env.DAILY_SUMMARY_HOUR_UTC || 18);
const DAILY_MINUTE_UTC = Number(process.env.DAILY_SUMMARY_MINUTE_UTC || 0);

let dailySummaryTimer = null;
let lastSummaryDateKey = null;

const sanitizeMetadata = (metadata = {}) => {
  const safe = {};
  Object.entries(metadata || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'object') {
      safe[key] = JSON.stringify(value).slice(0, 1000);
      return;
    }
    safe[key] = String(value).slice(0, 500);
  });
  return safe;
};

const captureIfSentryEnabled = (error, context = {}) => {
  if (!process.env.SENTRY_DSN) return;

  try {
    const Sentry = require('@sentry/node');
    Sentry.captureException(error, {
      tags: context.tags || {},
      extra: context.extra || {},
    });
  } catch (captureError) {
    console.error('Sentry capture failed:', captureError?.message || captureError);
  }
};

const alertCriticalIssue = async ({ type, title, message, metadata = {}, error = null }) => {
  const safeMetadata = sanitizeMetadata(metadata);

  try {
    await OpsEvent.create({
      type: String(type || 'unknown_issue'),
      severity: 'critical',
      message: String(message || title || 'Critical issue detected'),
      metadata: safeMetadata,
    });
  } catch (opsEventError) {
    console.error('Failed to persist ops event:', opsEventError);
  }

  if (error) {
    captureIfSentryEnabled(error, {
      tags: { opsType: String(type || 'unknown_issue') },
      extra: safeMetadata,
    });
  }

  await sendOpsAlertEmail({
    title: String(title || 'Critical business alert'),
    message: String(message || 'Critical issue detected'),
    metadata: safeMetadata,
  });
};

const getLast24HoursRange = () => {
  const end = new Date();
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  return { start, end };
};

const buildDailySummary = async () => {
  const { start, end } = getLast24HoursRange();
  const dateFilter = { createdAt: { $gte: start, $lte: end } };

  const [
    totalBookings,
    paymentPaid,
    paymentFailed,
    bookingCreateFailed,
    paymentVerificationFailed,
    emailSendFailed,
  ] = await Promise.all([
    Booking.countDocuments(dateFilter),
    Payment.countDocuments({ ...dateFilter, status: 'paid' }),
    Payment.countDocuments({ ...dateFilter, status: 'failed' }),
    OpsEvent.countDocuments({ ...dateFilter, type: 'booking_create_failed' }),
    OpsEvent.countDocuments({ ...dateFilter, type: 'payment_verification_failed' }),
    OpsEvent.countDocuments({ ...dateFilter, type: 'email_send_failed' }),
  ]);

  const failedAttempts = bookingCreateFailed + paymentVerificationFailed + emailSendFailed;

  return {
    dateLabel: new Date().toISOString().slice(0, 10),
    windowStart: start.toISOString(),
    windowEnd: end.toISOString(),
    totalBookings,
    paymentPaid,
    paymentFailed,
    failedAttempts,
    breakdown: {
      bookingCreateFailed,
      paymentVerificationFailed,
      emailSendFailed,
    },
  };
};

const sendDailyBusinessSummary = async () => {
  try {
    const summary = await buildDailySummary();
    await sendDailyOpsSummaryEmail(summary);
  } catch (error) {
    console.error('Failed to send daily business summary:', error);
    captureIfSentryEnabled(error, { tags: { feature: 'daily_summary' } });
  }
};

const shouldSendNow = () => {
  const now = new Date();
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();
  const currentDateKey = now.toISOString().slice(0, 10);

  if (lastSummaryDateKey === currentDateKey) return false;
  if (currentHour < DAILY_HOUR_UTC) return false;
  if (currentHour === DAILY_HOUR_UTC && currentMinute < DAILY_MINUTE_UTC) return false;

  return true;
};

const startDailyBusinessSummaryJob = () => {
  if (dailySummaryTimer) return;

  dailySummaryTimer = setInterval(async () => {
    if (!process.env.ADMIN_ALERT_EMAIL && !process.env.SMTP_USER) return;
    if (!shouldSendNow()) return;

    const currentDateKey = new Date().toISOString().slice(0, 10);
    await sendDailyBusinessSummary();
    lastSummaryDateKey = currentDateKey;
  }, DAILY_CHECK_MS);
};

const getApiHealthStatus = () => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbStateCode = mongoose.connection.readyState;
  const dbState = dbStates[dbStateCode] || 'unknown';

  return {
    status: dbState === 'connected' ? 'ok' : 'degraded',
    app: 'Ama Puja API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    db: dbState,
    env: process.env.NODE_ENV || 'development',
  };
};

module.exports = {
  alertCriticalIssue,
  captureIfSentryEnabled,
  sendDailyBusinessSummary,
  startDailyBusinessSummaryJob,
  getApiHealthStatus,
};
