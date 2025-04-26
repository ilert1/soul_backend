-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ExperienceType" ADD VALUE 'CHECKIN_7_DAYS';
ALTER TYPE "ExperienceType" ADD VALUE 'CHECKED_SOCIAL_MEDIA';
ALTER TYPE "ExperienceType" ADD VALUE 'SHARED_ABOUT_SOUL';
ALTER TYPE "ExperienceType" ADD VALUE 'PREMIUM_SUPPORT';
ALTER TYPE "ExperienceType" ADD VALUE 'PROFILE_COMPLETED';
ALTER TYPE "ExperienceType" ADD VALUE 'VIEWED_HOW_IT_WORKS';
