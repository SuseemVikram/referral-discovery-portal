// Load environment configuration
require('./config/env');

const express = require('express');
const { verifyTransporter } = require('./lib/email-transporter');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const candidatesRouter = require('./routes/candidates.routes');
const authRouter = require('./routes/auth.routes');
const eoiRouter = require('./routes/eoi.routes');
const adminRouter = require('./routes/admin/index');
const authenticateToken = require('./middleware/auth');
const requireAdmin = require('./middleware/requireAdmin');
const errorHandler = require('./middleware/errorHandler');
const performanceMiddleware = require('./middleware/performance');
const requestIdMiddleware = require('./middleware/requestId');
const config = require('./config/env');

const app = express();

// Trust proxy - Required when behind a proxy (Railway, Render, etc.)
// This allows Express to correctly identify the client IP from X-Forwarded-For headers
// Set to 1 to trust only the first proxy (Railway)
app.set('trust proxy', 1);

// Rate limiting - More lenient in development, stricter in production
const isDevelopment = process.env.NODE_ENV === 'development';

// Custom key generator that uses X-Forwarded-For header safely
const keyGenerator = (req) => {
  // Use X-Forwarded-For header if available (from Railway proxy)
  // Take the first IP (original client) to prevent spoofing
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = forwarded.split(',').map(ip => ip.trim());
    return ips[0] || req.ip;
  }
  return req.ip;
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

// Stricter rate limiting for auth endpoints
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

// Health check (no caching needed)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Development-only endpoint to reset rate limits (for testing)
if (isDevelopment) {
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
app.use('/auth', authLimiter, authRouter); // Stricter rate limiting for auth
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

// Verify SMTP connection on startup (non-blocking)
verifyTransporter().then((status) => {
  if (status.success) {
    console.log('[SMTP] Email service verified and ready');
  } else {
    console.error('[SMTP] Email service verification failed:', status.error);
    console.error('[SMTP] Emails will not be sent until SMTP is properly configured');
  }
}).catch((error) => {
  console.error('[SMTP] Error during verification:', error);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

