const express = require('express');
const Pooja = require('../models/Pooja');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const poojas = await Pooja.find().sort({ createdAt: -1 });
  return res.json(poojas);
});

router.get('/:id', async (req, res) => {
  const pooja = await Pooja.findById(req.params.id);
  if (!pooja) {
    return res.status(404).json({ message: 'Pooja not found' });
  }
  return res.json(pooja);
});

router.post('/', protect, adminOnly, async (req, res) => {
  const { title, description, image, startPrice, packages } = req.body;
  const pooja = await Pooja.create({
    title,
    description,
    image,
    startPrice,
    packages,
    createdBy: req.user._id,
  });
  return res.status(201).json(pooja);
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  const pooja = await Pooja.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!pooja) {
    return res.status(404).json({ message: 'Pooja not found' });
  }
  return res.json(pooja);
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  const pooja = await Pooja.findByIdAndDelete(req.params.id);
  if (!pooja) {
    return res.status(404).json({ message: 'Pooja not found' });
  }
  return res.json({ message: 'Pooja deleted' });
});

module.exports = router;
