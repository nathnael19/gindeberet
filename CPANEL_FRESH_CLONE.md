# cPanel — fresh clone (Gindeberet API)

Shared hosting **cannot** run `prisma generate` (OOM).  
The generated client is already in the repo: `backend/src/generated/prisma/`.

## 0) Remove old broken clone

1. Git Version Control → remove `gindeberet-src` (if present)
2. File Manager → delete folder `gindeberet-src` if it remains
3. Do **not** delete `api.gindeberetconstruction.com` yet (or wipe it later)

## 1) Clone again

Git Version Control → **Create**:

| Field | Value |
|--------|--------|
| Clone URL | `https://github.com/nathnael19/gindeberet.git` |
| Repository Path | `gindeberet-src` |
| Name | `gindeberet-src` |

After clone, File Manager must show:

```text
gindeberet-src/backend/cpanel-seed.js
gindeberet-src/backend/prisma/init-from-empty.sql
gindeberet-src/backend/src/generated/prisma/index.js
gindeberet-src/backend/src/server.js
gindeberet-src/backend/package.json
```

## 2) Point Node app at the backend (recommended)

**Setup Node.js App** (edit existing api app):

| Field | Value |
|--------|--------|
| Application root | `gindeberet-src/backend` |
| Application URL | `api.gindeberetconstruction.com` |
| Startup file | `src/server.js` |
| Mode | Production |
| Node | 18 or 20 |

This avoids copying files into `api.gindeberetconstruction.com`.

**Alternative:** copy everything from `gindeberet-src/backend/` into `api.gindeberetconstruction.com/` (overwrite), keep Application root = `api.gindeberetconstruction.com`.

## 3) Create `.env` in the app root

In the same folder as `package.json` (either `gindeberet-src/backend` or `api…`):

File name must be exactly `.env`:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=mysql://gindebsx_gindeberet:YOUR_MYSQL_PASSWORD@localhost:3306/gindebsx_gindeberet_db
JWT_SECRET=gB7kR9mP2xQ4vL8nW1tH5cY0jF6sA3dE8uZqN4bM7pK2wX9rT5hJ1vC6
JWT_EXPIRE=7d
FRONTEND_URL=https://gindeberetconstruction.com
```

Also add the same keys under Node App → **Environment variables** → SAVE.

## 4) NPM Install

Node App → **Run NPM Install** (wait until success).

Do **not** run `cpanel-generate.js` / `prisma generate`.

## 5) Import database tables (phpMyAdmin)

1. Download / open: `gindeberet-src/backend/prisma/init-from-empty.sql`
2. phpMyAdmin → database `gindebsx_gindeberet_db` → **Import** → that SQL → Go

## 6) Seed

Node App → **Run JS script** → `cpanel-seed.js`

## 7) Restart + test

**RESTART** → open https://api.gindeberetconstruction.com/health

Expect JSON (not 503 HTML), e.g. `"success": true`.

## Do NOT run on this host

- `npx prisma generate`
- `cpanel-generate.js`
- heavy `prisma db push` (often OOM) — use SQL import instead

## Frontend (later)

Build locally with:

```env
VITE_API_URL=https://api.gindeberetconstruction.com/api
VITE_SITE_URL=https://gindeberetconstruction.com
```

Upload `frontend/dist/*` → `public_html/`.
