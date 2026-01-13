/**
 * Request ID Middleware
 * Adds a unique request ID to each request for correlation and debugging
 */
const { randomUUID } = require('crypto');

function requestIdMiddleware(req, res, next) {
  // Generate or use existing request ID from headers (for distributed systems)
  req.id = req.headers['x-request-id'] || randomUUID();
  
  // Add request ID to response headers for client correlation
  res.setHeader('X-Request-ID', req.id);
  
  next();
}

module.exports = requestIdMiddleware;
