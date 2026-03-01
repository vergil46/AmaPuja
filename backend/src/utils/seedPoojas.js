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
    let packages = buildPackages(basePrice);
    // Special case for Saraswati Puja: custom description, pricing, packages, procedures, and addOns
    if (title === 'Saraswati Puja') {
      return {
        title,
        description:
          'Mata Saraswati is the deity of intelligence, wisdom, arts, music, memory power, and other soft skills. This havan relieves people from mental pressure. It improves concentration, memory power, focus, and the ability to understand complex things.',
        image: defaultImage,
        startPrice: 3500,
        pricing: {
          odia: {
            packages: [
              {
                name: 'With Samagri',
                price: 4300,
                pandits: '1 Panditji + Pooja Samagries',
                procedure: [
                  'Ghata Sthapana',
                  'Sankalpa',
                  'Ganapathi Puja',
                  'Panchdevata Puja',
                  'Saraswati Devi Avahan',
                  'Bhog Neivedhya',
                  'Aarti',
                  'Pushpanjali',
                  'Prasad Sevan',
                ],
                inclusions: ['Dakshina', 'Puja Samagries'],
              },
            ],
            addOns: [
              { name: 'Flowers & Fruits', price: 1000 },
              { name: 'Havan', price: 1000 },
            ],
          },
          hindi: {
            packages: [
              {
                name: 'Standard',
                price: 3500,
                pandits: '1 Pandit + All Pooja Materials',
                procedure: [
                  'Swasti vachanam',
                  'Maha Sankalp',
                  'Ganapathi Puja',
                  'Saraswati Puja',
                  'Aarti & Prasad Distribution',
                ],
                inclusions: ['Dakshina', 'All Puja Samagries'],
              },
              {
                name: 'Premium',
                price: 6500,
                pandits: '2 Panditji + All Puja Samagries',
                procedure: [
                  'Swasti vachanam',
                  'Maha Sankalp',
                  'Ganapathi Puja',
                  'Punyaha Vachanam',
                  'Saraswati Puja',
                  'Aarti & Prasad Distribution',
                ],
                inclusions: ['Dakshina', 'All Puja Samagries'],
              },
            ],
            addOns: [
              { name: 'Flowers & Fruits', price: 1000 },
              { name: 'Havan', price: 1000 },
            ],
          },
          bengali: {
            packages: [
              {
                name: 'Standard',
                price: 4500,
                pandits: '1 Pandit + All Pooja Materials',
                procedure: [
                  'Swasti vachanam',
                  'Maha Sankalp',
                  'Ganapathi Puja',
                  'Punyaha Vachanam',
                  'Saraswati Puja',
                  'Aarti & Prasad Distribution',
                ],
                inclusions: ['Dakshina', 'All Puja Samagries'],
              },
            ],
            addOns: [
              { name: 'Flowers & Fruits', price: 1000 },
              { name: 'Havan', price: 1000 },
            ],
          },
        },
      };
    }
    // ...existing code...
  });

  await Pooja.insertMany(docs, { ordered: false });
  console.log(`Default poojas seeded: ${missingTitles.length} added`);
};

module.exports = seedPoojas;
