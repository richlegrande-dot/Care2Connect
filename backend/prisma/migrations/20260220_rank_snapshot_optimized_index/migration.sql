-- Phase 9B.2: Rank Snapshot Fields + Optimized DESC Composite Index
--
-- 1. Add rank snapshot columns to v2_intake_sessions
-- 2. Drop existing ASC-only composite index
-- 3. Create optimized composite index with totalScore DESC
--
-- NOTE: In production, run the CREATE INDEX with CONCURRENTLY outside a transaction.
--       Prisma migrations run in a transaction by default, so for production apply
--       this migration manually or use `prisma migrate resolve --applied` after
--       running the SQL directly.

-- ── Step 1: Add rank snapshot columns ──────────────────────────

ALTER TABLE "v2_intake_sessions"
  ADD COLUMN IF NOT EXISTS "rankPosition" INTEGER,
  ADD COLUMN IF NOT EXISTS "rankOf" INTEGER,
  ADD COLUMN IF NOT EXISTS "rankComputedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "rankSortKey" TEXT;

-- ── Step 2: Drop old ASC-only composite index ──────────────────

DROP INDEX IF EXISTS "v2_intake_sessions_rank_composite_idx";

-- ── Step 3: Create optimized composite index with DESC on totalScore ──
-- Rank sort order: stabilityLevel ASC, totalScore DESC, completedAt ASC, id ASC
-- Leading columns: status, isTest (equality filters)

CREATE INDEX "v2_intake_sessions_rank_desc_idx"
  ON "v2_intake_sessions" (
    "status",
    "isTest",
    "stabilityLevel" ASC,
    "totalScore" DESC,
    "completedAt" ASC,
    "id" ASC
  );

-- ── Step 4: Partial index for completed non-test sessions (hot path) ──

CREATE INDEX IF NOT EXISTS "v2_intake_sessions_rank_completed_idx"
  ON "v2_intake_sessions" ("stabilityLevel" ASC, "totalScore" DESC, "completedAt" ASC, "id" ASC)
  WHERE "status" = 'COMPLETED' AND "isTest" = false;
