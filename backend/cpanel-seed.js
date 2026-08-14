/** Seed only — use after importing prisma/init-from-empty.sql in phpMyAdmin */
try {
  require('dotenv').config({ path: require('path').join(__dirname, '.env') });
} catch (_) {}
require('./src/config/seed.js');
