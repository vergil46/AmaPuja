const express = require('express');
const http = require('http');
const fs = require('fs');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const multer = require('multer');
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
const galleryRoutes = require('./routes/galleryRoutes');
const { protect, adminOnly } = require('./middleware/auth');

const normalizeOrigin = (value) => String(value || '').trim().replace(/\/+$/, '');

const configuredOrigins = [
  'https://pujasamriddhi.vercel.app',
  'https://pujasamriddhi.com',
  'https://www.pujasamriddhi.com',
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS || '').split(','),
]
  .map(normalizeOrigin)
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const normalizedOrigin = normalizeOrigin(origin);
  const isLocalhostVitePort = /^http:\/\/localhost:\d+$/.test(normalizedOrigin);
  return configuredOrigins.includes(normalizedOrigin) || isLocalhostVitePort;
};

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again later.' },
});

const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many payment requests. Please try again later.' },
});

connectDB().then(seedPoojas);

const app = express();
app.set('trust proxy', 1);
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    credentials: true,
  },
});
app.set('io', io);

io.on('connection', (socket) => {
  socket.emit('feedback:connected');
});

const proofUploadDir = path.resolve(__dirname, '../../frontend/public/proofs');
fs.mkdirSync(proofUploadDir, { recursive: true });

const proofStorage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, proofUploadDir),
  filename: (_req, file, callback) => {
    const sanitizedBaseName = String(file.originalname || 'proof-photo')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-_\s]/g, ' ')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase() || 'proof-photo';
    const extension = path.extname(file.originalname || '.jpeg') || '.jpeg';
    callback(null, `${sanitizedBaseName}-${Date.now()}${extension}`);
  },
});

const proofUpload = multer({
  storage: proofStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      return callback(null, true);
    }
    callback(new Error('Only JPG, PNG, WEBP, and GIF images are allowed.'));
  },
});

const isIPv4Host = (hostname) => /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);

const isKnownCustomFrontendOrigin = (origin) => {
  const normalized = normalizeOrigin(origin).toLowerCase();
  if (!normalized) {
    return false;
  }

  return /^https:\/\/(?:[a-z0-9-]+\.)?(?:pujasamriddhi\.com|amapuja\.com)$/.test(normalized);
};

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

app.use(helmet());
app.use('/api', apiRateLimiter);
app.use('/api/auth', authRateLimiter);
app.use('/api/payments', paymentRateLimiter);
app.use(
  cors({
    origin: (origin, callback) => {
      return callback(null, isAllowedOrigin(origin));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(compression());
app.use(morgan('dev'));

app.post('/api/admin/upload-proof', protect, adminOnly, proofUpload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please select an image to upload.' });
  }

  const fileName = req.file.filename;
  return res.status(200).json({
    message: 'Proof photo uploaded successfully.',
    fileName,
    url: `/proofs/${fileName}`,
  });
});

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
app.use('/api/gallery', galleryRoutes);

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
httpServer.listen(PORT, () => {
  console.log('Server running');
  startDailyBusinessSummaryJob();
});
