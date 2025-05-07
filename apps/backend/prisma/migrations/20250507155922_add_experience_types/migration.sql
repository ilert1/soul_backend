-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ExperienceType" ADD VALUE 'MESSAGE';
ALTER TYPE "ExperienceType" ADD VALUE 'REACTION';
ALTER TYPE "ExperienceType" ADD VALUE 'REPLY';
ALTER TYPE "ExperienceType" ADD VALUE 'RECEIVED_REACTION';
ALTER TYPE "ExperienceType" ADD VALUE 'RECEIVED_REPLY';
