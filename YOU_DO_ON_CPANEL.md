# What you must do on cPanel (cannot be done from this laptop alone)

Auto deploy after push: see **GITHUB_ACTIONS_SETUP.md** (FTP secrets + Restart).

## First-time API (once)

1. MySQL DB + user (`gindebsx_gindeberet_db` / `gindebsx_gindeberet`)
2. Subdomain `api.gindeberetconstruction.com` + SSL
3. Node.js App root = `api.gindeberetconstruction.com`, startup = `src/server.js`
4. Create `.env` on server (+ same vars in Node App UI)
5. Run NPM Install
6. phpMyAdmin → import `backend/prisma/init-from-empty.sql`
7. Run JS script `cpanel-seed.js` → RESTART → `/health`
8. Never run `prisma generate` on this shared host (OOM)

## Every code change (automatic)

1. Push to `main` (or Actions → Run workflow)
2. Wait for **Deploy to cPanel** to finish green
3. cPanel → Node.js App → **RESTART**

## GitHub secrets required

`FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_BACKEND_DIR`, `FTP_FRONTEND_DIR`, `VITE_API_URL`, `VITE_SITE_URL`
