require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./src/models/Booking');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const bookingId = process.argv[2];
  const booking = await Booking.findById(bookingId).lean();
  console.log(
    JSON.stringify(
      {
        found: Boolean(booking),
        bookingId: booking?._id || null,
        email: booking?.email || null,
        paymentStatus: booking?.paymentStatus || null,
        bookingStatus: booking?.bookingStatus || null,
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
