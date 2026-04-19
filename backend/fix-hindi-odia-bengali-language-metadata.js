const mongoose = require('mongoose');
require('dotenv').config();
const Pooja = require('./src/models/Pooja');

const normalizeTitle = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const normalizeLanguage = (value) => String(value || '').trim().toLowerCase();

const expectedLanguageByTitle = new Map();

const addExpected = (language, titles) => {
  for (const title of titles) {
    const key = normalizeTitle(title);
    if (!key) {
      continue;
    }

    const existing = expectedLanguageByTitle.get(key) || new Set();
    existing.add(normalizeLanguage(language));
    expectedLanguageByTitle.set(key, existing);
  }
};

addExpected('hindi', [
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
  'Janamdin Puja (Birthday Puja)',
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
  'Solah Somvar Puja',
  'Surya Puja',
  'Vastu Shanti Puja',
  'Vidyarambham (Patti Pujan)',
  'Vishwakarma Puja',
  'Vivah (Marriage)',
  'Yagnopavit Sanskar',
]);

addExpected('odia', [
  'Annaprashan Puja',
  'Engagement Puja',
  'Ganapathi Puja',
  'Griha Pravesh',
  'Janma Chuti Poka (Mundan)',
  'Lakshmi Puja',
  'Namkaran Puja (Ekoisia)',
  'Office Opening Puja',
  'Office/Shop Opening Puja',
  'Saraswati Puja',
  'Satyanarayan Puja',
  'Vishwakarma Puja',
]);

addExpected('bengali', [
  'Bhoomi Puja',
  'Durga Puja',
  'Ganesh Puja',
  'Griho Probesh',
  'Laxmi Puja',
  'Onnoprashon (Mukhe Bhaat)',
  'Saraswati Puja',
  'Satyanarayan Puja',
  'Upanayan',
  'Vivah (Marriage)',
  'Lakshmi Puja',
  'Annaprashan Puja',
  'Griha Pravesh (Gruha Pratistha)',
  'Ganapathi Puja',
]);

const trimLanguageMap = (value, allowed) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce((acc, [key, entry]) => {
    const language = normalizeLanguage(key);
    if (!allowed.has(language)) {
      return acc;
    }
    acc[language] = entry;
    return acc;
  }, {});
};

const clonePackages = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => ({ ...item }));
};

const cloneAddOns = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => ({ ...item }));
};

async function fixLanguageMetadata() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const docs = await Pooja.find({}, {
      title: 1,
      description: 1,
      packages: 1,
      addOns: 1,
      availableLanguages: 1,
      pricing: 1,
      localizedTitle: 1,
      localizedDescription: 1,
    });

    let considered = 0;
    let updated = 0;

    for (const doc of docs) {
      const key = normalizeTitle(doc.title);
      const expected = expectedLanguageByTitle.get(key);
      if (!expected || expected.size === 0) {
        continue;
      }

      considered += 1;

      const expectedLanguages = Array.from(expected).sort();
      const currentLanguages = Array.from(
        new Set((Array.isArray(doc.availableLanguages) ? doc.availableLanguages : []).map(normalizeLanguage).filter(Boolean))
      ).sort();

      const nextPricing = trimLanguageMap(doc.pricing, expected);
      const nextLocalizedTitle = trimLanguageMap(doc.localizedTitle, expected);
      const nextLocalizedDescription = trimLanguageMap(doc.localizedDescription, expected);

      for (const language of expectedLanguages) {
        if (!nextLocalizedTitle[language]) {
          nextLocalizedTitle[language] = doc.title;
        }

        const localizedDescriptionValue = nextLocalizedDescription[language];
        const hasLocalizedDescription =
          localizedDescriptionValue &&
          typeof localizedDescriptionValue === 'object' &&
          (String(localizedDescriptionValue.short || '').trim() ||
            String(localizedDescriptionValue.full || '').trim());

        if (!hasLocalizedDescription) {
          const fallbackDescription = String(doc.description || '').trim();
          nextLocalizedDescription[language] = {
            short: fallbackDescription,
            full: fallbackDescription,
          };
        }

        if (!nextPricing[language] || typeof nextPricing[language] !== 'object') {
          nextPricing[language] = {
            packages: clonePackages(doc.packages),
            addOns: cloneAddOns(doc.addOns),
          };
        } else {
          if (!Array.isArray(nextPricing[language].packages)) {
            nextPricing[language].packages = clonePackages(doc.packages);
          }
          if (!Array.isArray(nextPricing[language].addOns)) {
            nextPricing[language].addOns = cloneAddOns(doc.addOns);
          }
        }
      }

      const beforeSnapshot = JSON.stringify({
        availableLanguages: currentLanguages,
        pricing: doc.pricing || {},
        localizedTitle: doc.localizedTitle || {},
        localizedDescription: doc.localizedDescription || {},
      });

      doc.availableLanguages = expectedLanguages;
      doc.pricing = nextPricing;
      doc.localizedTitle = nextLocalizedTitle;
      doc.localizedDescription = nextLocalizedDescription;
      doc.markModified('availableLanguages');
      doc.markModified('pricing');
      doc.markModified('localizedTitle');
      doc.markModified('localizedDescription');

      const afterSnapshot = JSON.stringify({
        availableLanguages: doc.availableLanguages || [],
        pricing: doc.pricing || {},
        localizedTitle: doc.localizedTitle || {},
        localizedDescription: doc.localizedDescription || {},
      });

      if (beforeSnapshot !== afterSnapshot) {
        await doc.save();
        updated += 1;
        console.log(`Updated: ${doc.title} -> [${expectedLanguages.join(', ')}]`);
      }
    }

    console.log('--- Language Metadata Fix Summary ---');
    console.log(`Considered: ${considered}`);
    console.log(`Updated: ${updated}`);
  } catch (error) {
    console.error('Failed to fix language metadata:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

fixLanguageMetadata();
