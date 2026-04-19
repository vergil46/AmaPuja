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
  'Mahalaxmi Puja',
  'Marriage',
  'Murti Pran Pratishta',
  'Namakarana',
  'Namkaran Puja (Ekoisia)',
  'New Vehicle Puja',
  'Nischitartha',
  'Office Opening Puja',
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
    if (title === 'Office Opening Puja') {
      return {
        title,
        description:
          'In the new building or place, many negative dosh and effects exist. By performing Office Opening Puja, blessings of Lord Ganesha and Mata Lakshmi are invoked to negate the influence of negative energies and bring success in business.',
        image: defaultImage,
        startPrice: 4300,
        pricing: {
          odia: {
            packages: [
              {
                name: 'Standard',
                price: 4300,
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
            packages: [
              {
                name: 'Economy',
                price: 3500,
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
        startPrice: 4300,
        packages: [
          { name: 'Standard', price: 4300, includesSamagri: true },
        ],
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
        addOns: [],
      };
    }
    // ...existing code...
  });

  await Pooja.insertMany(docs, { ordered: false });
  console.log(`Default poojas seeded: ${missingTitles.length} added`);
};

module.exports = seedPoojas;
