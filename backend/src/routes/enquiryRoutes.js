const express = require('express');
const Enquiry = require('../models/Enquiry');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, message, phone } = req.body;
  const enquiry = await Enquiry.create({ name, email, message, phone });
  return res.status(201).json(enquiry);
});

router.get('/', protect, adminOnly, async (req, res) => {
  const enquiries = await Enquiry.find().sort({ createdAt: -1 });
  return res.json(enquiries);
});

module.exports = router;
