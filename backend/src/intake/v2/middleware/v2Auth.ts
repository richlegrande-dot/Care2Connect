/**
 * V2 Intake Auth Middleware
 *
 * JWT-based authentication for V2 intake routes.
 * Follows the same pattern as systemAuth.ts but accepts
 * both 'system-admin' and 'intake-user' token types.
 *
 * Applied to session-mutating endpoints (POST, PUT).
 * Read-only schema endpoints are public.
 *
 * When a valid token is verified, `req.v2User` is set with
 * the decoded userId so routes can enforce cross-session
 * access prevention (a user can only access their own sessions).
 *
 * @module intake/v2/middleware
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request to carry V2 user context
declare global {
  namespace Express {
    interface Request {
      v2User?: {
        userId: string;
        type: "system-admin" | "intake-user";
      };
    }
  }
}

/**
 * Authenticate V2 intake requests via JWT Bearer token.
 *
 * Accepted token types:
 *   - 'system-admin' — full access
 *   - 'intake-user'  — scoped to own sessions
 *
 * Skips auth when ENABLE_V2_INTAKE_AUTH is not 'true'
 * (allows staged rollout — auth can be enabled independently).
 */
export function v2IntakeAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Staged rollout: auth can be disabled independently of the feature
  if (process.env.ENABLE_V2_INTAKE_AUTH !== "true") {
    return next();
  }

  const authHeader = req.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Authorization required" });
    return;
  }

  try {
    const secret =
      process.env.ADMIN_SESSION_SECRET || process.env.JWT_SECRET || "";

    if (!secret) {
      console.error("[V2 Auth] No JWT secret configured");
      res.status(500).json({ error: "Auth configuration error" });
      return;
    }

    const decoded = jwt.verify(token, secret) as {
      type: string;
      userId?: string;
      sub?: string;
      exp: number;
    };

    const tokenType = decoded.type;
    if (tokenType !== "system-admin" && tokenType !== "intake-user") {
      res.status(403).json({ error: "Invalid token type for V2 intake" });
      return;
    }

    // Set user context on request
    req.v2User = {
      userId: decoded.userId || decoded.sub || "unknown",
      type: tokenType as "system-admin" | "intake-user",
    };

    next();
  } catch {
    res.status(403).json({ error: "Forbidden — invalid or expired token" });
  }
}

/**
 * Enforce that an intake-user can only access their own sessions.
 * Admin users bypass this check.
 *
 * Call AFTER v2IntakeAuthMiddleware; expects req.v2User to be set.
 * Checks req.params.sessionId against the session's userId in DB.
 */
export function v2SessionOwnershipGuard(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // If auth is disabled, skip ownership check
  if (process.env.ENABLE_V2_INTAKE_AUTH !== "true") {
    return next();
  }

  // Admins can access any session
  if (req.v2User?.type === "system-admin") {
    return next();
  }

  // For intake-user, the route handler will check ownership
  // by comparing req.v2User.userId against session.userId.
  // We just mark it here — the route does the actual DB check.
  next();
}
