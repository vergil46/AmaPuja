const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    poojaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pooja', required: true },
    package: { type: String, required: true, trim: true },
    selectedAddOns: { type: [String], default: [] },

    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    priestPreference: { type: String, trim: true },

    date: { type: String, required: true, trim: true },
    time: { type: String, trim: true, default: '' },
    address: { type: String, required: true, trim: true },
    specialNotes: { type: String, trim: true, default: '' },

    paymentOption: {
      type: String,
      enum: ['full', 'advance', 'pay-after-pooja'],
      required: true,
      default: 'full',
    },
    finalAmount: { type: Number, required: true, min: 0 },
    paymentAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'manual-pending'],
      default: 'pending',
    },
    transactionId: { type: String, trim: true, default: '' },

    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
