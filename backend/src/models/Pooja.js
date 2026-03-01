const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    includesSamagri: { type: Boolean, default: false },
    pandits: { type: String, trim: true },
    description: { type: String, trim: true },
    procedure: [String],
    inclusions: [String],
    note: { type: String, trim: true },
    addOns: [{ name: String, price: Number }],
  },
  { _id: false }
);

const poojaSchema = new mongoose.Schema(
  {
    serviceKey: { type: String, trim: true },
    title: { type: String, required: true, unique: true, trim: true },
    availableLanguages: { type: [String], default: [] },
    localizedTitle: { type: mongoose.Schema.Types.Mixed, default: {} },
    localizedDescription: { type: mongoose.Schema.Types.Mixed, default: {} },
    description: { type: String, required: true },
    image: { type: String, required: true },
    startPrice: { type: Number, required: true, min: 0 },
    packages: { type: [packageSchema], required: true },
    addOns: [{ name: String, price: Number }],
    pricing: { type: mongoose.Schema.Types.Mixed, default: {} },
    details: {
      standard: {
        title: String,
        procedure: [String],
        note: String,
        inclusions: [String],
        maxHours: Number,
        extraHourCharge: Number,
      },
    },
    maxHours: Number,
    extraHourCharge: Number,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pooja', poojaSchema);
