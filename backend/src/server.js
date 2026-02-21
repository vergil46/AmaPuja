const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

dotenv.config();

const connectDB = require('./config/db');
const seedPoojas = require('./utils/seedPoojas');

const authRoutes = require('./routes/authRoutes');
const poojaRoutes = require('./routes/poojaRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

connectDB().then(seedPoojas);

const app = express();

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

      const isConfiguredClient = normalizedConfigured && normalizedOrigin === normalizedConfigured;
      const isConfiguredClientList = normalizedConfiguredList.includes(normalizedOrigin);
      const isLocalhostVitePort = /^http:\/\/localhost:\d+$/.test(origin);

      if (isConfiguredClient || isConfiguredClientList || isLocalhostVitePort) {
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
  res.json({ status: 'ok', app: 'Ama Puja API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/poojas', poojaRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running"));
