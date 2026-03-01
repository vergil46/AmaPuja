const mongoose = require('mongoose');
require('dotenv').config();
const Pooja = require('./src/models/Pooja');

async function checkOdiaFromScreenshot() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Exact names from the screenshot
    const screenshotServices = [
      'Annaprashan Puja',
      'Engagement Puja - Nirbandha',
      'Ganapathi Puja',
      'Griha Pravesh (Gruha Pratistha)',
      'Janma Chuti Poka (Mundan)',
      'Lakshmi Puja',
      'Namkaran Puja (Ekoisia)',
      'Office/Shop Opening Puja',
      'Saraswati Puja',
      'Satyanarayan Puja',
      'Vishwakarma Puja'
    ];

    const allPoojas = await Pooja.find({}, { title: 1 }).lean();
    const existingTitles = allPoojas.map(p => p.title);

    console.log('Checking services from screenshot:\n');
    
    const missing = [];
    for (const service of screenshotServices) {
      const exists = existingTitles.includes(service);
      if (exists) {
        console.log(`✓ "${service}" - EXISTS`);
      } else {
        console.log(`✗ "${service}" - MISSING`);
        
        // Check for similar names
        const similar = existingTitles.filter(t => 
          t.toLowerCase().replace(/[^a-z0-9]/g, '') === service.toLowerCase().replace(/[^a-z0-9]/g, '')
        );
        
        if (similar.length > 0) {
          console.log(`  → Similar exists: "${similar[0]}"`);
        } else {
          missing.push(service);
        }
      }
    }

    console.log(`\n--- Summary ---`);
    console.log(`Total checked: ${screenshotServices.length}`);
    console.log(`Exact match exists: ${screenshotServices.length - missing.length}`);
    console.log(`Need to add: ${missing.length}`);
    
    if (missing.length > 0) {
      console.log('\nServices to add:');
      missing.forEach(m => console.log(`  - ${m}`));
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOdiaFromScreenshot();
