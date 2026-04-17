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

    const feedbacks = await Feedback.find({})
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
        customerName: feedback.userId?.name || 'Verified Customer',
        poojaTitle: feedback.poojaId?.title || 'Pooja Service',
      }));

    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load feedbacks' });
  }
});

router.get('/my', protect, async (req, res) => {
  const feedbacks = await Feedback.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .populate('poojaId', 'title');
  return res.json(feedbacks);
});

router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, rating, comment, reviewPhoto } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({ message: 'bookingId, rating, and comment are required' });
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

    if (String(booking.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only submit feedback for your own booking' });
    }

    if (booking.bookingStatus !== 'completed') {
      return res.status(400).json({ message: 'Feedback can be submitted only after pooja is completed' });
    }

    const feedback = await Feedback.findOneAndUpdate(
      { userId: req.user._id, bookingId: booking._id },
      {
        userId: req.user._id,
        bookingId: booking._id,
        poojaId: booking.poojaId,
        rating: parsedRating,
        comment: trimmedComment,
        reviewPhoto: normalizedPhoto,
        isApproved: true,
        approvedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const populatedFeedback = await Feedback.findById(feedback._id).populate('poojaId', 'title');

    return res.status(201).json(populatedFeedback);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Feedback already exists for this booking' });
    }
    return res.status(500).json({ message: 'Failed to submit feedback' });
  }
});

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
 * ADMIN: APPROVE A FEEDBACK
 */
router.patch('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.isApproved = true;
    feedback.approvedBy = req.user._id;
    feedback.approvedAt = new Date();
    await feedback.save();

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('userId', 'name')
      .populate('poojaId', 'title');

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

    await Feedback.deleteOne({ _id: feedback._id });

    return res.json({ message: 'Feedback rejected and removed' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reject feedback' });
  }
});

module.exports = router;
