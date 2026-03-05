const mongoose = require('mongoose')
require('dotenv').config()

const Pooja = require('./src/models/Pooja')

async function cleanupDuplicatePoojas() {
  await mongoose.connect(process.env.MONGO_URI)

  const summary = {
    removedLegacyNoServiceKey: 0,
    removedExtraServiceKeyDuplicates: 0,
    updatedNamkaranPrice: 0,
  }

  // Remove known stale legacy records that should not appear in Services cards.
  const knownLegacyTitles = [
    'Lalitha Sahasranam Puja',
    'Namkaran (Ekoisia)',
    'namkaran puja(ekosia)',
  ]

  const legacyDelete = await Pooja.deleteMany({
    title: { $in: knownLegacyTitles },
    serviceKey: { $in: [null, ''] },
  })
  summary.removedLegacyNoServiceKey = legacyDelete.deletedCount || 0

  // Keep only one document per canonical service key when accidental duplicates exist.
  const canonicalKeys = ['lalitha_sahasranamam_puja', 'namkaran_puja', 'namkaran_puja_ekoisia']
  for (const key of canonicalKeys) {
    const docs = await Pooja.find({ serviceKey: key }).sort({ updatedAt: -1 }).lean()
    if (docs.length <= 1) continue

    const keepId = docs[0]._id
    const removeIds = docs.slice(1).map((d) => d._id)
    const duplicateDelete = await Pooja.deleteMany({ _id: { $in: removeIds } })
    summary.removedExtraServiceKeyDuplicates += duplicateDelete.deletedCount || 0

    // Defensive: make sure a record still exists for this key.
    const exists = await Pooja.exists({ _id: keepId })
    if (!exists) {
      throw new Error(`Unexpected cleanup issue for serviceKey: ${key}`)
    }
  }

  // Enforce requested Hindi starting price for Namkaran Puja.
  const namkaranResult = await Pooja.updateOne(
    { serviceKey: 'namkaran_puja' },
    {
      $set: {
        startPrice: 3800,
        'pricing.hindi.packages.0.price': 3800,
      },
    }
  )
  summary.updatedNamkaranPrice = namkaranResult.modifiedCount || 0

  const finalDocs = await Pooja.find(
    { title: /Lalitha|Namkaran/i },
    { title: 1, serviceKey: 1, startPrice: 1, 'pricing.hindi.packages.price': 1 }
  ).lean()

  console.log('Cleanup summary:')
  console.log(JSON.stringify(summary, null, 2))
  console.log('\nPost-cleanup records:')
  console.log(
    JSON.stringify(
      finalDocs.map((d) => ({
        title: d.title,
        serviceKey: d.serviceKey || null,
        startPrice: d.startPrice,
        hindiPrices: (d.pricing?.hindi?.packages || []).map((p) => p.price),
      })),
      null,
      2
    )
  )
}

cleanupDuplicatePoojas()
  .catch((error) => {
    console.error('Cleanup failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.connection.close()
  })
