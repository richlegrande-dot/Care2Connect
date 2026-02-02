import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { validateSession } from '../services/adminSession';

/**
 * Middleware to verify system admin token
 */
export function systemAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authorization required' });
  }

  try {
    // First try JWT verify if secret present
    const secret = process.env.ADMIN_SESSION_SECRET || process.env.JWT_SECRET;
    if (secret) {
      const decoded = jwt.verify(token, secret) as { type: string; exp: number };
      if (decoded.type !== 'system-admin') return res.status(403).json({ error: 'Invalid token type' });
      return next();
    }

    // Fallback: validate opaque session token
    const ok = validateSession(token);
    if (!ok) return res.status(403).json({ error: 'Forbidden' });
    return next();
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden' });
  }
}
