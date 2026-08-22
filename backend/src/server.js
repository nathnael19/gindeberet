try {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
} catch (err) {
  console.warn('dotenv not installed yet; using process.env only:', err.message);
}

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { ensureUploadDir, migrateLegacyUploadsIfNeeded } = require('./config/uploads');

const uploadDir = ensureUploadDir();
migrateLegacyUploadsIfNeeded();

const app = express();
const PORT = process.env.PORT || 3001;
const bootErrors = [];

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  ...(process.env.FRONTEND_URLS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  'https://gindeberetconstruction.com',
  'https://www.gindeberetconstruction.com',
  'http://gindeberetconstruction.com',
  'http://www.gindeberetconstruction.com',
].filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  try {
    const host = new URL(origin).hostname.replace(/^www\./, '');
    return host === 'gindeberetconstruction.com' || host === 'localhost';
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      console.warn('CORS blocked origin:', origin);
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-setup-secret'],
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  next();
});
app.use('/uploads', express.static(uploadDir));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health must work even when Prisma/routes fail to load
app.get('/health', (req, res) => {
  res.json({
    success: bootErrors.length === 0,
    message: bootErrors.length === 0 ? 'Server is running' : 'Server booted with errors',
    timestamp: new Date().toISOString(),
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    bootErrors,
  });
});

function mount(name, mountPath, loader) {
  try {
    const routes = loader();
    app.use(mountPath, routes);
    console.log(`Mounted ${name} at ${mountPath}`);
  } catch (err) {
    const msg = `${name}: ${err.message}`;
    console.error('Failed to mount', msg);
    bootErrors.push(msg);
  }
}

mount('auth', '/api/auth', () => require('./routes/auth'));
mount('projects', '/api/projects', () => require('./routes/projects'));
mount('activity', '/api/activity', () => require('./routes/activity'));
mount('dashboard', '/api/dashboard', () => require('./routes/dashboard'));
mount('upload', '/api/upload', () => require('./routes/upload'));
mount('settings', '/api/settings', () => require('./routes/settings'));
mount('landing', '/api/landing', () => require('./routes/landing'));
mount('careers', '/api/careers', () => require('./routes/careers'));
mount('stamp', '/api/stamp', () => require('./routes/stamp'));
mount('setup', '/api/setup', () => require('./routes/setup'));
mount('contact', '/api/contact', () => require('./routes/contact'));
mount('companyProfile', '/api/company-profile', () => require('./routes/companyProfile'));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    bootErrors,
  });
});

try {
  const errorHandler = require('./middleware/errorHandler');
  app.use(errorHandler);
} catch (err) {
  bootErrors.push(`errorHandler: ${err.message}`);
}

try {
  const prisma = require('./config/database');
  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
} catch (err) {
  bootErrors.push(`database: ${err.message}`);
  console.error('Prisma unavailable at boot:', err.message);
}

/**
 * After Restart: seed 35 sheet projects (no SETUP_SECRET / no outbound API).
 * If Actions dropped data/pending-fix-content, run full awards+admin+projects fix.
 */
async function runBootMaintenance() {
  const flagPath = path.join(__dirname, '../data/pending-fix-content');
  try {
    const fs = require('fs');
    const prisma = require('./config/database');
    if (fs.existsSync(flagPath)) {
      const { fixPublicContent } = require('./services/fixPublicContent');
      const result = await fixPublicContent();
      console.log('pending-fix-content applied:', JSON.stringify(result));
      try {
        fs.unlinkSync(flagPath);
      } catch (_) {
        /* ignore */
      }
      return;
    }
    if (process.env.SEED_SHEET_ON_BOOT === '0') {
      console.log('SEED_SHEET_ON_BOOT=0 — skipping sheet seed');
    } else {
      const { seedSheetProjects } = require('./config/seedSheetProjects');
      const sheet = await seedSheetProjects(prisma);
      console.log(
        `Boot sheet seed: created=${sheet.created || 0} updated=${sheet.updated || 0} total=${sheet.sheetCount || 35} errors=${(sheet.errors && sheet.errors.length) || 0}`
      );
    }
    const { ensureLandingDefaults } = require('./services/ensureLandingDefaults');
    const landing = await ensureLandingDefaults();
    if (landing.heroCreated || landing.servicesCreated) {
      console.log(
        `Boot landing defaults: hero=${landing.heroCreated} services=${landing.servicesCreated}`
      );
    }
    const { PUBLIC_CONTACT_EMAIL } = require('./config/emails');
    const CONTACT_EMAIL = PUBLIC_CONTACT_EMAIL;
    const emailFix = await prisma.siteSettings.updateMany({
      where: {
        OR: [
          { email: 'gindeberetconstruction2772@gmail.com' },
          { email: 'info@gindeberet.com' },
          { email: null },
        ],
      },
      data: { email: CONTACT_EMAIL },
    });
    if (emailFix.count > 0) {
      console.log(`Boot contact email fixed → ${CONTACT_EMAIL}`);
    }

    const bcrypt = require('bcryptjs');
    const { DEFAULT_ADMIN_EMAIL, PUBLIC_CONTACT_EMAIL } = require('./config/emails');
    const plcEmail = DEFAULT_ADMIN_EMAIL;
    const plcAdmin = await prisma.adminUser.findUnique({ where: { email: plcEmail } });
    if (!plcAdmin) {
      const legacy = await prisma.adminUser.findUnique({
        where: { email: PUBLIC_CONTACT_EMAIL.toLowerCase() },
      });
      const password =
        legacy?.password ||
        (await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Gindeberetplc@246', 10));
      await prisma.adminUser.create({
        data: {
          email: plcEmail,
          password,
          role: 'SUPER_ADMIN',
          isActive: true,
          firstName: 'Admin',
          lastName: 'Gindeberet',
        },
      });
      console.log(`Boot admin inbox account ready → ${plcEmail}`);
    }

    const { ensureResetTable } = require('./controllers/passwordResetController');
    await ensureResetTable();
  } catch (err) {
    const msg = `bootMaintenance: ${err.message}`;
    console.error(msg);
    bootErrors.push(msg);
  }
}

const start = () => {
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Upload directory: ${uploadDir}`);
  console.log(`Frontend URL(s): ${allowedOrigins.join(', ')}`);
  console.log(`DATABASE_URL set: ${Boolean(process.env.DATABASE_URL)}`);
  console.log(`JWT_SECRET set: ${Boolean(process.env.JWT_SECRET)}`);
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    bootErrors.push('JWT_SECRET is not set — admin login tokens will fail after restart');
  }
  if (bootErrors.length) {
    console.error('Boot errors:', bootErrors);
  }
  void runBootMaintenance();
};

const passenger = global.PhusionPassenger;
if (passenger) {
  passenger.configure({ autoInstall: false });
  app.listen('passenger', start);
} else {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    start();
  });
}

module.exports = app;
