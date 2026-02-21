/*
  Warnings:

  - Added the required column `updatedAt` to the `knowledge_chunks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('KNOWLEDGE_SOURCE', 'KNOWLEDGE_CHUNK');

-- AlterTable
ALTER TABLE "knowledge_chunks" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "knowledge_sources" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB;

-- CreateTable
CREATE TABLE "knowledge_audit_logs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor" TEXT NOT NULL DEFAULT 'admin',
    "action" "AuditAction" NOT NULL,
    "entityType" "AuditEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "beforeJson" JSONB,
    "afterJson" JSONB,
    "diffJson" JSONB,
    "reason" TEXT,

    CONSTRAINT "knowledge_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "knowledge_audit_logs_action_idx" ON "knowledge_audit_logs"("action");

-- CreateIndex
CREATE INDEX "knowledge_audit_logs_entityType_idx" ON "knowledge_audit_logs"("entityType");

-- CreateIndex
CREATE INDEX "knowledge_audit_logs_entityId_idx" ON "knowledge_audit_logs"("entityId");

-- CreateIndex
CREATE INDEX "knowledge_audit_logs_createdAt_idx" ON "knowledge_audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "knowledge_chunks_isDeleted_idx" ON "knowledge_chunks"("isDeleted");

-- CreateIndex
CREATE INDEX "knowledge_sources_isDeleted_idx" ON "knowledge_sources"("isDeleted");
