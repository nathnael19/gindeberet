/**
 * DO NOT use cPanel "Run JS script" / npm run cpanel:setup for seeding.
 * A second Prisma engine process panics on this host: "timer has gone away".
 *
 * Correct path:
 * 1) Node App → Run NPM Install → RESTART
 * 2) GitHub Actions → "Fix cPanel content" → Run workflow
 *    (POST /api/setup/fix-content with SETUP_SECRET)
 *
 * Or phpMyAdmin import: prisma/fix-awards-projects.sql
 */
console.error(`
============================================================
STOPPED: cpanel:setup / seed must NOT run on this cPanel host.
============================================================

Prisma "Run JS script" crashes here (PANIC: timer has gone away).

Do this instead:
  1. Setup Node.js App → Run NPM Install → RESTART
  2. GitHub → Actions → "Fix cPanel content" → Run workflow
     (requires SETUP_SECRET on cPanel env + GitHub secrets)

Admin login after fix-content:
  email: gindeberetconstruction278@gmail.com
  (password set by ADMIN_PASSWORD / defaults in deploy)

Forgot-password OTP needs SMTP_* env vars, then RESTART.
============================================================
`);
process.exit(1);
