/**
 * Request Correlation ID Middleware
 * Adds X-Request-Id to all requests for distributed tracing
 */

import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Middleware to add correlation ID to requests
 */
export function correlationIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Use existing X-Request-Id if provided, otherwise generate new one
  const requestId = (req.headers["x-request-id"] as string) || uuidv4();

  // Store in request object
  req.requestId = requestId;

  // Add to response headers
  res.setHeader("X-Request-Id", requestId);

  next();
}

/**
 * Get request ID from request object
 */
export function getRequestId(req: Request): string {
  return req.requestId || "unknown";
}
