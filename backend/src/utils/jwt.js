const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId, email, role) => {
  // Ensure role is in uppercase for consistency with Prisma enum
  const normalizedRole = role ? role.toUpperCase() : 'ADMIN';
  return jwt.sign(
    { userId, email, role: normalizedRole },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };