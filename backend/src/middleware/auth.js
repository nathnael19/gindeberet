const { verifyToken } = require('../utils/jwt');

// Authentication middleware
const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token.' 
      });
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role ? decoded.role.toUpperCase() : 'ADMIN'
    };

    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Authentication failed.' 
    });
  }
};

// Authorization middleware (check if user is admin)
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

// Authorization middleware (check if user is super admin)
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Super admin privileges required.' 
    });
  }
  next();
};

/** Attach user when a valid Bearer token is present; never fails the request. */
const optionalAuthenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const decoded = verifyToken(authHeader.substring(7));
    if (decoded) {
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role ? decoded.role.toUpperCase() : 'ADMIN',
      };
    }
  } catch {
    // ignore invalid tokens for optional auth
  }
  next();
};

module.exports = { authenticate, optionalAuthenticate, requireAdmin, requireSuperAdmin };