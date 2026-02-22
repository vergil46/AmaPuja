const mongoose = require('mongoose');
require('dotenv').config();
const Pooja = require('./src/models/Pooja');

async function checkOdiaServices() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const odiaServices = [
      'Annaprashan Pooja',
      'Ganpathi puja',
      'laxmi puja',
      'namkaran puja(ekosia)',
      'office/shop opening puja'
    ];

    const allPoojas = await Pooja.find({}, { title: 1 }).lean();
    const existingTitles = allPoojas.map(p => p.title);

    console.log('Checking Odia services:\n');
    
    const missing = [];
    for (const service of odiaServices) {
      const exists = existingTitles.some(t => t.toLowerCase() === service.toLowerCase());
      if (exists) {
        console.log(`✓ ${service} - EXISTS`);
      } else {
        console.log(`✗ ${service} - MISSING`);
        missing.push(service);
      }
    }

    console.log(`\n--- Summary ---`);
    console.log(`Total requested: ${odiaServices.length}`);
    console.log(`Already exists: ${odiaServices.length - missing.length}`);
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

checkOdiaServices();
