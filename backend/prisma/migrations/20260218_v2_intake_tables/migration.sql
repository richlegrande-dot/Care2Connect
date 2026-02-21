-- V2 Intake Tables — Care2Connect
-- Migration: Add intake_responses, stability_scores, action_plans, coordinated_entry_events
-- Non-destructive: CREATE TABLE only, no ALTER on V1 tables
-- Feature flag: ENABLE_V2_INTAKE=true

-- ── Enums ──────────────────────────────────────────────────────

CREATE TYPE "IntakeStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'EXPIRED');
CREATE TYPE "PriorityTier" AS ENUM ('CRITICAL', 'HIGH', 'MODERATE', 'LOWER');
CREATE TYPE "ActionPlanStatus" AS ENUM ('GENERATED', 'REVIEWED', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE "CEEventType" AS ENUM ('INTAKE_COMPLETED', 'SCORE_COMPUTED', 'PLAN_GENERATED', 'REFERRAL_MADE', 'STATUS_CHANGE');

-- ── Tables ─────────────────────────────────────────────────────

CREATE TABLE "intake_responses" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "status" "IntakeStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "consentData" JSONB,
    "demographicsData" JSONB,
    "housingData" JSONB,
    "safetyData" JSONB,
    "healthData" JSONB,
    "historyData" JSONB,
    "incomeData" JSONB,
    "goalsData" JSONB,
    "completedModules" TEXT[],
    "completedAt" TIMESTAMP(3),
    "dvSafeMode" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "intake_responses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "stability_scores" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "intakeResponseId" TEXT NOT NULL,
    "housingStability" INTEGER NOT NULL,
    "safetyCrisis" INTEGER NOT NULL,
    "vulnerabilityHealth" INTEGER NOT NULL,
    "chronicitySystem" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "stabilityLevel" INTEGER NOT NULL,
    "priorityTier" "PriorityTier" NOT NULL,
    "placementRule" TEXT NOT NULL,
    "overridesApplied" TEXT[],
    "explainabilityCard" JSONB NOT NULL,
    "policyPackVersion" TEXT NOT NULL DEFAULT 'v1.0.0',
    "scoringEngineVersion" TEXT NOT NULL DEFAULT 'v1.0.0',

    CONSTRAINT "stability_scores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "action_plans" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "intakeResponseId" TEXT NOT NULL,
    "immediateTasks" JSONB NOT NULL,
    "shortTermTasks" JSONB NOT NULL,
    "mediumTermTasks" JSONB NOT NULL,
    "status" "ActionPlanStatus" NOT NULL DEFAULT 'GENERATED',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "action_plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "coordinated_entry_events" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "intakeResponseId" TEXT NOT NULL,
    "eventType" "CEEventType" NOT NULL,
    "eventData" JSONB NOT NULL,
    "exportedAt" TIMESTAMP(3),

    CONSTRAINT "coordinated_entry_events_pkey" PRIMARY KEY ("id")
);

-- ── Unique Constraints ─────────────────────────────────────────

CREATE UNIQUE INDEX "intake_responses_sessionId_key" ON "intake_responses"("sessionId");
CREATE UNIQUE INDEX "stability_scores_intakeResponseId_key" ON "stability_scores"("intakeResponseId");
CREATE UNIQUE INDEX "action_plans_intakeResponseId_key" ON "action_plans"("intakeResponseId");

-- ── Indexes ────────────────────────────────────────────────────

CREATE INDEX "intake_responses_userId_idx" ON "intake_responses"("userId");
CREATE INDEX "intake_responses_sessionId_idx" ON "intake_responses"("sessionId");
CREATE INDEX "intake_responses_status_idx" ON "intake_responses"("status");
CREATE INDEX "intake_responses_createdAt_idx" ON "intake_responses"("createdAt");

CREATE INDEX "stability_scores_stabilityLevel_idx" ON "stability_scores"("stabilityLevel");
CREATE INDEX "stability_scores_priorityTier_idx" ON "stability_scores"("priorityTier");
CREATE INDEX "stability_scores_createdAt_idx" ON "stability_scores"("createdAt");

CREATE INDEX "action_plans_status_idx" ON "action_plans"("status");
CREATE INDEX "action_plans_createdAt_idx" ON "action_plans"("createdAt");

CREATE INDEX "coordinated_entry_events_intakeResponseId_idx" ON "coordinated_entry_events"("intakeResponseId");
CREATE INDEX "coordinated_entry_events_eventType_idx" ON "coordinated_entry_events"("eventType");
CREATE INDEX "coordinated_entry_events_createdAt_idx" ON "coordinated_entry_events"("createdAt");

-- ── Foreign Keys ───────────────────────────────────────────────

ALTER TABLE "intake_responses" ADD CONSTRAINT "intake_responses_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "stability_scores" ADD CONSTRAINT "stability_scores_intakeResponseId_fkey"
    FOREIGN KEY ("intakeResponseId") REFERENCES "intake_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "action_plans" ADD CONSTRAINT "action_plans_intakeResponseId_fkey"
    FOREIGN KEY ("intakeResponseId") REFERENCES "intake_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "coordinated_entry_events" ADD CONSTRAINT "coordinated_entry_events_intakeResponseId_fkey"
    FOREIGN KEY ("intakeResponseId") REFERENCES "intake_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
