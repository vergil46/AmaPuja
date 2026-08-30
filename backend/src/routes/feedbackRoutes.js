const express = require('express');
const Feedback = require('../models/Feedback');
const Booking = require('../models/Booking');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const normalize = (value) => String(value || '').trim().toLowerCase();

const isBlockedPublicReview = (feedback) => {
  const customerName = normalize(feedback?.userId?.name);
  const comment = normalize(feedback?.comment);

  return (
    customerName === 'akash sevlani' &&
    comment === 'very good experience pandit ji came on time on did in very good puja'
  );
};

router.get('/', async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 500)
      : 200;

    const feedbacks = await Feedback.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name')
      .populate('poojaId', 'title');

    const items = feedbacks
      .filter((feedback) => !isBlockedPublicReview(feedback))
      .map((feedback) => ({
        _id: feedback._id,
        rating: feedback.rating,
        comment: feedback.comment,
        reviewPhoto: feedback.reviewPhoto || '',
        createdAt: feedback.createdAt,
        customerName: feedback.customerName || feedback.userId?.name || 'Verified Customer',
        poojaTitle: feedback.poojaId?.title || 'Pooja Service',
        verifiedBooking: true,
      }));

    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load feedbacks' });
  }
});

router.get('/booking/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate('poojaId', 'title');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const existingFeedback = await Feedback.exists({ bookingId: booking._id });
    return res.json({
      bookingId: String(booking._id),
      customerName: booking.name,
      poojaName: booking.poojaId?.title || 'Pooja Service',
      bookingStatus: booking.bookingStatus,
      hasFeedback: Boolean(existingFeedback),
    });
  } catch (error) {
    return res.status(400).json({ message: 'Invalid booking ID' });
  }
});

router.get('/my', protect, async (req, res) => {
  const feedbacks = await Feedback.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .populate('poojaId', 'title');
  return res.json(feedbacks);
});

const submitFeedback = async (req, res, isPublic = false) => {
  try {
    const { bookingId, customerName, rating, comment, reviewPhoto } = req.body;

    if (!bookingId || !rating || !comment || (isPublic && !customerName)) {
      return res.status(400).json({ message: 'bookingId, customerName, rating, and comment are required' });
    }

    const parsedRating = Number(rating);
    if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const trimmedComment = String(comment).trim();
    if (!trimmedComment) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    const normalizedPhoto = String(reviewPhoto || '').trim();
    if (normalizedPhoto) {
      const isSupportedImage = /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(normalizedPhoto);
      if (!isSupportedImage) {
        return res.status(400).json({ message: 'Review photo must be a valid JPG, PNG, or WEBP image' });
      }

      if (normalizedPhoto.length > 400000) {
        return res.status(400).json({ message: 'Review photo is too large. Please upload a smaller image.' });
      }
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!isPublic && String(booking.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only submit feedback for your own booking' });
    }

    if (booking.bookingStatus !== 'completed') {
      return res.status(400).json({ message: 'Feedback can be submitted only after pooja is completed' });
    }

    const existingFeedback = await Feedback.exists({ bookingId: booking._id });
    if (existingFeedback) return res.status(409).json({ message: 'Feedback already exists for this booking' });

    if (isPublic && normalize(customerName) !== normalize(booking.name)) {
      return res.status(403).json({ message: 'Please enter the customer name used for this booking' });
    }

    const feedback = await Feedback.create({
      userId: isPublic ? booking.userId || null : req.user._id,
      bookingId: booking._id,
      poojaId: booking.poojaId,
      customerName: booking.name,
      rating: parsedRating,
      comment: trimmedComment,
      reviewPhoto: normalizedPhoto,
      isApproved: false,
      status: 'pending',
    });

    const populatedFeedback = await Feedback.findById(feedback._id).populate('poojaId', 'title');

    return res.status(201).json({ ...populatedFeedback.toObject(), message: 'Feedback submitted and is pending approval' });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Feedback already exists for this booking' });
    }
    return res.status(500).json({ message: 'Failed to submit feedback' });
  }
};

router.post('/', protect, (req, res) => submitFeedback(req, res));
router.post('/public', (req, res) => submitFeedback(req, res, true));

/**
 * ADMIN: GET PENDING FEEDBACKS (UNAPPROVED)
 */
router.get('/admin/pending', protect, adminOnly, async (req, res) => {
  try {
    const pendingFeedbacks = await Feedback.find({ isApproved: false })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('poojaId', 'title')
      .populate('bookingId', 'date');

    return res.json(pendingFeedbacks);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch pending feedbacks' });
  }
});

/**
 * ADMIN: GET ALL FEEDBACKS
 */
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 1000)
      : 500;

    const feedbacks = await Feedback.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name email')
      .populate('poojaId', 'title')
      .populate('bookingId', 'date time');

    return res.json(feedbacks);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch feedbacks' });
  }
});

/**
 * ADMIN: APPROVE A FEEDBACK
 */
router.patch('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.isApproved = true;
    feedback.status = 'approved';
    feedback.approvedBy = req.user._id;
    feedback.approvedAt = new Date();
    await feedback.save();

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('userId', 'name')
      .populate('poojaId', 'title');

    req.app.get('io')?.emit('feedback:approved', { feedbackId: String(feedback._id) });

    return res.json(populatedFeedback);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to approve feedback' });
  }
});

/**
 * ADMIN: REJECT A FEEDBACK (SOFT DELETE)
 */
router.patch('/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.isApproved = false;
    feedback.status = 'rejected';
    await feedback.save();

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('userId', 'name email')
      .populate('poojaId', 'title')
      .populate('bookingId', 'date time');

    req.app.get('io')?.emit('feedback:changed', { feedbackId: String(feedback._id) });

    return res.json(populatedFeedback);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reject feedback' });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const result = await Feedback.deleteOne({ _id: req.params.id });
    if (!result.deletedCount) return res.status(404).json({ message: 'Feedback not found' });
    req.app.get('io')?.emit('feedback:changed', { feedbackId: String(req.params.id) });
    return res.json({ message: 'Feedback deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete feedback' });
  }
});

module.exports = router;
