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
    addressDetails: {
      house: { type: String, trim: true, default: '' },
      street: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      pincode: { type: String, trim: true, default: '' },
      formattedAddress: { type: String, trim: true, default: '' },
    },
    coordinates: {
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
    },
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
      enum: ['pending', 'confirmed', 'pandit-assigned', 'accepted', 'completed', 'cancelled', 'complaint-under-review'],
      default: 'pending',
    },
    panditId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    payout: {
      normalPanditPercentage: { type: Number, default: 75 },
      normalPlatformPercentage: { type: Number, default: 25 },
      finalPanditPercentage: { type: Number, default: 75 },
      finalPlatformPercentage: { type: Number, default: 25 },
      originalPanditAmount: { type: Number, default: 0 },
      finalPanditAmount: { type: Number, default: 0 },
      platformAmount: { type: Number, default: 0 },
      paidAmount: { type: Number, default: 0 },
      adjustmentReason: { type: String, trim: true, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
