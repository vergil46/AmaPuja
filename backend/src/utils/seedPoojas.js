const Pooja = require('../models/Pooja');

const poojaTitles = [
  'Annaprashan Puja',
  'Engagement Puja – Nirbandha',
  'Ganapathi Puja',
  'Griha Pravesh (Gruha Pratistha)',
  'Janma Chuti Poka (Mundan)',
  'Lakshmi Puja',
  'Namkaran Puja (Ekoisia)',
  'Office/Shop Opening Puja',
  'Saraswati Puja',
  'Satyanarayan Puja',
  'Vishwakarma Puja',
];

const defaultImage =
  'https://images.unsplash.com/photo-1542327897-d73f4005b533?auto=format&fit=crop&w=1200&q=80';

const buildPackages = (basePrice) => [
  { name: 'Basic', price: basePrice, includesSamagri: false },
  { name: 'Standard', price: Math.round(basePrice * 1.35), includesSamagri: true },
  { name: 'Premium', price: Math.round(basePrice * 1.8), includesSamagri: true },
];

const seedPoojas = async () => {
  const hasValidPooja = await Pooja.findOne({ 'packages.0': { $exists: true } });
  if (hasValidPooja) return;

  const docs = poojaTitles.map((title, index) => {
    const basePrice = 3500 + index * 400;
    return {
      title,
      description: `${title} performed by experienced pandits with authentic rituals and personalized guidance for your family traditions.`,
      image: defaultImage,
      startPrice: basePrice,
      packages: buildPackages(basePrice),
    };
  });

  await Pooja.insertMany(docs, { ordered: false });
  console.log('Default poojas seeded');
};

module.exports = seedPoojas;
