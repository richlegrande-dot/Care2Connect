import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// Comprehensive Helmet.js configuration for production security
export const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for some CSS-in-JS libraries
        "https://fonts.googleapis.com"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-eval'", // Required for development tools, remove in production
        "https://vercel.live" // Vercel live reload
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:" // For generated QR codes and user uploads
      ],
      fontSrc: [
        "'self'",
        "data:",
        "https://fonts.gstatic.com"
      ],
      connectSrc: [
        "'self'",
        "https://api.careconnect.org",
        "https://api.openai.com",
        "https://indeed-api.com",
        "https://api.adzuna.com",
        process.env.SUPABASE_URL || "",
        "wss:" // WebSocket connections
      ],
      mediaSrc: [
        "'self'",
        "blob:", // For audio recording and playback
        "data:"
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"], // Prevent embedding in frames
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
    reportOnly: false
  },

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },

  // Prevent clickjacking
  frameguard: {
    action: 'deny'
  },

  // Prevent MIME type sniffing
  noSniff: true,

  // Referrer Policy
  referrerPolicy: {
    policy: ['strict-origin-when-cross-origin']
  },

  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Disabled to allow external resources

  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: {
    policy: 'same-origin-allow-popups'
  },

  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: {
    policy: 'cross-origin'
  },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // DNS Prefetch Control
  dnsPrefetchControl: {
    allow: false
  },
});

// Additional security middleware
export const additionalSecurity = (req: Request, res: Response, next: NextFunction) => {
  // Set additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Permissions Policy (not supported natively in Helmet v7)
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=(), payment=(), usb=(), bluetooth=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()');
  
  // Remove server signature
  res.removeHeader('Server');
  res.removeHeader('X-Powered-By');
  
  // Set custom security headers
  res.setHeader('X-API-Version', process.env.APP_VERSION || '1.0.0');
  res.setHeader('X-Security-Policy', 'strict');
  
  // Add cache control for sensitive endpoints
  if (req.path.includes('/auth') || req.path.includes('/profile')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
  
  next();
};

// Security validation middleware
export const validateSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Check for required security headers in requests
  const requiredHeaders = ['user-agent'];
  
  for (const header of requiredHeaders) {
    if (!req.headers[header]) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Missing required header: ${header}`
      });
    }
  }
  
  // Validate User-Agent to block suspicious requests
  const userAgent = req.headers['user-agent'] as string;
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /scraper/i,
    /spider/i
  ];
  
  // Allow legitimate bots but block malicious ones
  const allowedBots = [
    /googlebot/i,
    /bingbot/i,
    /slackbot/i,
    /facebookexternalhit/i,
    /twitterbot/i
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  const isAllowedBot = allowedBots.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious && !isAllowedBot) {
    console.warn(`Suspicious User-Agent detected: ${userAgent} from IP: ${req.ip}`);
    // Log but don't block - just monitor
  }
  
  next();
};

// Content validation middleware
export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  // Validate content type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    
    if (!contentType) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Content-Type header is required'
      });
    }
    
    // Allow specific content types
    const allowedContentTypes = [
      'application/json',
      'multipart/form-data',
      'application/x-www-form-urlencoded'
    ];
    
    const isAllowed = allowedContentTypes.some(type => 
      contentType.toLowerCase().includes(type)
    );
    
    if (!isAllowed) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Unsupported Content-Type'
      });
    }
  }
  
  next();
};

// Security monitoring middleware
export const securityMonitoring = (req: Request, res: Response, next: NextFunction) => {
  // Log security-relevant events
  const securityEvents = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    referer: req.headers.referer
  };
  
  // Check for potential security threats
  const threats = [];
  
  // SQL injection patterns
  const sqlInjectionPatterns = [
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    /insert\s+into/i,
    /update.+set/i
  ];
  
  const requestData = JSON.stringify(req.body) + req.url + JSON.stringify(req.query);
  
  if (sqlInjectionPatterns.some(pattern => pattern.test(requestData))) {
    threats.push('SQL_INJECTION_ATTEMPT');
  }
  
  // XSS patterns
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /onload=/i,
    /onerror=/i
  ];
  
  if (xssPatterns.some(pattern => pattern.test(requestData))) {
    threats.push('XSS_ATTEMPT');
  }
  
  // Path traversal patterns
  if (req.url.includes('../') || req.url.includes('..\\')) {
    threats.push('PATH_TRAVERSAL_ATTEMPT');
  }
  
  // Log threats
  if (threats.length > 0) {
    console.error('SECURITY THREAT DETECTED:', {
      ...securityEvents,
      threats,
      severity: 'HIGH'
    });
    
    // In production, you might want to:
    // 1. Send alert to security team
    // 2. Block the IP temporarily
    // 3. Log to security monitoring system
  }
  
  next();
};
