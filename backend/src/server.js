require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const activityRoutes = require('./routes/activity');
const dashboardRoutes = require('./routes/dashboard');
const uploadRoutes = require('./routes/upload');
const settingsRoutes = require('./routes/settings');
const landingRoutes = require('./routes/landing');
const careersRoutes = require('./routes/careers');
const stampRoutes = require('./routes/stamp');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3001;

// CORS — allow primary site + optional comma-separated extras (e.g. www)
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  ...(process.env.FRONTEND_URLS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow same-origin / server-to-server / mobile apps with no Origin
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the backend uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/landing', landingRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/stamp', stampRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
const prisma = require('./config/database');

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server — supports cPanel Passenger and normal Node
const start = () => {
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL(s): ${allowedOrigins.join(', ')}`);
};

// Phusion Passenger injects a global on some cPanel Node apps
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