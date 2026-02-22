const mongoose = require('mongoose');
require('dotenv').config();
const Pooja = require('./src/models/Pooja');

const nameUpdates = [
  { old: 'Annaprashan Puja', new: 'Annaprasana (Onnoprashon)' },
  { old: 'Brihaspati Vrat Udyapan Puja', new: 'Brihaspati Vrat Udyapan' },
  { old: 'Ekadashi Vrat Udyapan Puja', new: 'Ekadashi Vrat Udyapan' },
  { old: 'Engagement Puja - Sagai', new: 'Engagement Puja - Nirbandha' },
  { old: 'Godh Bharai Puja (Baby Shower)', new: 'Godh Bharai (Baby Shower)' },
  { old: 'Griha Pravesh', new: 'Griha Pravesh (Gruha Pratistha)' },
  { old: 'Janamdin Puja - Birthday Puja', new: 'Janamdin Puja (Birthday Puja)' },
  { old: 'Mundan Or Chudakarana Ceremony', new: 'Janma Chuti Poka (Mundan)' },
  { old: 'Murti Pran Pratishta At Home', new: 'Murti Pran Pratishta' },
  { old: 'Namkaran Puja', new: 'Namkaran (Ekoisia)' },
  { old: 'Solah Somvar Udyapan Puja', new: 'Solah Somvar Udyapan' },
  { old: 'Yagnopavit Sanskar', new: 'Yagnopavit Sanskar (Bratabandha)' },
];

async function updatePoojaNames() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    let updated = 0;
    let notFound = 0;
    let skipped = 0;

    for (const { old, new: newName } of nameUpdates) {
      // Check if new name already exists
      const existingNew = await Pooja.findOne({ title: newName });
      const existingOld = await Pooja.findOne({ title: old });
      
      if (existingNew && existingOld) {
        // Both exist, delete the old one
        await Pooja.deleteOne({ title: old });
        console.log(`🗑 Deleted duplicate: "${old}" (keeping "${newName}")`);
        skipped++;
      } else if (existingNew) {
        // New name exists, old doesn't - already updated
        console.log(`⏭ Already updated: "${newName}"`);
        skipped++;
      } else if (existingOld) {
        // Can safely update
        await Pooja.updateOne({ title: old }, { $set: { title: newName } });
        console.log(`✓ Updated: "${old}" → "${newName}"`);
        updated++;
      } else {
        console.log(`✗ Not found: "${old}"`);
        notFound++;
      }
    }

    console.log(`\n✅ Update complete: ${updated} updated, ${skipped} skipped, ${notFound} not found`);
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error updating pooja names:', error);
    process.exit(1);
  }
}

updatePoojaNames();
