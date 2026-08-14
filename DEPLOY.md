# Deploy — Gindeberet General Construction PLC (cPanel)

Domain: **gindeberetconstruction.com**  
cPanel user: **gindebsx**

> **Start here for a clean API install:** [CPANEL_FRESH_CLONE.md](./CPANEL_FRESH_CLONE.md)  
> Shared hosting cannot run `prisma generate` (out of memory). Generated client is committed under `backend/src/generated/prisma/`.

## Architecture

| Piece | Where |
|--------|--------|
| Frontend (Vite `dist`) | `public_html` → https://gindeberetconstruction.com |
| Backend (Express) | Node app root = `gindeberet-src/backend` → https://api.gindeberetconstruction.com |
| Database | cPanel MySQL + import `backend/prisma/init-from-empty.sql` |

## Backend quick path

1. Clone repo to `gindeberet-src`
2. Node.js App → root `gindeberet-src/backend`, startup `src/server.js`
3. `.env` + env vars
4. Run NPM Install
5. phpMyAdmin import `init-from-empty.sql`
6. Run JS script `cpanel-seed.js`
7. RESTART → `/health`

**Do not** run `prisma generate` or `cpanel-generate.js` on the server.

## Frontend

```bash
cd frontend
# set VITE_API_URL=https://api.gindeberetconstruction.com/api
# set VITE_SITE_URL=https://gindeberetconstruction.com
npm ci && npm run build
```

Upload `frontend/dist/*` to `public_html/` (includes `.htaccess`).

## GitHub Actions

See `.github/workflows/deploy-cpanel.yml` and secrets in [YOU_DO_ON_CPANEL.md](./YOU_DO_ON_CPANEL.md).
