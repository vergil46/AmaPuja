const mongoose = require('mongoose');

const funnelEventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      enum: ['service_view', 'form_started', 'booking_submitted', 'payment_success', 'payment_failed'],
      required: true,
    },
    sessionId: { type: String, trim: true, default: '' },
    route: { type: String, trim: true, default: '' },
    poojaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pooja' },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

funnelEventSchema.index({ eventName: 1, createdAt: -1 });
funnelEventSchema.index({ sessionId: 1, createdAt: -1 });

module.exports = mongoose.model('FunnelEvent', funnelEventSchema);
