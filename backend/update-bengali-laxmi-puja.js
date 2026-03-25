const mongoose = require('mongoose');
require('dotenv').config();

const Pooja = require('./src/models/Pooja');

const bengaliStandardPackage = {
  name: 'Standard',
  price: 5200,
  includesSamagri: true,
  pandits: '1 Panditji + All Puja Samagries',
  procedure: [
    'Swasti vachanam',
    'Maha Sankalp',
    'Ganapathi Puja',
    'Punyaha Vachanam',
    'Mahalaxmi Puja',
    'Aarti & Prasad Distribution',
  ],
  inclusions: ['Dakshina', 'All Puja Samagries'],
  addOns: [{ name: 'Flowers & Fruits', price: 2000 }],
};

async function updateBengaliLaxmiPuja() {
  await mongoose.connect(process.env.MONGO_URI);

  const filter = { title: /^laxmi puja$/i };

  const update = {
    $set: {
      description:
        'Laxmi Puja performed with traditional Bengali rituals for prosperity, wealth, and divine blessings in your home.',
      startPrice: 5200,
      availableLanguages: ['bengali'],
      packages: [bengaliStandardPackage],
      addOns: [],
      'localizedTitle.bengali': 'Laxmi Puja',
      'localizedDescription.bengali.short':
        'Laxmi Puja is performed to gain wealth and financial stability through the blessings of Goddess Laxmi.',
      'localizedDescription.bengali.full':
        'Laxmi Puja is performed to gain wealth, preserve existing wealth, and achieve financial stability by seeking the blessings of Goddess Laxmi, the Goddess of wealth and prosperity.',
      'pricing.bengali.title': 'Laxmi Puja',
      'pricing.bengali.description.short':
        'Laxmi Puja is performed to gain wealth and financial stability through the blessings of Goddess Laxmi.',
      'pricing.bengali.description.full':
        'Laxmi Puja is performed to gain wealth, preserve existing wealth, and achieve financial stability by seeking the blessings of Goddess Laxmi, the Goddess of wealth and prosperity.',
      'pricing.bengali.packages': [bengaliStandardPackage],
      'pricing.bengali.addOns': [],
    },
  };

  const result = await Pooja.updateMany(filter, update);

  const updatedDocs = await Pooja.find(filter)
    .select('title startPrice packages availableLanguages pricing.bengali')
    .lean();

  console.log('Matched:', result.matchedCount || 0);
  console.log('Modified:', result.modifiedCount || 0);
  console.log(JSON.stringify(updatedDocs, null, 2));
}

updateBengaliLaxmiPuja()
  .catch((error) => {
    console.error('Update failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
