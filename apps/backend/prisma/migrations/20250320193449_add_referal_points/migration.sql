/*
  Warnings:

  - Added the required column `updated_at` to the `Invite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invite" ADD COLUMN     "referral_points_given" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "total_referral_points" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
