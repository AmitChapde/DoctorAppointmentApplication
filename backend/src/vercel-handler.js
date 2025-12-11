require('dotenv').config();
const app = require('./app');
const { prisma } = require('./prisma/client');

async function init() {
  try {
    await prisma.$connect();
    console.log('Prisma connected (vercel handler)');
  } catch (e) {
    console.error('Prisma connection failed (vercel handler)', e);
    // don't exit — let Vercel surface the error
  }
}

init();

module.exports = app;
