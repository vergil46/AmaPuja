const Pooja = require('../models/Pooja');

const poojaTitles = [
  'Aksharabhyasa',
  'Annaprasana',
  'Annaprasana (Onnoprashon)',
  'Annaprashan Pooja',
  'Annaprashan Puja',
  'Bhima Ratha Shanti (70th Birthday)',
  'Bhoomi Puja',
  'Brihaspati Vrat Udyapan',
  'Chaula or Chudakarma',
  'Devata Kalyanotsavam',
  'Durga Puja',
  'Ekadashi Vrat Udyapan',
  'Engagement Puja - Nirbandha',
  'Fix Your Muhurat',
  'Gand Mool Nakshatra Shanti Puja',
  'Ganapathi Puja',
  'Ganesh Puja',
  'Ganpathi puja',
  'Godh Bharai (Baby Shower)',
  'Graha Shanti Puja',
  'Griha Pravesh (Gruha Pratistha)',
  'Griho Probesh',
  'Gruhapravesha Pooja',
  'Haldi Ceremony',
  'Janamdin Puja (Birthday Puja)',
  'Janma Chuti Poka (Mundan)',
  'Karna Vedhana',
  'Kuber Upasana Puja',
  'Lakshmi Puja',
  'Lalitha Sahasranam Puja',
  'laxmi puja',
  'Mahalaxmi Puja',
  'Marriage',
  'Murti Pran Pratishta',
  'Namakarana',
  'Namkaran (Ekoisia)',
  'Namkaran Puja (Ekoisia)',
  'namkaran puja(ekosia)',
  'New Vehicle Puja',
  'Nischitartha',
  'Office Opening Puja',
  'Office/Shop Opening Puja',
  'Onnoprashon (Mukhe Bhaat)',
  'Punsavan Sanskar',
  'Roka Ceremony',
  'Rudrabhishek Puja',
  'Saraswati Puja',
  'Sashtiapthapoorthi (60th Birthday)',
  'Sathabhishekam (80th birthday)',
  'Satyanarayan Puja',
  'Seemantha',
  'Shuddhikaran Puja',
  'Solah Somvar Udyapan',
  'Surya Puja',
  'Upakarma',
  'Upanayan',
  'Upanayana',
  'Vastu Shanti Puja',
  'Vidyarambham (Patti Pujan)',
  'Vishwakarma Puja',
  'Vivah (Marriage)',
  'Yagnopavit Sanskar (Bratabandha)',
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
