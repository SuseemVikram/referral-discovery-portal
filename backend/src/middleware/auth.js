const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { UnauthorizedError } = require('../utils/errors');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new UnauthorizedError('Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };
    next();
  } catch (error) {
    // Log token validation error for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      const logger = require('../utils/logger');
      logger.debug(req.id || 'unknown', 'Token validation failed:', {
        error: error.message,
        tokenPrefix: token.substring(0, 20) + '...',
        // Don't log full token for security
      });
    }
    return next(new UnauthorizedError('Invalid or expired token'));
  }
}

module.exports = authenticateToken;

