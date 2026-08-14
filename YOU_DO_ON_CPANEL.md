# What you must do on cPanel / GitHub (cannot be done from this repo alone)
#
# See DEPLOY.md for full steps. Short list:

1. Create MySQL database + user in cPanel → copy DATABASE_URL
2. Create subdomain api.gindeberetconstruction.com + SSL
3. Upload/configure Node.js App (startup: src/server.js) + .env
4. Run NPM Install, prisma db push, Restart → /health OK
5. First frontend upload to public_html OR rely on GitHub Actions
6. GitHub → Settings → Secrets: FTP_* and VITE_* (see DEPLOY.md)
7. Change default admin password after seed
8. Pay hosting invoices so cPanel stays reachable
