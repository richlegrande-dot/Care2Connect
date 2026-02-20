/**
 * Rank Service — Scalable ranking for V2 Intake Sessions
 *
 * Provides:
 *   - Partitioned level ranking (global + level-local)
 *   - In-memory count cache with configurable TTL
 *   - Snapshot-first rank resolution with freshness check
 *   - Rank computation and DB snapshot persistence
 *
 * Rank sort order (deterministic):
 *   1. stabilityLevel ASC  (0 = most urgent)
 *   2. totalScore DESC     (higher = more need)
 *   3. completedAt ASC     (older first)
 *   4. id ASC              (final tie-break)
 *
 * @module intake/v2/rank/rankService
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// ── Types ──────────────────────────────────────────────────────

export interface RankResult {
  global: { position: number; of: number };
  level: { position: number; of: number; level: number };
  sortKey: string;
  excludesTestSessions: boolean;
  fromSnapshot: boolean;
}

export interface SessionRankInput {
  id: string;
  stabilityLevel: number | null;
  totalScore: number | null;
  completedAt: Date | null;
  isTest: boolean;
}

// ── In-Memory Count Cache ──────────────────────────────────────

interface CountCache {
  /** Map: stabilityLevel → count of completed non-test sessions at that level */
  byLevel: Map<number, number>;
  /** Total completed non-test sessions */
  total: number;
  /** Timestamp of last refresh */
  lastRefreshed: number;
}

const DEFAULT_TTL_MS = 30_000; // 30 seconds

let _cache: CountCache = {
  byLevel: new Map(),
  total: 0,
  lastRefreshed: 0,
};

let _cacheTTL = DEFAULT_TTL_MS;

/**
 * Configure the cache TTL (for testing).
 */
export function setCacheTTL(ms: number): void {
  _cacheTTL = ms;
}

/**
 * Force-invalidate the cache (useful after bulk operations).
 */
export function invalidateCache(): void {
  _cache.lastRefreshed = 0;
}

/**
 * Get cached counts, refreshing from DB if stale.
 * Returns { byLevel, total }.
 */
async function getCachedCounts(includeTest: boolean): Promise<{ byLevel: Map<number, number>; total: number }> {
  // If includeTest=true, we bypass cache (rare admin path)
  if (includeTest) {
    return refreshCountsFromDB(true);
  }

  const now = Date.now();
  if (now - _cache.lastRefreshed < _cacheTTL) {
    return { byLevel: _cache.byLevel, total: _cache.total };
  }

  // Refresh from DB
  const fresh = await refreshCountsFromDB(false);
  _cache = {
    byLevel: fresh.byLevel,
    total: fresh.total,
    lastRefreshed: now,
  };
  return fresh;
}

/**
 * Query DB for counts grouped by stabilityLevel using optimized SQL.
 */
async function refreshCountsFromDB(includeTest: boolean): Promise<{ byLevel: Map<number, number>; total: number }> {
  // Use raw SQL for explicit index usage with the level_counts_idx
  const results = includeTest
    ? await prisma.$queryRaw<Array<{ stabilityLevel: number; count: bigint }>>`
        SELECT "stabilityLevel", COUNT(*) as count
        FROM "v2_intake_sessions"
        WHERE "status" = 'COMPLETED'
          AND "stabilityLevel" IS NOT NULL
        GROUP BY "stabilityLevel"
        ORDER BY "stabilityLevel" ASC
      `
    : await prisma.$queryRaw<Array<{ stabilityLevel: number; count: bigint }>>`
        SELECT "stabilityLevel", COUNT(*) as count
        FROM "v2_intake_sessions"
        WHERE "status" = 'COMPLETED'
          AND "isTest" = false
          AND "stabilityLevel" IS NOT NULL
        GROUP BY "stabilityLevel"
        ORDER BY "stabilityLevel" ASC
      `;

  const byLevel = new Map<number, number>();
  let total = 0;
  
  for (const row of results) {
    const count = Number(row.count);
    byLevel.set(row.stabilityLevel, count);
    total += count;
  }

  return { byLevel, total };
}

// ── Build Sort Key ─────────────────────────────────────────────

export function buildSortKey(session: SessionRankInput): string {
  const L = session.stabilityLevel ?? 999;
  const S = session.totalScore ?? 0;
  const T = session.completedAt?.toISOString() ?? '';
  return `L${L}|S${S}|T${T}|ID${session.id}`;
}

// ── Rank Computation ───────────────────────────────────────────

/**
 * Compute both global and level-local rank for a completed session.
 *
 * Global rank uses partitioned approach:
 *   globalRank = sum(counts for all levels < L) + levelRank
 *
 * Level rank = 1 + count(same-level sessions that outrank this one).
 *
 * This reduces O(N) full-table COUNT to:
 *   - 1 groupBy query (cached)
 *   - 1 COUNT within the session's level only
 */
export async function computeRank(
  session: SessionRankInput,
  options: { includeTest?: boolean } = {}
): Promise<RankResult> {
  const includeTest = options.includeTest ?? false;
  const testFilter = includeTest ? {} : { isTest: false };

  const L = session.stabilityLevel ?? 999;
  const S = session.totalScore ?? 0;
  const T = session.completedAt ?? new Date();
  const ID = session.id;

  // Get cached level counts
  const { byLevel, total } = await getCachedCounts(includeTest);

  // Count sessions that outrank this one WITHIN the same level
  // Outrank within level: higher totalScore, OR same score + earlier completedAt, OR same score + same time + smaller id
  // Use raw SQL for explicit index usage and better performance predictability
  const levelOutrankResult = includeTest
    ? await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM "v2_intake_sessions"
        WHERE "status" = 'COMPLETED'
          AND "stabilityLevel" = ${L}
          AND (
            "totalScore" > ${S}
            OR ("totalScore" = ${S} AND "completedAt" < ${T})
            OR ("totalScore" = ${S} AND "completedAt" = ${T} AND "id" < ${ID})
          )
      `
    : await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM "v2_intake_sessions"
        WHERE "status" = 'COMPLETED'
          AND "isTest" = false
          AND "stabilityLevel" = ${L}
          AND (
            "totalScore" > ${S}
            OR ("totalScore" = ${S} AND "completedAt" < ${T})
            OR ("totalScore" = ${S} AND "completedAt" = ${T} AND "id" < ${ID})
          )
      `;
  const levelOutrankCount = Number(levelOutrankResult[0].count);

  // Level rank = 1-based position within this level
  const levelPosition = levelOutrankCount + 1;
  const levelCount = byLevel.get(L) ?? 0;

  // Global rank = sum of counts for ALL levels below L (more urgent) + levelRank
  let lowerLevelCount = 0;
  for (const [level, count] of byLevel) {
    if (level < L) {
      lowerLevelCount += count;
    }
  }
  const globalPosition = lowerLevelCount + levelPosition;

  return {
    global: { position: globalPosition, of: total },
    level: { position: levelPosition, of: levelCount, level: L },
    sortKey: buildSortKey(session),
    excludesTestSessions: !includeTest,
    fromSnapshot: false,
  };
}

// ── Snapshot Management ────────────────────────────────────────

/** Snapshot freshness threshold — 15 minutes */
const SNAPSHOT_FRESHNESS_MS = 15 * 60 * 1000;

/**
 * Check if a session's rank snapshot is fresh enough to use.
 */
export function isSnapshotFresh(
  rankComputedAt: Date | null,
  freshnessMs: number = SNAPSHOT_FRESHNESS_MS
): boolean {
  if (!rankComputedAt) return false;
  return (Date.now() - rankComputedAt.getTime()) < freshnessMs;
}

/**
 * Build a RankResult from a session's stored snapshot fields.
 * Returns null if snapshot is incomplete.
 */
export function rankFromSnapshot(session: {
  rankPosition: number | null;
  rankOf: number | null;
  rankComputedAt: Date | null;
  rankSortKey: string | null;
  stabilityLevel: number | null;
}): RankResult | null {
  if (
    session.rankPosition === null ||
    session.rankOf === null ||
    session.rankComputedAt === null
  ) {
    return null;
  }

  return {
    global: { position: session.rankPosition, of: session.rankOf },
    // Snapshot doesn't store level-local separately — we return global for both
    // Level rank is recomputed live when needed
    level: {
      position: session.rankPosition,
      of: session.rankOf,
      level: session.stabilityLevel ?? 999,
    },
    sortKey: session.rankSortKey ?? '',
    excludesTestSessions: true, // snapshots always exclude test
    fromSnapshot: true,
  };
}

/**
 * Compute rank and persist snapshot to DB.
 * Returns the computed rank result.
 *
 * This is best-effort — errors are caught and logged, never thrown.
 */
export async function computeAndStoreSnapshot(
  sessionId: string,
  session: SessionRankInput
): Promise<RankResult | null> {
  try {
    const rank = await computeRank(session, { includeTest: false });

    await prisma.v2IntakeSession.update({
      where: { id: sessionId },
      data: {
        rankPosition: rank.global.position,
        rankOf: rank.global.of,
        rankComputedAt: new Date(),
        rankSortKey: rank.sortKey,
      },
    });

    // Invalidate cache since a new completion changes counts
    invalidateCache();

    return rank;
  } catch (err) {
    console.error(`[RankService] Failed to compute/store snapshot for ${sessionId}:`, err);
    return null;
  }
}

/**
 * Get rank for a session, using snapshot-first with freshness check.
 * Falls back to live computation if snapshot is stale or missing.
 *
 * @param session - Full session record from DB
 * @param options - { includeTest, forceRefresh }
 */
export async function getRank(
  session: {
    id: string;
    stabilityLevel: number | null;
    totalScore: number | null;
    completedAt: Date | null;
    isTest: boolean;
    rankPosition: number | null;
    rankOf: number | null;
    rankComputedAt: Date | null;
    rankSortKey: string | null;
  },
  options: { includeTest?: boolean; forceRefresh?: boolean } = {}
): Promise<RankResult> {
  const includeTest = options.includeTest ?? false;

  // Snapshot path: use if fresh, not forced, and not includeTest (snapshots always exclude test)
  if (
    !options.forceRefresh &&
    !includeTest &&
    isSnapshotFresh(session.rankComputedAt) &&
    session.rankPosition !== null
  ) {
    const snapshot = rankFromSnapshot(session);
    if (snapshot) return snapshot;
  }

  // Live compute
  const rank = await computeRank(session, { includeTest });

  // Best-effort snapshot update (only for non-test default path)
  if (!includeTest) {
    prisma.v2IntakeSession
      .update({
        where: { id: session.id },
        data: {
          rankPosition: rank.global.position,
          rankOf: rank.global.of,
          rankComputedAt: new Date(),
          rankSortKey: rank.sortKey,
        },
      })
      .catch((err) => {
        console.error(`[RankService] Failed to update snapshot for ${session.id}:`, err);
      });
  }

  return rank;
}

/**
 * Bulk recompute ranks for all completed sessions (admin use).
 *
 * @param options - { dryRun, batchSize }
 * @returns Number of sessions processed
 */
export async function bulkRecomputeRanks(
  options: { dryRun?: boolean; batchSize?: number } = {}
): Promise<{ processed: number; errors: number }> {
  const batchSize = options.batchSize ?? 100;
  const dryRun = options.dryRun ?? false;

  // Invalidate cache so we get fresh counts
  invalidateCache();

  // Fetch all completed non-test sessions in rank order
  const sessions = await prisma.v2IntakeSession.findMany({
    where: { status: 'COMPLETED', isTest: false },
    orderBy: [
      { stabilityLevel: 'asc' },
      { totalScore: 'desc' },
      { completedAt: 'asc' },
      { id: 'asc' },
    ],
    select: {
      id: true,
      stabilityLevel: true,
      totalScore: true,
      completedAt: true,
      isTest: true,
    },
  });

  const total = sessions.length;
  let processed = 0;
  let errors = 0;
  const now = new Date();

  // Process in batches
  for (let i = 0; i < sessions.length; i += batchSize) {
    const batch = sessions.slice(i, i + batchSize);
    const updates = batch.map((s, idx) => {
      const globalPosition = i + idx + 1; // Already in sorted order
      return {
        id: s.id,
        rankPosition: globalPosition,
        rankOf: total,
        rankComputedAt: now,
        rankSortKey: buildSortKey(s),
      };
    });

    if (!dryRun) {
      try {
        await prisma.$transaction(
          updates.map((u) =>
            prisma.v2IntakeSession.update({
              where: { id: u.id },
              data: {
                rankPosition: u.rankPosition,
                rankOf: u.rankOf,
                rankComputedAt: u.rankComputedAt,
                rankSortKey: u.rankSortKey,
              },
            })
          )
        );
      } catch (err) {
        console.error(`[RankService] Batch error at offset ${i}:`, err);
        errors += batch.length;
        continue;
      }
    }

    processed += batch.length;

    if (processed % 500 === 0 || processed === total) {
      console.log(`[RankService] Bulk recompute: ${processed}/${total} ${dryRun ? '(dry-run)' : ''}`);
    }
  }

  return { processed, errors };
}
