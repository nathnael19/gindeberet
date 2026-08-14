# Deploy — Gindeberet General Construction PLC (cPanel)

Domain: **gindeberetconstruction.com**  
cPanel user: **gindebsx** · Home: `/home/gindebsx` · SSL: Active

Architecture

| Piece | Where |
|--------|--------|
| Frontend (Vite build) | `public_html` → https://gindeberetconstruction.com |
| Backend (Express API) | Node.js App on **api** subdomain → https://api.gindeberetconstruction.com |
| Database | cPanel MySQL + Prisma |

---

## Tartiiba 1 — MySQL (cPanel)

1. cPanel → **MySQL® Databases**
2. Database uumi (fakkeenya: `gindebsx_gindeberet`)
3. User uumi + password cimaa kenni; database sanaatti **ALL PRIVILEGES** kenni
4. Connection string qopheessi:

```text
mysql://gindebsx_USER:PASSWORD@localhost:3306/gindebsx_DBNAME
```

---

## Tartiiba 2 — Subdomain API

1. cPanel → **Domains** / **Subdomains**
2. Subdomain: `api` → document root fakkeenya: `/home/gindebsx/api.gindeberetconstruction.com`
3. SSL (AutoSSL / Let’s Encrypt) api subdomain irratti mirkaneessi

---

## Tartiiba 3 — Backend upload + Node.js App

1. Folder api root keessa backend files galchi (`src/`, `prisma/`, `package.json`, …) — **`.env` hin irraa dabarsi Git irraa**
2. File Manager ykn FTP fayyadami; folder `uploads/` uumi (writable `755` / `775`)
3. cPanel search: **Setup Node.js App** → **Create Application**
   - **Node version:** 18 ykn 20
   - **Application mode:** Production
   - **Application root:** folder backend jiru (fakkeenya `api.gindeberetconstruction.com`)
   - **Application URL:** `api.gindeberetconstruction.com`
   - **Application startup file:** `src/server.js`
4. **Environment variables** (ykn `.env` file):

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=mysql://gindebsx_USER:PASSWORD@localhost:3306/gindebsx_DBNAME
JWT_SECRET=RANDOM_LONG_SECRET_HERE
JWT_EXPIRE=7d
FRONTEND_URL=https://gindeberetconstruction.com
```

5. **Run NPM Install** (cPanel button)
6. Terminal / SSH yoo jiraate:

```bash
cd ~/api.gindeberetconstruction.com
npx prisma generate
npx prisma db push
npm run seed
```

Yoo Terminal hin jirre: Node App “Run JS script” / support ticket — `prisma db push` barbaachisa.

7. App **Restart** → check: https://api.gindeberetconstruction.com/health  
   Deebiin `{"success":true,...}` ta’uu qaba.

8. Admin password seed default jijjiiri (`admin@gindeberet.com` / `admin123` yoo seed fayyadamte).

---

## Tartiiba 4 — Frontend (manual ykn GitHub Actions)

### Manual

```bash
cd frontend
copy .env.production.example .env.production
# VITE_API_URL=https://api.gindeberetconstruction.com/api
# VITE_SITE_URL=https://gindeberetconstruction.com
npm ci
npm run build
```

`frontend/dist/*` hunda `public_html/` keessa galchi (`.htaccess` waliin — SPA routing).

### GitHub Actions (automatic)

1. Repo GitHub irratti push godhi
2. GitHub → **Settings → Secrets and variables → Actions** → secrets armaan gadii uumi:

| Secret | Fakkeenya |
|--------|-----------|
| `FTP_SERVER` | `ftp.gindeberetconstruction.com` ykn IP `192.250.239.60` |
| `FTP_USERNAME` | `gindebsx` |
| `FTP_PASSWORD` | cPanel / FTP password |
| `FTP_PROTOCOL` | `ftps` (ykn `ftp` yoo FTPS hin hojjenne) |
| `FTP_PORT` | `21` |
| `FTP_FRONTEND_DIR` | `/public_html/` |
| `FTP_BACKEND_DIR` | `/api.gindeberetconstruction.com/` |
| `VITE_API_URL` | `https://api.gindeberetconstruction.com/api` |
| `VITE_SITE_URL` | `https://gindeberetconstruction.com` |

3. Branch `main` irratti push → workflow **Deploy to cPanel** ni ka’a
4. Backend FTP booda cPanel keessa **Run NPM Install** + **Restart** (node_modules FTP irratti hin ergamu)

Workflow file: `.github/workflows/deploy-cpanel.yml`

---

## Tartiiba 5 — DNS / Cloudflare (filannoo)

PP Host dashboard irratti **Enable Cloudflare** ni dandeessa. Yoo Cloudflare fayyadamte:

- SSL mode: **Full** (Strict yoo certificate ifaanii ta’e)
- `api` subdomain DNS A/CNAME record mirkaneessi
- Yeroo tokko orange-cloud (proxy) API irratti rakkoo CORS/WebSocket uumu danda’a — yoo API hin hojjenne, DNS-only (grey cloud) yaali

Nameservers amma: `ns1.mysecurecloudhost.com` / `ns2.mysecurecloudhost.com`

---

## Checklist xumuraa

- [ ] https://gindeberetconstruction.com homepage mul’ata
- [ ] https://api.gindeberetconstruction.com/health OK
- [ ] Projects / images `/uploads` mul’atu
- [ ] `/about`, `/services`, `/admin` deep link SPA (`.htaccess`)
- [ ] Admin login https://gindeberetconstruction.com/admin
- [ ] Invoice hosting kaffalame (cPanel timeout irraa oolchuuf)
- [ ] JWT_SECRET cimaa · admin password jijjiirame

---

## Rakkoo beekamoo

| Rakkoo | Furmaata |
|--------|----------|
| `ERR_CONNECTION_TIMED_OUT` cPanel | Invoice / PP Host support |
| CORS error browser | `FRONTEND_URL` = exact `https://gindeberetconstruction.com` (www malee ykn waliin `FRONTEND_URLS`) |
| Prisma engine error | Server irratti `npx prisma generate` · binaryTargets schema keessa jiru |
| `sharp` install fail | Node 18/20 yaali; ykn support ask to enable build tools |
| API 404 after deploy | Startup file `src/server.js` · Application URL subdomain sirrii |
| Blank page on `/about` | `.htaccess` `public_html` keessa jiraa mirkaneessi |

Fakkeenya env: `frontend/.env.production.example`, `backend/.env.production.example`
