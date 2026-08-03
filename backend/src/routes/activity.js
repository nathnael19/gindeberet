const express = require('express');
const router = express.Router();
const { getRecentActivity } = require('../controllers/activityController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getRecentActivity);

module.exports = router;