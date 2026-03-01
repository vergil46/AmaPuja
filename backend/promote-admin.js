require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function run() {
  const email = process.argv[2];
  if (!email) {
    throw new Error('Usage: node promote-admin.js <email>');
  }

  await mongoose.connect(process.env.MONGO_URI);
  const result = await User.updateOne({ email }, { $set: { role: 'admin' } });
  const user = await User.findOne({ email }, 'email role').lean();

  console.log(
    JSON.stringify(
      {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        user,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error.message);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
