const express = require('express');
const router = express.Router();
const { getRevenueData, getKPIData, getAnalytics } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.get('/revenue', authenticate, getRevenueData);
router.get('/kpi', authenticate, getKPIData);
router.get('/analytics', authenticate, getAnalytics);

module.exports = router;
