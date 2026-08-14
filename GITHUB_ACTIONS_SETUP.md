# GitHub Actions → automatic cPanel deploy

Every push to `main` uploads:

| Local | Server |
|--------|--------|
| `backend/` (incl. `src/generated`) | `FTP_BACKEND_DIR` (e.g. `/api.gindeberetconstruction.com/`) |
| `frontend/dist/` | `FTP_FRONTEND_DIR` (e.g. `/public_html/`) |

Prisma client is **regenerated on GitHub’s Linux runners** before upload (avoids cPanel OOM).

## One-time: add secrets

Repo → **Settings** → **Secrets and variables** → **Actions** → **Repository secrets** → **New repository secret**

**Critical:** use **Repository secrets**, not Environment secrets, and not Variables. Names must match exactly (case-sensitive).

| Secret name | Example value |
|-------------|----------------|
| `FTP_SERVER` | `ftp.gindeberetconstruction.com` or `192.250.239.60` |
| `FTP_USERNAME` | `gindebsx` |
| `FTP_PASSWORD` | (cPanel / FTP password) |
| `FTP_BACKEND_DIR` | `/api.gindeberetconstruction.com/` |
| `FTP_FRONTEND_DIR` | `/public_html/` |
| `VITE_API_URL` | `https://api.gindeberetconstruction.com/api` |
| `VITE_SITE_URL` | `https://gindeberetconstruction.com` |

Optional (defaults are already cPanel-friendly: `ftp` on port `21`):

| Secret name | Example value |
|-------------|----------------|
| `FTP_PROTOCOL` | `ftp` (default) or `ftps` |
| `FTP_PORT` | `21` |

### If Actions says `Input required and not supplied: server`

That means `FTP_SERVER` is empty for the workflow. Fix:

1. Open https://github.com/nathnael19/gindeberet/settings/secrets/actions
2. Confirm you are on **Repository secrets** (not Environments)
3. Re-create `FTP_SERVER` / `FTP_USERNAME` / `FTP_PASSWORD` with non-empty values
4. Re-run the workflow (**Actions** → latest run → **Re-run all jobs**) — no code push needed

## After each auto-deploy

1. cPanel → **Setup Node.js App** → **RESTART** (required so Node loads new files)
2. Only if `package.json` dependencies changed → **Run NPM Install**, then Restart
3. Do **not** run `prisma generate` on the server

`.env` and backend `.htaccess` on the server are **never** overwritten by Actions (excluded).

## Test the workflow

1. Add secrets (above)
2. GitHub → **Actions** → **Deploy to cPanel** → **Run workflow**  
   or push any small change to `main`
3. Wait for green checks
4. Restart Node app → open `/health`

## Manual still needed once

- MySQL + `.env` + phpMyAdmin SQL import + first seed (`cpanel-seed.js`)
- Node.js App created and pointed at `api.gindeberetconstruction.com`
