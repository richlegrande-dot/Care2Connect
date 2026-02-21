-- CreateEnum
CREATE TYPE "PipelineStage" AS ENUM ('UPLOAD', 'TRANSCRIPTION', 'ANALYSIS', 'DRAFT', 'DOC_GEN', 'STRIPE', 'WEBHOOK', 'HEALTH', 'DB');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('INFO', 'WARN', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'RESOLVED', 'AUTO_RESOLVED');

-- CreateTable
CREATE TABLE "pipeline_incidents" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ticketId" TEXT,
    "stage" "PipelineStage" NOT NULL,
    "severity" "IncidentSeverity" NOT NULL,
    "errorCode" TEXT,
    "errorMessage" TEXT NOT NULL,
    "contextJson" JSONB,
    "recommendationsJson" JSONB,
    "status" "IncidentStatus" NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "pipeline_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_bindings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "incidentId" TEXT NOT NULL,
    "knowledgeChunkId" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "reason" TEXT,

    CONSTRAINT "knowledge_bindings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pipeline_incidents_ticketId_idx" ON "pipeline_incidents"("ticketId");

-- CreateIndex
CREATE INDEX "pipeline_incidents_stage_idx" ON "pipeline_incidents"("stage");

-- CreateIndex
CREATE INDEX "pipeline_incidents_severity_idx" ON "pipeline_incidents"("severity");

-- CreateIndex
CREATE INDEX "pipeline_incidents_status_idx" ON "pipeline_incidents"("status");

-- CreateIndex
CREATE INDEX "pipeline_incidents_createdAt_idx" ON "pipeline_incidents"("createdAt");

-- CreateIndex
CREATE INDEX "knowledge_bindings_incidentId_idx" ON "knowledge_bindings"("incidentId");

-- CreateIndex
CREATE INDEX "knowledge_bindings_knowledgeChunkId_idx" ON "knowledge_bindings"("knowledgeChunkId");

-- AddForeignKey
ALTER TABLE "pipeline_incidents" ADD CONSTRAINT "pipeline_incidents_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "recording_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_bindings" ADD CONSTRAINT "knowledge_bindings_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "pipeline_incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
