const express = require('express');
const router = express.Router();
const { login, getMe, updateMe, createUser } = require('../controllers/authController');
const {
  forgotPassword,
  resetPassword,
} = require('../controllers/passwordResetController');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');

// Public routes
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);
router.post('/users', authenticate, requireSuperAdmin, createUser);

module.exports = router;
