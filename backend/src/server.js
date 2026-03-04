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

      const normalizeOrigin = (value) => value.replace(/\/$/, '');
      const normalizedOrigin = normalizeOrigin(origin);
      const normalizedConfigured = configuredClientUrl ? normalizeOrigin(configuredClientUrl) : null;
      const normalizedConfiguredList = configuredClientUrls.map(normalizeOrigin);
      const isKnownRenderFrontend = /^https:\/\/amapuja-frontend(?:-[a-z0-9-]+)?\.onrender\.com$/i.test(
        normalizedOrigin
      );
      const isKnownVercelFrontend = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalizedOrigin);

      const isConfiguredClient = normalizedConfigured && normalizedOrigin === normalizedConfigured;
      const isConfiguredClientList = normalizedConfiguredList.includes(normalizedOrigin);
      const isLocalhostVitePort = /^http:\/\/localhost:\d+$/.test(origin);

      if (
        isConfiguredClient ||
        isConfiguredClientList ||
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
