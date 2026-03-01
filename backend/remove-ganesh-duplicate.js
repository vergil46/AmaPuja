const mongoose = require('mongoose');
require('dotenv').config();
const Pooja = require('./src/models/Pooja');

async function checkGaneshPoojas() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const ganeshPuja = await Pooja.findOne({ title: 'Ganesh Puja' });
    const ganapathiPuja = await Pooja.findOne({ title: 'Ganapathi Puja' });

    console.log('Checking Ganesh/Ganapathi entries:\n');
    
    if (ganeshPuja) {
      console.log(`✓ "Ganesh Puja" exists (ID: ${ganeshPuja._id})`);
    } else {
      console.log(`✗ "Ganesh Puja" not found`);
    }
    
    if (ganapathiPuja) {
      console.log(`✓ "Ganapathi Puja" exists (ID: ${ganapathiPuja._id})`);
    } else {
      console.log(`✗ "Ganapathi Puja" not found`);
    }

    if (ganeshPuja && ganapathiPuja) {
      console.log('\n⚠️  Both exist - will keep "Ganesh Puja" and remove "Ganapathi Puja"');
      await Pooja.deleteOne({ title: 'Ganapathi Puja' });
      console.log('✓ Deleted "Ganapathi Puja"');
    } else if (ganapathiPuja && !ganeshPuja) {
      console.log('\n⚠️  Only "Ganapathi Puja" exists - will rename to "Ganesh Puja"');
      await Pooja.updateOne({ title: 'Ganapathi Puja' }, { $set: { title: 'Ganesh Puja' } });
      console.log('✓ Renamed "Ganapathi Puja" to "Ganesh Puja"');
    } else {
      console.log('\n✓ No duplicates found');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkGaneshPoojas();
