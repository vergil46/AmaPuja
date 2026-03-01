const mongoose = require('mongoose');
require('dotenv').config();
const Pooja = require('./src/models/Pooja');

const newOdiaServices = [
  {
    title: 'Annaprashan Puja',
    description: 'Annaprashan Puja - the first rice feeding ceremony for your child, performed according to authentic Odia traditions with personalized rituals.',
    basePrice: 3900
  },
  {
    title: 'Ganapathi Puja',
    description: 'Ganapathi Puja performed with traditional Odia rituals to remove obstacles and bring prosperity, success, and divine blessings.',
    basePrice: 4200
  },
  {
    title: 'Lakshmi Puja',
    description: 'Lakshmi Puja performed with traditional Odia rituals for prosperity, wealth, and divine blessings in your home and business.',
    basePrice: 4500
  },
  {
    title: 'Namkaran Puja (Ekoisia)',
    description: 'Namkaran Puja (Ekoisia) - the naming ceremony for your newborn performed according to authentic Odia traditions with astrological guidance.',
    basePrice: 3800
  }
];

const buildPackages = (basePrice) => [
  { name: 'Without Samagri', price: basePrice, includesSamagri: false },
  { name: 'With Samagri', price: Math.round(basePrice * 1.35), includesSamagri: true },
];

async function addProperOdiaServices() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    let added = 0;
    let skipped = 0;

    for (const service of newOdiaServices) {
      const exists = await Pooja.findOne({ title: service.title });
      
      if (exists) {
        console.log(`⏭ Already exists: "${service.title}"`);
        skipped++;
      } else {
        const defaultImage = 'https://images.unsplash.com/photo-1542327897-d73f4005b533?auto=format&fit=crop&w=1200&q=80';
        
        await Pooja.create({
          title: service.title,
          description: service.description,
          image: defaultImage,
          startPrice: service.basePrice,
          packages: buildPackages(service.basePrice),
        });
        
        console.log(`✓ Added: "${service.title}"`);
        added++;
      }
    }

    // Also fix the Office/Shop Opening Puja capitalization
    const officeServiceLower = await Pooja.findOne({ title: 'office/shop opening puja' });
    if (officeServiceLower) {
      await Pooja.updateOne(
        { title: 'office/shop opening puja' },
        { $set: { title: 'Office/Shop Opening Puja' } }
      );
      console.log(`✓ Updated: "office/shop opening puja" → "Office/Shop Opening Puja"`);
      added++;
    }

    console.log(`\n✅ Complete: ${added} added/updated, ${skipped} skipped`);
    
    const total = await Pooja.countDocuments();
    console.log(`\nTotal services in database: ${total}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addProperOdiaServices();
