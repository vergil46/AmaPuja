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
  },
  { _id: false }
);

const poojaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    startPrice: { type: Number, required: true, min: 0 },
    packages: { type: [packageSchema], required: true },
    addOns: [{ name: String, price: Number }],
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
