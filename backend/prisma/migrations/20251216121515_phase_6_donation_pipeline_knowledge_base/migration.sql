-- CreateEnum
CREATE TYPE "TranscriptionSource" AS ENUM ('WEB_RECORDING', 'UPLOAD', 'API', 'SYSTEM_SMOKE_TEST');

-- CreateEnum
CREATE TYPE "TranscriptionEngine" AS ENUM ('OPENAI', 'NVT', 'EVTS', 'EVTS_WHISPER', 'EVTS_VOSK', 'WHISPER', 'MANUAL');

-- CreateEnum
CREATE TYPE "TranscriptionStatus" AS ENUM ('SUCCESS', 'PARTIAL', 'FAILED', 'PROCESSING');

-- CreateEnum
CREATE TYPE "TranscriptionStage" AS ENUM ('UPLOAD', 'DECODE', 'TRANSCRIBE', 'ANALYZE', 'PERSIST', 'VALIDATION');

-- CreateEnum
CREATE TYPE "TuningScope" AS ENUM ('GLOBAL', 'LANGUAGE', 'ROUTE', 'ENGINE');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ProfileTicketStatus" AS ENUM ('CREATED', 'UPLOADING', 'TRANSCRIBING', 'ANALYZING', 'GENERATING_QR', 'GENERATING_DOC', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('EMAIL', 'PHONE');

-- CreateEnum
CREATE TYPE "RecordingTicketStatus" AS ENUM ('DRAFT', 'RECORDING', 'PROCESSING', 'READY', 'PUBLISHED', 'ERROR');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('GOFUNDME_DRAFT', 'RECEIPT', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "KnowledgeSourceType" AS ENUM ('DOC', 'URL', 'NOTE', 'IMPORT');

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "summary" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "lastCheckPayload" JSONB,
    "recommendation" TEXT NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ticketId" TEXT,
    "recordingTicketId" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "contact" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "systemSnapshot" JSONB,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_tickets" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "age" INTEGER,
    "location" TEXT,
    "story" TEXT,
    "status" "ProfileTicketStatus" NOT NULL DEFAULT 'CREATED',
    "transcriptionId" TEXT,
    "analysisComplete" BOOLEAN NOT NULL DEFAULT false,
    "qrCodeUrl" TEXT,
    "gofundmeDraftUrl" TEXT,
    "profilePageUrl" TEXT,
    "language" TEXT,
    "processingErrors" JSONB,

    CONSTRAINT "profile_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_check_runs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uptime" INTEGER NOT NULL,
    "cpuUsage" DOUBLE PRECISION,
    "memoryUsage" DOUBLE PRECISION,
    "eventLoopDelay" DOUBLE PRECISION,
    "checks" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "latency" INTEGER,

    CONSTRAINT "health_check_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcription_sessions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "anonymousId" TEXT,
    "recordingTicketId" TEXT,
    "source" "TranscriptionSource" NOT NULL,
    "engine" "TranscriptionEngine" NOT NULL,
    "engineVersion" TEXT,
    "languageHint" TEXT,
    "detectedLanguage" TEXT,
    "durationMs" INTEGER,
    "sampleRate" INTEGER,
    "channelCount" INTEGER,
    "status" "TranscriptionStatus" NOT NULL,
    "consentToStoreText" BOOLEAN NOT NULL DEFAULT false,
    "consentToStoreMetrics" BOOLEAN NOT NULL DEFAULT true,
    "transcriptText" TEXT,
    "transcriptPreview" TEXT,
    "redactionApplied" BOOLEAN NOT NULL DEFAULT false,
    "retentionUntil" TIMESTAMP(3),

    CONSTRAINT "transcription_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcription_segments" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "startMs" INTEGER NOT NULL,
    "endMs" INTEGER NOT NULL,
    "text" TEXT,
    "confidence" DOUBLE PRECISION,
    "tokens" INTEGER,

    CONSTRAINT "transcription_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speech_analysis_results" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,
    "analyzerVersion" TEXT NOT NULL,
    "resultJson" JSONB NOT NULL,
    "qualityScore" DOUBLE PRECISION,
    "warnings" JSONB,

    CONSTRAINT "speech_analysis_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcription_error_events" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,
    "engine" "TranscriptionEngine",
    "stage" "TranscriptionStage" NOT NULL,
    "errorCode" TEXT NOT NULL,
    "errorMessageSafe" TEXT NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "isTransient" BOOLEAN NOT NULL DEFAULT false,
    "metaJson" JSONB,

    CONSTRAINT "transcription_error_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcription_feedback" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "issueTags" TEXT[],
    "correctedTranscript" TEXT,
    "notes" TEXT,
    "createdByAdminId" TEXT,

    CONSTRAINT "transcription_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model_tuning_profiles" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "scope" "TuningScope" NOT NULL,
    "scopeKey" TEXT,
    "recommendedEngine" "TranscriptionEngine",
    "vadSensitivity" DOUBLE PRECISION,
    "chunkSeconds" DOUBLE PRECISION,
    "silenceTrimMs" INTEGER,
    "retryPolicyJson" JSONB,
    "sampleCount" INTEGER NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION,
    "avgLatencyMs" DOUBLE PRECISION,
    "lastComputedAt" TIMESTAMP(3),

    CONSTRAINT "model_tuning_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recording_tickets" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "displayName" TEXT,
    "contactType" "ContactType" NOT NULL,
    "contactValue" TEXT NOT NULL,
    "status" "RecordingTicketStatus" NOT NULL DEFAULT 'DRAFT',
    "lastStep" TEXT,
    "audioFileId" TEXT,
    "audioUrl" TEXT,

    CONSTRAINT "recording_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donation_drafts" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ticketId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "goalAmount" DECIMAL(65,30),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "story" TEXT NOT NULL,
    "beneficiary" TEXT,
    "location" TEXT,
    "editableJson" JSONB,
    "finalizedAt" TIMESTAMP(3),

    CONSTRAINT "donation_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_documents" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ticketId" TEXT NOT NULL,
    "docType" "DocumentType" NOT NULL,
    "storageUrl" TEXT,
    "filePath" TEXT,
    "sha256" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,

    CONSTRAINT "generated_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_attributions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ticketId" TEXT NOT NULL,
    "checkoutSessionId" TEXT NOT NULL,
    "paymentIntentId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
    "webhookEventId" TEXT,
    "metadataSnapshot" JSONB,

    CONSTRAINT "stripe_attributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_code_links" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ticketId" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "imageStorageUrl" TEXT,

    CONSTRAINT "qr_code_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_sources" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sourceType" "KnowledgeSourceType" NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "licenseNote" TEXT,
    "fetchedAt" TIMESTAMP(3),
    "contentHash" TEXT,

    CONSTRAINT "knowledge_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_chunks" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceId" TEXT NOT NULL,
    "chunkText" TEXT NOT NULL,
    "tags" TEXT[],
    "language" TEXT,

    CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_ticketId_idx" ON "support_tickets"("ticketId");

-- CreateIndex
CREATE INDEX "support_tickets_recordingTicketId_idx" ON "support_tickets"("recordingTicketId");

-- CreateIndex
CREATE INDEX "profile_tickets_status_idx" ON "profile_tickets"("status");

-- CreateIndex
CREATE INDEX "health_check_runs_createdAt_idx" ON "health_check_runs"("createdAt");

-- CreateIndex
CREATE INDEX "transcription_sessions_userId_idx" ON "transcription_sessions"("userId");

-- CreateIndex
CREATE INDEX "transcription_sessions_recordingTicketId_idx" ON "transcription_sessions"("recordingTicketId");

-- CreateIndex
CREATE INDEX "transcription_sessions_status_idx" ON "transcription_sessions"("status");

-- CreateIndex
CREATE INDEX "transcription_sessions_engine_idx" ON "transcription_sessions"("engine");

-- CreateIndex
CREATE INDEX "transcription_sessions_createdAt_idx" ON "transcription_sessions"("createdAt");

-- CreateIndex
CREATE INDEX "transcription_sessions_retentionUntil_idx" ON "transcription_sessions"("retentionUntil");

-- CreateIndex
CREATE INDEX "transcription_segments_sessionId_idx" ON "transcription_segments"("sessionId");

-- CreateIndex
CREATE INDEX "speech_analysis_results_sessionId_idx" ON "speech_analysis_results"("sessionId");

-- CreateIndex
CREATE INDEX "transcription_error_events_sessionId_idx" ON "transcription_error_events"("sessionId");

-- CreateIndex
CREATE INDEX "transcription_error_events_errorCode_idx" ON "transcription_error_events"("errorCode");

-- CreateIndex
CREATE INDEX "transcription_error_events_stage_idx" ON "transcription_error_events"("stage");

-- CreateIndex
CREATE INDEX "transcription_feedback_sessionId_idx" ON "transcription_feedback"("sessionId");

-- CreateIndex
CREATE INDEX "transcription_feedback_rating_idx" ON "transcription_feedback"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "model_tuning_profiles_scope_scopeKey_key" ON "model_tuning_profiles"("scope", "scopeKey");

-- CreateIndex
CREATE INDEX "recording_tickets_contactType_contactValue_idx" ON "recording_tickets"("contactType", "contactValue");

-- CreateIndex
CREATE INDEX "recording_tickets_status_idx" ON "recording_tickets"("status");

-- CreateIndex
CREATE INDEX "recording_tickets_createdAt_idx" ON "recording_tickets"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "donation_drafts_ticketId_key" ON "donation_drafts"("ticketId");

-- CreateIndex
CREATE INDEX "donation_drafts_ticketId_idx" ON "donation_drafts"("ticketId");

-- CreateIndex
CREATE INDEX "generated_documents_ticketId_idx" ON "generated_documents"("ticketId");

-- CreateIndex
CREATE INDEX "generated_documents_docType_idx" ON "generated_documents"("docType");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_attributions_checkoutSessionId_key" ON "stripe_attributions"("checkoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_attributions_webhookEventId_key" ON "stripe_attributions"("webhookEventId");

-- CreateIndex
CREATE INDEX "stripe_attributions_ticketId_idx" ON "stripe_attributions"("ticketId");

-- CreateIndex
CREATE INDEX "stripe_attributions_status_idx" ON "stripe_attributions"("status");

-- CreateIndex
CREATE INDEX "stripe_attributions_createdAt_idx" ON "stripe_attributions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "qr_code_links_ticketId_key" ON "qr_code_links"("ticketId");

-- CreateIndex
CREATE INDEX "knowledge_sources_sourceType_idx" ON "knowledge_sources"("sourceType");

-- CreateIndex
CREATE INDEX "knowledge_sources_createdAt_idx" ON "knowledge_sources"("createdAt");

-- CreateIndex
CREATE INDEX "knowledge_chunks_sourceId_idx" ON "knowledge_chunks"("sourceId");

-- CreateIndex
CREATE INDEX "knowledge_chunks_language_idx" ON "knowledge_chunks"("language");

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_recordingTicketId_fkey" FOREIGN KEY ("recordingTicketId") REFERENCES "recording_tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcription_sessions" ADD CONSTRAINT "transcription_sessions_recordingTicketId_fkey" FOREIGN KEY ("recordingTicketId") REFERENCES "recording_tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcription_segments" ADD CONSTRAINT "transcription_segments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "transcription_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "speech_analysis_results" ADD CONSTRAINT "speech_analysis_results_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "transcription_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcription_error_events" ADD CONSTRAINT "transcription_error_events_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "transcription_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcription_feedback" ADD CONSTRAINT "transcription_feedback_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "transcription_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_drafts" ADD CONSTRAINT "donation_drafts_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "recording_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "recording_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stripe_attributions" ADD CONSTRAINT "stripe_attributions_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "recording_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_code_links" ADD CONSTRAINT "qr_code_links_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "recording_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "knowledge_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
