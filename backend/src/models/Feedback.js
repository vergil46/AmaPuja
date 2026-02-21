const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    poojaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pooja', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

feedbackSchema.index({ userId: 1, bookingId: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
