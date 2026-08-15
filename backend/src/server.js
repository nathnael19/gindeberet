try {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
} catch (err) {
  console.warn('dotenv not installed yet; using process.env only:', err.message);
}

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

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
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

const start = () => {
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL(s): ${allowedOrigins.join(', ')}`);
  console.log(`DATABASE_URL set: ${Boolean(process.env.DATABASE_URL)}`);
  if (bootErrors.length) {
    console.error('Boot errors:', bootErrors);
  }
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
