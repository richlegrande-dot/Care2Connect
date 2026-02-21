/**
 * Security Hardening Recommendations Implementation
 * Optional security enhancements for production deployment
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// 1. Rate Limiting for Login Endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many login attempts',
    message: 'Please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`[ADMIN_LOGIN_RATE_LIMIT] IP: ${req.ip} exceeded login attempts`);
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Please try again in 15 minutes'
    });
  }
});

// 2. General API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: 'Too many requests',
    message: 'Please slow down'
  }
});

// 3. Cache Control Middleware for Admin Routes
const noCacheMiddleware = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
};

// 4. Security Headers (Helmet)
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// 5. Environment Variable Validation
function validateEnvironment() {
  const required = ['DATABASE_URL'];
  const recommended = ['ADMIN_PASSWORD', 'SESSION_SECRET', 'NODE_ENV'];
  
  const missing = [];
  const warnings = [];
  
  required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });
  
  recommended.forEach(key => {
    if (!process.env[key]) {
      warnings.push(key);
    }
  });
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️  Recommended environment variables not set:', warnings.join(', '));
    console.warn('   Using defaults (not recommended for production)');
  }
}

// Usage in server.js:
// 
// const { loginLimiter, apiLimiter, noCacheMiddleware, securityHeaders, validateEnvironment } = require('./security');
// 
// // Validate environment on startup
// validateEnvironment();
// 
// // Apply security headers
// app.use(securityHeaders);
// 
// // Apply rate limiting
// app.use('/api', apiLimiter);
// app.post('/api/admin/login', loginLimiter, async (req, res) => { ... });
// 
// // Apply no-cache to admin routes
// app.use('/api/admin/*', noCacheMiddleware);

module.exports = {
  loginLimiter,
  apiLimiter,
  noCacheMiddleware,
  securityHeaders,
  validateEnvironment
};
