const express = require('express');
const router = express.Router();
const { getRevenueData, getKPIData } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.get('/revenue', authenticate, getRevenueData);
router.get('/kpi', authenticate, getKPIData);

module.exports = router;
