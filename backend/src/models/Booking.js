const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    poojaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pooja', required: true },
    package: { type: String, required: true, enum: ['Basic', 'Standard', 'Premium'] },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    city: { type: String, enum: ['Bangalore', 'Bhubaneswar'], required: true },
    priestPreference: { type: String, enum: ['Odia', 'Hindi', 'Bengali', 'Kannada'], required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    address: { type: String, required: true },
    specialNotes: { type: String, default: '' },
    paymentOption: {
      type: String,
      required: true,
      enum: ['full', 'advance-20', 'advance-30', 'pay-after-pooja'],
    },
    paymentAmount: { type: Number, required: true, min: 0 },
    transactionId: { type: String, default: '' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'manual-pending'],
      default: 'pending',
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
