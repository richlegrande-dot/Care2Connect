-- AlterTable
ALTER TABLE "recordings" ADD COLUMN     "donationExcerpt" TEXT,
ADD COLUMN     "donationGoal" INTEGER,
ADD COLUMN     "donationSlug" TEXT,
ADD COLUMN     "donationTitle" TEXT;
