const express = require('express');
const router = express.Router();
const { getSiteSettings, updateSiteSettings } = require('../controllers/settingsController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/', getSiteSettings);

// Admin-only routes
router.put('/', authenticate, requireAdmin, updateSiteSettings);

module.exports = router;
