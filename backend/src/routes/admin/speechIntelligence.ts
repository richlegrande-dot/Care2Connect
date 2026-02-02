/**
 * Speech Intelligence Admin Routes
 * Endpoints for troubleshooting and improvement
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { RuntimeTuning } from '../../services/speechIntelligence/runtimeTuning';
import { SessionManager } from '../../services/speechIntelligence/sessionManager';
import { getSpeechIntelligenceScheduler } from '../../services/speechIntelligence/scheduler';
import { systemAuthMiddleware } from '../../middleware/systemAuth';
import { TranscriptionSource, TranscriptionEngine, TranscriptionStatus, TranscriptionStage } from '@prisma/client';

const router = Router();
const runtimeTuning = new RuntimeTuning();
const sessionManager = new SessionManager();

// Apply auth middleware to all routes unless explicitly bypassed
const ALLOW_INSECURE = process.env.ALLOW_INSECURE_ADMIN_ENDPOINTS === 'true';
if (ALLOW_INSECURE) {
  console.warn('⚠️  WARNING: Speech Intelligence admin endpoints are UNSECURED (ALLOW_INSECURE_ADMIN_ENDPOINTS=true)');
  console.warn('⚠️  This should NEVER be enabled in production!');
}

// Apply auth conditionally
const authMiddleware = ALLOW_INSECURE ? [] : [systemAuthMiddleware];

/**
 * POST /admin/speech-intelligence/smoke-test/run
 * Manually trigger smoke tests
 */
router.post('/smoke-test/run', ...authMiddleware, async (req: Request, res: Response) => {
  try {
    const scheduler = getSpeechIntelligenceScheduler();
    
    if (!scheduler) {
      return res.status(503).json({
        error: 'Speech Intelligence scheduler not running',
        hint: 'Check SPEECH_TELEMETRY_ENABLED environment variable'
      });
    }

    const result = await scheduler.runSmokeTestsNow();
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /admin/speech-intelligence/sessions
 * List recent transcription sessions
 */
router.get('/sessions', ...authMiddleware, async (req: Request, res: Response) => {
  try {
    const { 
      engine, 
      language, 
      status, 
      source,
      limit = '50',
      offset = '0'
    } = req.query;

    const where: any = {};

    if (engine) where.engine = engine;
    if (language) where.detectedLanguage = language;
    if (status) where.status = status;
    if (source) where.source = source;

    const [sessions, total] = await Promise.all([
      prisma.transcriptionSession.findMany({
        where,
        select: {
          id: true,
          createdAt: true,
          source: true,
          engine: true,
          status: true,
          detectedLanguage: true,
          durationMs: true,
          transcriptPreview: true,
          consentToStoreText: true,
          _count: {
            select: {
              errorEvents: true,
              feedback: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      }),
      prisma.transcriptionSession.count({ where })
    ]);

    res.json({
      sessions: sessions.map(s => ({
        ...s,
        hasErrors: s._count.errorEvents > 0,
        hasFeedback: s._count.feedback > 0
      })),
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sessions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /admin/speech-intelligence/sessions/:id
 * Get detailed session information
 */
router.get('/sessions/:id', ...authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const session = await prisma.transcriptionSession.findUnique({
      where: { id },
      include: {
        segments: {
          orderBy: { index: 'asc' },
          select: {
            index: true,
            startMs: true,
            endMs: true,
            text: true,
            confidence: true,
            tokens: true
          }
        },
        analysisResults: {
          select: {
            analyzerVersion: true,
            resultJson: true,
            qualityScore: true,
            warnings: true,
            createdAt: true
          }
        },
        errorEvents: {
          select: {
            stage: true,
            errorCode: true,
            errorMessageSafe: true,
            retryCount: true,
            isTransient: true,
            createdAt: true
          }
        },
        feedback: {
          select: {
            rating: true,
            issueTags: true,
            notes: true,
            createdAt: true
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Don't expose transcript unless consent
    const response: any = { ...session };
    if (!session.consentToStoreText) {
      delete response.transcriptText;
      response.segments = response.segments.map((seg: any) => ({
        ...seg,
        text: undefined
      }));
    }

    res.json(response);
  } catch (error) {
    console.error('Failed to fetch session:', error);
    res.status(500).json({ 
      error: 'Failed to fetch session details',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /admin/speech-intelligence/sessions/:id/feedback
 * Submit feedback for a session
 */
router.post('/sessions/:id/feedback', ...authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, issueTags, correctedTranscript, notes } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if session exists and has consent for corrections
    const session = await prisma.transcriptionSession.findUnique({
      where: { id },
      select: { consentToStoreText: true }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Only allow corrected transcript if consent was given
    const feedbackData: any = {
      sessionId: id,
      rating,
      issueTags: issueTags || [],
      notes,
      createdByAdminId: 'system' // TODO: Get from auth
    };

    if (correctedTranscript && session.consentToStoreText) {
      feedbackData.correctedTranscript = correctedTranscript;
    }

    const feedback = await prisma.transcriptionFeedback.create({
      data: feedbackData
    });

    res.json({ success: true, feedback });
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    res.status(500).json({ 
      error: 'Failed to submit feedback',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /admin/speech-intelligence/tuning-profiles
 * Get current tuning profiles
 */
router.get('/tuning-profiles', async (req: Request, res: Response) => {
  try {
    const profiles = await prisma.modelTuningProfile.findMany({
      orderBy: [
        { scope: 'asc' },
        { scopeKey: 'asc' }
      ]
    });

    res.json({ profiles });
  } catch (error) {
    console.error('Failed to fetch tuning profiles:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tuning profiles',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /admin/speech-intelligence/compute-profiles
 * Trigger profile recomputation
 */
router.post('/compute-profiles', ...authMiddleware, async (req: Request, res: Response) => {
  try {
    const results = await runtimeTuning.computeProfiles();
    res.json({ success: true, results });
  } catch (error) {
    console.error('Failed to compute profiles:', error);
    res.status(500).json({ 
      error: 'Failed to compute profiles',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /admin/speech-intelligence/stats
 * Get overall statistics
 */
router.get('/stats', ...authMiddleware, async (req: Request, res: Response) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalSessions,
      recentSessions,
      successRate,
      engineBreakdown,
      avgDuration
    ] = await Promise.all([
      prisma.transcriptionSession.count(),
      prisma.transcriptionSession.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.transcriptionSession.count({
        where: { 
          status: 'SUCCESS',
          createdAt: { gte: thirtyDaysAgo }
        }
      }).then(count => 
        prisma.transcriptionSession.count({
          where: { createdAt: { gte: thirtyDaysAgo } }
        }).then(total => total > 0 ? count / total : 0)
      ),
      prisma.transcriptionSession.groupBy({
        by: ['engine'],
        _count: true,
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.transcriptionSession.aggregate({
        _avg: { durationMs: true },
        where: { 
          createdAt: { gte: thirtyDaysAgo },
          durationMs: { not: null }
        }
      })
    ]);

    res.json({
      totalSessions,
      recentSessions,
      successRate: Math.round(successRate * 100) / 100,
      engineBreakdown,
      avgDurationMs: avgDuration._avg.durationMs
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /admin/speech-intelligence/dev/generate-sessions
 * Generate test sessions for tuning validation (DEV ONLY)
 */
router.post('/dev/generate-sessions', ...authMiddleware, async (req: Request, res: Response) => {
  // Safety check - never run in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ 
      error: 'Test data generation disabled in production',
      hint: 'This endpoint is only available in development environments'
    });
  }

  try {
    const { count = 35 } = req.body;
    
    if (count > 200) {
      return res.status(400).json({
        error: 'Count too large',
        hint: 'Maximum 200 sessions per request'
      });
    }

    const createdSessions = [];
    const engines = [TranscriptionEngine.OPENAI, TranscriptionEngine.NVT, TranscriptionEngine.EVTS];
    const languages = ['en', 'es', 'fr', 'de', 'it'];
    const sources = [TranscriptionSource.WEB_RECORDING, TranscriptionSource.UPLOAD, TranscriptionSource.API];

    for (let i = 0; i < count; i++) {
      const engine = engines[i % engines.length];
      const language = languages[i % languages.length];
      const source = sources[i % sources.length];
      
      // Simulate varying success rates per engine
      const success = engine === TranscriptionEngine.OPENAI 
        ? Math.random() > 0.05  // 95% success
        : engine === TranscriptionEngine.NVT
        ? Math.random() > 0.10  // 90% success
        : Math.random() > 0.15; // 85% success for EVTS

      // Simulate processing time (varies by engine)
      const latency = engine === TranscriptionEngine.OPENAI
        ? 1500 + Math.random() * 1000  // 1.5-2.5s
        : engine === TranscriptionEngine.NVT
        ? 800 + Math.random() * 700    // 0.8-1.5s
        : 2500 + Math.random() * 2000; // 2.5-4.5s

      const duration = 30 + Math.random() * 60; // 30-90s audio
      const wordCount = success ? Math.floor(duration * 2.5) : null; // ~2.5 words/sec

      const session = await sessionManager.createSession({
        source,
        engine,
        language,
        consentToStoreText: false, // Never store test transcripts
        consentToStoreMetrics: true
      });

      // Update with simulated results
      await sessionManager.updateSession(session.id, {
        status: success ? TranscriptionStatus.SUCCESS : TranscriptionStatus.FAILED,
        durationMs: Math.floor(duration * 1000),
        wordCount,
        confidenceScore: success ? 0.85 + Math.random() * 0.10 : null
      });

      if (!success) {
        await sessionManager.recordError({
          sessionId: session.id,
          stage: TranscriptionStage.ENGINE_CALL,
          errorCode: 'SIMULATED_TIMEOUT',
          message: 'Simulated engine timeout for testing'
        });
      }

      // Add simulated analysis
      if (success && wordCount) {
        await sessionManager.addAnalysisResult({
          sessionId: session.id,
          analyzerType: 'word_count',
          analysisData: { 
            words: wordCount,
            sentences: Math.floor(wordCount / 15),
            avgWordLength: 4.5 + Math.random() * 1.5
          }
        });
      }

      createdSessions.push(session.id);
    }

    res.json({ 
      success: true, 
      sessionsCreated: count,
      sessionIds: createdSessions.slice(0, 5), // Show first 5
      message: `Created ${count} test sessions for tuning validation`,
      hint: 'Use POST /admin/speech-intelligence/compute-profiles to recompute tuning recommendations'
    });
  } catch (error) {
    console.error('Failed to generate sessions:', error);
    res.status(500).json({ 
      error: 'Failed to generate sessions', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
