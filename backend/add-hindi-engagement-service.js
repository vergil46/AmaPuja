const mongoose = require('mongoose');
require('dotenv').config();
const Pooja = require('./src/models/Pooja');

const hindiEngagementService = {
  title: 'Engagement Puja – Sagai',
  description:
    'Perform Engagement Puja before marriage to receive divine blessings. Book expert Pandits for Sagai or Ring Ceremony with all samagri included. Service available across India.',
  image:
    'https://images.unsplash.com/photo-1542327897-d73f4005b533?auto=format&fit=crop&w=1200&q=80',
  startPrice: 4200,
  packages: [
    {
      name: 'With Samagri',
      price: 4200,
      includesSamagri: true,
    },
  ],
  details: {
    standard: {
      title: 'Standard : (1 Panditji + All Puja Samagries)',
      procedure: [
        'Gowri-Ganesh Puja',
        'Sankalp',
        'Patrika Puja',
        'Ashirwad',
        'Prasad distribution',
      ],
      note:
        'Puja Samagries like Haldi, Abeer, Gulal, Mango leaves, Tulasi, Darba, Kalash, Beetle Leaves, Beetle Nuts, Dravyas, Kapda, Ghee etc. will be brought by us. Yajaman has to keep house items like Vessels, Oil Lamps, Mats, Bowls, Chowki, Plates, Prasad, Photos etc you will be receiving details to do list after booking.',
      inclusions: ['Dakshina', 'All Puja Samagries'],
      maxHours: 2,
      extraHourCharge: 1000,
    },
  },
  addOns: [
    { name: 'Flowers & Fruits', price: 1000 },
  ],
};

async function addHindiEngagementService() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const exists = await Pooja.findOne({ title: hindiEngagementService.title });
    if (exists) {
      console.log(`⏭ Already exists: "${hindiEngagementService.title}"`);
      return;
    }
    await Pooja.create(hindiEngagementService);
    console.log(`✓ Added: "${hindiEngagementService.title}"`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.connection.close();
  }
}

addHindiEngagementService();
