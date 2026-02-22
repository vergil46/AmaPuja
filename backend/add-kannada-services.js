const mongoose = require('mongoose');
require('dotenv').config();
const Pooja = require('./src/models/Pooja');

const kannadaServices = [
  {
    title: 'Aksharabhyasa',
    description: 'Aksharabhyasa - the sacred ceremony for a child\'s first learning experience, performed with traditional Kannada rituals and blessings.',
    basePrice: 4200
  },
  {
    title: 'Annaprasana',
    description: 'Annaprasana - the first rice feeding ceremony for your child, performed according to authentic Kannada traditions.',
    basePrice: 3900
  },
  {
    title: 'Bhima Ratha Shanti (70th Birthday)',
    description: 'Bhima Ratha Shanti - special 70th birthday puja performed for longevity, health, and prosperity according to Kannada traditions.',
    basePrice: 7500
  },
  {
    title: 'Chaula or Chudakarma',
    description: 'Chaula or Chudakarma - the first hair cutting ceremony performed with traditional Kannada rituals and blessings.',
    basePrice: 4100
  },
  {
    title: 'Devata Kalyanotsavam',
    description: 'Devata Kalyanotsavam - divine wedding ceremony for your home deity performed with authentic Kannada rituals.',
    basePrice: 6500
  },
  {
    title: 'Fix Your Muhurtha',
    description: 'Fix Your Muhurtha - professional astrology consultation to determine the most auspicious time for your important life events.',
    basePrice: 2500
  },
  {
    title: 'Gruhapravesha Pooja',
    description: 'Gruhapravesha Pooja - house warming ceremony performed with traditional Kannada rituals for a blessed new home.',
    basePrice: 5500
  },
  {
    title: 'Karna Vedhana',
    description: 'Karna Vedhana - ear piercing ceremony performed with traditional Kannada rituals and blessings for your child.',
    basePrice: 3700
  },
  {
    title: 'Marriage',
    description: 'Marriage ceremony performed by experienced pandits following authentic Kannada wedding rituals and traditions.',
    basePrice: 15000
  },
  {
    title: 'Namakarana',
    description: 'Namakarana - naming ceremony for your newborn performed according to authentic Kannada traditions and astrological guidance.',
    basePrice: 3800
  },
  {
    title: 'Nischitartha',
    description: 'Nischitartha - engagement ceremony performed with traditional Kannada rituals for a blessed union.',
    basePrice: 5500
  },
  {
    title: 'Sashtiapthapoorthi (60th Birthday)',
    description: 'Sashtiapthapoorthi - special 60th birthday puja performed for longevity, health, and prosperity according to Kannada traditions.',
    basePrice: 7000
  },
  {
    title: 'Sathabhishekam (80th birthday)',
    description: 'Sathabhishekam - sacred 80th birthday puja performed for divine blessings, longevity, and peace according to Kannada traditions.',
    basePrice: 8500
  },
  {
    title: 'Seemantha',
    description: 'Seemantha - baby shower ceremony performed with traditional Kannada rituals for the health and wellbeing of mother and child.',
    basePrice: 4800
  },
  {
    title: 'Upakarma',
    description: 'Upakarma - annual thread changing ceremony performed according to authentic Kannada Vedic traditions.',
    basePrice: 4500
  },
  {
    title: 'Upanayana',
    description: 'Upanayana - sacred thread ceremony performed by experienced pandits following authentic Kannada rituals and traditions.',
    basePrice: 8500
  }
];

const buildPackages = (basePrice) => [
  { name: 'Without Samagri', price: basePrice, includesSamagri: false },
  { name: 'With Samagri', price: Math.round(basePrice * 1.35), includesSamagri: true },
];

async function addKannadaServices() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    let added = 0;
    let skipped = 0;

    for (const service of kannadaServices) {
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

    console.log(`\n✅ Complete: ${added} added, ${skipped} skipped`);
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error adding Kannada services:', error);
    process.exit(1);
  }
}

addKannadaServices();
