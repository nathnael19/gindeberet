/**
 * One-time cPanel setup without Terminal.
 * In Setup Node.js App → "Run JS script" → enter: cpanel-setup.js
 *
 * Requires .env with DATABASE_URL already in the app root.
 */
const { execSync } = require('child_process');
const path = require('path');

process.chdir(path.join(__dirname));

function run(cmd) {
  console.log('\n>>>', cmd);
  execSync(cmd, { stdio: 'inherit', env: process.env });
}

try {
  require('dotenv').config();
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL missing. Create .env in app root first.');
    process.exit(1);
  }

  run('npx prisma generate');
  run('npx prisma db push');
  run('node src/config/seed.js');

  console.log('\nOK: prisma + seed finished. Click RESTART on the Node.js App page.');
  console.log('Then open: https://api.gindeberetconstruction.com/health');
} catch (err) {
  console.error('\nSETUP FAILED:', err.message);
  process.exit(1);
}
