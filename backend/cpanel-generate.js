/**
 * Minimal cPanel script: prisma generate only.
 * Setup Node.js App → Run JS script → cpanel-generate.js
 */
const { execSync } = require('child_process');
const path = require('path');

process.chdir(path.join(__dirname));

try {
  try {
    require('dotenv').config({ path: path.join(__dirname, '.env') });
  } catch (_) {
    /* optional */
  }
  console.log('Running prisma generate...');
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
  console.log('OK: prisma generate done. Next: Run JS script cpanel-setup.js OR db push, then RESTART.');
} catch (err) {
  console.error('FAILED:', err.message);
  process.exit(1);
}
