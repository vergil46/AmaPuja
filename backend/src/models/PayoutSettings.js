const mongoose = require('mongoose');

const payoutSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'default' },
  normalPanditPercentage: { type: Number, default: 75, min: 0, max: 100 },
  normalPlatformPercentage: { type: Number, default: 25, min: 0, max: 100 },
  verifiedIssuePanditPercentage: { type: Number, default: 50, min: 0, max: 100 },
  verifiedIssuePlatformPercentage: { type: Number, default: 50, min: 0, max: 100 },
}, { timestamps: true });

module.exports = mongoose.model('PayoutSettings', payoutSettingsSchema);