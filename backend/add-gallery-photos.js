const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const GalleryPhoto = require('./src/models/GalleryPhoto');
const connectDB = require('./src/config/db');

const proofPhotos = [
  { name: 'WhatsApp Image 2026-08-30 at 5.18.29 PM.jpeg', title: 'Ganesh Puja Ceremony', category: 'Ganesh Puja' },
  { name: 'WhatsApp Image 2026-08-30 at 5.18.30 PM.jpeg', title: 'Puja Ritual', category: 'Other Pujas' },
  { name: 'WhatsApp Image 2026-08-30 at 5.18.30 PM (1).jpeg', title: 'Pooja Setup', category: 'Griha Pravesh' },
  { name: 'WhatsApp Image 2026-08-30 at 5.18.30 PM (2).jpeg', title: 'Family Ceremony', category: 'Annaprashan' },
  { name: 'WhatsApp Image 2026-08-30 at 5.18.31 PM.jpeg', title: 'Puja Completion', category: 'Satyanarayan Puja' },
  { name: 'IMG_20260420_063648.jpg.jpeg', title: 'Morning Puja', category: 'Shiva Puja' },
  { name: 'IMG_20260420_072006.jpg.jpeg', title: 'Ritual Performance', category: 'Durga Puja' },
  { name: 'IMG_20260420_074152.jpg.jpeg', title: 'Pooja Preparation', category: 'Navagraha Puja' },
  { name: 'IMG_20260420_074157.jpg.jpeg', title: 'Sacred Ceremony', category: 'Griha Pravesh' },
  { name: 'IMG_20260420_074227.jpg.jpeg', title: 'Family Gathering', category: 'Annaprashan' },
];

async function addGalleryPhotos() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    let added = 0;
    for (const photo of proofPhotos) {
      const imageUrl = `/proofs/${photo.name}`;
      
      const existing = await GalleryPhoto.findOne({ image: imageUrl });
      if (existing) {
        console.log(`⏭️  ${photo.name} already exists`);
        continue;
      }

      const galleryPhoto = new GalleryPhoto({
        title: photo.title,
        category: photo.category,
        location: 'Bangalore',
        date: '30 Aug 2026',
        image: imageUrl,
        isPublished: true,
        sortOrder: added,
      });

      await galleryPhoto.save();
      console.log(`✅ Added: ${photo.title}`);
      added++;
    }

    console.log(`\nTotal added: ${added}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addGalleryPhotos();
