require('dotenv').config();
const mongoose = require('./src/models/User').prototype.constructor.base;
const User = require('./src/models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  await User.updateOne({ email: 'lokanathpanda46@gmail.com' }, { $set: { emailVerified: true } });
  const u = await User.findOne({ email: 'lokanathpanda46@gmail.com' }).lean();
  console.log(u);
  process.exit(0);
}

run();
