const mongoose = require('mongoose');
require('dotenv').config();
const Pooja = require('./src/models/Pooja');

const LANGUAGE_KEYS = ['hindi', 'odia', 'bengali', 'kannada'];

const normalizeKey = (value) => String(value || '').trim().toLowerCase();

const keepOnlyLanguages = (doc, allowedKeys) => {
  const allowed = new Set((allowedKeys || []).map(normalizeKey).filter(Boolean));

  const currentLanguages = Array.isArray(doc.availableLanguages)
    ? doc.availableLanguages.map(normalizeKey).filter(Boolean)
    : [];

  doc.availableLanguages = Array.from(new Set(currentLanguages.filter((key) => allowed.has(key))));

  const trimLanguageMap = (mapValue) => {
    if (!mapValue || typeof mapValue !== 'object' || Array.isArray(mapValue)) {
      return {};
    }

    return Object.entries(mapValue).reduce((acc, [key, value]) => {
      const normalized = normalizeKey(key);
      if (!allowed.has(normalized)) {
        return acc;
      }
      acc[normalized] = value;
      return acc;
    }, {});
  };

  doc.pricing = trimLanguageMap(doc.pricing);
  doc.localizedTitle = trimLanguageMap(doc.localizedTitle);
  doc.localizedDescription = trimLanguageMap(doc.localizedDescription);

  doc.markModified('availableLanguages');
  doc.markModified('pricing');
  doc.markModified('localizedTitle');
  doc.markModified('localizedDescription');
};

const ensureLanguage = (doc, languageKey) => {
  const normalized = normalizeKey(languageKey);
  if (!normalized) {
    return;
  }

  const list = Array.isArray(doc.availableLanguages) ? doc.availableLanguages : [];
  const normalizedList = list.map(normalizeKey).filter(Boolean);
  if (!normalizedList.includes(normalized)) {
    normalizedList.push(normalized);
  }

  doc.availableLanguages = Array.from(new Set(normalizedList));
  doc.markModified('availableLanguages');
};

async function fixLanguageServiceCrossovers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const report = {
      deleted: 0,
      updated: 0,
      unchanged: 0,
    };

    const typoGanpathi = await Pooja.findOne({ title: /^ganpathi puja$/i });
    if (typoGanpathi) {
      await Pooja.deleteOne({ _id: typoGanpathi._id });
      report.deleted += 1;
      console.log('Deleted typo duplicate: Ganpathi puja');
    }

    const ganapathi = await Pooja.findOne({ title: /^ganapathi puja$/i });
    if (ganapathi) {
      let changed = false;
      if (ganapathi.title !== 'Ganapathi Puja') {
        ganapathi.title = 'Ganapathi Puja';
        changed = true;
      }

      const before = JSON.stringify({
        availableLanguages: ganapathi.availableLanguages,
        pricing: ganapathi.pricing,
        localizedTitle: ganapathi.localizedTitle,
        localizedDescription: ganapathi.localizedDescription,
      });

      keepOnlyLanguages(ganapathi, ['odia']);
      ensureLanguage(ganapathi, 'odia');

      const after = JSON.stringify({
        availableLanguages: ganapathi.availableLanguages,
        pricing: ganapathi.pricing,
        localizedTitle: ganapathi.localizedTitle,
        localizedDescription: ganapathi.localizedDescription,
      });

      if (before !== after || changed) {
        await ganapathi.save();
        report.updated += 1;
        console.log('Updated Ganapathi Puja -> Odia only');
      } else {
        report.unchanged += 1;
      }
    }

    const ganesh = await Pooja.findOne({ title: /^ganesh puja$/i });
    if (ganesh) {
      const before = JSON.stringify({
        availableLanguages: ganesh.availableLanguages,
        pricing: ganesh.pricing,
        localizedTitle: ganesh.localizedTitle,
        localizedDescription: ganesh.localizedDescription,
      });

      keepOnlyLanguages(ganesh, ['hindi', 'bengali']);
      ensureLanguage(ganesh, 'hindi');

      const after = JSON.stringify({
        availableLanguages: ganesh.availableLanguages,
        pricing: ganesh.pricing,
        localizedTitle: ganesh.localizedTitle,
        localizedDescription: ganesh.localizedDescription,
      });

      if (before !== after) {
        await ganesh.save();
        report.updated += 1;
        console.log('Updated Ganesh Puja -> Hindi/Bengali only');
      } else {
        report.unchanged += 1;
      }
    }

    const officeOpening = await Pooja.findOne({ title: /^office opening puja$/i });
    if (officeOpening) {
      const before = JSON.stringify({
        availableLanguages: officeOpening.availableLanguages,
        pricing: officeOpening.pricing,
        localizedTitle: officeOpening.localizedTitle,
        localizedDescription: officeOpening.localizedDescription,
      });

      keepOnlyLanguages(officeOpening, ['hindi']);
      ensureLanguage(officeOpening, 'hindi');

      const after = JSON.stringify({
        availableLanguages: officeOpening.availableLanguages,
        pricing: officeOpening.pricing,
        localizedTitle: officeOpening.localizedTitle,
        localizedDescription: officeOpening.localizedDescription,
      });

      if (before !== after) {
        await officeOpening.save();
        report.updated += 1;
        console.log('Updated Office Opening Puja -> Hindi only');
      } else {
        report.unchanged += 1;
      }
    }

    const officeShopOpening = await Pooja.findOne({ title: /^office\/?shop opening puja$/i });
    if (officeShopOpening) {
      let changed = false;
      if (officeShopOpening.title !== 'Office/Shop Opening Puja') {
        officeShopOpening.title = 'Office/Shop Opening Puja';
        changed = true;
      }

      const before = JSON.stringify({
        availableLanguages: officeShopOpening.availableLanguages,
        pricing: officeShopOpening.pricing,
        localizedTitle: officeShopOpening.localizedTitle,
        localizedDescription: officeShopOpening.localizedDescription,
      });

      keepOnlyLanguages(officeShopOpening, ['odia']);
      ensureLanguage(officeShopOpening, 'odia');

      const after = JSON.stringify({
        availableLanguages: officeShopOpening.availableLanguages,
        pricing: officeShopOpening.pricing,
        localizedTitle: officeShopOpening.localizedTitle,
        localizedDescription: officeShopOpening.localizedDescription,
      });

      if (before !== after || changed) {
        await officeShopOpening.save();
        report.updated += 1;
        console.log('Updated Office/Shop Opening Puja -> Odia only');
      } else {
        report.unchanged += 1;
      }
    }

    // Safety pass: remove unsupported language keys if they appear accidentally.
    const affectedDocs = await Pooja.find({
      title: { $in: ['Ganapathi Puja', 'Ganesh Puja', 'Office Opening Puja', 'Office/Shop Opening Puja'] },
    });

    for (const doc of affectedDocs) {
      const normalized = (doc.availableLanguages || []).map(normalizeKey).filter(Boolean);
      const filtered = normalized.filter((key) => LANGUAGE_KEYS.includes(key));
      if (JSON.stringify(normalized) !== JSON.stringify(filtered)) {
        doc.availableLanguages = Array.from(new Set(filtered));
        doc.markModified('availableLanguages');
        await doc.save();
      }
    }

    console.log('--- Cleanup Summary ---');
    console.log(`Updated: ${report.updated}`);
    console.log(`Deleted: ${report.deleted}`);
    console.log(`Unchanged: ${report.unchanged}`);
  } catch (error) {
    console.error('Failed to fix language crossovers:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

fixLanguageServiceCrossovers();
