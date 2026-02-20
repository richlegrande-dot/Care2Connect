/**
 * Admin CLI: Bulk Rank Recompute
 *
 * Iterates all completed sessions in rank order and writes
 * rankPosition/rankOf snapshots. Supports dry-run mode.
 *
 * Usage:
 *   npx tsx scripts/recompute-ranks.ts [--dry-run] [--batch-size N]
 *
 * @module scripts/recompute-ranks
 */

import { PrismaClient } from '@prisma/client';
import { bulkRecomputeRanks, invalidateCache } from '../backend/src/intake/v2/rank/rankService';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const batchSizeIdx = args.indexOf('--batch-size');
  const batchSize = batchSizeIdx >= 0 ? parseInt(args[batchSizeIdx + 1], 10) : 100;

  console.log('╔══════════════════════════════════════════════╗');
  console.log('║    Admin: Bulk Rank Recompute                ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`  Mode:       ${dryRun ? 'DRY-RUN (no writes)' : 'LIVE (writing to DB)'}`);
  console.log(`  Batch size: ${batchSize}`);
  console.log('');

  // Pre-flight: count sessions
  const totalCompleted = await prisma.v2IntakeSession.count({
    where: { status: 'COMPLETED', isTest: false },
  });
  const totalTest = await prisma.v2IntakeSession.count({
    where: { status: 'COMPLETED', isTest: true },
  });

  console.log(`  Completed sessions: ${totalCompleted} (+ ${totalTest} test, excluded)`);
  console.log('');

  // Invalidate cache before bulk operation
  invalidateCache();

  const startTime = Date.now();
  const result = await bulkRecomputeRanks({ dryRun, batchSize });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('');
  console.log('─── Results ───');
  console.log(`  Processed: ${result.processed}`);
  console.log(`  Errors:    ${result.errors}`);
  console.log(`  Duration:  ${elapsed}s`);
  console.log(`  Mode:      ${dryRun ? 'DRY-RUN' : 'LIVE'}`);

  if (!dryRun && result.processed > 0) {
    // Verify a sample
    const sample = await prisma.v2IntakeSession.findFirst({
      where: { status: 'COMPLETED', isTest: false, rankPosition: { not: null } },
      select: { id: true, rankPosition: true, rankOf: true, rankComputedAt: true },
      orderBy: { rankPosition: 'asc' },
    });
    if (sample) {
      console.log('');
      console.log('─── Sample Verification ───');
      console.log(`  Rank 1 session: ${sample.id}`);
      console.log(`  Position:       ${sample.rankPosition}/${sample.rankOf}`);
      console.log(`  Computed at:    ${sample.rankComputedAt?.toISOString()}`);
    }
  }

  console.log('');
  await prisma.$disconnect();
  process.exit(result.errors > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
