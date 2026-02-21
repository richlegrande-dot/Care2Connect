import cors from 'cors';
import { Request } from 'express';

// CORS Configuration for Production
export const corsConfig = cors({
  origin: (origin: string | undefined, callback: (err: Error | null, origin?: boolean | string | RegExp | (boolean | string | RegExp)[]) => void) => {
    // Allow requests with no origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);

    // Allowed origins for production
    const allowedOrigins = [
      'https://careconnect.org',
      'https://www.careconnect.org',
      'https://careconnect.vercel.app',
      ...(process.env.ALLOWED_ORIGINS?.split(',') || [])
    ];

    // Development origins
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push(
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
      );
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy violation: Origin ${origin} not allowed`), false);
    }
  },
  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-User-ID',
    'X-API-Key',
    'Cache-Control',
    'Pragma'
  ],
  
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset'
  ],
  
  credentials: true,
  
  maxAge: 86400, // 24 hours
  
  optionsSuccessStatus: 200, // For legacy browser support
  
  preflightContinue: false
});

// CORS preflight handler
export const handlePreflight = (req: Request, res: any, next: any) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-User-ID');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }
  next();
};

// Security headers for API responses
export const securityHeaders = (req: Request, res: any, next: any) => {
  // Prevent clickjacking
  res.header('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.header('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.header('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy for API
  res.header('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none';");
  
  // Permissions Policy
  res.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  
  // Remove server signature
  res.removeHeader('X-Powered-By');
  
  next();
};

// Rate limiting configuration per endpoint
export const rateLimitConfig = {
  // General API rate limiting
  general: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests per window
    message: {
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: 15 * 60 // 15 minutes in seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // Audio upload rate limiting (more restrictive)
  audioUpload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: parseInt(process.env.AUDIO_UPLOAD_LIMIT || '5'), // 5 uploads per hour
    message: {
      error: 'Upload rate limit exceeded',
      message: 'Too many audio uploads. Please wait before uploading again.',
      retryAfter: 60 * 60 // 1 hour in seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // Chat messages rate limiting
  chatMessages: {
    windowMs: 60 * 1000, // 1 minute
    max: parseInt(process.env.CHAT_MESSAGE_LIMIT || '30'), // 30 messages per minute
    message: {
      error: 'Chat rate limit exceeded',
      message: 'Too many messages. Please slow down.',
      retryAfter: 60 // 1 minute in seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // Authentication attempts
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    message: {
      error: 'Authentication rate limit exceeded',
      message: 'Too many authentication attempts. Please try again later.',
      retryAfter: 15 * 60 // 15 minutes in seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
  }
};

// IP whitelist for admin endpoints
export const adminIPWhitelist = [
  '127.0.0.1',
  '::1',
  ...(process.env.ADMIN_IP_WHITELIST?.split(',') || [])
];

// Check if IP is whitelisted for admin access
export const isAdminIPWhitelisted = (ip: string): boolean => {
  return adminIPWhitelist.includes(ip) || process.env.NODE_ENV === 'development';
};

// Trust proxy configuration for accurate IP detection
export const trustProxyConfig = (req: Request): boolean => {
  // Trust Render.com proxy
  if (req.headers['x-forwarded-for'] && req.headers['x-render-origin-name']) {
    return true;
  }
  
  // Trust Fly.io proxy
  if (req.headers['fly-forwarded-proto']) {
    return true;
  }
  
  // Trust Vercel proxy for development
  if (req.headers['x-vercel-forwarded-for']) {
    return true;
  }
  
  // Trust localhost in development
  if (process.env.NODE_ENV === 'development') {
    return req.ip === '127.0.0.1' || req.ip === '::1';
  }
  
  return false;
};
