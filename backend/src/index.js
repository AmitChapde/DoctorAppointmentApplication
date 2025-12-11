require('dotenv').config();
const app = require('./app');
const { prisma } = require('./prisma/client');
const { startExpiryWorker } = require('./services/booking.service');

const port = process.env.PORT || 3000;

app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
  try {
    await prisma.$connect();
    console.log('Connected to Postgres via Prisma');
    // Start background expiry worker
    startExpiryWorker();
  } catch (e) {
    console.error('DB connection failed', e);
    process.exit(1);
  }
});
