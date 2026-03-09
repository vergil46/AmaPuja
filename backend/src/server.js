const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const Sentry = require('@sentry/node');

const envFilePath = path.resolve(__dirname, '../.env');
dotenv.config({
  path: envFilePath,
  quiet: process.env.NODE_ENV === 'production',
});
if (process.env.NODE_ENV !== 'production') {
  console.log(`Loading environment variables from: ${envFilePath}`);
}

const connectDB = require('./config/db');
const seedPoojas = require('./utils/seedPoojas');
const { getApiHealthStatus, startDailyBusinessSummaryJob, captureIfSentryEnabled } = require('./services/monitoringService');

const authRoutes = require('./routes/authRoutes');
const poojaRoutes = require('./routes/poojaRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

connectDB().then(seedPoojas);

const app = express();

const normalizeOrigin = (value) => String(value || '').trim().replace(/\/+$/, '');

const isIPv4Host = (hostname) => /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);

const buildAllowedConfiguredOrigins = (origins) => {
  const allowedOrigins = new Set();

  origins.forEach((origin) => {
    const normalized = normalizeOrigin(origin);
    if (!normalized) {
      return;
    }

    allowedOrigins.add(normalized);

    try {
      const parsed = new URL(normalized);
      const { protocol, hostname, port } = parsed;
      const canAddWwwVariant = hostname.includes('.') && hostname !== 'localhost' && !isIPv4Host(hostname) && !port;

      if (!canAddWwwVariant) {
        return;
      }

      if (hostname.startsWith('www.')) {
        allowedOrigins.add(`${protocol}//${hostname.slice(4)}`);
      } else {
        allowedOrigins.add(`${protocol}//www.${hostname}`);
      }
    } catch {
      // Ignore invalid CLIENT_URL/CLIENT_URLS entries and keep strict CORS behavior.
    }
  });

  return allowedOrigins;
};

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.2),
  });
  app.use(Sentry.Handlers.requestHandler());
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const configuredClientUrl = process.env.CLIENT_URL;
      const configuredClientUrls = process.env.CLIENT_URLS
        ? process.env.CLIENT_URLS.split(',').map((value) => value.trim()).filter(Boolean)
        : [];
      const configuredOrigins = [configuredClientUrl, ...configuredClientUrls].filter(Boolean);
      const allowedConfiguredOrigins = buildAllowedConfiguredOrigins(configuredOrigins);

      const normalizedOrigin = normalizeOrigin(origin);
      const isKnownRenderFrontend = /^https:\/\/amapuja-frontend(?:-[a-z0-9-]+)?\.onrender\.com$/i.test(
        normalizedOrigin
      );
      const isKnownVercelFrontend = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalizedOrigin);

      const isConfiguredClient = allowedConfiguredOrigins.has(normalizedOrigin);
      const isLocalhostVitePort = /^http:\/\/localhost:\d+$/.test(origin);

      if (
        isConfiguredClient ||
        isLocalhostVitePort ||
        isKnownRenderFrontend ||
        isKnownVercelFrontend
      ) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  const health = getApiHealthStatus();
  const code = health.status === 'ok' ? 200 : 503;
  res.status(code).json(health);
});

app.use('/api/auth', authRoutes);
app.use('/api/poojas', poojaRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

app.use((err, req, res, next) => {
  console.error(err);
  captureIfSentryEnabled(err, {
    tags: { layer: 'express_error_middleware' },
    extra: {
      path: req?.originalUrl,
      method: req?.method,
    },
  });
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server running');
  startDailyBusinessSummaryJob();
});
