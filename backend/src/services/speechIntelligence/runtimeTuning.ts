/**
 * Speech Intelligence - Runtime Tuning
 * Uses DB data to improve engine/settings selection
 */

import { prisma } from '../../lib/prisma';
import { TranscriptionEngine, TuningScope } from '@prisma/client';

export interface TuningRecommendation {
  engine: TranscriptionEngine;
  vadSensitivity?: number;
  chunkSeconds?: number;
  silenceTrimMs?: number;
  confidence: number; // 0-1, how confident we are in this recommendation
  sampleCount: number;
}

export class RuntimeTuning {
  private readonly MIN_SAMPLES = 30; // Minimum sessions before changing profile
  
  /**
   * Get tuned settings for a given context
   */
  async getRecommendation(context: {
    language?: string;
    route?: string;
    defaultEngine: TranscriptionEngine;
  }): Promise<TuningRecommendation> {
    try {
      // Try language-specific profile first
      if (context.language) {
        const languageProfile = await prisma.modelTuningProfile.findUnique({
          where: {
            scope_scopeKey: {
              scope: TuningScope.LANGUAGE,
              scopeKey: context.language
            }
          }
        });

        if (languageProfile && (languageProfile.sampleCount ?? 0) >= this.MIN_SAMPLES) {
          return this.profileToRecommendation(languageProfile, context.defaultEngine);
        }
      }

      // Try route-specific profile
      if (context.route) {
        const routeProfile = await prisma.modelTuningProfile.findUnique({
          where: {
            scope_scopeKey: {
              scope: TuningScope.ROUTE,
              scopeKey: context.route
            }
          }
        });

        if (routeProfile && (routeProfile.sampleCount ?? 0) >= this.MIN_SAMPLES) {
          return this.profileToRecommendation(routeProfile, context.defaultEngine);
        }
      }

      // Fall back to global profile
      const globalProfile = await prisma.modelTuningProfile.findUnique({
        where: {
          scope_scopeKey: {
            scope: TuningScope.GLOBAL,
            scopeKey: 'default'
          }
        }
      });

      if (globalProfile && (globalProfile.sampleCount ?? 0) >= this.MIN_SAMPLES) {
        return this.profileToRecommendation(globalProfile, context.defaultEngine);
      }

      // No profiles available, use defaults
      return {
        engine: context.defaultEngine,
        confidence: 0,
        sampleCount: 0
      };
    } catch (error) {
      console.warn('Failed to fetch tuning recommendation:', error);
      // On DB error, return safe defaults
      return {
        engine: context.defaultEngine,
        confidence: 0,
        sampleCount: 0
      };
    }
  }

  /**
   * Update tuning profiles based on accumulated data
   * Should run periodically (daily cron)
   */
  async computeProfiles(): Promise<{
    updated: number;
    skipped: number;
    errors: string[];
  }> {
    const results = {
      updated: 0,
      skipped: 0,
      errors: [] as string[]
    };

    try {
      // Compute global profile
      await this.computeGlobalProfile(results);

      // Compute language-specific profiles
      await this.computeLanguageProfiles(results);

      // Compute route-specific profiles
      await this.computeRouteProfiles(results);

    } catch (error) {
      results.errors.push(`Profile computation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return results;
  }

  private async computeGlobalProfile(results: { updated: number; skipped: number; errors: string[] }) {
    const stats = await this.getEngineStats({ scope: 'global' });

    if (stats.totalSessions < this.MIN_SAMPLES) {
      results.skipped++;
      return;
    }

    const bestEngine = this.selectBestEngine(stats.engineStats);

    await prisma.modelTuningProfile.upsert({
      where: {
        scope_scopeKey: {
          scope: TuningScope.GLOBAL,
          scopeKey: 'default'
        }
      },
      create: {
        scope: TuningScope.GLOBAL,
        scopeKey: 'default',
        recommendedEngine: bestEngine,
        sampleCount: stats.totalSessions,
        successRate: stats.overallSuccessRate,
        avgLatencyMs: stats.avgLatencyMs,
        lastComputedAt: new Date()
      },
      update: {
        recommendedEngine: bestEngine,
        sampleCount: stats.totalSessions,
        successRate: stats.overallSuccessRate,
        avgLatencyMs: stats.avgLatencyMs,
        lastComputedAt: new Date()
      }
    });

    results.updated++;
  }

  private async computeLanguageProfiles(results: { updated: number; skipped: number; errors: string[] }) {
    // Get unique languages from sessions
    const languages = await prisma.transcriptionSession.groupBy({
      by: ['detectedLanguage'],
      where: {
        detectedLanguage: { not: null }
      },
      _count: true
    });

    for (const lang of languages) {
      if (!lang.detectedLanguage) continue;

      const stats = await this.getEngineStats({ 
        scope: 'language', 
        value: lang.detectedLanguage 
      });

      if (stats.totalSessions < this.MIN_SAMPLES) {
        results.skipped++;
        continue;
      }

      const bestEngine = this.selectBestEngine(stats.engineStats);

      await prisma.modelTuningProfile.upsert({
        where: {
          scope_scopeKey: {
            scope: TuningScope.LANGUAGE,
            scopeKey: lang.detectedLanguage
          }
        },
        create: {
          scope: TuningScope.LANGUAGE,
          scopeKey: lang.detectedLanguage,
          recommendedEngine: bestEngine,
          sampleCount: stats.totalSessions,
          successRate: stats.overallSuccessRate,
          avgLatencyMs: stats.avgLatencyMs,
          lastComputedAt: new Date()
        },
        update: {
          recommendedEngine: bestEngine,
          sampleCount: stats.totalSessions,
          successRate: stats.overallSuccessRate,
          avgLatencyMs: stats.avgLatencyMs,
          lastComputedAt: new Date()
        }
      });

      results.updated++;
    }
  }

  private async computeRouteProfiles(results: { updated: number; skipped: number; errors: string[] }) {
    // Get unique sources (routes)
    const sources = await prisma.transcriptionSession.groupBy({
      by: ['source'],
      _count: true
    });

    for (const src of sources) {
      const stats = await this.getEngineStats({ 
        scope: 'route', 
        value: src.source 
      });

      if (stats.totalSessions < this.MIN_SAMPLES) {
        results.skipped++;
        continue;
      }

      const bestEngine = this.selectBestEngine(stats.engineStats);

      await prisma.modelTuningProfile.upsert({
        where: {
          scope_scopeKey: {
            scope: TuningScope.ROUTE,
            scopeKey: src.source
          }
        },
        create: {
          scope: TuningScope.ROUTE,
          scopeKey: src.source,
          recommendedEngine: bestEngine,
          sampleCount: stats.totalSessions,
          successRate: stats.overallSuccessRate,
          avgLatencyMs: stats.avgLatencyMs,
          lastComputedAt: new Date()
        },
        update: {
          recommendedEngine: bestEngine,
          sampleCount: stats.totalSessions,
          successRate: stats.overallSuccessRate,
          avgLatencyMs: stats.avgLatencyMs,
          lastComputedAt: new Date()
        }
      });

      results.updated++;
    }
  }

  private async getEngineStats(filter: { scope: string; value?: string }) {
    const where: any = {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    };

    if (filter.scope === 'language' && filter.value) {
      where.detectedLanguage = filter.value;
    } else if (filter.scope === 'route' && filter.value) {
      where.source = filter.value;
    }

    const sessions = await prisma.transcriptionSession.findMany({
      where,
      select: {
        engine: true,
        status: true,
        durationMs: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const engineStats: Record<string, { success: number; total: number; avgLatency: number }> = {};

    for (const session of sessions) {
      if (!engineStats[session.engine]) {
        engineStats[session.engine] = { success: 0, total: 0, avgLatency: 0 };
      }

      engineStats[session.engine].total++;
      
      if (session.status === 'SUCCESS') {
        engineStats[session.engine].success++;
      }

      const latency = session.updatedAt.getTime() - session.createdAt.getTime();
      engineStats[session.engine].avgLatency += latency;
    }

    // Calculate averages
    for (const engine in engineStats) {
      engineStats[engine].avgLatency /= engineStats[engine].total;
    }

    const totalSessions = sessions.length;
    const successSessions = sessions.filter(s => s.status === 'SUCCESS').length;
    const overallSuccessRate = totalSessions > 0 ? successSessions / totalSessions : 0;
    const avgLatencyMs = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + (s.updatedAt.getTime() - s.createdAt.getTime()), 0) / sessions.length
      : 0;

    return {
      totalSessions,
      overallSuccessRate,
      avgLatencyMs,
      engineStats
    };
  }

  private selectBestEngine(engineStats: Record<string, { success: number; total: number; avgLatency: number }>): TranscriptionEngine {
    let bestEngine: TranscriptionEngine = TranscriptionEngine.OPENAI;
    let bestScore = 0;

    for (const [engine, stats] of Object.entries(engineStats)) {
      if (stats.total < 5) continue; // Need minimum samples per engine

      const successRate = stats.success / stats.total;
      const latencyPenalty = Math.min(stats.avgLatency / 10000, 0.5); // Max 0.5 penalty for slow engines
      const score = successRate * (1 - latencyPenalty);

      if (score > bestScore) {
        bestScore = score;
        bestEngine = engine as TranscriptionEngine;
      }
    }

    return bestEngine;
  }

  private profileToRecommendation(profile: any, defaultEngine: TranscriptionEngine): TuningRecommendation {
    return {
      engine: profile.recommendedEngine ?? defaultEngine,
      vadSensitivity: profile.vadSensitivity ?? undefined,
      chunkSeconds: profile.chunkSeconds ?? undefined,
      silenceTrimMs: profile.silenceTrimMs ?? undefined,
      confidence: Math.min((profile.sampleCount ?? 0) / (this.MIN_SAMPLES * 3), 1),
      sampleCount: profile.sampleCount ?? 0
    };
  }
}
