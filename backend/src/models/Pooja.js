const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, enum: ['Without Samagri', 'With Samagri'] },
    price: { type: Number, required: true, min: 0 },
    includesSamagri: { type: Boolean, default: false },
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
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pooja', poojaSchema);
