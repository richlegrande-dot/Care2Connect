-- Phase 9B.1: Audit events table + isTest + rank composite index
-- Idempotent: safe to run on databases where tables already exist (via db push)

-- ── 1. Enums (IF NOT EXISTS) ───────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "V2IntakeStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "V2PriorityTier" AS ENUM ('CRITICAL', 'HIGH', 'MODERATE', 'LOWER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 2. v2_intake_sessions (IF NOT EXISTS) ──────────────────────

CREATE TABLE IF NOT EXISTS "v2_intake_sessions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "status" "V2IntakeStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "dvSafeMode" BOOLEAN NOT NULL DEFAULT false,
    "modules" JSONB NOT NULL DEFAULT '{}',
    "completedModules" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "completedAt" TIMESTAMP(3),
    "policyPackVersion" TEXT,
    "scoreResult" JSONB,
    "explainabilityCard" JSONB,
    "actionPlan" JSONB,
    "totalScore" INTEGER,
    "stabilityLevel" INTEGER,
    "priorityTier" "V2PriorityTier",
    "sensitiveDataRedacted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "v2_intake_sessions_pkey" PRIMARY KEY ("id")
);

-- Indexes on v2_intake_sessions
CREATE INDEX IF NOT EXISTS "v2_intake_sessions_userId_idx" ON "v2_intake_sessions"("userId");
CREATE INDEX IF NOT EXISTS "v2_intake_sessions_status_idx" ON "v2_intake_sessions"("status");
CREATE INDEX IF NOT EXISTS "v2_intake_sessions_createdAt_idx" ON "v2_intake_sessions"("createdAt");

-- ── 3. v2_intake_audit_events (IF NOT EXISTS) ──────────────────

CREATE TABLE IF NOT EXISTS "v2_intake_audit_events" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "requestId" TEXT,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "v2_intake_audit_events_pkey" PRIMARY KEY ("id")
);

-- FK constraint (idempotent via exception handler)
DO $$ BEGIN
  ALTER TABLE "v2_intake_audit_events"
    ADD CONSTRAINT "v2_intake_audit_events_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "v2_intake_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Indexes on v2_intake_audit_events
CREATE INDEX IF NOT EXISTS "v2_intake_audit_events_sessionId_idx" ON "v2_intake_audit_events"("sessionId");
CREATE INDEX IF NOT EXISTS "v2_intake_audit_events_eventType_idx" ON "v2_intake_audit_events"("eventType");
CREATE INDEX IF NOT EXISTS "v2_intake_audit_events_createdAt_idx" ON "v2_intake_audit_events"("createdAt");

-- ── 4. Add isTest column to v2_intake_sessions ─────────────────

DO $$ BEGIN
  ALTER TABLE "v2_intake_sessions" ADD COLUMN "isTest" BOOLEAN NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Index on isTest for filtering
CREATE INDEX IF NOT EXISTS "v2_intake_sessions_isTest_idx" ON "v2_intake_sessions"("isTest");

-- ── 5. Composite index for rank scalability ────────────────────
-- Supports: WHERE status='COMPLETED' AND isTest=false
--           ORDER BY stabilityLevel ASC, totalScore DESC, completedAt ASC, id ASC

CREATE INDEX IF NOT EXISTS "v2_intake_sessions_rank_composite_idx"
  ON "v2_intake_sessions"("status", "isTest", "stabilityLevel" ASC, "totalScore" DESC, "completedAt" ASC, "id" ASC);
