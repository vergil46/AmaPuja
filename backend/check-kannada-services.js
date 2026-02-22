const mongoose = require('mongoose');
require('dotenv').config();
const Pooja = require('./src/models/Pooja');

async function checkKannadaServices() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const kannadaServices = [
      'Aksharabhyasa',
      'Annaprasana',
      'Bhima Ratha Shanti (70th Birthday)',
      'Chaula or Chudakarma',
      'Devata Kalyanotsavam',
      'Fix Your Muhurtha',
      'Gruhapravesha Pooja',
      'Karna Vedhana',
      'Marriage',
      'Namakarana',
      'Nischitartha',
      'Sashtiapthapoorthi (60th Birthday)',
      'Sathabhishekam (80th birthday)',
      'Seemantha',
      'Upakarma',
      'Upanayana'
    ];

    const allPoojas = await Pooja.find({}, { title: 1 }).lean();
    const existingTitles = allPoojas.map(p => p.title);

    console.log('Checking Kannada services:\n');
    
    const missing = [];
    for (const service of kannadaServices) {
      const exists = existingTitles.includes(service);
      if (exists) {
        console.log(`✓ ${service} - EXISTS`);
      } else {
        console.log(`✗ ${service} - MISSING`);
        missing.push(service);
      }
    }

    console.log(`\n--- Summary ---`);
    console.log(`Total requested: ${kannadaServices.length}`);
    console.log(`Already exists: ${kannadaServices.length - missing.length}`);
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

checkKannadaServices();
