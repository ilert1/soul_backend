-- CreateEnum
CREATE TYPE "BonusDistributionEnum" AS ENUM ('ALL', 'FIRST', 'FIRST_N');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "bonus_distribution_n" INTEGER,
ADD COLUMN     "bonus_distribution_type" "BonusDistributionEnum" NOT NULL DEFAULT 'ALL';
