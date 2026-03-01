const mongoose = require('mongoose');
require('dotenv').config();
const Pooja = require('./src/models/Pooja');

async function checkBengaliPoojas() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const bengaliServices = [
      'Bhoomi Puja',
      'Durga Puja',
      'Ganesh Puja',
      'Griho Probesh',
      'Laxmi Puja',
      'Onnoprashon (Mukhe Bhaat)',
      'Saraswati Puja',
      'Satyanarayan Puja',
      'Upanayan',
      'Vivah (Marriage)'
    ];

    const allPoojas = await Pooja.find({}, { title: 1 }).lean();
    const existingTitles = allPoojas.map(p => p.title);

    console.log('Checking Bengali services:\n');
    
    const missing = [];
    for (const service of bengaliServices) {
      const exists = existingTitles.includes(service);
      if (exists) {
        console.log(`✓ ${service} - EXISTS`);
      } else {
        console.log(`✗ ${service} - MISSING`);
        missing.push(service);
      }
    }

    console.log(`\n--- Summary ---`);
    console.log(`Total requested: ${bengaliServices.length}`);
    console.log(`Already exists: ${bengaliServices.length - missing.length}`);
    console.log(`Missing: ${missing.length}`);
    
    if (missing.length > 0) {
      console.log('\nMissing services to add:');
      missing.forEach(m => console.log(`  - ${m}`));
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkBengaliPoojas();
