const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { generateVerificationToken, sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const router = express.Router();

const signToken = (id, tokenVersion = 0) => jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, { expiresIn: '7d' });
const isStrongPassword = (value) =>
  typeof value === 'string' && value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
const genericResetMessage = 'If an account exists with this email, a password reset link has been sent.';
const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const forgotPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many reset requests. Please try again later.' },
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters and include uppercase, lowercase, and a number' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({ 
      name, 
      email, 
      password, 
      phone,
      verificationToken,
      verificationTokenExpiry,
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(user, verificationToken).then((sent) => {
      if (sent) {
        console.log(`✅ Verification email sent to ${email}`);
      } else {
        console.warn(`⚠️ Could not send verification email to ${email}`);
      }
    });

    const token = signToken(user._id, user.authTokenVersion);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      message: 'Registration successful! Please check your email to verify your account.',
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: error.message || 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select('name email phone role panditStatus emailVerified password authTokenVersion');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user._id, user.authTokenVersion);
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        panditStatus: user.panditStatus,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: error.message || 'Login failed' });
  }
});

router.post('/pandit-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('name email phone role panditStatus emailVerified password authTokenVersion');
    if (!user || user.role !== 'pandit' || user.panditStatus !== 'approved') {
      return res.status(401).json({ message: 'Only approved Pandit accounts can use this login.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user._id, user.authTokenVersion);
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        panditStatus: user.panditStatus,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error('Pandit login error:', error);
    return res.status(500).json({ message: error.message || 'Pandit login failed' });
  }
});

router.get('/me', protect, async (req, res) => {
  return res.json(req.user);
});

router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    return res.json({ message: 'Email verified successfully! You can now login.' });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ message: 'Email verification failed' });
  }
});

router.post('/forgot-password', forgotPasswordRateLimiter, async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: genericResetMessage });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = hashResetToken(resetToken);
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendPasswordResetEmail(user, resetToken);

    return res.json({ message: genericResetMessage });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.json({ message: genericResetMessage });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const token = String(req.body?.token || '').trim();
    const password = String(req.body?.password || '');

    if (!token || !password) {
      return res.status(400).json({ message: 'Reset token and password are required.' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters and include uppercase, lowercase, and a number' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
      { resetPasswordToken: hashResetToken(token), resetPasswordExpires: { $gt: new Date() } },
      {
        $set: { password: passwordHash },
        $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 },
        $inc: { authTokenVersion: 1 },
      },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
    }

    return res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Password reset failed' });
  }
});

module.exports = router;
