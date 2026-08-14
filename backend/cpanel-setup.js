/**
 * cPanel one-time setup WITHOUT prisma generate / db push (both OOM on shared hosts).
 *
 * Before this script:
 *   1. Import prisma/init-from-empty.sql in phpMyAdmin (creates tables)
 *   2. Ensure DATABASE_URL is in .env or Node App env vars
 *
 * Prefer running: cpanel-seed.js
 * Run JS script: cpanel-setup.js  (seed only; same as seed after SQL import)
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

process.chdir(path.join(__dirname));

try {
  try {
    require('dotenv').config({ path: path.join(__dirname, '.env') });
  } catch (_) {
    /* optional */
  }

  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL missing');
    process.exit(1);
  }

  const clientPath = path.join(__dirname, 'src/generated/prisma');
  if (!fs.existsSync(clientPath)) {
    console.error('ERROR: src/generated/prisma missing. Upload it from GitHub.');
    process.exit(1);
  }
  console.log('Prisma client found at src/generated/prisma');
  console.log(
    'Skipping prisma db push (OOM on shared cPanel). Tables must come from phpMyAdmin import of prisma/init-from-empty.sql'
  );

  console.log('\n>>> seed');
  execSync('node src/config/seed.js', { stdio: 'inherit', env: process.env });
  console.log('\nOK: setup finished. RESTART the Node app, then open /health');
} catch (err) {
  console.error('\nSETUP FAILED:', err.message);
  console.error(
    'If you see "table does not exist", import prisma/init-from-empty.sql in phpMyAdmin first, then re-run cpanel-seed.js'
  );
  process.exit(1);
}
