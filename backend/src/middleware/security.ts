import { Request, Response, NextFunction } from "express";

export interface SecurityHeaders {
  "X-Content-Type-Options": string;
  "X-Frame-Options": string;
  "X-XSS-Protection": string;
  "Strict-Transport-Security": string;
  "Referrer-Policy": string;
  "Permissions-Policy": string;
}

/**
 * Add security headers to all responses
 */
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Enforce HTTPS (in production)
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }

  // Control referrer information
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Restrict dangerous browser features
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()",
  );

  next();
};

/**
 * Sanitize request data to prevent injection attacks
 */
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const sanitizeString = (str: string): string => {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+=/gi, "") // Remove event handlers
      .trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === "string") {
      return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    if (obj && typeof obj === "object") {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * Privacy-aware logging middleware
 */
export const privacyLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const sensitiveFields = ["password", "email", "phone", "ssn", "address"];

  const sanitizeForLogging = (obj: any): any => {
    if (!obj || typeof obj !== "object") return obj;

    const sanitized = { ...obj };

    Object.keys(sanitized).forEach((key) => {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof sanitized[key] === "object") {
        sanitized[key] = sanitizeForLogging(sanitized[key]);
      }
    });

    return sanitized;
  };

  // Override console.log for this request to sanitize data
  const originalLog = console.log;
  const originalError = console.error;

  console.log = (...args) => {
    const sanitizedArgs = args.map((arg) => sanitizeForLogging(arg));
    originalLog.apply(console, sanitizedArgs);
  };

  console.error = (...args) => {
    const sanitizedArgs = args.map((arg) => sanitizeForLogging(arg));
    originalError.apply(console, sanitizedArgs);
  };

  // Restore original logging after request
  res.on("finish", () => {
    console.log = originalLog;
    console.error = originalError;
  });

  next();
};

/**
 * Data retention middleware - flags old data for cleanup
 */
export const dataRetentionCheck = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Add metadata for data retention tracking
    req.dataRetention = {
      timestamp: new Date(),
      userAgent: req.get("User-Agent") || "",
      ip: req.ip,
    };

    next();
  } catch (error) {
    console.error("Data retention check failed:", error);
    next(); // Continue even if this fails
  }
};

/**
 * Content Security Policy middleware
 */
export const contentSecurityPolicy = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: unsafe-inline/eval should be removed in production
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.openai.com https://api.indeed.com https://api.adzuna.com",
    "media-src 'self' blob:",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  res.setHeader("Content-Security-Policy", cspDirectives);
  next();
};

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      dataRetention?: {
        timestamp: Date;
        userAgent: string;
        ip: string;
      };
    }
  }
}
