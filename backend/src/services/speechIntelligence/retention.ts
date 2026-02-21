/**
 * Speech Intelligence - Retention & Cleanup
 * Handles data retention policies
 */

import { prisma } from '../../lib/prisma';

export class RetentionManager {
  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<{
    deleted: number;
    errors: string[];
  }> {
    const results = {
      deleted: 0,
      errors: [] as string[]
    };

    try {
      const now = new Date();

      // Find expired sessions
      const expiredSessions = await prisma.transcription_sessions.findMany({
        where: {
          retentionUntil: {
            lt: now
          }
        },
        select: { id: true }
      });

      // Delete in batches
      const batchSize = 100;
      for (let i = 0; i < expiredSessions.length; i += batchSize) {
        const batch = expiredSessions.slice(i, i + batchSize);
        const ids = batch.map(s => s.id);

        try {
          // Cascade delete will handle related records
          const result = await prisma.transcription_sessions.deleteMany({
            where: {
              id: { in: ids }
            }
          });

          results.deleted += result.count;
        } catch (error) {
          results.errors.push(`Batch ${i / batchSize + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      console.log(`Retention cleanup completed: ${results.deleted} sessions deleted`);
    } catch (error) {
      results.errors.push(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return results;
  }

  /**
   * Get retention stats
   */
  async getRetentionStats(): Promise<{
    totalSessions: number;
    expiringSoon: number;
    expired: number;
    avgRetentionDays: number;
  }> {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [total, expiringSoon, expired, avgRetention] = await Promise.all([
      prisma.transcription_sessions.count(),
      prisma.transcription_sessions.count({
        where: {
          retentionUntil: {
            gte: now,
            lte: sevenDaysFromNow
          }
        }
      }),
      prisma.transcription_sessions.count({
        where: {
          retentionUntil: {
            lt: now
          }
        }
      }),
      prisma.$queryRaw<Array<{ avg: number }>>`
        SELECT AVG(EXTRACT(EPOCH FROM ("retentionUntil" - "createdAt")) / 86400) as avg
        FROM "transcription_sessions"
        WHERE "retentionUntil" IS NOT NULL
      `.then(result => result[0]?.avg || 0)
    ]);

    return {
      totalSessions: total,
      expiringSoon,
      expired,
      avgRetentionDays: Math.round(avgRetention * 10) / 10
    };
  }
}
