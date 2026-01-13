/**
 * Performance monitoring middleware
 */
function performanceMiddleware(req, res, next) {
  const startTime = Date.now();
  
  // Add performance header
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Only set header if response hasn't been sent yet
    if (!res.headersSent) {
      try {
        res.setHeader('X-Response-Time', `${duration}ms`);
      } catch (err) {
        // Ignore errors if headers already sent
      }
    }
    
    // Log slow requests (always log if very slow, otherwise only in development)
    if (duration > 1000 || (process.env.NODE_ENV === 'development' && duration > 500)) {
      console.warn(`Slow request: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  
  next();
}

module.exports = performanceMiddleware;
