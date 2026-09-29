const mongoose = require('mongoose');

const panditApplicationSchema = new mongoose.Schema(
  {
    applicationId: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    mobileNumber: { type: String, required: true, trim: true },
    whatsappNumber: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    city: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    profilePhotoPath: { type: String, required: true, select: false },
    yearsOfExperience: { type: Number, required: true, min: 0, max: 80 },
    pujaIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pooja' }],
    pujaNames: { type: [String], default: [] },
    languages: { type: [String], required: true },
    specialization: { type: String, trim: true, default: '' },
    samagri: { type: String, enum: ['yes', 'no', 'depends'], required: true },
    serviceAreas: { type: [String], default: [] },
    maxTravelDistance: { type: Number, min: 0, default: 0 },
    availableDays: { type: [String], default: [] },
    availableTime: { type: String, trim: true, default: '' },
    identityDocumentPath: { type: String, required: true, select: false },
    experienceDocumentPath: { type: String, select: false },
    accountPasswordHash: { type: String, select: false },
    rulesAcceptedAt: { type: Date, required: true },
    rulesVersion: { type: String, required: true, default: '1.0' },
    status: { type: String, enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Suspended'], default: 'Pending' },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String, trim: true, default: '' },
    suspensionReason: { type: String, trim: true, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    profile: {
      serviceAreas: { type: [String], default: [] },
      availableDays: { type: [String], default: [] },
      availableTime: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PanditApplication', panditApplicationSchema);