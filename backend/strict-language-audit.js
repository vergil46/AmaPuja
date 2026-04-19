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

const normArray = (arr) =>
  Array.from(new Set((Array.isArray(arr) ? arr : []).map(normalizeLanguage).filter(Boolean))).sort();

const normKeys = (obj) =>
  Array.from(
    new Set(
      (obj && typeof obj === 'object' && !Array.isArray(obj) ? Object.keys(obj) : [])
        .map(normalizeLanguage)
        .filter(Boolean)
    )
  ).sort();

const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

async function runStrictLanguageAudit() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const docs = await Pooja.find({}, {
      title: 1,
      availableLanguages: 1,
      pricing: 1,
      localizedTitle: 1,
      localizedDescription: 1,
    });

    let considered = 0;
    const mismatches = [];

    for (const doc of docs) {
      const expectedSet = expectedLanguageByTitle.get(normalizeTitle(doc.title));
      if (!expectedSet || expectedSet.size === 0) {
        continue;
      }

      considered += 1;
      const expected = Array.from(expectedSet).sort();
      const details = {};

      const available = normArray(doc.availableLanguages);
      if (!same(expected, available)) {
        details.availableLanguages = { expected, actual: available };
      }

      const pricing = normKeys(doc.pricing);
      if (!same(expected, pricing)) {
        details.pricingKeys = { expected, actual: pricing };
      }

      const titleKeys = normKeys(doc.localizedTitle);
      if (!same(expected, titleKeys)) {
        details.localizedTitleKeys = { expected, actual: titleKeys };
      }

      const descriptionKeys = normKeys(doc.localizedDescription);
      if (!same(expected, descriptionKeys)) {
        details.localizedDescriptionKeys = { expected, actual: descriptionKeys };
      }

      if (Object.keys(details).length) {
        mismatches.push({
          id: String(doc._id),
          title: doc.title,
          ...details,
        });
      }
    }

    console.log(
      JSON.stringify(
        {
          totalConsidered: considered,
          mismatchCount: mismatches.length,
          mismatches,
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error('Audit failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

runStrictLanguageAudit();
