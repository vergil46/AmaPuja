const mongoose = require('mongoose');
require('dotenv').config();
const Pooja = require('./src/models/Pooja');

async function checkOverlappingServices() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const allPoojas = await Pooja.find({}, { title: 1 }).lean();
    const titles = allPoojas.map(p => p.title).sort();

    console.log(`Total services in database: ${titles.length}\n`);
    console.log('All services:\n');
    
    titles.forEach((title, index) => {
      console.log(`${index + 1}. ${title}`);
    });

    // Check for potential overlaps
    console.log('\n\n=== CHECKING FOR OVERLAPS ===\n');

    const overlaps = [
      { group: 'Annaprasana/Onnoprashon', services: [] },
      { group: 'Griha Pravesh/Gruhapravesha', services: [] },
      { group: 'Namkaran/Namakarana', services: [] },
      { group: 'Mundan/Chaula/Chudakarma', services: [] },
      { group: 'Upanayana/Upanayan/Upakarma', services: [] },
      { group: 'Marriage/Vivah', services: [] },
      { group: 'Engagement/Nischitartha', services: [] },
      { group: 'Fix Muhurat/Muhurtha', services: [] },
      { group: 'Birthday ceremonies', services: [] }
    ];

    // Annaprasana variations
    titles.forEach(t => {
      if (t.toLowerCase().includes('annapras') || t.toLowerCase().includes('onnoprash')) {
        overlaps[0].services.push(t);
      }
    });

    // Griha Pravesh variations
    titles.forEach(t => {
      if (t.toLowerCase().includes('griha') || t.toLowerCase().includes('gruha') || t.toLowerCase().includes('griho')) {
        overlaps[1].services.push(t);
      }
    });

    // Namkaran variations
    titles.forEach(t => {
      if (t.toLowerCase().includes('namkaran') || t.toLowerCase().includes('namakaran')) {
        overlaps[2].services.push(t);
      }
    });

    // Mundan variations
    titles.forEach(t => {
      if (t.toLowerCase().includes('mundan') || t.toLowerCase().includes('chaula') || t.toLowerCase().includes('chudakar') || t.toLowerCase().includes('janma chuti')) {
        overlaps[3].services.push(t);
      }
    });

    // Upanayana variations
    titles.forEach(t => {
      if (t.toLowerCase().includes('upanayana') || t.toLowerCase().includes('upanayan') || t.toLowerCase().includes('upakarma') || t.toLowerCase().includes('yagnopavit')) {
        overlaps[4].services.push(t);
      }
    });

    // Marriage variations
    titles.forEach(t => {
      if (t.toLowerCase().includes('marriage') || t.toLowerCase().includes('vivah')) {
        overlaps[5].services.push(t);
      }
    });

    // Engagement variations
    titles.forEach(t => {
      if (t.toLowerCase().includes('engagement') || t.toLowerCase().includes('nischit') || t.toLowerCase().includes('nirbandh')) {
        overlaps[6].services.push(t);
      }
    });

    // Fix Muhurat
    titles.forEach(t => {
      if (t.toLowerCase().includes('muhurat') || t.toLowerCase().includes('muhurth')) {
        overlaps[7].services.push(t);
      }
    });

    // Birthday ceremonies
    titles.forEach(t => {
      if (t.toLowerCase().includes('birthday') || t.toLowerCase().includes('janamdin') || 
          t.toLowerCase().includes('shanti') || t.toLowerCase().includes('shashtiapt') ||
          t.toLowerCase().includes('sathabhishek') || t.toLowerCase().includes('bhima ratha')) {
        overlaps[8].services.push(t);
      }
    });

    overlaps.forEach(overlap => {
      if (overlap.services.length > 1) {
        console.log(`\n🔍 ${overlap.group}:`);
        overlap.services.forEach(s => console.log(`   - ${s}`));
      }
    });

    // Check for exact duplicates
    console.log('\n\n=== EXACT DUPLICATES ===\n');
    const titleCounts = {};
    titles.forEach(t => {
      titleCounts[t] = (titleCounts[t] || 0) + 1;
    });

    const duplicates = Object.entries(titleCounts).filter(([, count]) => count > 1);
    if (duplicates.length > 0) {
      console.log('⚠️ Found exact duplicates:');
      duplicates.forEach(([title, count]) => {
        console.log(`   - "${title}" appears ${count} times`);
      });
    } else {
      console.log('✓ No exact duplicates found');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOverlappingServices();
