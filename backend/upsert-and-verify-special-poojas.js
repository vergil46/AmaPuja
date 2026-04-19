const mongoose = require('mongoose');
require('dotenv').config();

const Pooja = require('./src/models/Pooja');

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1542327897-d73f4005b533?auto=format&fit=crop&w=1200&q=80';

const officeOpeningPuja = {
  serviceKey: 'office_opening_puja',
  title: 'Office Opening Puja',
  availableLanguages: ['odia', 'hindi'],
  localizedTitle: {
    odia: 'Office Opening Puja',
    hindi: 'Office/Shop Opening Puja',
  },
  localizedDescription: {
    odia: {
      short: 'Office Opening Puja for Odia rituals',
      full: 'In the new building or place, many negative dosh and effects exist. By performing Office Opening Puja, blessings of Lord Ganesha and Mata Lakshmi are invoked to negate the influence of negative energies and bring success in business.',
    },
    hindi: {
      short: 'Office/Shop Opening Puja with Hindi pandits',
      full: 'In the new building or place, many negative dosh and effects exist. By performing Office Opening Puja, blessings of Lord Ganesha and Mata Lakshmi are invoked to negate the influence of negative energies and bring success in business.',
    },
  },
  description:
    'In the new building or place, many negative dosh and effects exist. By performing Office Opening Puja, blessings of Lord Ganesha and Mata Lakshmi are invoked to negate the influence of negative energies and bring success in business.',
  image: DEFAULT_IMAGE,
  startPrice: 4300,
  packages: [
    {
      name: 'Standard',
      price: 4300,
      includesSamagri: true,
      pandits: '1 Panditji + All Puja Samagries',
      procedure: [
        'Ganapathi Puja',
        'Lakshmi Puja',
        'Vastu Puja',
        'Vishnu Puja',
        'Navagraha Puja',
        'Dwarpal Puja',
        'Dasadikpal Puja',
        'Havan',
        'Pushpanjali',
        'Neivedhya',
        'Aarti',
        'Prasad Vitran',
      ],
      inclusions: ['Dakshina', 'All Puja Samagries'],
    },
  ],
  addOns: [],
  pricing: {
    odia: {
      title: 'Office Opening Puja',
      description: {
        short: 'Office Opening Puja for Odia rituals',
        full: 'In the new building or place, many negative dosh and effects exist. By performing Office Opening Puja, blessings of Lord Ganesha and Mata Lakshmi are invoked to negate the influence of negative energies and bring success in business.',
      },
      packages: [
        {
          name: 'Standard',
          price: 4300,
          includesSamagri: true,
          pandits: '1 Panditji + All Puja Samagries',
          procedure: [
            'Ganapathi Puja',
            'Lakshmi Puja',
            'Vastu Puja',
            'Vishnu Puja',
            'Navagraha Puja',
            'Dwarpal Puja',
            'Dasadikpal Puja',
            'Havan',
            'Pushpanjali',
            'Neivedhya',
            'Aarti',
            'Prasad Vitran',
          ],
          inclusions: ['Dakshina', 'All Puja Samagries'],
        },
      ],
      addOns: [],
    },
    hindi: {
      title: 'Office/Shop Opening Puja',
      description: {
        short: 'Office/Shop Opening Puja with Hindi pandits',
        full: 'In the new building or place, many negative dosh and effects exist. By performing Office Opening Puja, blessings of Lord Ganesha and Mata Lakshmi are invoked to negate the influence of negative energies and bring success in business.',
      },
      packages: [
        {
          name: 'Economy',
          price: 3500,
          includesSamagri: true,
          pandits: '1 Panditji + Puja Samagries',
          description:
            'In this package 1 Panditji will be there, this package is recommended for those who are looking for simple and short puja for New office, Restaurants, any New shop openings etc.',
          procedure: [
            'Swasti vachanam',
            'Gauri Ganesh Puja',
            'Kalash Puja',
            'Ganesh, Lakshmi and Navgraha Puja',
            'Aarti',
            'Pushpanjali',
          ],
          inclusions: ['Dakshina', 'All Puja Samagries'],
          addOns: [
            { name: 'Flowers & Fruits', price: 1200 },
            { name: 'Havan', price: 1000 },
          ],
          note:
            'Puja Samagries like Haldi, Abeer, Gulal, Mango leaves, Tulasi, Darba, Kalash, Beetle Leaves, Beetle Nuts, Dravyas, Kapda, Ghee etc. will be brought by us. Yajaman has to keep house items like Vessels, Oil Lamps, Mats, Bowls, Chowki, Plates, Milk, Curd, Prasad, Photos etc. You will receive a detailed to-do list after booking.',
        },
        {
          name: 'Standard',
          price: 7200,
          includesSamagri: true,
          pandits: '2 Panditji + All Puja Samagries + Havan',
          description:
            'In standard package 2 Vedic pandits will be there, More number of Vedis/mandals will be put, more number of mantra aahutis will be performed and Puja goes on for 2:00 to 2:30 hrs.',
          procedure: [
            'Dwar Puja',
            'Gauri Ganesh puja',
            'Kalash Navgraha Puja',
            'Vastu Puja',
            'Havans – Ganesh, Navagrah, Laxmi, Varun and Vastu Havan',
            'Poornahuthi, Aarti & Prasad Distribution',
          ],
          inclusions: ['Dakshina', 'All Puja Samagries'],
          addOns: [{ name: 'Flowers & Fruits', price: 1500 }],
          note:
            'Puja Samagries like Haldi, Abeer, Gulal, Mango leaves, Tulasi, Darba, Kalash, Beetle Leaves, Beetle Nuts, Dravyas, Kapda, Ghee, Havan Sticks, Samidha etc. will be brought by us. Yajaman has to keep house items like Vessels, Oil Lamps, Mats, Bowls, Chowki, Milk, Curd, Plates, Prasad, Photos etc. You will receive a detailed to-do list after booking.',
        },
      ],
      addOns: [],
    },
  },
};

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set');
  }

  await mongoose.connect(process.env.MONGO_URI);
  await Pooja.deleteOne({ title: 'Office/Shop Opening Puja' });

  const updated = await Pooja.findOneAndUpdate(
    { title: officeOpeningPuja.title },
    { $set: officeOpeningPuja },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  console.log(
    JSON.stringify(
      {
        title: updated.title,
        startPrice: updated.startPrice,
        pricing: {
          odia: updated.pricing?.odia?.packages?.map((pkg) => ({ name: pkg.name, price: pkg.price })) || [],
          hindi: updated.pricing?.hindi?.packages?.map((pkg) => ({ name: pkg.name, price: pkg.price })) || [],
        },
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    console.error(disconnectError);
  }
  process.exitCode = 1;
});
