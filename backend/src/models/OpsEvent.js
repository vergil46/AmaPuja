const mongoose = require('mongoose');

const opsEventSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'warning',
    },
    message: { type: String, required: true, trim: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OpsEvent', opsEventSchema);
