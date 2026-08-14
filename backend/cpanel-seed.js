/**
 * Seed only — no prisma generate / db push (those OOM on shared cPanel).
 * Import prisma/init-from-empty.sql in phpMyAdmin first.
 */
try {
  require('dotenv').config({ path: require('path').join(__dirname, '.env') });
} catch (_) {}

require('./src/config/seed.js');
