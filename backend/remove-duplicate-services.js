const mongoose = require('mongoose');
require('dotenv').config();
const Pooja = require('./src/models/Pooja');

async function removeDuplicates() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const duplicatesToRemove = [
      {
        keep: 'Engagement Puja - Nirbandha',
        remove: 'Engagement Puja – Nirbandha',
        reason: 'Different dash character'
      },
      {
        keep: 'Fix Your Muhurat',
        remove: 'Fix Your Muhurtha',
        reason: 'Spelling variation'
      },
      {
        keep: 'Namkaran (Ekoisia)',
        remove: 'Namkaran Puja (Ekoisia)',
        reason: 'Extra "Puja" word'
      },
      {
        keep: 'Office Opening Puja',
        remove: 'Office/Shop Opening Puja',
        reason: 'Consolidate to simpler name'
      },
      {
        keep: 'Mahalaxmi Puja',
        remove: 'Lakshmi Puja',
        reason: 'Consolidate Lakshmi variations'
      },
      {
        keep: 'Mahalaxmi Puja',
        remove: 'Laxmi Puja',
        reason: 'Consolidate Lakshmi variations'
      }
    ];

    let removed = 0;
    let notFound = 0;

    console.log('Removing duplicate services:\n');

    for (const dup of duplicatesToRemove) {
      const exists = await Pooja.findOne({ title: dup.remove });
      
      if (exists) {
        await Pooja.deleteOne({ title: dup.remove });
        console.log(`✓ Removed: "${dup.remove}"`);
        console.log(`  Keeping: "${dup.keep}"`);
        console.log(`  Reason: ${dup.reason}\n`);
        removed++;
      } else {
        console.log(`⏭ Not found: "${dup.remove}"\n`);
        notFound++;
      }
    }

    console.log(`\n✅ Complete: ${removed} removed, ${notFound} not found`);
    
    const remaining = await Pooja.countDocuments();
    console.log(`\nTotal services remaining: ${remaining}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

removeDuplicates();
