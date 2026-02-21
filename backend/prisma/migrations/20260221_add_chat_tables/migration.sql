-- CreateEnum (only if not exists)
DO $$ BEGIN
  CREATE TYPE "V2ChatMode" AS ENUM ('DETERMINISTIC', 'LLM');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "V2ChatRole" AS ENUM ('user', 'assistant', 'system');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateTable: v2_intake_chat_threads
CREATE TABLE IF NOT EXISTS "v2_intake_chat_threads" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "mode" "V2ChatMode" NOT NULL DEFAULT 'DETERMINISTIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_intake_chat_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable: v2_intake_chat_messages
CREATE TABLE IF NOT EXISTS "v2_intake_chat_messages" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "role" "V2ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "redacted" BOOLEAN NOT NULL DEFAULT false,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "v2_intake_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "v2_intake_chat_threads_sessionId_key" ON "v2_intake_chat_threads"("sessionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "v2_intake_chat_messages_threadId_idx" ON "v2_intake_chat_messages"("threadId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "v2_intake_chat_messages_createdAt_idx" ON "v2_intake_chat_messages"("createdAt");

-- AddForeignKey
ALTER TABLE "v2_intake_chat_threads" ADD CONSTRAINT "v2_intake_chat_threads_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "v2_intake_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_intake_chat_messages" ADD CONSTRAINT "v2_intake_chat_messages_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "v2_intake_chat_threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
