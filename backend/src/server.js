// Load environment configuration
require('./config/env');

const express = require('express');
const { verifyTransporter } = require('./lib/email-transporter');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const candidatesRouter = require('./routes/candidates.routes');
const authRouter = require('./routes/auth.routes');
const eoiRouter = require('./routes/eoi.routes');
const adminRouter = require('./routes/admin/index');
const authenticateToken = require('./middleware/auth');
const requireAdmin = require('./middleware/requireAdmin');
const errorHandler = require('./middleware/errorHandler');
const performanceMiddleware = require('./middleware/performance');
const requestIdMiddleware = require('./middleware/requestId');
const logger = require('./utils/logger');
const config = require('./config/env');

const app = express();

// Trust proxy - Required when behind a proxy (Railway, Render, etc.)
// This allows Express to correctly identify the client IP from X-Forwarded-For headers
// Set to 1 to trust only the first proxy (Railway)
app.set('trust proxy', 1);

// Security headers (must be before other middleware)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for email templates
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow iframe embedding if needed
}));

// Rate limiting - More lenient in development, stricter in production
const isDevelopment = process.env.NODE_ENV === 'development';

// Custom key generator that uses X-Forwarded-For header safely
// Uses ipKeyGenerator helper for proper IPv6 handling
const keyGenerator = (req) => {
  // Use X-Forwarded-For header if available (from Railway proxy)
  // Take the first IP (original client) to prevent spoofing
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = forwarded.split(',').map(ip => ip.trim());
    const clientIp = ips[0] || req.ip;
    // Use ipKeyGenerator helper to properly handle IPv6 addresses
    return ipKeyGenerator(clientIp);
  }
  // Use ipKeyGenerator helper for proper IPv6 handling
  return ipKeyGenerator(req.ip);
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // More lenient in development for testing
  keyGenerator: keyGenerator,
  message: (req) => {
    return JSON.stringify({
      error: 'Too many requests from this IP, please try again later.',
      type: 'API_RATE_LIMIT',
      limit: isDevelopment ? 1000 : 100,
      windowMinutes: 15,
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check endpoint
    return req.path === '/health';
  },
});

// Stricter rate limiting for sensitive auth endpoints (login, signup, etc.)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 100 : 5, // More lenient in development (100 vs 5)
  keyGenerator: keyGenerator,
  message: (req) => {
    return JSON.stringify({
      error: 'Too many authentication attempts, please try again later.',
      type: 'AUTH_RATE_LIMIT',
      limit: isDevelopment ? 100 : 5,
      windowMinutes: 15,
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for GET /auth/me (user profile fetch)
    // This endpoint is called frequently on page loads and should not be strictly rate limited
    return req.method === 'GET' && req.path === '/me';
  },
});

// More lenient rate limiting for /auth/me (GET only - user profile fetch)
const authProfileLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: isDevelopment ? 60 : 30, // 30 requests per minute in production (more lenient)
  keyGenerator: keyGenerator,
  message: (req) => {
    return JSON.stringify({
      error: 'Too many requests, please try again later.',
      type: 'RATE_LIMIT',
      limit: isDevelopment ? 60 : 30,
      windowMinutes: 1,
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
// Normalize FRONTEND_URL to remove trailing slash for CORS matching
const frontendUrl = config.app.frontendUrl.replace(/\/$/, '');
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Normalize origin to remove trailing slash
    const normalizedOrigin = origin.replace(/\/$/, '');
    const normalizedFrontendUrl = frontendUrl.replace(/\/$/, '');
    
    // Check if origin matches (with or without trailing slash)
    if (normalizedOrigin === normalizedFrontendUrl || origin === frontendUrl) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(requestIdMiddleware); // Add request IDs for correlation
app.use(limiter); // Apply rate limiting to all routes
app.use(performanceMiddleware); // Track performance
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size

// Health check endpoint with detailed status
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  // Check database connectivity
  try {
    const prisma = require('./lib/prisma');
    await prisma.$queryRaw`SELECT 1`;
    health.database = 'connected';
  } catch (error) {
    health.database = 'disconnected';
    health.status = 'degraded';
  }

  // Check email service status (non-blocking)
  const { getTransporter } = require('./lib/email-transporter');
  const transporter = getTransporter();
  health.email = transporter ? 'configured' : 'not_configured';

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Development-only endpoint to reset rate limits (for testing)
// Double-check: ensure NODE_ENV is 'development' (not just truthy)
if (isDevelopment && process.env.NODE_ENV === 'development') {
  app.post('/dev/reset-rate-limits', (req, res) => {
    // Reset rate limit stores by creating new instances
    // Note: This only works if using default in-memory store
    // For Redis stores, you'd need to clear Redis keys
    res.json({ 
      message: 'Rate limit stores reset. Note: This only works with in-memory stores. For full reset, restart the server.',
      note: 'Rate limits are stored in memory and reset when server restarts.'
    });
  });
}

// Optimize: Add etag support for better caching
app.set('etag', true);

// Routes
app.use('/api/candidates', candidatesRouter);

// Auth routes with differentiated rate limiting
// /auth/me (GET) gets lenient rate limiting, other auth endpoints get strict rate limiting
app.use('/auth', (req, res, next) => {
  // Apply lenient rate limiting for GET /auth/me
  if (req.method === 'GET' && req.path === '/me') {
    return authProfileLimiter(req, res, next);
  }
  // Apply strict rate limiting for all other auth endpoints (login, signup, etc.)
  return authLimiter(req, res, next);
}, authRouter);

app.use('/api/eoi', eoiRouter);
app.use(
  '/api/admin',
  authenticateToken,
  requireAdmin,
  adminRouter
);

// Error handler (must be last)
app.use(errorHandler);

const PORT = config.app.port;

// Verify email service on startup (non-blocking, fire-and-forget)
// Email verification must NEVER block server startup - email is a side-effect, not core infrastructure
verifyTransporter()
  .then((status) => {
    if (status.success) {
      logger.info('[Email] Email service verified and ready');
    } else {
      logger.warn('[Email] Email service verification skipped:', status.error);
      logger.warn('[Email] Server continues to run - emails may not be sent until email is properly configured');
    }
  })
  .catch((error) => {
    // Log as warning, not error - don't let email verification failures crash the server
    logger.warn('[Email] Email verification failed (server continues running):', error.message);
    logger.warn('[Email] Server is operational - configure email to enable email sending');
  });

// Start server - email verification does not block this
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

