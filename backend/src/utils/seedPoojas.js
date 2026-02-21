const Pooja = require('../models/Pooja');

const poojaTitles = [
  'Annaprashan Puja',
  'Bhoomi Puja',
  'Brihaspati Vrat Udyapan Puja',
  'Durga Puja',
  'Ekadashi Vrat Udyapan Puja',
  'Engagement Puja - Sagai',
  'Fix Your Muhurat',
  'Gand Mool Nakshatra Shanti Puja',
  'Ganesh Puja',
  'Godh Bharai Puja (Baby Shower)',
  'Graha Shanti Puja',
  'Griha Pravesh',
  'Haldi Ceremony',
  'Janamdin Puja - Birthday Puja',
  'Kuber Upasana Puja',
  'Lalitha Sahasranam Puja',
  'Mahalaxmi Puja',
  'Mundan Or Chudakarana Ceremony',
  'Murti Pran Pratishta At Home',
  'Namkaran Puja',
  'New Vehicle Puja',
  'Office Opening Puja',
  'Punsavan Sanskar',
  'Roka Ceremony',
  'Rudrabhishek Puja',
  'Saraswati Puja',
  'Satyanarayan Puja',
  'Shuddhikaran Puja',
  'Solah Somvar Udyapan Puja',
  'Surya Puja',
  'Vastu Shanti Puja',
  'Vidyarambham (Patti Pujan)',
  'Vishwakarma Puja',
  'Vivah (Marriage)',
  'Yagnopavit Sanskar',
];

const defaultImage =
  'https://images.unsplash.com/photo-1542327897-d73f4005b533?auto=format&fit=crop&w=1200&q=80';

const buildPackages = (basePrice) => [
  { name: 'Without Samagri', price: basePrice, includesSamagri: false },
  { name: 'With Samagri', price: Math.round(basePrice * 1.35), includesSamagri: true },
];

const seedPoojas = async () => {
  const existingPoojas = await Pooja.find({}, { title: 1 }).lean();
  const existingTitles = new Set(existingPoojas.map((pooja) => pooja.title));
  const missingTitles = poojaTitles.filter((title) => !existingTitles.has(title));

  if (missingTitles.length === 0) {
    return;
  }

  const docs = missingTitles.map((title, index) => {
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
  console.log(`Default poojas seeded: ${missingTitles.length} added`);
};

module.exports = seedPoojas;
