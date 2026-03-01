const express = require('express');
const Pooja = require('../models/Pooja');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const SUPPORTED_LANGUAGE_KEYS = ['odia', 'hindi', 'kannada', 'bengali'];

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeLanguageKey = (value) => normalizeText(value).toLowerCase();

const toValidPrice = (value, fallback = 0) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return Math.round(parsed);
  }
  return Math.max(0, Math.round(Number(fallback) || 0));
};

const defaultDescription = (title) =>
  `${title} performed by experienced pandits with authentic rituals and personalized guidance for your family traditions.`;

const normalizeStringArray = (items) =>
  (Array.isArray(items) ? items : [])
    .map((item) => normalizeText(item))
    .filter(Boolean);

const uniqueStrings = (items) => Array.from(new Set((Array.isArray(items) ? items : []).filter(Boolean)));

const getPreferredLanguage = (languageKeys = []) => {
  const preferredOrder = ['hindi', 'odia', 'bengali', 'kannada'];
  for (const languageKey of preferredOrder) {
    if (languageKeys.includes(languageKey)) {
      return languageKey;
    }
  }
  return languageKeys[0] || 'hindi';
};

const normalizeLocalizedTitleMap = (titleConfig) => {
  if (!titleConfig || typeof titleConfig !== 'object' || Array.isArray(titleConfig)) {
    return {};
  }

  return Object.entries(titleConfig).reduce((accumulator, [languageKey, titleValue]) => {
    const normalizedLanguageKey = normalizeLanguageKey(languageKey);
    const normalizedTitle = normalizeText(titleValue);
    if (!normalizedLanguageKey || !normalizedTitle) {
      return accumulator;
    }

    accumulator[normalizedLanguageKey] = normalizedTitle;
    return accumulator;
  }, {});
};

const normalizeLocalizedDescriptionMap = (descriptionConfig) => {
  if (!descriptionConfig || typeof descriptionConfig !== 'object' || Array.isArray(descriptionConfig)) {
    return {};
  }

  return Object.entries(descriptionConfig).reduce((accumulator, [languageKey, descriptionValue]) => {
    const normalizedLanguageKey = normalizeLanguageKey(languageKey);
    if (!normalizedLanguageKey || !descriptionValue || typeof descriptionValue !== 'object') {
      return accumulator;
    }

    const short = normalizeText(descriptionValue.short);
    const full = normalizeText(descriptionValue.full);

    if (!short && !full) {
      return accumulator;
    }

    accumulator[normalizedLanguageKey] = {
      short: short || full,
      full: full || short,
    };

    return accumulator;
  }, {});
};

const normalizeAddOns = (items) =>
  (Array.isArray(items) ? items : [])
    .map((addon) => ({
      name: normalizeText(addon?.name),
      price: toValidPrice(addon?.price, 0),
    }))
    .filter((addon) => addon.name);

const normalizePricingMap = (pricing = {}) => {
  if (!pricing || typeof pricing !== 'object' || Array.isArray(pricing)) {
    return {};
  }

  const entries = Object.entries(pricing);
  const normalized = {};

  entries.forEach(([languageKey, config]) => {
    const normalizedLanguageKey = normalizeText(languageKey).toLowerCase();
    if (!normalizedLanguageKey || !config || typeof config !== 'object') {
      return;
    }

    const packages = (Array.isArray(config.packages) ? config.packages : [])
      .map((pkg) => normalizePackageItem(pkg, 0))
      .filter(Boolean);

    const addOns = normalizeAddOns(config.addOns);

    const descriptionConfig = config.description && typeof config.description === 'object'
      ? {
          short: normalizeText(config.description.short),
          full: normalizeText(config.description.full),
        }
      : undefined;

    normalized[normalizedLanguageKey] = {
      title: normalizeText(config.title),
      description: descriptionConfig,
      packages,
      addOns,
    };
  });

  return normalized;
};

const normalizePackageItem = (item, fallbackPrice = 0) => {
  const name = normalizeText(item?.name);
  const price = toValidPrice(item?.price, fallbackPrice);

  if (!name) {
    return null;
  }

  return {
    name,
    price,
    includesSamagri: Boolean(item?.includesSamagri),
    pandits: normalizeText(item?.pandits),
    description: normalizeText(item?.description),
    procedure: normalizeStringArray(item?.procedure),
    inclusions: normalizeStringArray(item?.inclusions),
    note: normalizeText(item?.note),
    addOns: normalizeAddOns(item?.addOns),
  };
};

const buildTwoPackages = (packages, startPrice) => {
  const list = Array.isArray(packages) ? packages : [];

  const withoutSamagri =
    list.find((item) => item && item.includesSamagri === false) ||
    list.find((item) => normalizeText(item?.name).toLowerCase().includes('without')) ||
    list[0];

  const withSamagri =
    list.find((item) => item && item.includesSamagri === true) ||
    list.find((item) => normalizeText(item?.name).toLowerCase().includes('with')) ||
    list[1];

  const withoutSamagriPrice = toValidPrice(withoutSamagri?.price, startPrice);
  const withSamagriPrice = toValidPrice(
    withSamagri?.price,
    withoutSamagriPrice > 0 ? Math.round(withoutSamagriPrice * 1.35) : 0
  );

  return [
    { name: 'Without Samagri', price: withoutSamagriPrice, includesSamagri: false },
    { name: 'With Samagri', price: withSamagriPrice, includesSamagri: true },
  ];
};

const normalizePoojaPayload = (input = {}) => {
  const structuredTitleMap = normalizeLocalizedTitleMap(
    input.title && typeof input.title === 'object' ? input.title : {}
  );

  const legacyLocalizedTitleMap = normalizeLocalizedTitleMap(
    input.localizedTitle && typeof input.localizedTitle === 'object'
      ? input.localizedTitle
      : {}
  );

  const localizedTitle = {
    ...legacyLocalizedTitleMap,
    ...structuredTitleMap,
  };

  const structuredDescriptionMap = normalizeLocalizedDescriptionMap(
    input.description && typeof input.description === 'object' ? input.description : {}
  );

  const legacyLocalizedDescriptionMap = normalizeLocalizedDescriptionMap(
    input.localizedDescription && typeof input.localizedDescription === 'object'
      ? input.localizedDescription
      : {}
  );

  const localizedDescription = {
    ...legacyLocalizedDescriptionMap,
    ...structuredDescriptionMap,
  };

  const pricing = normalizePricingMap(input.pricing);

  const languageKeysFromPayload = uniqueStrings([
    ...normalizeStringArray(input.availableLanguages).map(normalizeLanguageKey),
    ...Object.keys(localizedTitle).map(normalizeLanguageKey),
    ...Object.keys(localizedDescription).map(normalizeLanguageKey),
    ...Object.keys(pricing).map(normalizeLanguageKey),
  ]).filter(Boolean);

  const preferredLanguage = getPreferredLanguage(languageKeysFromPayload);

  const titleFromPayload =
    typeof input.title === 'string'
      ? normalizeText(input.title)
      : normalizeText(localizedTitle[preferredLanguage]);

  const descriptionFromPayload =
    typeof input.description === 'string'
      ? normalizeText(input.description)
      : normalizeText(
          localizedDescription[preferredLanguage]?.full ||
            localizedDescription[preferredLanguage]?.short
        );

  const title = titleFromPayload;
  const startPrice = toValidPrice(input.startPrice, 0);

  const fallbackLanguagePackages =
    Array.isArray(pricing?.[preferredLanguage]?.packages)
      ? pricing[preferredLanguage].packages
      : [];

  const normalizedInputPackages = (Array.isArray(input.packages) ? input.packages : [])
    .map((pkg) => normalizePackageItem(pkg, startPrice))
    .filter(Boolean);

  const packages =
    normalizedInputPackages.length > 0
      ? normalizedInputPackages
      : fallbackLanguagePackages.length > 0
        ? fallbackLanguagePackages
        : buildTwoPackages(input.packages, startPrice);

  const packagePrices = packages.map((pkg) => toValidPrice(pkg.price, startPrice));
  const normalizedStartPrice = packagePrices.length > 0 ? Math.min(...packagePrices) : startPrice;

  const fallbackLanguageAddOns =
    Array.isArray(pricing?.[preferredLanguage]?.addOns)
      ? pricing[preferredLanguage].addOns
      : [];

  const addOns = normalizeAddOns(input.addOns).length > 0
    ? normalizeAddOns(input.addOns)
    : normalizeAddOns(fallbackLanguageAddOns);

  const availableLanguages = uniqueStrings(
    languageKeysFromPayload.length > 0 ? languageKeysFromPayload : [preferredLanguage]
  ).filter(Boolean);

  const ensuredLocalizedTitle = { ...localizedTitle };
  const ensuredLocalizedDescription = { ...localizedDescription };

  availableLanguages.forEach((languageKey) => {
    if (!ensuredLocalizedTitle[languageKey]) {
      ensuredLocalizedTitle[languageKey] = title;
    }

    if (!ensuredLocalizedDescription[languageKey]) {
      ensuredLocalizedDescription[languageKey] = {
        short: descriptionFromPayload || defaultDescription(title),
        full: descriptionFromPayload || defaultDescription(title),
      };
    }
  });

  return {
    serviceKey: normalizeText(input.key || input.serviceKey),
    title,
    availableLanguages,
    localizedTitle: ensuredLocalizedTitle,
    localizedDescription: ensuredLocalizedDescription,
    description: descriptionFromPayload || defaultDescription(title),
    image: normalizeText(input.image),
    startPrice: normalizedStartPrice,
    packages,
    addOns,
    pricing,
    details: input.details,
    maxHours: input.maxHours,
    extraHourCharge: input.extraHourCharge,
  };
};

const packagesChanged = (currentPackages, normalizedPackages) =>
  JSON.stringify(currentPackages || []) !== JSON.stringify(normalizedPackages || []);

router.get('/', async (req, res) => {
  const poojaDocs = await Pooja.find().sort({ createdAt: -1 });
  // Return all fields for each pooja, not just normalized
  return res.json(poojaDocs.map((doc) => doc.toObject()));
});

router.get('/:id', async (req, res) => {
  const poojaDoc = await Pooja.findById(req.params.id);
  if (!poojaDoc) {
    return res.status(404).json({ message: 'Pooja not found' });
  }
  // Return all fields for the pooja
  return res.json(poojaDoc.toObject());
});

router.post('/', protect, adminOnly, async (req, res) => {
  const payload = normalizePoojaPayload(req.body);
  const pooja = await Pooja.create({
    ...payload,
    createdBy: req.user._id,
  });
  return res.status(201).json(pooja);
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  const existingPooja = await Pooja.findById(req.params.id);
  if (!existingPooja) {
    return res.status(404).json({ message: 'Pooja not found' });
  }

  const payload = normalizePoojaPayload({
    ...existingPooja.toObject(),
    ...req.body,
  });

  const pooja = await Pooja.findByIdAndUpdate(
    req.params.id,
    { ...payload },
    { new: true, runValidators: true }
  );

  return res.json(pooja);
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  const pooja = await Pooja.findByIdAndDelete(req.params.id);
  if (!pooja) {
    return res.status(404).json({ message: 'Pooja not found' });
  }
  return res.json({ message: 'Pooja deleted' });
});

module.exports = router;
