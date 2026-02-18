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
import { PrismaClient } from '@prisma/client';

import { INTAKE_MODULES, getModuleSchema, validateModuleData } from '../forms/default-intake-form';
import { computeScores, type IntakeData } from '../scoring/computeScores';
import { buildExplanation } from '../explainability/buildExplanation';
import { generatePlan } from '../action_plans/generatePlan';
import { MODULE_ORDER, REQUIRED_MODULES, SCORING_ENGINE_VERSION, type ModuleId } from '../constants';
import { DEFAULT_POLICY_PACK } from '../policy/policyPack';
import { redactSensitiveModules, getPanicButtonConfig } from '../dvSafe';
import { v2IntakeAuthMiddleware } from '../middleware/v2Auth';

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
    const session = await prisma.v2IntakeSession.create({
      data: {
        userId: req.body?.userId ?? null,
        status: 'IN_PROGRESS',
        dvSafeMode: false,
        modules: {},
        completedModules: [],
        policyPackVersion: DEFAULT_POLICY_PACK.version,
      },
    });

    res.status(201).json({
      sessionId: session.id,
      status: session.status,
      nextModule: MODULE_ORDER[0],
      createdAt: session.createdAt.toISOString(),
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
        modules: updatedModules,
        completedModules: updatedCompleted,
        dvSafeMode,
      },
    });

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
 * Uses a Prisma transaction to atomically store the session completion,
 * score results, explainability card, and action plan.
 */
router.post('/session/:sessionId/complete', async (req: Request, res: Response) => {
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

    const completedModules = session.completedModules as string[];

    // Verify required modules
    const missingRequired = REQUIRED_MODULES.filter(
      m => !completedModules.includes(m)
    );
    if (missingRequired.length > 0) {
      return res.status(422).json({
        error: 'Missing required modules',
        missingModules: missingRequired,
      });
    }

    // Build IntakeData from session modules
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

    // Compute scores using policy pack
    const scoreResult = computeScores(intakeData);

    // Build explainability card
    const explainabilityCard = buildExplanation(scoreResult, session.dvSafeMode);

    // Generate action plan
    const actionPlan = generatePlan(intakeData);

    // P0-3: If DV-safe mode, redact sensitive data before storage
    const storedModules = session.dvSafeMode
      ? redactSensitiveModules(modules).redacted
      : modules;

    // Atomic update: store all results together
    const completedSession = await prisma.v2IntakeSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        modules: storedModules,
        scoreResult: scoreResult as unknown as Record<string, unknown>,
        explainabilityCard: explainabilityCard as unknown as Record<string, unknown>,
        actionPlan: actionPlan as unknown as Record<string, unknown>,
        totalScore: scoreResult.totalScore,
        stabilityLevel: scoreResult.stabilityLevel,
        priorityTier: scoreResult.priorityTier,
        policyPackVersion: scoreResult.policyPackVersion,
        sensitiveDataRedacted: session.dvSafeMode,
      },
    });

    res.json({
      sessionId,
      status: completedSession.status,
      completedAt: completedSession.completedAt?.toISOString(),
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
    console.error('[V2 Intake] Failed to complete session:', err);
    res.status(500).json({ error: 'Failed to complete intake session' });
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

export default router;
