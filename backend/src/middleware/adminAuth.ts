/**
 * Admin Authentication Middleware
 * Reuses the same password mechanism as the health page
 * 
 * Security: Password stored in environment variable ADMIN_PASSWORD
 */

import { Request, Response, NextFunction } from 'express';

export interface AdminAuthRequest extends Request {
  adminUser?: string;
}

/**
 * Middleware to require admin authentication
 * Checks for admin token in cookies, headers, or query params
 */
export function requireAdminAuth(
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction
) {
  // Check for admin token in multiple locations:
  // 1. Cookie: admin_session (if cookie-parser is loaded)
  // 2. Header: x-admin-password or Authorization: Bearer <token>
  // 3. Query param: token (for development only, avoid in production)

  const cookieToken = (req as any).cookies?.admin_session;
  const headerPassword = req.headers['x-admin-password'] as string | undefined;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : undefined;
  const queryToken = req.query.token as string | undefined;

  const providedToken =
    cookieToken || headerPassword || bearerToken || queryToken;

  // Get valid token from environment (same as health page)
  const validToken = process.env.ADMIN_PASSWORD || 'changeme';

  if (providedToken === validToken) {
    req.adminUser = 'admin';
    next();
  } else {
    res.status(401).json({
      error: 'Authorization required',
      message: 'Admin password required to access this endpoint',
      code: 'ADMIN_AUTH_REQUIRED',
    });
  }
}

/**
 * Optional middleware to verify admin auth without blocking
 * Sets req.adminUser if authenticated, but continues either way
 */
export function optionalAdminAuth(
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction
) {
  const cookieToken = (req as any).cookies?.admin_session;
  const headerPassword = req.headers['x-admin-password'] as string | undefined;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : undefined;
  const queryToken = req.query.token as string | undefined;

  const providedToken =
    cookieToken || headerPassword || bearerToken || queryToken;

  const validToken = process.env.ADMIN_PASSWORD || 'changeme';

  if (providedToken === validToken) {
    req.adminUser = 'admin';
  }

  next();
}
