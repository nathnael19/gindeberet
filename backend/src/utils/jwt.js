const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    console.error(
      'JWT_SECRET is not set — admin tokens will break after restart. Set JWT_SECRET in cPanel Node env.'
    );
  }

  return 'dev-only-insecure-jwt-secret';
}

// Generate JWT token
const generateToken = (userId, email, role) => {
  const normalizedRole = role ? role.toUpperCase() : 'ADMIN';
  return jwt.sign(
    { userId, email, role: normalizedRole },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Verify JWT token — returns payload or { error: 'expired' | 'invalid' }
const verifyToken = (token) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { error: 'expired' };
    }
    return { error: 'invalid' };
  }
};

module.exports = { generateToken, verifyToken, getJwtSecret };
