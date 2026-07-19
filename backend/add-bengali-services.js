const mongoose = require('mongoose');
require('dotenv').config();
const Pooja = require('./src/models/Pooja');

const newBengaliServices = [
  {
    title: 'Bhoomi Puja',
    description: 'Bhoomi Puja is performed for Goddess Bhoomi, Vaastu Purush, the deity of directions, and the five elements of nature to remove negative influences or Vastu dosh in the plot or land.',
    basePrice: 4500
  },
  {
    title: 'Durga Puja',
    description: 'Durga Mata is a very powerful deity. Performing this Puja protects people from all troubles and sufferings. A person will be blessed with happiness and positivity in life. This is a 5-day Durga Puja (from Shashti to Dashami) performed by our experienced team from West Bengal.',
    basePrice: 45000
  },
  {
    title: 'Ganesh Puja',
    description: 'Ganesh Puja is performed for Lord Ganapathi who removes all obstacles and negative energies. This puja blesses one with victory, brings harmony in the family, and helps one succeed in life.',
    basePrice: 5800
  },
  {
    title: 'Griho Probesh',
    description: 'Griho Probesh (house warming ceremony) performed by experienced pandits with authentic Bengali rituals for a blessed new home.',
    basePrice: 5500
  },
  {
    title: 'Laxmi Puja',
    description: 'Laxmi Puja performed with traditional rituals for prosperity, wealth, and divine blessings in your home and business.',
    basePrice: 4500
  },
  {
    title: 'Onnoprashon (Mukhe Bhaat)',
    description: 'Onnoprashon (Mukhe Bhaat) - the first rice feeding ceremony for your child, performed according to authentic Bengali traditions.',
    basePrice: 3900
  },
  {
    title: 'Satyanarayan Puja',
    description: 'Satyanarayan Puja is performed to remove obstacles and negative energies and to bring success, prosperity, and harmony into life. This sacred ritual invokes the blessings of Lord Vishnu in the form of Lord Satyanarayan for wealth, peace, and overall well-being of the family.',
    basePrice: 4000
  },
  {
    title: 'Vivah (Marriage)',
    description: 'Marriage Puja or Wedding Ceremony is one of the most sacred and important events in life. Performing Vivah as per Vedic traditions invokes blessings for a prosperous and harmonious married life.',
    basePrice: 14000
  },
  {
    title: 'Upanayan',
    description: 'Upanayan (sacred thread ceremony) performed by experienced pandits following authentic Bengali rituals and traditions.',
    basePrice: 8500
  }
];

const buildPackages = (basePrice) => [
  { name: 'Without Samagri', price: basePrice, includesSamagri: false },
  { name: 'With Samagri', price: Math.round(basePrice * 1.35), includesSamagri: true },
];

async function addBengaliServices() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    let added = 0;
    let skipped = 0;

    for (const service of newBengaliServices) {
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
    console.error('Error adding Bengali services:', error);
    process.exit(1);
  }
}

addBengaliServices();


