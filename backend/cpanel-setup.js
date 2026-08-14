/**
 * cPanel setup WITHOUT prisma generate (OOM on shared hosts).
 * Client is committed under src/generated/prisma.
 *
 * Run JS script: cpanel-setup.js
 * Still needs DATABASE_URL in .env or Node App env vars.
 * For empty DB: import prisma/init-from-empty.sql via phpMyAdmin first,
 * or run db push if memory allows.
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

  try {
    console.log('\n>>> npx prisma db push');
    execSync('npx prisma db push --skip-generate', {
      stdio: 'inherit',
      env: process.env,
    });
  } catch (err) {
    console.error(
      '\nDB push failed (often OOM). Import prisma/init-from-empty.sql in phpMyAdmin, then re-run seed only.'
    );
    console.error(err.message);
  }

  console.log('\n>>> seed');
  execSync('node src/config/seed.js', { stdio: 'inherit', env: process.env });
  console.log('\nOK: setup finished. RESTART the Node app, then open /health');
} catch (err) {
  console.error('\nSETUP FAILED:', err.message);
  process.exit(1);
}
