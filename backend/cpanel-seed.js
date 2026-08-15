/**
 * DO NOT run seed via cPanel "Run JS script".
 * Use GitHub Actions → "Fix cPanel content" after Node RESTART.
 */
console.error(`
STOPPED: cpanel-seed.js crashes Prisma on this host (timer has gone away).

Use instead:
  1) Node App → NPM Install → RESTART
  2) Actions → Fix cPanel content → Run workflow
`);
process.exit(1);
