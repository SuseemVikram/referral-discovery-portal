/**
 * Global Error Handler Middleware
 */
const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

function errorHandler(err, req, res, next) {
  // Get request ID for correlation
  const requestId = req.id || 'unknown';
  
  // Log error with request ID
  logger.error(requestId, 'Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    user: req.user ? { id: req.user.id, email: req.user.email } : undefined,
  });

  // Prisma errors
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Resource not found',
      requestId: requestId,
    });
  }

  // Validation errors (Zod)
  if (err.name === 'ZodError' || err.errors) {
    return res.status(400).json({
      error: 'Validation error',
      errors: err.errors || err.issues,
      requestId: requestId,
    });
  }

  // Custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      requestId: requestId,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    error: message,
    requestId: requestId,
  });
}

module.exports = errorHandler;

