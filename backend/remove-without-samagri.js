// Script to remove all 'Without Samagri' options from all poojas
const mongoose = require('mongoose');
const Pooja = require('./src/models/Pooja');
require('dotenv').config();

async function removeWithoutSamagri() {
  await mongoose.connect(process.env.MONGO_URI);

  const poojas = await Pooja.find();
  let updatedCount = 0;

  for (const pooja of poojas) {
    const originalLength = pooja.packages.length;
    pooja.packages = pooja.packages.filter(
      (pkg) => pkg.includesSamagri === true || pkg.name === 'With Samagri'
    );
    if (pooja.packages.length !== originalLength) {
      await pooja.save();
      updatedCount++;
      console.log(`Updated: ${pooja.title}`);
    }
  }

  console.log(`Done. Updated ${updatedCount} poojas.`);
  await mongoose.disconnect();
}

removeWithoutSamagri().catch((err) => {
  console.error(err);
  process.exit(1);
});
