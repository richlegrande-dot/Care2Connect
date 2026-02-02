/*
  Warnings:

  - A unique constraint covering the columns `[paymentIntentId]` on the table `stripe_attributions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'DISPUTED';
ALTER TYPE "PaymentStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "stripe_attributions" ADD COLUMN     "chargeId" TEXT,
ADD COLUMN     "donorCountry" TEXT,
ADD COLUMN     "donorEmailHash" TEXT,
ADD COLUMN     "donorLastName" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "stripeCreatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "stripe_events" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripeEventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "stripeCreated" TIMESTAMP(3) NOT NULL,
    "livemode" BOOLEAN NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error" TEXT,

    CONSTRAINT "stripe_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stripe_events_stripeEventId_key" ON "stripe_events"("stripeEventId");

-- CreateIndex
CREATE INDEX "stripe_events_stripeEventId_idx" ON "stripe_events"("stripeEventId");

-- CreateIndex
CREATE INDEX "stripe_events_type_idx" ON "stripe_events"("type");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_attributions_paymentIntentId_key" ON "stripe_attributions"("paymentIntentId");

-- CreateIndex
CREATE INDEX "stripe_attributions_paymentIntentId_idx" ON "stripe_attributions"("paymentIntentId");
