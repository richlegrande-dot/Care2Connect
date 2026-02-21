-- CreateTable
CREATE TABLE "recording_issue_logs" (
    "id" TEXT NOT NULL,
    "kioskId" TEXT NOT NULL DEFAULT 'unknown',
    "connectivity" TEXT NOT NULL,
    "errorName" TEXT NOT NULL,
    "permissionState" TEXT,
    "hasAudioInput" BOOLEAN,
    "userAgentSnippet" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recording_issue_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recording_issue_logs_kioskId_idx" ON "recording_issue_logs"("kioskId");

-- CreateIndex
CREATE INDEX "recording_issue_logs_errorName_idx" ON "recording_issue_logs"("errorName");

-- CreateIndex
CREATE INDEX "recording_issue_logs_connectivity_idx" ON "recording_issue_logs"("connectivity");

-- CreateIndex
CREATE INDEX "recording_issue_logs_createdAt_idx" ON "recording_issue_logs"("createdAt");
