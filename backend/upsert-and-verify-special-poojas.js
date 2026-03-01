const mongoose = require('mongoose');
require('dotenv').config();
const Pooja = require('./src/models/Pooja');

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1542327897-d73f4005b533?auto=format&fit=crop&w=1200&q=80';

const SUPPORTED_LANGUAGES = ['odia', 'hindi', 'bengali', 'kannada'];

const createServiceKey = (title = '') =>
  String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const ensureLanguageArchitecture = (pooja) => {
  const serviceKey = pooja.serviceKey || createServiceKey(pooja.title);

  const localizedTitle =
    pooja.localizedTitle && typeof pooja.localizedTitle === 'object'
      ? { ...pooja.localizedTitle }
      : {};

  const localizedDescription =
    pooja.localizedDescription && typeof pooja.localizedDescription === 'object'
      ? { ...pooja.localizedDescription }
      : {};

  const pricing =
    pooja.pricing && typeof pooja.pricing === 'object'
      ? deepClone(pooja.pricing)
      : {};

  SUPPORTED_LANGUAGES.forEach((languageKey) => {
    if (!localizedTitle[languageKey]) {
      localizedTitle[languageKey] = pooja.title;
    }

    if (!localizedDescription[languageKey]) {
      localizedDescription[languageKey] = {
        short: pooja.description,
        full: pooja.description,
      };
    } else {
      localizedDescription[languageKey] = {
        short:
          localizedDescription[languageKey].short ||
          pooja.description,
        full:
          localizedDescription[languageKey].full ||
          pooja.description,
      };
    }

    if (!pricing[languageKey]) {
      pricing[languageKey] = {
        title: localizedTitle[languageKey],
        description: deepClone(localizedDescription[languageKey]),
        packages: deepClone(pooja.packages || []),
        addOns: deepClone(pooja.addOns || []),
      };
    } else {
      pricing[languageKey] = {
        ...pricing[languageKey],
        title:
          pricing[languageKey].title ||
          localizedTitle[languageKey],
        description: {
          short:
            pricing[languageKey].description?.short ||
            localizedDescription[languageKey].short,
          full:
            pricing[languageKey].description?.full ||
            localizedDescription[languageKey].full,
        },
        packages:
          Array.isArray(pricing[languageKey].packages) &&
          pricing[languageKey].packages.length > 0
            ? pricing[languageKey].packages
            : deepClone(pooja.packages || []),
        addOns:
          Array.isArray(pricing[languageKey].addOns)
            ? pricing[languageKey].addOns
            : deepClone(pooja.addOns || []),
      };
    }
  });

  const availableLanguageSet = new Set(
    (Array.isArray(pooja.availableLanguages)
      ? pooja.availableLanguages
      : [])
      .map((item) => String(item || '').trim().toLowerCase())
      .filter(Boolean)
  );

  Object.keys(pricing).forEach((languageKey) => {
    availableLanguageSet.add(languageKey);
  });

  SUPPORTED_LANGUAGES.forEach((languageKey) => {
    availableLanguageSet.add(languageKey);
  });

  return {
    ...pooja,
    serviceKey,
    availableLanguages: Array.from(availableLanguageSet),
    localizedTitle,
    localizedDescription,
    pricing,
  };
};

const pujasToUpsert = [
  {
    title: 'Annaprashan Puja',
    description:
      'Annaprashan is the ceremony where the baby is introduced to solid foods preferably Sweet/Milk Rice for the first time. The puja is performed to bestow a very healthy and prosperous life for the baby.',
    startPrice: 4000,
    packages: [
      {
        name: 'Standard',
        price: 4000,
        includesSamagri: true,
        pandits: '1 Panditji + All Puja Samagries',
        procedure: [
          'Ghata Sthapana',
          'Sankalpa',
          'Ganapathi Panchdevta Puja',
          'Matrugana Puja',
          'Havan',
          'Annaprashan',
          'Neivedhya',
          'Aarti',
          'Pushpanjali',
          'Bhojya daana',
        ],
        inclusions: ['Dakshina', 'All Pooja Materials'],
        note:
          'Puja Samagries like Haldi, Abeer, Gulal, Mango leaves, Tulasi, Darba, Kalash, Beetle Leaves, Beetle Nuts, Havan Sticks, Samidha, Havan Kund, Dravyas, Kapda, Ghee, etc. will be brought by us. Yajaman has to keep house items like Vessels, Oil Lamps, Mats, Bowls, Chowki, Plates, Prasad, Photos etc. You will receive a detailed to-do list after booking.',
      },
    ],
    addOns: [
      { name: 'Flowers & Fruits', price: 1000 },
      { name: 'Satyanarayan Katha', price: 1700 },
    ],
  },
  {
    title: 'Engagement Puja',
    description:
      'Engagement or Nirbandha is an occasion where there is a formal agreement to get married and families announce the same to society. It is also known as the betrothal ceremony, Sagai, Ring ceremony, Nishchitartham, Roka, Chunni, etc.',
    startPrice: 4000,
    packages: [
      {
        name: 'Standard',
        price: 4000,
        includesSamagri: true,
        pandits: '1 Panditji + Puja Samagries',
        procedure: [
          'Ghata Sthapana',
          'Mangalastaka',
          'Ganapathi Panchdevta Puja',
          'Both Parents Sankalpa',
          'Pushpanjali',
          'Satya Patha',
          'Kanya Agamana',
          'Ring Exchange',
        ],
        inclusions: ['Dakshina', 'All Puja Samagries'],
      },
    ],
    addOns: [{ name: 'Flowers & Fruits', price: 1000 }],
  },
  {
    title: 'Ganapathi Puja',
    description:
      'Ganapathi Puja is performed for Lord Ganapathi who removes all the obstacles and negative energies. This puja bestows a person with victory, brings harmony to the family, and helps to attain success in life.',
    startPrice: 5200,
    packages: [
      {
        name: 'Standard',
        price: 5200,
        includesSamagri: true,
        pandits: '1 Panditji + Pooja Samagries',
        procedure: [
          'Ghata Sthapana',
          'Sankalpa',
          'Ganapathi Puja',
          'Panchdevata Puja',
          'Ganapathi Devata Avahan',
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
      { name: 'Havan', price: 100 },
    ],
  },
  {
    serviceKey: 'griha_pravesh',
    title: 'Griha Pravesh',
    availableLanguages: ['odia', 'hindi', 'bengali'],
    localizedTitle: {
      odia: 'Griha Pravesh',
      hindi: 'Griha Pravesh',
      bengali: 'Griho Probesh',
    },
    localizedDescription: {
      odia: {
        short: 'Griha Pravesh puja for peaceful new home entry',
        full: 'Griha Pravesh also known as Gruha Pratistha is the set of Pujas and rituals that are performed before a person starts to live in a new house. It is the process of cleansing the new house with Vedic mantras to make it peaceful and to live happily.',
      },
      hindi: {
        short: 'Griha Pravesh puja with Hindi pandits',
        full: 'Griha Pravesh also known as Gruha Pratistha is the set of Pujas and rituals that are performed before a person starts to live in a new house. It is the process of cleansing the new house with Vedic mantras to make it peaceful and to live happily.',
      },
      bengali: {
        short: 'Griho Probesh puja with Bengali pandits',
        full: 'Griha Pravesh also known as Gruha Pratistha is the set of Pujas and rituals that are performed before a person starts to live in a new house. It is the process of cleansing the new house with Vedic mantras to make it peaceful and to live happily.',
      },
    },
    description:
      'Griha Pravesh also known as Gruha Pratistha is the set of Pujas and rituals that are performed before a person starts to live in a new house. It is the process of cleansing the new house with Vedic mantras to make it peaceful and to live happily.',
    startPrice: 6200,
    packages: [
      {
        name: 'Basic',
        price: 6200,
        includesSamagri: true,
        pandits: '1 Panditji + All Puja Samagries',
        description:
          'Basic Griha Pravesh Puja goes on for 1:30-2 hrs. Recommended for those looking for simple, short puja or puja for rented home.',
        procedure: [
          'Dwar Puja',
          'Griha Pravesh',
          'Kitchen Puja',
          'Boiling Milk with new vessel',
          'Gauri Ganesh Puja',
          'Kalash Navgraha Puja',
          'Vastu Puja',
          'Havans – Ganesh, Navagraha, Laxmi, Varun and Vastu Havan',
          'Poornahuthi, Aarti & Prasad Distribution',
        ],
        inclusions: ['Dakshina', 'All Puja Samagries'],
        note:
          'Puja Samagries like Haldi, Abeer, Gulal, Mango leaves, Tulasi, Darba, Kalasha, Vastra, Beetle Leaves, Beetle Nuts, Homam Sticks, Samidha, Havan Kund, Dravyas, Kapda Ghee etc. will be brought by us. Yajaman has to keep house items like Gas stove, Vessels, Oil Lamps, Mats, Bowls, Chowki, Plates, Photos etc. You will be receiving a detailed to-do list after booking.',
        addOns: [
          { name: 'Flowers & Fruits', price: 1500 },
          { name: 'Satyanarayan Katha', price: 1700 },
        ],
      },
      {
        name: 'Economy',
        price: 11000,
        includesSamagri: true,
        pandits: '2 Panditji + All Puja Samagries',
        description:
          'In Economy package 2 vedic pandits will be there, more number of vedis/mandals will be put, more number of mantra aahutis will be performed and Griha Pravesh puja will be performed in a grand way and goes on for 2:30-3:00 hrs. This package is recommended for new home.',
        procedure: [
          'Dwar Puja',
          'Griha Pravesh',
          'Kitchen Puja',
          'Boiling Milk with new vessel',
          'Gauri Ganesh Puja',
          'Kalasha Navgraha Puja',
          'Vastu Puja',
          'Havans – Ganesh, Navagraha, Laxmi, Varun and Vastu Havan',
          'Poornahuthi, Aarti & Prasad Distribution',
        ],
        inclusions: ['Dakshina', 'All Puja Samagries'],
        note:
          'Puja Samagries like Haldi, Abeer, Gulal, Mango leaves, Tulasi, Darba, Kalasha, Vastra, Beetle Leaves, Beetle Nuts, Homam Sticks, Samidha, Havan Kund, Dravyas, Kapda Ghee etc. will be brought by us. Yajaman has to keep house items like Gas stove, Vessels, Oil Lamps, Mats, Bowls, Chowki, Plates, Photos etc. You will be receiving a detailed to-do list after booking.',
        addOns: [
          { name: 'Flowers & Fruits', price: 1600 },
          { name: 'Satyanarayan Katha', price: 1700 },
        ],
      },
    ],
    pricing: {
      hindi: {
        title: 'Griha Pravesh',
        description: {
          short: 'Griha Pravesh puja with Hindi pandits',
          full: 'Griha Pravesh also known as Gruha Pratistha is the set of Pujas and rituals that are performed before a person starts to live in a new house. It is the process of cleansing the new house with Vedic mantras to make it peaceful and to live happily.',
        },
        packages: [
          {
            name: 'Basic',
            price: 6200,
            includesSamagri: true,
            pandits: '1 Panditji + All Puja Samagries',
            description:
              'Basic Griha Pravesh Puja goes on for 1:30-2 hrs. Recommended for those looking for simple, short puja or puja for rented home.',
            procedure: [
              'Dwar Puja',
              'Griha Pravesh',
              'Kitchen Puja',
              'Boiling Milk with new vessel',
              'Gauri Ganesh Puja',
              'Kalash Navgraha Puja',
              'Vastu Puja',
              'Havans – Ganesh, Navagraha, Laxmi, Varun and Vastu Havan',
              'Poornahuthi, Aarti & Prasad Distribution',
            ],
            inclusions: ['Dakshina', 'All Puja Samagries'],
            note:
              'Puja Samagries like Haldi, Abeer, Gulal, Mango leaves, Tulasi, Darba, Kalasha, Vastra, Beetle Leaves, Beetle Nuts, Homam Sticks, Samidha, Havan Kund, Dravyas, Kapda Ghee etc. will be brought by us. Yajaman has to keep house items like Gas stove, Vessels, Oil Lamps, Mats, Bowls, Chowki, Plates, Photos etc. You will be receiving a detailed to-do list after booking.',
            addOns: [
              { name: 'Flowers & Fruits', price: 1500 },
              { name: 'Satyanarayan Katha', price: 1700 },
            ],
          },
          {
            name: 'Economy',
            price: 11000,
            includesSamagri: true,
            pandits: '2 Panditji + All Puja Samagries',
            description:
              'In Economy package 2 vedic pandits will be there, more number of vedis/mandals will be put, more number of mantra aahutis will be performed and Griha Pravesh puja will be performed in a grand way and goes on for 2:30-3:00 hrs. This package is recommended for new home.',
            procedure: [
              'Dwar Puja',
              'Griha Pravesh',
              'Kitchen Puja',
              'Boiling Milk with new vessel',
              'Gauri Ganesh Puja',
              'Kalasha Navgraha Puja',
              'Vastu Puja',
              'Havans – Ganesh, Navagraha, Laxmi, Varun and Vastu Havan',
              'Poornahuthi, Aarti & Prasad Distribution',
            ],
            inclusions: ['Dakshina', 'All Puja Samagries'],
            note:
              'Puja Samagries like Haldi, Abeer, Gulal, Mango leaves, Tulasi, Darba, Kalasha, Vastra, Beetle Leaves, Beetle Nuts, Homam Sticks, Samidha, Havan Kund, Dravyas, Kapda Ghee etc. will be brought by us. Yajaman has to keep house items like Gas stove, Vessels, Oil Lamps, Mats, Bowls, Chowki, Plates, Photos etc. You will be receiving a detailed to-do list after booking.',
            addOns: [
              { name: 'Flowers & Fruits', price: 1600 },
              { name: 'Satyanarayan Katha', price: 1700 },
            ],
          },
        ],
        addOns: [],
      },
      odia: {
        title: 'Griha Pravesh',
        description: {
          short: 'Traditional Odia Griha Pravesh packages',
          full: 'Griha Pravesh also known as Gruha Pratistha is the set of Pujas and rituals that are performed before a person starts to live in a new house. It is the process of cleansing the new house with Vedic mantras to make it peaceful and to live happily.',
        },
        packages: [
          {
            name: 'Economy',
            price: 7200,
            includesSamagri: true,
            pandits: '1 Panditji + All Puja Samagries',
            description:
              'Basic Griha Pravesh Puja goes on for 1:30-2 hrs. Recommended for those looking for Simple, Short Puja or Puja for rented home.',
            procedure: [
              'Ghata sthapana',
              'Dwarapal Puja',
              'Surya puja',
              'Panchagavya Sinchana',
              'Ganapati Ghata Puja',
              'Navagraha Mandal Puja',
              'Durga Madhava Puja',
              'Naryana Lakshmivardhani Ghata Puja.',
              'Vrindavati Puja',
              'Vastu Puja',
              'Havan',
              'Gruha pravesh',
              'Aarti and Pushpanjali',
            ],
            inclusions: ['Dakshina', 'All Puja Samagries'],
            note:
              'Puja Samagries like Haldi, Abeer, Gulal, Mango leaves, Tulasi, Darba, Kalasha, Vastra, Navadhanya, Beetle Leaves, Beetle Nuts, Homam Sticks, Samidha, Havan Kund, Dravyas, Kapda Ghee etc. will be brought by us. Yajaman has to keep house items like Gas stove, Vessels, Bhoji dan, Oil Lamps, Mats, Bowls, Chowki, Plates, Photos etc you will be receiving detailed to do list after booking.',
            addOns: [
              { name: 'Flowers & Fruits', price: 1500 },
              { name: 'Satyanarayan Katha', price: 1500 },
            ],
          },
          {
            name: 'Standard',
            price: 11000,
            includesSamagri: true,
            pandits: '2 Panditjis + All Puja Samagries',
            description:
              'In Standard Griha Pravesh Puja 1 main panditji and 1 assistant panditji will be there, More number of pujas will be performed and more number of mandals are drawn, total pooja goes on for 2:30-3:00 hours.',
            procedure: [
              'Ghata sthapana',
              'Dwarapal Puja',
              'Guru Puja',
              'Surya puja',
              'Matru pitru Puja',
              'Purohit varan',
              'Saptadhanya Abhimantrita',
              'Panchagavya Sinchana',
              'Ganapati Ghata Puja',
              'Brahma Mandal Puja',
              'Savitri Puja',
              'Navagraha Mandal Puja',
              'Dashadikpal Mandal Puja',
              'Astadasha Matrika Puja',
              'Durga Madhava Puja',
              'Naryana Lakshmivardhani Ghata Puja.',
              'Vrindavati Puja',
              'Vastu Mandal Puja',
              'Vishwakarma Puja',
              'Havan',
              'Gruha pravesh',
              'Aarti and Pushpanjali',
            ],
            inclusions: ['Dakshina', 'All Puja Samagries'],
            note:
              'Puja Samagries like Haldi, Abeer, Gulal, Mango leaves, Tulasi, Darba, Kalasha, Vastra, Navadhanya, Beetle Leaves, Beetle Nuts, Homam Sticks, Samidha, Havan Kund, Dravyas, Kapda Ghee etc. will be brought by us. Yajaman has to keep house items like Gas stove, Vessels, Bhoji daan, Oil Lamps, Mats, Bowls, Chowki, Plates, Photos etc you will be receiving detailed to do list after booking.',
            addOns: [
              { name: 'Flowers & Fruits', price: 2000 },
              { name: 'Satyanarayan Katha', price: 1500 },
            ],
          },
        ],
        addOns: [],
      },
      bengali: {
        title: 'Griho Probesh',
        description: {
          short: 'Traditional Bengali Griho Probesh packages',
          full: 'Griha Pravesh also known as Gruha Pratistha is the set of Pujas and rituals that are performed before a person starts to live in a new house. It is the process of cleansing the new house with Vedic mantras to make it peaceful and to live happily.',
        },
        packages: [
          {
            name: 'Economy',
            price: 7800,
            includesSamagri: true,
            pandits: '1 Panditji + All Puja Samagries',
            description:
              'Basic Griho Probesh Puja goes on for 1:30-2 hours. Recommended for those looking for simple, short puja or puja for rented home.',
            procedure: [
              'Ghata Sthapana',
              'Dwarapal Puja',
              'Surya Puja',
              'Panchagavya Sinchana',
              'Ganapati Ghata Puja',
              'Navagraha Mandal Puja',
              'Durga Madhava Puja',
              'Naryana Lakshmivardhani Ghata Puja',
              'Vrindavati Puja',
              'Vastu Puja',
              'Havan',
              'Griho Probesh',
              'Aarti and Pushpanjali',
            ],
            inclusions: ['Dakshina', 'All Puja Samagries'],
            note:
              'Puja Samagries like Haldi, Abeer, Gulal, Mango leaves, Tulasi, Darba, Kalasha, Vastra, Navadhanya, Beetle Leaves, Beetle Nuts, Homam Sticks, Samidha, Havan Kund, Dravyas, Kapda, Ghee etc. will be brought by us. Yajaman has to keep house items like Gas stove, Vessels, Bhoji dan, Oil Lamps, Mats, Bowls, Chowki, Plates, Photos etc. You will receive a detailed to-do list after booking.',
            addOns: [
              { name: 'Flowers & Fruits', price: 1500 },
              { name: 'Satyanarayan Katha', price: 1500 },
            ],
          },
          {
            name: 'Standard',
            price: 11000,
            includesSamagri: true,
            pandits: '2 Panditjis + All Puja Samagries',
            description:
              'In Standard Griho Probesh Puja, 1 main panditji and 1 assistant panditji perform additional pujas and more mandals. Total puja goes on for 2:30-3:00 hours.',
            procedure: [
              'Ghata Sthapana',
              'Dwarapal Puja',
              'Guru Puja',
              'Surya Puja',
              'Matru Pitru Puja',
              'Purohit Varan',
              'Saptadhanya Abhimantrita',
              'Panchagavya Sinchana',
              'Ganapati Ghata Puja',
              'Brahma Mandal Puja',
              'Savitri Puja',
              'Navagraha Mandal Puja',
              'Dashadikpal Mandal Puja',
              'Astadasha Matrika Puja',
              'Durga Madhava Puja',
              'Naryana Lakshmivardhani Ghata Puja',
              'Vrindavati Puja',
              'Vastu Mandal Puja',
              'Vishwakarma Puja',
              'Havan',
              'Griho Probesh',
              'Aarti and Pushpanjali',
            ],
            inclusions: ['Dakshina', 'All Puja Samagries'],
            note:
              'Puja Samagries like Haldi, Abeer, Gulal, Mango leaves, Tulasi, Darba, Kalasha, Vastra, Navadhanya, Beetle Leaves, Beetle Nuts, Homam Sticks, Samidha, Havan Kund, Dravyas, Kapda, Ghee etc. will be brought by us. Yajaman has to keep house items like Gas stove, Vessels, Bhoji daan, Oil Lamps, Mats, Bowls, Chowki, Plates, Photos etc. You will receive a detailed to-do list after booking.',
            addOns: [
              { name: 'Flowers & Fruits', price: 2000 },
              { name: 'Satyanarayan Katha', price: 1500 },
            ],
          },
        ],
        addOns: [],
      },
    },
    addOns: [],
  },
  {
    title: 'Janma Chuti Poka (Mundan)',
    description:
      'Mundan Ceremony is performed for the child, the hairs are shaved to signify freedom from the past and moving into the new life. Chudakarana is done to ensure the baby grows as a healthy and spiritual individual who is free from sins and also to attain the goodness of life.',
    startPrice: 3500,
    packages: [
      {
        name: 'Standard',
        price: 3500,
        includesSamagri: true,
        pandits: '1 Panditji + Puja Samagri',
        procedure: [
          'Swastivachanam',
          'Sankalp',
          'Gauri Ganesh Puja',
          'Panchdevata Puja',
          'Chudakaran Puja',
          'Bhog Neivedhya',
          'Pushpanjali',
          'Prasad Sevan',
        ],
        inclusions: ['Dakshina', 'All Puja Samagries'],
        note: 'You need to arrange your barber .',
      },
    ],
    addOns: [
      { name: 'Fruits & Flowers', price: 1000 },
      { name: 'Havan', price: 800 },
    ],
  },
  {
    title: 'Lakshmi Puja',
    description:
      'Lakshmi Puja is performed to gain, conserve the existing wealth, and also to achieve financial stability by appeasing Goddess Laxmi, the Goddess of wealth and prosperity.',
    startPrice: 4000,
    packages: [
      {
        name: 'Standard',
        price: 4000,
        includesSamagri: true,
        pandits: '1 Panditji + Puja Samagries',
        procedure: [
          'Kaya Shudhi',
          'Ghata Sthapana',
          'Sankalpa',
          'Ganapathi Panchdevta Puja',
          'Brahama Savitri Matrigana Mandal Puja',
          'Narayan Vardhani Ghata Puja',
          'Lakshmi Ghata Puja',
          'Neivedhya, Aarti',
          'Pushpanjali and Bhojyadana',
        ],
        inclusions: ['Dakshina', 'All Puja Samagries'],
      },
    ],
    addOns: [
      { name: 'Flowers & Fruits', price: 1000 },
      { name: 'Havan', price: 1000 },
    ],
  },
  {
    title: 'Namkaran Puja (Ekoisia)',
    description:
      'Namkaran is the naming ceremony of the child, it is very important as it is the first ceremony of a child’s life. It is also known as Ekoisia or Ekusia. Satyanarayan Katha and havan are performed for the well-being of the child to get all the blessings for a healthy and happy life.',
    startPrice: 5200,
    packages: [
      {
        name: 'Standard',
        price: 5200,
        includesSamagri: true,
        pandits: '1 Panditji + All Puja Samagries',
        procedure: [
          'Ghata Sthapana',
          'Sankalpa',
          'Ganapathi Panchdevta Puja',
          'Navagraha Mandala Puja',
          'Narayan Puja',
          'Satyanarayan Katha',
          'Havan',
          'Neivedhya',
          'Aarti',
          'Pushpanjali',
          'Namakaran',
          'Bhojya daana',
        ],
        inclusions: ['Dakshina', 'All Puja Samagries'],
        note:
          'Puja Samagries like Haldi, Abeer, Gulal, Mango leaves, Tulasi, Darba, Kalash, Beetle Leaves, Beetle Nuts, Havan Sticks, Samidha, Havan Kund, Dravyas, Kapda, Ghee etc. will be brought by us. Yajaman has to keep house items like Vessels, Oil Lamps, Mats, Bowls, Chowki, Plates, Prasad, Photos etc. You will receive a detailed to-do list after booking.',
      },
    ],
    addOns: [{ name: 'Flowers & Fruits', price: 1000 }],
  },
  {
    title: 'Office/Shop Opening Puja',
    description:
      'In the new building or place, many negative dosh and effects exist. By performing Office Opening Puja, blessings of Lord Ganesha and Mata Lakshmi are invoked to negate the influence of negative energies and bring success in business.',
    startPrice: 4300,
    packages: [
      {
        name: 'Standard',
        price: 4300,
        includesSamagri: true,
        pandits: '1 Panditji + All Pooja Samagries',
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
        note:
          'Puja Samagries like Haldi, Abeer, Gulal, Mango leaves, Tulasi, Darba, Kalash, Beetle Leaves, Beetle Nuts, Havan Sticks, Samidha, Havan Kund, Dravyas, Kapda, Ghee etc. will be brought by us. Yajaman has to keep house items like Vessels, Oil Lamps, Mats, Bowls, Chowki, Plates, Prasad, Photos etc. You will receive a detailed to-do list after booking.',
      },
    ],
    addOns: [{ name: 'Flowers & Fruits', price: 1000 }],
  },
  {
    title: 'Saraswati Puja',
    description:
      'Mata Saraswati is the deity of intelligence, wisdom, arts, music, memory power, and other soft skills. This havan relieves people from mental pressure. It improves concentration, memory power, focus, and the ability to understand complex things.',
    startPrice: 4300,
    packages: [
      {
        name: 'Standard',
        price: 4300,
        includesSamagri: true,
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
  {
    title: 'Satyanarayan Puja',
    description:
      'Satyanarayan Puja is performed to remove all the obstacles and negative energies and gives victory or success. It acquires wealth and prosperity and brings harmony to the family and success in life.',
    startPrice: 4000,
    packages: [
      {
        name: 'Standard',
        price: 4000,
        includesSamagri: true,
        pandits: '1 Panditji + All Pooja Samagries',
        procedure: [
          'Ganapathi Puja',
          'Varun Puja',
          'Narayan Puja',
          'Pachdevta Puja',
          'Navagraha Puja',
          'Asthadasha Matrika Puja',
          'Satyanarayan Katha Shravan',
          'Havan',
          'Pushpanjali',
          'Neivedhya',
          'Aarti',
          'Prasad Vitran',
        ],
        inclusions: ['Dakshina', 'All Puja Samagries'],
        note:
          'Puja Samagries like Haldi, Abeer, Gulal, Mango leaves, Tulasi, Darba, Kalash, Beetle Leaves, Beetle Nuts, Havan Sticks, Samidha, Havan Kund, Dravyas, Kapda, Ghee etc. will be brought by us. Yajaman has to keep house items like Vessels, Oil Lamps, Mats, Bowls, Chowki, Plates, Prasad, Photos, Bhojya daan (raw rice, dal, vegetables etc.) You will receive a detailed to-do list after booking.',
      },
    ],
    addOns: [{ name: 'Flowers & Fruits', price: 1000 }],
  },
  {
    title: 'Vishwakarma Puja',
    description:
      'Lord Vishwakarma is the chief deity of all architects and craftsmen, also known as Devashilpi. This puja is performed to please Lord Vishwakarma and get his blessings for a happy and wealthy life.',
    startPrice: 4000,
    packages: [
      {
        name: 'Standard',
        price: 4000,
        includesSamagri: true,
        pandits: '1 Panditji + Puja Samagries',
        procedure: [
          'Kaya Shudhi',
          'Ghata Sthapana',
          'Sankalpa',
          'Ganapathi Panchdevta Puja',
          'Narayan Vardhani Ghata Puja',
          'Vishwakarma Puja',
          'Neivedhya, Aarti',
          'Pushpanjali and Bhojyadana',
        ],
        inclusions: ['Dakshina', 'All Puja Samagries'],
      },
    ],
    addOns: [
      { name: 'Flowers & Fruits', price: 1000 },
      { name: 'Havan', price: 1000 },
    ],
  },
];

const expectedByTitle = new Map(pujasToUpsert.map((item) => [item.title, item]));

const validatePooja = (doc, expected) => {
  const issues = [];

  if (!doc) {
    issues.push('missing record');
    return issues;
  }

  if (!doc.description || doc.description.trim().length < 20) {
    issues.push('description missing/too short');
  }

  if (!Array.isArray(doc.packages) || doc.packages.length !== expected.packages.length) {
    issues.push(`packages mismatch (expected ${expected.packages.length}, got ${doc.packages?.length || 0})`);
  }

  for (const expectedPackage of expected.packages) {
    const found = (doc.packages || []).find((pkg) => pkg.name === expectedPackage.name);
    if (!found) {
      issues.push(`package missing: ${expectedPackage.name}`);
      continue;
    }

    if (Number(found.price) !== Number(expectedPackage.price)) {
      issues.push(
        `package price mismatch for ${expectedPackage.name} (expected ${expectedPackage.price}, got ${found.price})`
      );
    }

    if (!Array.isArray(found.procedure) || found.procedure.length === 0) {
      issues.push(`procedure missing for ${expectedPackage.name}`);
    }

    if (!Array.isArray(found.inclusions) || found.inclusions.length === 0) {
      issues.push(`inclusions missing for ${expectedPackage.name}`);
    }
  }

  const expectedAddOns = expected.addOns || [];
  const actualAddOns = doc.addOns || [];
  if (actualAddOns.length !== expectedAddOns.length) {
    issues.push(`add-ons mismatch (expected ${expectedAddOns.length}, got ${actualAddOns.length})`);
  }

  for (const expectedAddOn of expectedAddOns) {
    const found = actualAddOns.find((item) => item.name === expectedAddOn.name);
    if (!found) {
      issues.push(`add-on missing: ${expectedAddOn.name}`);
      continue;
    }

    if (Number(found.price) !== Number(expectedAddOn.price)) {
      issues.push(
        `add-on price mismatch for ${expectedAddOn.name} (expected ${expectedAddOn.price}, got ${found.price})`
      );
    }
  }

  return issues;
};

async function upsertAndVerify() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    let upserted = 0;
    for (const rawPooja of pujasToUpsert) {
      const pooja = ensureLanguageArchitecture(rawPooja);
      const primaryNote = pooja.packages?.[0]?.note;
      const updatePayload = {
        $set: {
          serviceKey: pooja.serviceKey,
          title: pooja.title,
          availableLanguages: pooja.availableLanguages,
          localizedTitle: pooja.localizedTitle,
          localizedDescription: pooja.localizedDescription,
          description: pooja.description,
          image: DEFAULT_IMAGE,
          startPrice: pooja.startPrice,
          packages: pooja.packages,
          addOns: pooja.addOns,
          pricing: pooja.pricing,
        },
      };

      if (primaryNote) {
        updatePayload.$set['details.standard.note'] = primaryNote;
      } else {
        updatePayload.$unset = {
          'details.standard.note': '',
        };
      }

      await Pooja.updateOne(
        { title: pooja.title },
        updatePayload,
        { upsert: true }
      );
      upserted += 1;
    }

    console.log(`Upsert complete: ${upserted} records processed`);

    const titles = pujasToUpsert.map((item) => item.title);
    const docs = await Pooja.find({ title: { $in: titles } }).lean();
    const docByTitle = new Map(docs.map((doc) => [doc.title, doc]));

    let passCount = 0;
    let failCount = 0;

    console.log('\nVerification results:');
    for (const title of titles) {
      const expected = expectedByTitle.get(title);
      const issues = validatePooja(docByTitle.get(title), expected);

      if (issues.length === 0) {
        console.log(`✓ ${title}`);
        passCount += 1;
      } else {
        console.log(`✗ ${title}`);
        issues.forEach((issue) => console.log(`  - ${issue}`));
        failCount += 1;
      }
    }

    console.log('\nSummary:');
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);

    await mongoose.connection.close();

    if (failCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during upsert/verification:', error);
    process.exit(1);
  }
}

upsertAndVerify();
