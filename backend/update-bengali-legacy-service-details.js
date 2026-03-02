const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const Pooja = require('./src/models/Pooja');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const updates = [
  {
    title: 'Laxmi Puja',
    description:
      'Laxmi Puja is performed to gain wealth, preserve existing wealth, and achieve financial stability by seeking the blessings of Goddess Laxmi, the Goddess of wealth and prosperity.',
    startPrice: 5800,
    pricingBengali: {
      packages: [
        {
          name: 'Standard',
          price: 5800,
          includesSamagri: true,
          pandits: '1 Panditji + All Puja Samagri',
          procedure: [
            'Swasti Vachanam',
            'Maha Sankalp',
            'Ganapathi Puja',
            'Punyaha Vachanam',
            'Mahalaxmi Puja',
            'Aarti & Prasad Distribution',
          ],
          inclusions: ['Dakshina', 'All Puja Samagri'],
          addOns: [{ name: 'Flowers & Fruits', price: 1500 }],
          note:
            'All puja samagri such as Haldi, Abeer, Gulal, Mango Leaves, Tulasi, Darba, Kalash, Betel Leaves, Betel Nuts, Dravyas, Kapda, Ghee, etc., will be brought by us.\n\nThe Yajaman (host) must arrange household items like Vessels, Oil Lamps, Mats, Bowls, Chowki, Plates, Prasad, and Photos. A detailed preparation checklist will be shared after booking confirmation.',
        },
      ],
      addOns: [],
    },
  },
  {
    title: 'Onnoprashon (Mukhe Bhaat)',
    description:
      'Onnoprashon is the sacred ceremony where a baby is introduced to solid foods, preferably sweet/milk rice, for the first time. This ritual is performed to bless the child with good health, prosperity, and a happy life.',
    startPrice: 4500,
    pricingBengali: {
      packages: [
        {
          name: 'Standard',
          price: 4500,
          includesSamagri: true,
          pandits: '1 Panditji + All Puja Samagri',
          procedure: [
            'Ganesh Puja',
            'Sankalpam',
            'Kalash Puja',
            'Onnoprashon Puja',
            'Feeding Rice Ceremony',
            'Aarti',
            'Prasad Distribution',
          ],
          inclusions: ['Dakshina', 'All Puja Materials'],
          addOns: [
            { name: 'Flowers & Fruits', price: 1000 },
            { name: 'Havan', price: 1000 },
          ],
          note:
            'All puja materials such as Haldi, Abeer, Gulal, Mango Leaves, Tulasi, Darba, Kalash, Betel Leaves, Betel Nuts, Dravyas, Kapda, Ghee, etc., will be brought by us.\n\nThe Yajaman (parents/host) must arrange household items like Vessels, Oil Lamps, Mats, Bowls, Chowki, Plates, Sweet/Milk Rice, Prasad, and Photos. A detailed preparation checklist will be shared after booking confirmation.',
        },
      ],
      addOns: [],
    },
  },
  {
    title: 'Griho Probesh',
    description:
      'Perform Griho Probesh Puja before entering your new or renovated home. Our Bengali Pandits follow complete Vedic rituals with all puja samagri. Book now for peace, prosperity, and divine blessings in your new house.',
    startPrice: 8500,
    pricingBengali: {
      packages: [
        {
          name: 'Economy',
          price: 8500,
          includesSamagri: true,
          pandits: '1 Panditji + All Puja Samagri',
          description: 'Griha Pravesh with Satyanarayan Katha. Duration: Approx. 2 – 2.5 Hours.',
          procedure: [
            'Dwar Puja',
            'Griha Pravesh',
            'Boiling Milk in New Vessel',
            'Ganesh Adi Panchadevata Puja',
            'Narayan Puja',
            'Vastu Puja',
            'Satyanarayan Katha',
            'Aarti',
            'Havan',
            'Poornahuti',
            'Pushpanjali',
            'Shantijal',
          ],
          inclusions: ['Dakshina', 'All Puja Samagri'],
          addOns: [{ name: 'Flowers & Fruits', price: 1700 }],
          note:
            'All puja samagri such as Haldi, Abeer, Gulal, Mango Leaves, Tulasi, Darba, Kalasha, Vastra, Betel Leaves, Betel Nuts, Havan Sticks, Samidha, Havan Kund, Dravyas, Kapda, Ghee, etc., will be brought by us.\n\nThe Yajaman must arrange items such as: Gas Stove, Shinni Prasad, Vessels, Oil Lamps, Mats, Bowls, Chowki, Plates, Photos.',
        },
        {
          name: 'Standard',
          price: 12500,
          includesSamagri: true,
          pandits: '1 Panditji + All Puja Samagri',
          description: 'Griha Pravesh with Chandi Path & Katha. Duration: Approx. 3 – 3.5 Hours.',
          procedure: [
            'Dwar Puja',
            'Griha Pravesh',
            'Boiling Milk in New Vessel',
            'Vasudhara',
            'Ganesh Adi Panchadevata Puja',
            'Narayan Puja',
            'Chandi Puja',
            'Chandi Path',
            'Vastu Puja',
            'Satyanarayan Katha',
            'Aarti',
            'Havan',
            'Poornahuti',
            'Pushpanjali',
            'Charanamrit Daan',
            'Shantijal',
          ],
          inclusions: ['Dakshina', 'All Puja Samagri'],
          addOns: [{ name: 'Flowers & Fruits', price: 2000 }],
          note:
            'All puja samagri such as Haldi, Abeer, Gulal, Mango Leaves, Tulasi, Darba, Kalasha, Vastra, Betel Leaves, Betel Nuts, Havan Sticks, Samidha, Havan Kund, Dravyas, Kapda, Ghee, etc., will be brought by us.\n\nThe Yajaman must arrange items such as: Gas Stove, Shinni Prasad, Vessels, Oil Lamps, Mats, Bowls, Chowki, Plates, Photos.',
        },
      ],
      addOns: [],
    },
  },
  {
    title: 'Upanayan',
    description:
      'Yagnopavit Sanskar, also known as Upanayan Sanskar, is performed when a boy traditionally reaches the age of 8. This sacred ceremony marks the beginning of formal spiritual education and makes the child eligible to receive instruction in the Vedas.',
    startPrice: 8800,
    pricingBengali: {
      packages: [
        {
          name: 'Standard',
          price: 8800,
          includesSamagri: true,
          pandits: '1 Panditji + All Puja Samagri',
          procedure: [
            'Gauri Ganesh Puja',
            'Kalash Navagraha Puja',
            'Yagnopavit Dharan (Sacred Thread Wearing)',
            'Gayatri Mantra Upadesh',
            'Bhikshatan',
            'Havan',
            'Aarti & Prasad Distribution',
          ],
          inclusions: ['Dakshina', 'All Puja Samagri'],
          addOns: [{ name: 'Flowers & Fruits', price: 1500 }],
          note:
            'All puja materials such as Haldi, Abeer, Gulal, Mango Leaves, Tulasi, Darba, Kalash, Betel Leaves, Betel Nuts, Dravyas, Kapda, Ghee, Havan Sticks, Samidha, Havan Kund, etc., will be brought by us.\n\nThe Yajaman must arrange items such as Dhoti for the boy, Bhiksha Patra (alms bowl), Food items, Daan items, Vessels, Oil Lamps, Mats, Bowls, Chowki, Plates, Prasad, Milk, Curd, and Photos. A detailed preparation checklist will be shared after booking confirmation.',
        },
        {
          name: 'Premium',
          price: 18800,
          includesSamagri: true,
          pandits: '3 Panditji + All Puja Samagri',
          procedure: [
            'Gauri Ganesh Puja',
            'Kalash Navagraha Puja',
            'Yagnopavit Dharan',
            'Bhiksha Karyakram',
            'Aarti & Prasad Distribution',
          ],
          inclusions: ['Dakshina', 'All Puja Samagri'],
          addOns: [{ name: 'Flowers & Fruits', price: 2000 }],
          note:
            'All puja materials such as Haldi, Abeer, Gulal, Mango Leaves, Tulasi, Darba, Kalash, Betel Leaves, Betel Nuts, Dravyas, Kapda, Ghee, Havan Sticks, Samidha, Havan Kund, etc., will be brought by us.\n\nThe Yajaman must arrange items such as Dhoti for the boy, Bhiksha Patra (alms bowl), Food items, Daan items, Vessels, Oil Lamps, Mats, Bowls, Chowki, Plates, Prasad, Milk, Curd, and Photos. A detailed preparation checklist will be shared after booking confirmation.',
        },
      ],
      addOns: [],
    },
  },
  {
    title: 'Saraswati Puja',
    description:
      'Mata Saraswati is the deity of intelligence, wisdom, arts, music, memory power, and soft skills. Performing Saraswati Puja relieves mental pressure and improves concentration, focus, memory power, and the ability to understand complex subjects.',
    startPrice: 4800,
    pricingBengali: {
      packages: [
        {
          name: 'Standard',
          price: 4800,
          includesSamagri: true,
          pandits: '1 Panditji + All Puja Materials',
          procedure: [
            'Swasti Vachanam',
            'Maha Sankalp',
            'Ganapathi Puja',
            'Punyaha Vachanam',
            'Saraswati Puja',
            'Aarti & Prasad Distribution',
          ],
          inclusions: ['Dakshina', 'All Puja Samagri'],
          addOns: [
            { name: 'Flowers & Fruits', price: 1000 },
            { name: 'Havan', price: 1000 },
          ],
        },
      ],
      addOns: [],
    },
  },
  {
    title: 'Yagnopavit Sanskar (Upanayan Sanskar)',
    description:
      'Yagnopavit Sanskar, also known as Upanayan Sanskar, is performed when a boy traditionally reaches the age of 8. This sacred ceremony marks the beginning of formal spiritual education and makes the child eligible to receive instruction in the Vedas.',
    startPrice: 8800,
    pricingBengali: {
      packages: [
        {
          name: 'Standard',
          price: 8800,
          includesSamagri: true,
          pandits: '1 Panditji + All Puja Samagri',
          procedure: [
            'Gauri Ganesh Puja',
            'Kalash Navagraha Puja',
            'Yagnopavit Dharan (Sacred Thread Wearing)',
            'Gayatri Mantra Upadesh',
            'Bhikshatan',
            'Havan',
            'Aarti & Prasad Distribution',
          ],
          inclusions: ['Dakshina', 'All Puja Samagri'],
          addOns: [{ name: 'Flowers & Fruits', price: 1500 }],
        },
        {
          name: 'Premium',
          price: 18800,
          includesSamagri: true,
          pandits: '3 Panditji + All Puja Samagri',
          procedure: [
            'Gauri Ganesh Puja',
            'Kalash Navagraha Puja',
            'Yagnopavit Dharan',
            'Bhiksha Karyakram',
            'Aarti & Prasad Distribution',
          ],
          inclusions: ['Dakshina', 'All Puja Samagri'],
          addOns: [{ name: 'Flowers & Fruits', price: 2000 }],
        },
      ],
      addOns: [],
    },
  },
  {
    title: 'Vivah (Marriage)',
    description:
      'Marriage Puja or Wedding Ceremony is one of the most sacred and important events in life. Performing Vivah as per Vedic traditions invokes blessings for a prosperous and harmonious married life.',
    startPrice: 14000,
    pricingBengali: {
      packages: [],
      addOns: [],
    },
  },
];

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set in backend/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);

  for (const item of updates) {
    const existing = await Pooja.findOne({ title: item.title });
    if (!existing) {
      console.log(`Not found: ${item.title}`);
      continue;
    }

    await Pooja.updateOne(
      { _id: existing._id },
      {
        $set: {
          description: item.description,
          startPrice: item.startPrice,
          'localizedTitle.bengali': item.title,
          'localizedDescription.bengali': {
            short: item.description,
            full: item.description,
          },
          'pricing.bengali': item.pricingBengali,
        },
        $addToSet: { availableLanguages: 'bengali' },
      }
    );

    console.log(`Updated: ${item.title}`);
  }

  await mongoose.connection.close();
}

run()
  .then(() => {
    console.log('Bengali legacy service updates completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to update Bengali legacy services:', error);
    process.exit(1);
  });
