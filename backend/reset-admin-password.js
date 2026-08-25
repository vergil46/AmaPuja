require('dotenv').config();
const mongoose = require('./src/models/User').prototype.constructor.base;
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function run() {
  const email = 'lokanathpanda46@gmail.com';
  const newPassword = process.env.ADMIN_PASSWORD;
  if (!newPassword) throw new Error('ADMIN_PASSWORD is required');
  const hash = await bcrypt.hash(newPassword, 10);
  await mongoose.connect(process.env.MONGO_URI);
  await User.updateOne({ email }, { $set: { password: hash } });
  const u = await User.findOne({ email }).lean();
  console.log({ email: u.email, passwordSet: true, role: u.role, emailVerified: u.emailVerified });
  process.exit(0);
}

run();
