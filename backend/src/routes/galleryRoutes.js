const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const GalleryPhoto = require('../models/GalleryPhoto');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
const uploadDir = path.resolve(__dirname, '../../../frontend/public/proofs');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) => {
    const safeName = String(file.originalname || 'gallery-photo')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-_\s]/g, ' ')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase() || 'gallery-photo';
    const extension = path.extname(file.originalname || '.jpeg') || '.jpeg';
    callback(null, `${safeName}-${Date.now()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      return callback(null, true);
    }
    callback(new Error('Only JPG, PNG, and WEBP images are allowed.'));
  },
});

router.get('/', async (_req, res) => {
  try {
    const photos = await GalleryPhoto.find({ isPublished: true }).sort({ sortOrder: 1, createdAt: -1 });
    return res.json(photos);
  } catch (error) {
    console.error('Gallery fetch failed:', error);
    return res.status(500).json({ message: 'Unable to load gallery photos.' });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, category, location, date, image, sortOrder } = req.body || {};

    if (!title || !category || !location || !date || !image) {
      return res.status(400).json({ message: 'Title, category, location, date, and image are required.' });
    }

    const photo = await GalleryPhoto.create({
      title: String(title).trim(),
      category: String(category).trim(),
      location: String(location).trim(),
      date: String(date).trim(),
      image: String(image).trim(),
      sortOrder: Number(sortOrder) || 0,
      isPublished: true,
    });

    return res.status(201).json(photo);
  } catch (error) {
    console.error('Create gallery item failed:', error);
    return res.status(500).json({ message: 'Unable to create gallery item.' });
  }
});

router.post('/upload', protect, adminOnly, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please choose an image.' });
  }

  const publicPath = `/proofs/${req.file.filename}`;
  return res.status(200).json({ url: publicPath, fileName: req.file.filename });
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const photo = await GalleryPhoto.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        sortOrder: Number(req.body?.sortOrder) || 0,
      },
      { new: true }
    );

    if (!photo) {
      return res.status(404).json({ message: 'Gallery photo not found.' });
    }

    return res.json(photo);
  } catch (error) {
    console.error('Update gallery item failed:', error);
    return res.status(500).json({ message: 'Unable to update gallery item.' });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const photo = await GalleryPhoto.findByIdAndDelete(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: 'Gallery photo not found.' });
    }
    return res.json({ message: 'Gallery photo deleted successfully.' });
  } catch (error) {
    console.error('Delete gallery item failed:', error);
    return res.status(500).json({ message: 'Unable to delete gallery item.' });
  }
});

module.exports = router;
