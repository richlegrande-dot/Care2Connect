-- Add generation mode and manual edit tracking to DonationDraft
ALTER TABLE "donation_drafts" ADD COLUMN "generationMode" TEXT DEFAULT 'AUTOMATED';
ALTER TABLE "donation_drafts" ADD COLUMN "extractedAt" TIMESTAMP(3);
ALTER TABLE "donation_drafts" ADD COLUMN "manuallyEditedAt" TIMESTAMP(3);

-- Create SystemIncident table for pipeline fallback logging
CREATE TABLE "system_incidents" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,

    CONSTRAINT "system_incidents_pkey" PRIMARY KEY ("id")
);

-- Add indexes for performance
CREATE INDEX "system_incidents_severity_idx" ON "system_incidents"("severity");
CREATE INDEX "system_incidents_category_idx" ON "system_incidents"("category");
CREATE INDEX "system_incidents_occurredAt_idx" ON "system_incidents"("occurredAt");
CREATE INDEX "system_incidents_resolved_idx" ON "system_incidents"("resolved");

-- Add index for generation mode queries
CREATE INDEX "donation_drafts_generationMode_idx" ON "donation_drafts"("generationMode");
