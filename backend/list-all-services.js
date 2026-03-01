const mongoose = require('mongoose');
require('dotenv').config();
const Pooja = require('./src/models/Pooja');

async function listAllServices() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const allPoojas = await Pooja.find({}, { title: 1 }).lean();
    const sorted = allPoojas.map(p => p.title).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

    console.log(`📋 All ${sorted.length} services in database (A-Z):\n`);
    
    sorted.forEach((title, index) => {
      console.log(`${String(index + 1).padStart(2, ' ')}. ${title}`);
    });

    // Check for the specific Odia services
    console.log('\n\n🔍 Checking specific Odia services:\n');
    const odiaToCheck = [
      'Annaprashan Pooja',
      'Ganpathi puja', 
      'laxmi puja',
      'namkaran puja(ekosia)',
      'office/shop opening puja'
    ];

    odiaToCheck.forEach(service => {
      const found = sorted.find(s => s === service);
      if (found) {
        console.log(`✓ "${service}" - FOUND`);
      } else {
        console.log(`✗ "${service}" - NOT FOUND`);
        // Check for similar
        const similar = sorted.filter(s => s.toLowerCase().includes(service.toLowerCase().split(' ')[0]));
        if (similar.length > 0) {
          console.log(`  Similar: ${similar.join(', ')}`);
        }
      }
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listAllServices();
