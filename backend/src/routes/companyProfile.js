const express = require('express');
const router = express.Router();
const controller = require('../controllers/companyProfileController');
const { authenticate, requireAdmin, optionalAuthenticate } = require('../middleware/auth');

// Public share page data + PDF (published projects only)
router.get('/public', controller.getPublicProfile);
router.get('/public/pdf', controller.downloadPdf);

// Admin full history table + PDF
router.get('/admin', authenticate, requireAdmin, controller.getAdminProfile);
router.get('/admin/pdf', authenticate, requireAdmin, (req, res) => {
  // scope=all (default) or scope=public
  controller.downloadPdf(req, res);
});

// Optional: authenticated users hitting /pdf get admin scope
router.get('/pdf', optionalAuthenticate, controller.downloadPdf);

module.exports = router;
