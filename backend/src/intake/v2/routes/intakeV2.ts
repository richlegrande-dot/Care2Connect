/**
 * V2 Intake API Routes — Prisma-backed
 *
 * All routes are gated behind ENABLE_V2_INTAKE=true.
 * Namespace: /api/v2/intake/*
 *
 * Endpoints:
 *   GET  /schema                - Get wizard module schemas
 *   GET  /schema/:moduleId      - Get a single module schema
 *   POST /session               - Start a new intake session
 *   PUT  /session/:sessionId    - Save module data to a session
 *   POST /session/:sessionId/complete - Complete intake & compute scores
 *   GET  /session/:sessionId    - Get session status + results
 *
 * P0-1: Sessions are persisted in PostgreSQL via Prisma.
 *        The complete endpoint uses a transaction to ensure atomicity.
 *
 * @module intake/v2/routes
 */

import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

import { INTAKE_MODULES, getModuleSchema, validateModuleData } from '../forms/default-intake-form';
import { computeScores, type IntakeData } from '../scoring/computeScores';
import { buildExplanation } from '../explainability/buildExplanation';
import { generatePlan } from '../action_plans/generatePlan';
import { MODULE_ORDER, REQUIRED_MODULES, SCORING_ENGINE_VERSION, type ModuleId } from '../constants';
import { DEFAULT_POLICY_PACK } from '../policy/policyPack';
import { redactSensitiveModules, getPanicButtonConfig } from '../dvSafe';
import { v2IntakeAuthMiddleware } from '../middleware/v2Auth';
import { buildHMISExport, hmisToCSV, type SessionData } from '../exports/hmisExport';
import { analyzeFairness, runFullFairnessAnalysis, type CompletedSessionSummary } from '../audit/fairnessMonitor';
import { generateCalibrationReport } from '../calibration/generateCalibrationReport';
import type { CalibrationSession } from '../calibration/calibrationTypes';
import {
  writeAuditEvent,
  generateRequestId,
  getSessionAuditEvents,
  countSessionAuditEvents,
  type V2AuditEventType,
} from '../audit/auditWriter';
import {
  getRank,
  computeAndStoreSnapshot,
  invalidateCache as invalidateRankCache,
} from '../rank/rankService';

const router = Router();
const prisma = new PrismaClient();

// ── Feature Flag Guard ─────────────────────────────────────────

router.use((_req: Request, res: Response, next) => {
  if (process.env.ENABLE_V2_INTAKE !== 'true') {
    return res.status(404).json({ error: 'V2 Intake is not enabled' });
  }
  next();
});

// ── Auth — applied to session endpoints (POST/PUT) ────────────
// Schema and panic-button endpoints are public.
// Auth is gated by ENABLE_V2_INTAKE_AUTH env var for staged rollout.
router.post('/session*', v2IntakeAuthMiddleware);
router.put('/session*', v2IntakeAuthMiddleware);
router.get('/session/:sessionId', v2IntakeAuthMiddleware);

// ── RequestId Middleware — applied to all V2 intake routes ─────
// Reads X-Request-Id from request header or generates a new UUID.
// Attached to req.requestId and echoed in response X-Request-Id header.
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

router.use((req: Request, res: Response, next) => {
  const incoming = req.headers['x-request-id'];
  const requestId = (typeof incoming === 'string' && incoming.length > 0)
    ? incoming
    : generateRequestId();
  (req as any).requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
});

// ── Routes ─────────────────────────────────────────────────────

/**
 * GET /panic-button — Get panic button configuration for DV-safe mode
 */
router.get('/panic-button', (_req: Request, res: Response) => {
  res.json(getPanicButtonConfig());
});

/**
 * GET /health — V2 Intake health check
 *
 * Returns subsystem readiness: feature flag, DB connectivity,
 * policy pack version, and engine version.
 */
router.get('/health', async (_req: Request, res: Response) => {
  let dbHealthy = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbHealthy = true;
  } catch {
    dbHealthy = false;
  }

  const healthy = dbHealthy; // Add more checks as needed

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'degraded',
    featureFlag: process.env.ENABLE_V2_INTAKE === 'true',
    authEnabled: process.env.ENABLE_V2_INTAKE_AUTH === 'true',
    database: dbHealthy ? 'connected' : 'unreachable',
    policyPackVersion: DEFAULT_POLICY_PACK.version,
    scoringEngineVersion: SCORING_ENGINE_VERSION,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /schema — Return all module schemas in wizard order
 */
router.get('/schema', (_req: Request, res: Response) => {
  res.json({
    modules: INTAKE_MODULES,
    requiredModules: REQUIRED_MODULES,
    moduleOrder: MODULE_ORDER,
  });
});

/**
 * GET /schema/:moduleId — Return a single module schema
 */
router.get('/schema/:moduleId', (req: Request, res: Response) => {
  try {
    const schema = getModuleSchema(req.params.moduleId as ModuleId);
    res.json({ moduleId: req.params.moduleId, schema });
  } catch {
    res.status(404).json({ error: `Unknown module: ${req.params.moduleId}` });
  }
});

/**
 * POST /session — Start a new intake session
 */
router.post('/session', async (req: Request, res: Response) => {
  try {
    // Check for test-run header with environment security
    const testHeaderPresent = req.headers['x-c2c-test'] === '1' || req.headers['x-c2c-test-run'] === '1';
    const allowTestSessions = process.env.ALLOW_TEST_SESSIONS === 'true';
    const isTest = testHeaderPresent && allowTestSessions;
    
    // Log test session rejection for security monitoring
    if (testHeaderPresent && !allowTestSessions) {
      console.warn('[V2 Intake] Test session header present but ALLOW_TEST_SESSIONS=false, creating regular session');
    }

    const session = await prisma.v2IntakeSession.create({
      data: {
        userId: req.body?.userId ?? null,
        status: 'IN_PROGRESS',
        dvSafeMode: false,
        modules: {},
        completedModules: [],
        policyPackVersion: DEFAULT_POLICY_PACK.version,
        isTest,
      },
    });

    // Audit: session started
    await writeAuditEvent(session.id, 'INTAKE_STARTED', {
      policyPackVersion: DEFAULT_POLICY_PACK.version,
      requestId: (req as any).requestId,
    }, (req as any).requestId);

    res.status(201).json({
      sessionId: session.id,
      status: session.status,
      nextModule: MODULE_ORDER[0],
      createdAt: session.createdAt.toISOString(),
      isTest: session.isTest,
    });
  } catch (err) {
    console.error('[V2 Intake] Failed to create session:', err);
    res.status(500).json({ error: 'Failed to create intake session' });
  }
});

/**
 * PUT /session/:sessionId — Save module data
 * Body: { moduleId: string, data: Record<string, unknown> }
 */
router.put('/session/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = await prisma.v2IntakeSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    if (session.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Session already completed' });
    }

    const { moduleId, data } = req.body as {
      moduleId: ModuleId;
      data: Record<string, unknown>;
    };

    if (!moduleId || !MODULE_ORDER.includes(moduleId)) {
      return res.status(400).json({ error: `Invalid module: ${moduleId}` });
    }

    // Validate module data
    const validation = validateModuleData(moduleId, data ?? {});
    if (!validation.valid) {
      return res.status(422).json({ error: 'Validation failed', details: validation.errors });
    }

    // Update module data
    const currentModules = (session.modules as Record<string, unknown>) ?? {};
    const updatedModules = { ...currentModules, [moduleId]: data };

    const currentCompleted = session.completedModules as string[];
    const updatedCompleted = currentCompleted.includes(moduleId)
      ? currentCompleted
      : [...currentCompleted, moduleId];

    // Check for DV-safe mode activation
    let dvSafeMode = session.dvSafeMode;
    if (moduleId === 'consent' && data?.consent_dv_safe_mode === true) {
      dvSafeMode = true;
    }
    if (moduleId === 'safety' && (data?.fleeing_dv === true || data?.fleeing_trafficking === true)) {
      dvSafeMode = true;
    }

    const updated = await prisma.v2IntakeSession.update({
      where: { id: sessionId },
      data: {
        modules: updatedModules as unknown as Prisma.InputJsonValue,
        completedModules: updatedCompleted,
        dvSafeMode,
      },
    });

    // Audit: module saved (no raw data — only safe metadata)
    await writeAuditEvent(sessionId, 'MODULE_SAVED', {
      moduleId,
      isRequired: REQUIRED_MODULES.includes(moduleId as any),
      isComplete: true,
      completedModuleCount: updatedCompleted.length,
      totalModuleCount: MODULE_ORDER.length,
      requestId: (req as any).requestId,
    }, (req as any).requestId);

    // Determine next module
    const currentIndex = MODULE_ORDER.indexOf(moduleId);
    const nextModule =
      currentIndex < MODULE_ORDER.length - 1
        ? MODULE_ORDER[currentIndex + 1]
        : null;

    res.json({
      sessionId,
      status: updated.status,
      completedModules: updated.completedModules,
      nextModule,
      dvSafeMode: updated.dvSafeMode,
    });
  } catch (err) {
    console.error('[V2 Intake] Failed to save module:', err);
    res.status(500).json({ error: 'Failed to save module data' });
  }
});

/**
 * POST /session/:sessionId/complete — Finalize intake, compute scores
 *
 * Hardened for:
 *   - Idempotency: re-completing returns stored results + audit event
 *   - Atomicity: all results + audit committed together
 *   - Durable logging: correlationId links all audit events for one request
 *   - Stable error contract: machine-friendly error codes
 */
router.post('/session/:sessionId/complete', async (req: Request, res: Response) => {
  const requestId = (req as any).requestId as string;
  const startTime = Date.now();

  try {
    const { sessionId } = req.params;
    const session = await prisma.v2IntakeSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({
        error: 'SESSION_NOT_FOUND',
        code: 'E_SESSION_NOT_FOUND',
        requestId,
      });
    }

    // ── Idempotency: already completed → return stored results ──
    if (session.status === 'COMPLETED') {
      await writeAuditEvent(sessionId, 'SESSION_COMPLETE_IDEMPOTENT_HIT', {
        requestId,
        correlationId: requestId,
      });

      return res.json({
        sessionId,
        status: 'COMPLETED',
        idempotent: true,
        requestId,
        completedAt: session.completedAt?.toISOString(),
        score: session.totalScore !== null
          ? {
              totalScore: session.totalScore,
              stabilityLevel: session.stabilityLevel,
              priorityTier: session.priorityTier,
              dimensions: (() => {
                const sr = session.scoreResult as Record<string, any> | null;
                const dims = sr?.dimensions ?? {};
                return {
                  housing_stability: dims.housing_stability?.score ?? 0,
                  safety_crisis: dims.safety_crisis?.score ?? 0,
                  vulnerability_health: dims.vulnerability_health?.score ?? 0,
                  chronicity_system: dims.chronicity_system?.score ?? 0,
                };
              })(),
            }
          : null,
        explainability: session.explainabilityCard,
        actionPlan: session.actionPlan,
      });
    }

    // ── Stage 1: INTAKE_SUBMITTED ──
    await writeAuditEvent(sessionId, 'INTAKE_SUBMITTED', {
      requestId,
      correlationId: requestId,
      completedModuleCount: (session.completedModules as string[]).length,
      totalModuleCount: MODULE_ORDER.length,
      dvSafeMode: session.dvSafeMode,
    });

    const completedModules = session.completedModules as string[];

    // ── Stage 2: Validate required modules ──
    const missingRequired = REQUIRED_MODULES.filter(
      m => !completedModules.includes(m)
    );
    if (missingRequired.length > 0) {
      await writeAuditEvent(sessionId, 'SESSION_COMPLETE_FAILED', {
        requestId,
        correlationId: requestId,
        errorCode: 'E_VALIDATE_REQUIRED_MODULES',
        errorMessage: 'Validation failed',
      });

      return res.status(422).json({
        error: 'COMPLETE_FAILED',
        code: 'E_VALIDATE_REQUIRED_MODULES',
        requestId,
        missingModules: missingRequired,
      });
    }

    // ── Stage 3: Build IntakeData ──
    const modules = session.modules as Record<string, Record<string, unknown>>;
    const intakeData: IntakeData = {
      consent: modules.consent,
      demographics: modules.demographics,
      housing: modules.housing,
      safety: modules.safety,
      health: modules.health,
      history: modules.history,
      income: modules.income,
      goals: modules.goals,
    };

    // ── Stage 4: Compute scores (no logic changes) ──
    const scoreStartTime = Date.now();
    const scoreResult = computeScores(intakeData);
    const scoreDurationMs = Date.now() - scoreStartTime;

    // ── Stage 5: Build explainability card ──
    const explainabilityCard = buildExplanation(scoreResult, session.dvSafeMode);

    // ── Stage 6: Generate action plan ──
    const actionPlan = generatePlan(intakeData);

    // ── Stage 7: DV-safe redaction ──
    const storedModules = session.dvSafeMode
      ? redactSensitiveModules(modules).redacted
      : modules;

    // ── Stage 8: Atomic persist (session + audit events in transaction) ──
    const completedAt = new Date();

    await prisma.$transaction([
      prisma.v2IntakeSession.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          completedAt,
          modules: storedModules as unknown as Prisma.InputJsonValue,
          scoreResult: scoreResult as unknown as Prisma.InputJsonValue,
          explainabilityCard: explainabilityCard as unknown as Prisma.InputJsonValue,
          actionPlan: actionPlan as unknown as Prisma.InputJsonValue,
          totalScore: scoreResult.totalScore,
          stabilityLevel: scoreResult.stabilityLevel,
          priorityTier: scoreResult.priorityTier,
          policyPackVersion: scoreResult.policyPackVersion,
          sensitiveDataRedacted: session.dvSafeMode,
        },
      }),
      prisma.v2IntakeAuditEvent.create({
        data: {
          sessionId,
          eventType: 'SCORE_COMPUTED',
          requestId,
          meta: {
            totalScore: scoreResult.totalScore,
            stabilityLevel: scoreResult.stabilityLevel,
            priorityTier: scoreResult.priorityTier,
            policyPackVersion: scoreResult.policyPackVersion,
            scoringEngineVersion: SCORING_ENGINE_VERSION,
            inputHashPrefix: scoreResult.inputHash?.slice(0, 8) ?? null,
            housing_stability: scoreResult.dimensions.housing_stability.score,
            safety_crisis: scoreResult.dimensions.safety_crisis.score,
            vulnerability_health: scoreResult.dimensions.vulnerability_health.score,
            chronicity_system: scoreResult.dimensions.chronicity_system.score,
            durationMs: scoreDurationMs,
            correlationId: requestId,
          },
        },
      }),
      prisma.v2IntakeAuditEvent.create({
        data: {
          sessionId,
          eventType: 'PLAN_GENERATED',
          requestId,
          meta: {
            immediateTaskCount: actionPlan.immediateTasks.length,
            shortTermTaskCount: actionPlan.shortTermTasks.length,
            mediumTermTaskCount: actionPlan.mediumTermTasks.length,
            totalTaskCount:
              actionPlan.immediateTasks.length +
              actionPlan.shortTermTasks.length +
              actionPlan.mediumTermTasks.length,
            correlationId: requestId,
          },
        },
      }),
      prisma.v2IntakeAuditEvent.create({
        data: {
          sessionId,
          eventType: 'SESSION_COMPLETED',
          requestId,
          meta: {
            totalScore: scoreResult.totalScore,
            stabilityLevel: scoreResult.stabilityLevel,
            priorityTier: scoreResult.priorityTier,
            durationMs: Date.now() - startTime,
            sensitiveDataRedacted: session.dvSafeMode,
            correlationId: requestId,
          },
        },
      }),
    ]);

    // ── Stage 9: Best-effort rank snapshot (non-blocking) ──
    // Compute and store rank immediately after completion.
    // Errors here MUST NOT block the completion response.
    try {
      await computeAndStoreSnapshot(sessionId, {
        id: sessionId,
        stabilityLevel: scoreResult.stabilityLevel,
        totalScore: scoreResult.totalScore,
        completedAt,
        isTest: session.isTest,
      });
    } catch (rankErr) {
      console.error('[V2 Intake] Best-effort rank snapshot failed:', rankErr);
      try {
        await writeAuditEvent(sessionId, 'RANK_COMPUTE_FAILED', {
          requestId,
          correlationId: requestId,
        });
      } catch { /* swallow */ }
    }

    res.json({
      sessionId,
      status: 'COMPLETED',
      requestId,
      completedAt: completedAt.toISOString(),
      score: {
        totalScore: scoreResult.totalScore,
        stabilityLevel: scoreResult.stabilityLevel,
        priorityTier: scoreResult.priorityTier,
        dimensions: {
          housing_stability: scoreResult.dimensions.housing_stability.score,
          safety_crisis: scoreResult.dimensions.safety_crisis.score,
          vulnerability_health: scoreResult.dimensions.vulnerability_health.score,
          chronicity_system: scoreResult.dimensions.chronicity_system.score,
        },
      },
      explainability: explainabilityCard,
      actionPlan: {
        immediateTasks: actionPlan.immediateTasks.length,
        shortTermTasks: actionPlan.shortTermTasks.length,
        mediumTermTasks: actionPlan.mediumTermTasks.length,
        tasks: actionPlan,
      },
    });
  } catch (err) {
    const { sessionId } = req.params;
    console.error('[V2 Intake] Failed to complete session:', err);

    // Best-effort audit of the failure (sanitized — no raw error strings)
    try {
      const isValidation = err instanceof Error &&
        (err.message.includes('Validation') || err.message.includes('Missing'));
      await writeAuditEvent(sessionId, 'SESSION_COMPLETE_FAILED', {
        requestId,
        correlationId: requestId,
        errorCode: 'E_INTERNAL',
        errorMessage: isValidation ? 'Validation failed' : 'Internal error',
        durationMs: Date.now() - startTime,
      });
    } catch { /* swallow — audit must not mask the real error */ }

    res.status(500).json({
      error: 'COMPLETE_FAILED',
      code: 'E_INTERNAL',
      requestId,
    });
  }
});

// ── Review-Entered Event ───────────────────────────────────────

/**
 * POST /session/:sessionId/review-entered — Log REVIEW_ENTERED audit event
 *
 * Called by the frontend (best-effort) when the user reaches the review screen.
 * Body: (empty or ignored — no PII accepted)
 */
router.post('/session/:sessionId/review-entered', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const requestId = (req as any).requestId as string;

    const session = await prisma.v2IntakeSession.findUnique({
      where: { id: sessionId },
      select: { id: true, status: true, completedModules: true },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found', requestId });
    }

    if (session.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Session already completed', requestId });
    }

    const completedModules = session.completedModules as string[];

    await writeAuditEvent(sessionId, 'REVIEW_ENTERED', {
      stage: 'review',
      completedModuleCount: completedModules.length,
      totalModuleCount: MODULE_ORDER.length,
      requestId,
    }, requestId);

    res.json({ ok: true, requestId });
  } catch (err) {
    console.error('[V2 Intake] Failed to log review-entered:', err);
    res.status(500).json({ error: 'Failed to log review event' });
  }
});

/**
 * GET /session/:sessionId — Get session status and results
 */
router.get('/session/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = await prisma.v2IntakeSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const response: Record<string, unknown> = {
      sessionId: session.id,
      status: session.status,
      completedModules: session.completedModules,
      dvSafeMode: session.dvSafeMode,
      createdAt: session.createdAt.toISOString(),
    };

    if (session.status === 'COMPLETED') {
      response.completedAt = session.completedAt?.toISOString();
      response.score = session.totalScore !== null
        ? {
            totalScore: session.totalScore,
            stabilityLevel: session.stabilityLevel,
            priorityTier: session.priorityTier,
          }
        : null;
      response.explainability = session.explainabilityCard;
      response.actionPlan = session.actionPlan;
    }

    res.json(response);
  } catch (err) {
    console.error('[V2 Intake] Failed to get session:', err);
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

// ── Session Profile + Rank ─────────────────────────────────────

/**
 * GET /session/:sessionId/profile — Return session profile with rank
 *
 * Ranking: among COMPLETED sessions, sorted by:
 *   1. stabilityLevel ASC (0 = most urgent)
 *   2. totalScore DESC
 *   3. completedAt ASC (older first)
 *   4. id ASC (final tie-break)
 * Rank is 1-based index.
 */
router.get('/session/:sessionId/profile', v2IntakeAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = await prisma.v2IntakeSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Audit stats
    const auditStats = await countSessionAuditEvents(sessionId);

    // Base profile fields
    const profile: Record<string, unknown> = {
      sessionId: session.id,
      status: session.status,
      createdAt: session.createdAt.toISOString(),
    };

    if (session.status !== 'COMPLETED') {
      // Add privacy headers for profile responses
      res.set({
        'Cache-Control': 'private, no-store, no-cache, must-revalidate',
        'X-Robots-Tag': 'noindex, nofollow',
      });
      
      // Return partial profile — no rank for incomplete sessions
      return res.json({
        ...profile,
        completedAt: null,
        profile: {
          totalScore: null,
          stabilityLevel: null,
          priorityTier: null,
          policyPackVersion: session.policyPackVersion,
        },
        topFactors: [],
        rank: null,
        audit: auditStats,
      });
    }

    // Completed session — get explainability top factors
    const explainCard = session.explainabilityCard as Record<string, unknown> | null;
    const topFactors = (explainCard?.topFactors as string[]) ?? [];

    // Rank: snapshot-first with 15-min freshness, fallback to live compute
    // Uses partitioned level ranking: global + level-local
    // By default, exclude isTest sessions from rank. Override with ?includeTest=true.
    const includeTest = req.query.includeTest === 'true';
    const forceRefresh = req.query.forceRefresh === 'true';

    const rankResult = await getRank(session, { includeTest, forceRefresh });

    // Add privacy headers for profile responses
    res.set({
      'Cache-Control': 'private, no-store, no-cache, must-revalidate',
      'X-Robots-Tag': 'noindex, nofollow',
    });

    res.json({
      sessionId: session.id,
      status: session.status,
      completedAt: session.completedAt?.toISOString(),
      profile: {
        totalScore: session.totalScore,
        stabilityLevel: session.stabilityLevel,
        priorityTier: session.priorityTier,
        policyPackVersion: session.policyPackVersion,
      },
      topFactors,
      rank: {
        position: rankResult.global.position,
        of: rankResult.global.of,
        global: rankResult.global,
        level: rankResult.level,
        sortKey: rankResult.sortKey,
        excludesTestSessions: rankResult.excludesTestSessions,
        fromSnapshot: rankResult.fromSnapshot,
      },
      audit: auditStats,
      // Optional roadmap data — include stored actionPlan when requested
      ...(req.query.include === 'roadmap' && session.actionPlan ? {
        roadmap: {
          currentLevel: session.stabilityLevel,
          nextLevel: (session.stabilityLevel ?? 0) < 5 ? (session.stabilityLevel ?? 0) + 1 : null,
          actionPlan: session.actionPlan,
        },
      } : {}),
    });
  } catch (err) {
    console.error('[V2 Intake] Failed to get session profile:', err);
    res.status(500).json({ error: 'Failed to retrieve session profile' });
  }
});

// ── Session Audit Events ───────────────────────────────────────

/**
 * GET /session/:sessionId/audit — Return DB-backed audit events (newest-first)
 *
 * Query params:
 *   ?limit=N — max events to return (default 50, max 200)
 */
router.get('/session/:sessionId/audit', v2IntakeAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    // Verify session exists
    const session = await prisma.v2IntakeSession.findUnique({
      where: { id: sessionId },
      select: { id: true, status: true },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const limitParam = parseInt(req.query.limit as string, 10);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 50;

    const events = await getSessionAuditEvents(sessionId, limit);

    // Add privacy headers for audit responses
    res.set({
      'Cache-Control': 'private, no-store, no-cache, must-revalidate',
      'X-Robots-Tag': 'noindex, nofollow',
    });

    res.json({
      sessionId,
      status: session.status,
      eventCount: events.length,
      events: events.map(e => ({
        id: e.id,
        eventType: e.eventType,
        requestId: e.requestId,
        meta: e.meta,
        createdAt: e.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error('[V2 Intake] Failed to get audit events:', err);
    res.status(500).json({ error: 'Failed to retrieve audit events' });
  }
});

// ── HMIS / CE Export ───────────────────────────────────────────

/**
 * GET /export/hmis/:sessionId — Export a single session as HMIS CSV 2024
 */
router.get('/export/hmis/:sessionId', v2IntakeAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = await prisma.v2IntakeSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    if (session.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Session must be completed for export' });
    }

    const sessionData: SessionData = {
      id: session.id,
      modules: session.modules as Record<string, Record<string, unknown>>,
      dvSafeMode: session.dvSafeMode,
      totalScore: session.totalScore,
      priorityTier: session.priorityTier,
      createdAt: session.createdAt,
      completedAt: session.completedAt,
    };

    const format = req.query.format as string | undefined;

    if (format === 'csv') {
      const exportData = buildHMISExport([sessionData]);
      const csv = hmisToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="hmis-export-${sessionId}.csv"`);
      return res.send(csv);
    }

    // Default: JSON
    const exportData = buildHMISExport([sessionData]);
    res.json(exportData);
  } catch (err) {
    console.error('[V2 Intake] HMIS export failed:', err);
    res.status(500).json({ error: 'Failed to generate HMIS export' });
  }
});

/**
 * GET /export/hmis — Bulk export all completed sessions as HMIS CSV 2024
 * Query params: ?since=ISO_DATE&format=csv|json
 */
router.get('/export/hmis', v2IntakeAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const since = req.query.since as string | undefined;
    const where: Record<string, unknown> = { status: 'COMPLETED' };

    if (since) {
      where.completedAt = { gte: new Date(since) };
    }

    const sessions = await prisma.v2IntakeSession.findMany({
      where: where as any,
      orderBy: { completedAt: 'desc' },
      take: 1000,
    });

    const sessionData: SessionData[] = sessions.map(s => ({
      id: s.id,
      modules: s.modules as Record<string, Record<string, unknown>>,
      dvSafeMode: s.dvSafeMode,
      totalScore: s.totalScore,
      priorityTier: s.priorityTier,
      createdAt: s.createdAt,
      completedAt: s.completedAt,
    }));

    const format = req.query.format as string | undefined;

    if (format === 'csv') {
      const exportData = buildHMISExport(sessionData);
      const csv = hmisToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="hmis-export-bulk.csv"');
      return res.send(csv);
    }

    const exportData = buildHMISExport(sessionData);
    res.json(exportData);
  } catch (err) {
    console.error('[V2 Intake] Bulk HMIS export failed:', err);
    res.status(500).json({ error: 'Failed to generate bulk HMIS export' });
  }
});

// ── Fairness & Audit Monitoring ────────────────────────────────

/**
 * GET /audit/fairness — Run aggregate fairness analysis across completed sessions
 * Query params: ?dimension=race_ethnicity|gender|veteran_status&since=ISO_DATE
 */
router.get('/audit/fairness', v2IntakeAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const since = req.query.since as string | undefined;
    const includeTest = req.query.includeTest === 'true';
    
    // Exclude test sessions from fairness analysis by default
    const where: Record<string, unknown> = { 
      status: 'COMPLETED',
      ...(includeTest ? {} : { isTest: false })
    };

    if (since) {
      where.completedAt = { gte: new Date(since) };
    }

    const sessions = await prisma.v2IntakeSession.findMany({
      where: where as any,
      select: {
        modules: true,
        totalScore: true,
        priorityTier: true,
      },
    });

    const summaries: CompletedSessionSummary[] = sessions
      .filter(s => s.totalScore !== null && s.priorityTier !== null)
      .map(s => ({
        demographics: ((s.modules as Record<string, unknown>)?.demographics ?? {}) as Record<string, unknown>,
        totalScore: s.totalScore as number,
        priorityTier: s.priorityTier as string,
      }));

    const dimension = req.query.dimension as string | undefined;

    if (dimension && ['race_ethnicity', 'gender', 'veteran_status'].includes(dimension)) {
      const report = analyzeFairness(summaries, dimension as any);
      return res.json(report);
    }

    // Default: run all dimensions
    const reports = runFullFairnessAnalysis(summaries);
    res.json({
      totalSessions: summaries.length,
      reports,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[V2 Intake] Fairness analysis failed:', err);
    res.status(500).json({ error: 'Failed to run fairness analysis' });
  }
});

// ── Version Info ───────────────────────────────────────────────

/**
 * GET /version — Return system version information
 *
 * Returns policy pack version, scoring engine version, build commit,
 * and migration version for staging verification.
 */
router.get('/version', (_req: Request, res: Response) => {
  res.json({
    policyPackVersion: DEFAULT_POLICY_PACK.version,
    scoringEngineVersion: SCORING_ENGINE_VERSION,
    buildCommit: process.env.BUILD_COMMIT || 'unknown',
    migrationVersion: '20260218_v2_intake_tables',
    featureFlags: {
      v2IntakeEnabled: process.env.ENABLE_V2_INTAKE === 'true',
      v2IntakeAuthEnabled: process.env.ENABLE_V2_INTAKE_AUTH === 'true',
    },
    timestamp: new Date().toISOString(),
  });
});

// ── Calibration Report ─────────────────────────────────────────

/**
 * GET /calibration — Generate a calibration report for clinical review
 *
 * Query params:
 *   ?since=ISO_DATE  — only include sessions completed after this date
 *   ?format=csv      — return as CSV instead of JSON
 *
 * This endpoint produces read-only aggregate statistics for stakeholder
 * review sessions. It does NOT mutate any intake data.
 */
router.get('/calibration', v2IntakeAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const since = req.query.since as string | undefined;
    const format = req.query.format as string | undefined;
    const where: Record<string, unknown> = { status: 'COMPLETED' };

    if (since) {
      where.completedAt = { gte: new Date(since) };
    }

    const sessions = await prisma.v2IntakeSession.findMany({
      where: where as any,
      select: {
        totalScore: true,
        stabilityLevel: true,
        priorityTier: true,
        scoreResult: true,
      },
    });

    const calibrationSessions: CalibrationSession[] = sessions
      .filter(s => s.totalScore !== null && s.stabilityLevel !== null && s.priorityTier !== null)
      .map(s => {
        const sr = (s.scoreResult ?? {}) as Record<string, any>;
        const dims = sr.dimensions ?? sr.dimensionScores ?? {};
        return {
          totalScore: s.totalScore as number,
          stabilityLevel: s.stabilityLevel as number,
          priorityTier: s.priorityTier as string,
          dimensionScores: {
            housing: dims.housing_stability?.score ?? dims.housing ?? 0,
            safety: dims.safety_crisis?.score ?? dims.safety ?? 0,
            vulnerability: dims.vulnerability?.score ?? dims.vulnerability ?? 0,
            chronicity: dims.chronicity?.score ?? dims.chronicity ?? 0,
          },
          overridesApplied: sr.overridesApplied ?? [],
          topContributors: sr.topContributors ?? [],
        };
      });

    const report = generateCalibrationReport(calibrationSessions);

    if (format === 'csv') {
      const lines: string[] = [];
      lines.push('Section,Metric,Value');
      lines.push(`Summary,Total Sessions,${report.totalSessions}`);
      lines.push(`Summary,Mean Total Score,${report.meanTotalScore.toFixed(2)}`);
      lines.push(`Summary,Median Total Score,${report.medianTotalScore.toFixed(2)}`);
      lines.push(`Summary,Generated At,${report.generatedAt}`);
      lines.push(`Summary,Policy Pack Version,${report.policyPackVersion}`);
      lines.push(`Summary,Engine Version,${report.scoringEngineVersion}`);
      for (const [level, count] of Object.entries(report.levelDistribution)) {
        lines.push(`Level Distribution,Level ${level},${count}`);
      }
      for (const [tier, count] of Object.entries(report.tierDistribution)) {
        lines.push(`Tier Distribution,${tier},${count}`);
      }
      for (const dim of report.dimensionAverages) {
        lines.push(`Dimension Averages,${dim.dimension} Mean,${dim.mean.toFixed(2)}`);
        lines.push(`Dimension Averages,${dim.dimension} Median,${dim.median.toFixed(2)}`);
        lines.push(`Dimension Averages,${dim.dimension} Min,${dim.min}`);
        lines.push(`Dimension Averages,${dim.dimension} Max,${dim.max}`);
      }
      for (const ovr of report.overrideFrequency) {
        lines.push(`Override Frequency,${ovr.override},${ovr.count}`);
      }
      for (const contrib of report.topContributorsByFrequency) {
        lines.push(`Top Contributors,${contrib.contributor},${contrib.count}`);
      }
      for (const row of report.tierVsLevelMatrix) {
        lines.push(`Tier vs Level Matrix,${row.tier} / Level ${row.level},${row.count}`);
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="calibration-report.csv"');
      return res.send(lines.join('\n'));
    }

    res.json(report);
  } catch (err) {
    console.error('[V2 Intake] Calibration report failed:', err);
    res.status(500).json({ error: 'Failed to generate calibration report' });
  }
});

export default router;
