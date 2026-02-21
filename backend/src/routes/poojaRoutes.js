const express = require('express');
const Pooja = require('../models/Pooja');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const toValidPrice = (value, fallback = 0) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return Math.round(parsed);
  }
  return Math.max(0, Math.round(Number(fallback) || 0));
};

const defaultDescription = (title) =>
  `${title} performed by experienced pandits with authentic rituals and personalized guidance for your family traditions.`;

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
  const title = normalizeText(input.title);
  const startPrice = toValidPrice(input.startPrice, 0);
  const packages = buildTwoPackages(input.packages, startPrice);
  const normalizedStartPrice = packages[0]?.price ?? startPrice;

  return {
    title,
    description: normalizeText(input.description) || defaultDescription(title),
    image: normalizeText(input.image),
    startPrice: normalizedStartPrice,
    packages,
  };
};

const packagesChanged = (currentPackages, normalizedPackages) =>
  JSON.stringify(currentPackages || []) !== JSON.stringify(normalizedPackages || []);

router.get('/', async (req, res) => {
  const poojaDocs = await Pooja.find().sort({ createdAt: -1 });

  const normalizedPoojas = poojaDocs.map((doc) => {
    const source = doc.toObject();
    const normalized = normalizePoojaPayload(source);

    return {
      source,
      data: { ...source, ...normalized },
      needsUpdate:
        normalizeText(source.description) !== normalized.description ||
        Number(source.startPrice) !== normalized.startPrice ||
        packagesChanged(source.packages, normalized.packages),
    };
  });

  const writeOps = normalizedPoojas
    .filter((item) => item.needsUpdate)
    .map((item) => ({
      updateOne: {
        filter: { _id: item.source._id },
        update: {
          $set: {
            description: item.data.description,
            startPrice: item.data.startPrice,
            packages: item.data.packages,
          },
        },
      },
    }));

  if (writeOps.length > 0) {
    await Pooja.bulkWrite(writeOps);
  }

  return res.json(normalizedPoojas.map((item) => item.data));
});

router.get('/:id', async (req, res) => {
  const poojaDoc = await Pooja.findById(req.params.id);
  if (!poojaDoc) {
    return res.status(404).json({ message: 'Pooja not found' });
  }

  const source = poojaDoc.toObject();
  const normalized = normalizePoojaPayload(source);
  const normalizedPooja = { ...source, ...normalized };

  const needsUpdate =
    normalizeText(source.description) !== normalized.description ||
    Number(source.startPrice) !== normalized.startPrice ||
    packagesChanged(source.packages, normalized.packages);

  if (needsUpdate) {
    await Pooja.findByIdAndUpdate(req.params.id, {
      description: normalizedPooja.description,
      startPrice: normalizedPooja.startPrice,
      packages: normalizedPooja.packages,
    });
  }

  return res.json(normalizedPooja);
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
