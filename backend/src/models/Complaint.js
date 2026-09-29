const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    panditId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    panditResponse: { type: String, trim: true, default: '' },
    adminDecision: { type: String, enum: ['No issue found', 'Verified service issue', 'Other resolution', ''], default: '' },
    status: { type: String, enum: ['Submitted', 'Under Review', 'Resolved'], default: 'Submitted' },
    originalPayout: { type: Number, default: 0 },
    adjustedPayout: { type: Number, default: 0 },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);