const express = require('express');
const Feedback = require('../models/Feedback');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/my', protect, async (req, res) => {
  const feedbacks = await Feedback.find({ userId: req.user._id }).sort({ createdAt: -1 });
  return res.json(feedbacks);
});

router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

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
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json(feedback);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Feedback already exists for this booking' });
    }
    return res.status(500).json({ message: 'Failed to submit feedback' });
  }
});

module.exports = router;
