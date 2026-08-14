# GitHub Actions → automatic cPanel deploy

Every push to `main` uploads:

| Local | Server |
|--------|--------|
| `backend/` (incl. `src/generated`) | `FTP_BACKEND_DIR` (e.g. `/api.gindeberetconstruction.com/`) |
| `frontend/dist/` | `FTP_FRONTEND_DIR` (e.g. `/public_html/`) |

Prisma client is **regenerated on GitHub’s Linux runners** before upload (avoids cPanel OOM).

## One-time: add secrets

Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret name | Example value |
|-------------|----------------|
| `FTP_SERVER` | `ftp.gindeberetconstruction.com` or `192.250.239.60` |
| `FTP_USERNAME` | `gindebsx` |
| `FTP_PASSWORD` | (cPanel / FTP password) |
| `FTP_BACKEND_DIR` | `/api.gindeberetconstruction.com/` |
| `FTP_FRONTEND_DIR` | `/public_html/` |
| `VITE_API_URL` | `https://api.gindeberetconstruction.com/api` |
| `VITE_SITE_URL` | `https://gindeberetconstruction.com` |

If FTPS fails, temporarily test with a workflow edit to `protocol: ftp` (less secure) or ask host for FTPS on port 21/990.

## After each auto-deploy

1. cPanel → **Setup Node.js App** → **RESTART** (required so Node loads new files)
2. Only if `package.json` dependencies changed → **Run NPM Install**, then Restart
3. Do **not** run `prisma generate` on the server

`.env` on the server is **never** overwritten by Actions (excluded).

## Test the workflow

1. Add secrets (above)
2. GitHub → **Actions** → **Deploy to cPanel** → **Run workflow**  
   or push any small change to `main`
3. Wait for green checks
4. Restart Node app → open `/health`

## Manual still needed once

- MySQL + `.env` + phpMyAdmin SQL import + first seed (`cpanel-seed.js`)
- Node.js App created and pointed at `api.gindeberetconstruction.com`
