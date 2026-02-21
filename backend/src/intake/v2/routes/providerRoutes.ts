/**
 * V2 Provider Dashboard Routes — Cookie-based auth for staff access
 *
 * Namespace: /api/v2/provider/*
 *
 * Endpoints:
 *   POST /auth       - Login with PROVIDER_DASHBOARD_TOKEN, sets c2c_provider_auth cookie
 *   GET  /sessions   - List completed intake sessions (paginated)
 *   GET  /session/:id - Get session detail (profile, topFactors, audit)
 *   POST /logout     - Clear auth cookie and end session
 *
 * Auth mechanism:
 *   - POST /auth with { token } body → validates against PROVIDER_DASHBOARD_TOKEN env var
 *   - On success, sets httpOnly cookie "c2c_provider_auth" containing a signed session value
 *   - All other endpoints require the c2c_provider_auth cookie to be present and valid
 *   - POST /logout clears the cookie (Max-Age=0)
 *
 * Privacy headers (Cache-Control: no-store, X-Robots-Tag: noindex, Referrer-Policy: no-referrer)
 * are set on all provider responses.
 *
 * @module intake/v2/routes/providerRoutes
 */

import { Router, Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { countSessionAuditEvents } from "../audit/auditWriter";

const router = Router();
const prisma = new PrismaClient();

// ── Constants ──────────────────────────────────────────────────

const COOKIE_NAME = "c2c_provider_auth";
const COOKIE_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

// In-memory session store (maps session tokens → expiry timestamps)
// For production scale, swap with Redis or DB-backed sessions.
const activeSessions = new Map<string, number>();

// ── Privacy Headers Middleware ──────────────────────────────────

function setPrivacyHeaders(_req: Request, res: Response, next: NextFunction) {
  res.set({
    "Cache-Control": "private, no-store, no-cache, must-revalidate",
    "X-Robots-Tag": "noindex, nofollow",
    "Referrer-Policy": "no-referrer",
  });
  next();
}

// Apply privacy headers to ALL provider routes
router.use(setPrivacyHeaders);

// ── Auth Middleware ─────────────────────────────────────────────

function requireProviderAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const expiry = activeSessions.get(token);
  if (!expiry || Date.now() > expiry) {
    // Session expired or unknown — clean up and reject
    activeSessions.delete(token);
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
    });
    return res.status(401).json({ error: "Session expired" });
  }

  next();
}

// ══════════════════════════════════════════════════════════════
// POST /auth — Provider login
// ══════════════════════════════════════════════════════════════

router.post("/auth", (req: Request, res: Response) => {
  const expectedToken = process.env.PROVIDER_DASHBOARD_TOKEN;

  if (!expectedToken) {
    console.warn(
      "[Provider] Login attempt but PROVIDER_DASHBOARD_TOKEN is not configured",
    );
    return res
      .status(503)
      .json({ error: "Provider dashboard is not configured" });
  }

  const { token } = req.body || {};

  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Token is required" });
  }

  // Constant-time comparison to prevent timing attacks
  const tokenBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expectedToken);

  if (
    tokenBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(tokenBuffer, expectedBuffer)
  ) {
    return res.status(401).json({ error: "Invalid token" });
  }

  // Generate session cookie value
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + COOKIE_MAX_AGE_MS;
  activeSessions.set(sessionToken, expiresAt);

  // Set httpOnly cookie
  res.cookie(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: COOKIE_MAX_AGE_MS,
    secure: process.env.NODE_ENV === "production",
  });

  console.log("[Provider] Login successful");
  res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════
// GET /sessions — List sessions (authenticated)
// ══════════════════════════════════════════════════════════════

router.get(
  "/sessions",
  requireProviderAuth,
  async (req: Request, res: Response) => {
    try {
      const status = (req.query.status as string) || undefined;
      const limitParam = parseInt(req.query.limit as string, 10);
      const limit = Number.isFinite(limitParam)
        ? Math.min(Math.max(limitParam, 1), 100)
        : 25;
      const offsetParam = parseInt(req.query.offset as string, 10);
      const offset = Number.isFinite(offsetParam)
        ? Math.max(offsetParam, 0)
        : 0;

      const where: Record<string, unknown> = {};
      if (status) {
        where.status = status;
      }
      // Exclude test sessions by default
      where.isTest = false;

      const [sessions, total] = await Promise.all([
        prisma.v2IntakeSession.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
          select: {
            id: true,
            status: true,
            createdAt: true,
            completedAt: true,
            totalScore: true,
            stabilityLevel: true,
            priorityTier: true,
            dvSafeMode: true,
            policyPackVersion: true,
            completedModules: true,
            // Explicitly exclude raw modules, scoreResult, etc.
          },
        }),
        prisma.v2IntakeSession.count({ where }),
      ]);

      res.json({
        sessions: sessions.map((s) => ({
          sessionId: s.id,
          status: s.status,
          createdAt: s.createdAt.toISOString(),
          completedAt: s.completedAt?.toISOString() ?? null,
          totalScore: s.totalScore,
          stabilityLevel: s.stabilityLevel,
          priorityTier: s.priorityTier,
          dvSafeMode: s.dvSafeMode,
          policyPackVersion: s.policyPackVersion,
          completedModules: s.completedModules,
        })),
        total,
        limit,
        offset,
      });
    } catch (err) {
      console.error("[Provider] Failed to list sessions:", err);
      res.status(500).json({ error: "Failed to list sessions" });
    }
  },
);

// ══════════════════════════════════════════════════════════════
// GET /session/:sessionId — Session detail (authenticated)
// ══════════════════════════════════════════════════════════════

router.get(
  "/session/:sessionId",
  requireProviderAuth,
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      const session = await prisma.v2IntakeSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Build profile summary (same shape as intakeV2 profile endpoint)
      const profile = {
        totalScore: session.totalScore,
        stabilityLevel: session.stabilityLevel,
        priorityTier: session.priorityTier,
        policyPackVersion: session.policyPackVersion,
      };

      // Extract topFactors from explainability card
      const explainCard = session.explainabilityCard as Record<
        string,
        unknown
      > | null;
      const topFactors = (explainCard?.topFactors as string[]) ?? [];

      // Audit summary
      const auditStats = await countSessionAuditEvents(sessionId);

      res.json({
        sessionId: session.id,
        status: session.status,
        createdAt: session.createdAt.toISOString(),
        completedAt: session.completedAt?.toISOString() ?? null,
        dvSafeMode: session.dvSafeMode,
        completedModules: session.completedModules,
        profile,
        topFactors,
        auditCount: auditStats.count ?? 0,
        auditEvents: auditStats,
        // Intentionally exclude: modules, scoreResult (raw data)
      });
    } catch (err) {
      console.error("[Provider] Failed to get session detail:", err);
      res.status(500).json({ error: "Failed to retrieve session" });
    }
  },
);

// ══════════════════════════════════════════════════════════════
// POST /logout — End provider session
// ══════════════════════════════════════════════════════════════

router.post("/logout", requireProviderAuth, (req: Request, res: Response) => {
  const token = req.cookies?.[COOKIE_NAME];

  // Remove from active sessions
  if (token) {
    activeSessions.delete(token);
  }

  // Clear cookie with Max-Age=0
  res.cookie(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });

  console.log("[Provider] Logout successful");
  res.json({ success: true });
});

// ── Periodic cleanup of expired sessions ───────────────────────

setInterval(
  () => {
    const now = Date.now();
    let cleaned = 0;
    for (const [token, expiry] of activeSessions.entries()) {
      if (now > expiry) {
        activeSessions.delete(token);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      console.log(`[Provider] Cleaned ${cleaned} expired sessions`);
    }
  },
  60 * 60 * 1000,
); // Every hour

export default router;
