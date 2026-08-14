# What you must do on cPanel (cannot be done from this laptop alone)

Full fresh-clone steps: **CPANEL_FRESH_CLONE.md**

1. MySQL DB + user already (e.g. `gindebsx_gindeberet_db` / `gindebsx_gindeberet`)
2. Subdomain `api.gindeberetconstruction.com` + SSL
3. Remove old Git clone → clone `https://github.com/nathnael19/gindeberet.git` to `gindeberet-src`
4. Node.js App root = `gindeberet-src/backend`, startup = `src/server.js`
5. Create `.env` + Node App env vars (`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`)
6. Run NPM Install
7. phpMyAdmin → import `backend/prisma/init-from-empty.sql`
8. Run JS script `cpanel-seed.js` → RESTART → `/health`
9. Never run `prisma generate` on this shared host (OOM)
10. Later: frontend `dist` → `public_html` + GitHub Actions secrets
