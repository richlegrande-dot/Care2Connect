-- CreateEnum
CREATE TYPE "RecordingStatus" AS ENUM ('NEW', 'IN_REVIEW', 'COMPLETE', 'TRANSCRIBED');

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recordings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "transcript" TEXT,
    "duration" INTEGER,
    "status" "RecordingStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recordings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recording_event_logs" (
    "id" TEXT NOT NULL,
    "recordingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recording_event_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_profiles_name_idx" ON "user_profiles"("name");

-- CreateIndex
CREATE INDEX "user_profiles_email_idx" ON "user_profiles"("email");

-- CreateIndex
CREATE INDEX "user_profiles_phone_idx" ON "user_profiles"("phone");

-- CreateIndex
CREATE INDEX "user_profiles_name_email_idx" ON "user_profiles"("name", "email");

-- CreateIndex
CREATE INDEX "user_profiles_name_phone_idx" ON "user_profiles"("name", "phone");

-- CreateIndex
CREATE INDEX "recordings_userId_idx" ON "recordings"("userId");

-- CreateIndex
CREATE INDEX "recordings_status_idx" ON "recordings"("status");

-- CreateIndex
CREATE INDEX "recordings_createdAt_idx" ON "recordings"("createdAt");

-- CreateIndex
CREATE INDEX "recording_event_logs_recordingId_idx" ON "recording_event_logs"("recordingId");

-- CreateIndex
CREATE INDEX "recording_event_logs_userId_idx" ON "recording_event_logs"("userId");

-- CreateIndex
CREATE INDEX "recording_event_logs_event_idx" ON "recording_event_logs"("event");

-- CreateIndex
CREATE INDEX "recording_event_logs_createdAt_idx" ON "recording_event_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "recordings" ADD CONSTRAINT "recordings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recording_event_logs" ADD CONSTRAINT "recording_event_logs_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "recordings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
