const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const mongoose = require('mongoose');
const PanditApplication = require('../models/PanditApplication');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Pooja = require('../models/Pooja');
const Complaint = require('../models/Complaint');
const PayoutSettings = require('../models/PayoutSettings');
const { protect, adminOnly } = require('../middleware/auth');
const { sendPanditApprovalNotification, sendPanditAssignmentNotification } = require('../services/notificationService');

const router = express.Router();
const privateUploadDir = path.resolve(__dirname, '../../private/pandits');
fs.mkdirSync(privateUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, privateUploadDir),
  filename: (_req, file, callback) => callback(null, `${crypto.randomUUID()}${path.extname(file.originalname || '.bin').toLowerCase()}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    callback(allowed.includes(file.mimetype) ? null : new Error('Only JPG, PNG, WEBP, and PDF files are allowed.'), allowed.includes(file.mimetype));
  },
});

const panditOnly = (req, res, next) => {
  if (req.user?.role !== 'pandit' || req.user?.panditStatus !== 'approved') {
    return res.status(403).json({ message: 'Approved Pandit access required' });
  }
  return next();
};

const parseArray = (value) => {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  try {
    const parsed = JSON.parse(String(value || '[]'));
    return Array.isArray(parsed) ? parsed.map(String).map((item) => item.trim()).filter(Boolean) : [];
  } catch {
    return String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
  }
};

const nextApplicationId = async () => {
  const year = new Date().getFullYear();
  const count = await PanditApplication.countDocuments({ createdAt: { $gte: new Date(`${year}-01-01`) } });
  return `PS-PND-${year}-${String(count + 1).padStart(4, '0')}`;
};

const payout = (amount, panditPercentage) => {
  const panditAmount = Math.round(Number(amount || 0) * Number(panditPercentage || 0) / 100);
  return { panditAmount, platformAmount: Number(amount || 0) - panditAmount };
};
const getPayoutSettings = async () => PayoutSettings.findOneAndUpdate({ key: 'default' }, {}, { upsert: true, new: true, setDefaultsOnInsert: true });

router.get('/pujas', async (_req, res) => res.json(await Pooja.find({}).select('_id title').sort({ title: 1 })));

router.post('/applications', upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'identityDocument', maxCount: 1 },
  { name: 'experienceDocument', maxCount: 1 },
]), async (req, res) => {
  try {
    const required = ['fullName', 'mobileNumber', 'city', 'area', 'yearsOfExperience', 'samagri', 'rulesAccepted'];
    const missing = required.filter((field) => !String(req.body?.[field] || '').trim());
    if (missing.length || !req.files?.profilePhoto?.[0] || !req.files?.identityDocument?.[0]) {
      return res.status(400).json({ message: `Missing required fields or documents: ${missing.join(', ') || 'profilePhoto, identityDocument'}` });
    }
    if (String(req.body.rulesAccepted) !== 'true') return res.status(400).json({ message: 'You must accept the Pandit Rules.' });

    const application = await PanditApplication.create({
      applicationId: await nextApplicationId(),
      fullName: String(req.body.fullName).trim(),
      mobileNumber: String(req.body.mobileNumber).trim(),
      whatsappNumber: String(req.body.whatsappNumber || '').trim(),
      email: String(req.body.email || '').trim().toLowerCase(),
      city: String(req.body.city).trim(),
      area: String(req.body.area).trim(),
      profilePhotoPath: req.files.profilePhoto[0].path,
      identityDocumentPath: req.files.identityDocument[0].path,
      experienceDocumentPath: req.files.experienceDocument?.[0]?.path,
      yearsOfExperience: Number(req.body.yearsOfExperience),
      pujaIds: parseArray(req.body.pujaIds).filter((id) => mongoose.isValidObjectId(id)),
      pujaNames: parseArray(req.body.pujaNames),
      languages: parseArray(req.body.languages),
      specialization: String(req.body.specialization || '').trim(),
      samagri: req.body.samagri,
      serviceAreas: parseArray(req.body.serviceAreas),
      maxTravelDistance: Number(req.body.maxTravelDistance || 0),
      availableDays: parseArray(req.body.availableDays),
      availableTime: String(req.body.availableTime || '').trim(),
      accountPasswordHash: req.body.password ? await bcrypt.hash(String(req.body.password), 10) : undefined,
      rulesAcceptedAt: new Date(),
      rulesVersion: '1.0',
    });
    return res.status(201).json({ applicationId: application.applicationId, status: application.status, message: 'Application Submitted Successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Application submission failed' });
  }
});

router.get('/applications/status/:applicationId', async (req, res) => {
  const mobileNumber = String(req.query.mobile || '').replace(/\D/g, '');
  const application = await PanditApplication.findOne({ applicationId: String(req.params.applicationId).trim(), mobileNumber }).select('applicationId status createdAt reviewedAt rejectionReason suspensionReason');
  if (!application) return res.status(404).json({ message: 'Application ID and mobile number do not match.' });
  return res.json(application);
});

router.get('/applications', protect, adminOnly, async (req, res) => {
  const filter = req.query.status && req.query.status !== 'All' ? { status: req.query.status } : {};
  const [applications, counts, total] = await Promise.all([
    PanditApplication.find(filter).select('-profilePhotoPath -identityDocumentPath -experienceDocumentPath -accountPasswordHash').sort({ createdAt: -1 }),
    PanditApplication.aggregate([{ $group: { _id: '$status', total: { $sum: 1 } } }]),
    PanditApplication.countDocuments(),
  ]);
  const stats = counts.reduce((result, item) => ({ ...result, [item._id]: item.total }), {});
  return res.json({ applications, stats: { total, ...stats } });
});

router.get('/applications/:id', protect, adminOnly, async (req, res) => {
  const application = await PanditApplication.findById(req.params.id).select('+profilePhotoPath +identityDocumentPath +experienceDocumentPath');
  if (!application) return res.status(404).json({ message: 'Application not found' });
  return res.json(application);
});

router.get('/applications/:id/files/:kind', protect, adminOnly, async (req, res) => {
  const application = await PanditApplication.findById(req.params.id).select('+profilePhotoPath +identityDocumentPath +experienceDocumentPath');
  const field = { profile: 'profilePhotoPath', identity: 'identityDocumentPath', experience: 'experienceDocumentPath' }[req.params.kind];
  if (!application || !field || !application[field]) return res.status(404).json({ message: 'Private document not found' });
  return res.sendFile(path.resolve(application[field]), { headers: { 'Content-Disposition': 'inline' } });
});

router.patch('/applications/:id/approve', protect, adminOnly, async (req, res) => {
  const application = await PanditApplication.findById(req.params.id).select('+accountPasswordHash');
  if (!application) return res.status(404).json({ message: 'Application not found' });
  if (!application.accountPasswordHash && !req.body?.password) return res.status(400).json({ message: 'A Pandit account password is required before approval' });
  const email = application.email || `${application.mobileNumber.replace(/\D/g, '')}@pandit.local`;
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name: application.fullName, email, phone: application.mobileNumber, password: req.body.password || 'ChangeMe123', role: 'pandit', panditStatus: 'approved', panditApplicationId: application._id, emailVerified: true });
    if (application.accountPasswordHash) {
      await User.updateOne({ _id: user._id }, { $set: { password: application.accountPasswordHash } });
    }
  } else {
    user.name = application.fullName; user.phone = application.mobileNumber; user.role = 'pandit'; user.panditStatus = 'approved'; user.panditApplicationId = application._id; await user.save();
  }
  application.status = 'Approved'; application.reviewedAt = new Date(); application.reviewedBy = req.user._id; application.userId = user._id; await application.save();
  sendPanditApprovalNotification(application).catch((error) => console.error('Pandit approval notification failed:', error));
  return res.json({ message: 'Pandit approved', application, user: { id: user._id, email: user.email } });
});

router.patch('/applications/:id/reject', protect, adminOnly, async (req, res) => {
  const reason = String(req.body?.reason || '').trim();
  if (!reason) return res.status(400).json({ message: 'Rejection reason is required' });
  const application = await PanditApplication.findByIdAndUpdate(req.params.id, { status: 'Rejected', rejectionReason: reason, reviewedAt: new Date(), reviewedBy: req.user._id }, { new: true });
  if (!application) return res.status(404).json({ message: 'Application not found' });
  return res.json(application);
});

router.patch('/applications/:id/suspend', protect, adminOnly, async (req, res) => {
  const reason = String(req.body?.reason || '').trim();
  if (!reason) return res.status(400).json({ message: 'Suspension reason is required' });
  const application = await PanditApplication.findById(req.params.id);
  if (!application) return res.status(404).json({ message: 'Application not found' });
  application.status = 'Suspended'; application.suspensionReason = reason; application.reviewedAt = new Date(); application.reviewedBy = req.user._id; await application.save();
  if (application.userId) await User.findByIdAndUpdate(application.userId, { panditStatus: 'suspended' });
  return res.json(application);
});

router.get('/dashboard', protect, panditOnly, async (req, res) => {
  const [bookings, application] = await Promise.all([
    Booking.find({ panditId: req.user._id }).populate('poojaId', 'title').select('-email -addressDetails -coordinates -transactionId').sort({ date: 1 }),
    PanditApplication.findOne({ userId: req.user._id }).select('-profilePhotoPath -identityDocumentPath -experienceDocumentPath -accountPasswordHash'),
  ]);
  return res.json({ bookings, application });
});

router.patch('/profile', protect, panditOnly, async (req, res) => {
  const allowed = ['serviceAreas', 'availableDays', 'availableTime'];
  const update = Object.fromEntries(allowed.filter((key) => req.body[key] !== undefined).map((key) => [key, key === 'availableTime' ? String(req.body[key]) : parseArray(req.body[key])]));
  const application = await PanditApplication.findOneAndUpdate({ userId: req.user._id }, { $set: { profile: update } }, { new: true }).select('-profilePhotoPath -identityDocumentPath -experienceDocumentPath -accountPasswordHash');
  return res.json(application);
});

router.patch('/bookings/:id/accept', protect, panditOnly, async (req, res) => {
  const booking = await Booking.findOneAndUpdate({ _id: req.params.id, panditId: req.user._id, bookingStatus: 'pandit-assigned' }, { bookingStatus: 'accepted' }, { new: true });
  if (!booking) return res.status(404).json({ message: 'Assigned booking not found' });
  return res.json(booking);
});

router.patch('/bookings/:id/complete', protect, panditOnly, async (req, res) => {
  const booking = await Booking.findOneAndUpdate({ _id: req.params.id, panditId: req.user._id, bookingStatus: { $in: ['accepted', 'pandit-assigned'] } }, { bookingStatus: 'completed' }, { new: true });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  sendPanditAssignmentNotification({ pandit, booking }).catch((error) => console.error('Pandit assignment notification failed:', error));
  return res.json(booking);
});

router.patch('/bookings/:id/assign', protect, adminOnly, async (req, res) => {
  const pandit = await User.findOne({ _id: req.body?.panditId, role: 'pandit', panditStatus: 'approved' });
  if (!pandit) return res.status(400).json({ message: 'Only approved active Pandits can be assigned' });
  const settings = await getPayoutSettings();
  const amount = Number((await Booking.findById(req.params.id).select('finalAmount'))?.finalAmount || 0);
  const split = payout(amount, settings.normalPanditPercentage);
  const booking = await Booking.findByIdAndUpdate(req.params.id, { panditId: pandit._id, assignedAt: new Date(), assignedBy: req.user._id, bookingStatus: 'pandit-assigned', payout: { normalPanditPercentage: settings.normalPanditPercentage, normalPlatformPercentage: settings.normalPlatformPercentage, finalPanditPercentage: settings.normalPanditPercentage, finalPlatformPercentage: settings.normalPlatformPercentage, originalPanditAmount: split.panditAmount, finalPanditAmount: split.panditAmount, platformAmount: split.platformAmount } }, { new: true }).populate('panditId', 'name phone');
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  return res.json(booking);
});

router.get('/active', protect, adminOnly, async (_req, res) => res.json(await User.find({ role: 'pandit', panditStatus: 'approved' }).select('name phone email')));
router.get('/payout-settings', protect, adminOnly, async (_req, res) => res.json(await getPayoutSettings()));
router.patch('/payout-settings', protect, adminOnly, async (req, res) => {
  const values = ['normalPanditPercentage', 'normalPlatformPercentage', 'verifiedIssuePanditPercentage', 'verifiedIssuePlatformPercentage'].reduce((result, key) => ({ ...result, [key]: Number(req.body?.[key]) }), {});
  if (values.normalPanditPercentage + values.normalPlatformPercentage !== 100 || values.verifiedIssuePanditPercentage + values.verifiedIssuePlatformPercentage !== 100) return res.status(400).json({ message: 'Each payout pair must total 100%' });
  return res.json(await PayoutSettings.findOneAndUpdate({ key: 'default' }, values, { upsert: true, new: true, setDefaultsOnInsert: true }));
});

router.post('/complaints', protect, async (req, res) => {
  const booking = await Booking.findOne({ _id: req.body?.bookingId, userId: req.user._id, bookingStatus: 'completed' });
  if (!booking) return res.status(404).json({ message: 'Completed booking not found' });
  const complaint = await Complaint.create({ bookingId: booking._id, customerId: req.user._id, panditId: booking.panditId, reason: req.body.reason, description: req.body.description, originalPayout: booking.payout?.originalPanditAmount || 0 });
  booking.bookingStatus = 'complaint-under-review'; await booking.save();
  return res.status(201).json(complaint);
});

router.get('/complaints', protect, adminOnly, async (_req, res) => res.json(await Complaint.find({}).populate('bookingId panditId customerId', 'name email finalAmount').sort({ createdAt: -1 })));

router.patch('/complaints/:id/resolve', protect, adminOnly, async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
  const decision = String(req.body?.adminDecision || '');
  if (!['No issue found', 'Verified service issue', 'Other resolution'].includes(decision)) return res.status(400).json({ message: 'Invalid admin decision' });
  const booking = await Booking.findById(complaint.bookingId);
  const settings = await getPayoutSettings();
  const finalPercentage = decision === 'Verified service issue' ? settings.verifiedIssuePanditPercentage : settings.normalPanditPercentage;
  const split = payout(booking?.finalAmount, finalPercentage);
  complaint.adminDecision = decision; complaint.status = 'Resolved'; complaint.panditResponse = String(req.body?.panditResponse || ''); complaint.adjustedPayout = split.panditAmount; complaint.reviewedAt = new Date(); complaint.reviewedBy = req.user._id; await complaint.save();
  if (booking) { booking.bookingStatus = 'completed'; booking.payout.finalPanditPercentage = finalPercentage; booking.payout.finalPlatformPercentage = 100 - finalPercentage; booking.payout.finalPanditAmount = split.panditAmount; booking.payout.platformAmount = split.platformAmount; booking.payout.adjustmentReason = decision === 'Verified service issue' ? 'Adjusted payout following a verified service issue' : decision; await booking.save(); }
  return res.json(complaint);
});

module.exports = router;