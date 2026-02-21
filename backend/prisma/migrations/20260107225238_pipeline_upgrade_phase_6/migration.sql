/*
  Warnings:

  - Added the required column `updatedAt` to the `qr_code_links` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "RecordingTicketStatus" ADD VALUE 'NEEDS_INFO';

-- AlterEnum
ALTER TYPE "TranscriptionEngine" ADD VALUE 'ASSEMBLYAI';

-- AlterTable
ALTER TABLE "donation_drafts" ADD COLUMN     "category" TEXT,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "timeline" TEXT,
ADD COLUMN     "urgency" TEXT;

-- AlterTable
ALTER TABLE "qr_code_links" ADD COLUMN     "amountCents" INTEGER,
ADD COLUMN     "scanCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "recording_tickets" ADD COLUMN     "needsInfo" JSONB;

-- CreateTable
CREATE TABLE "qr_code_history" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "qrCodeId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "qr_code_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "qr_code_history_qrCodeId_idx" ON "qr_code_history"("qrCodeId");

-- CreateIndex
CREATE INDEX "qr_code_history_createdAt_idx" ON "qr_code_history"("createdAt");

-- AddForeignKey
ALTER TABLE "qr_code_history" ADD CONSTRAINT "qr_code_history_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "qr_code_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
