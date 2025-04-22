-- AlterTable
ALTER TABLE "User" ADD COLUMN     "show_activity_to_others" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_soul_points_to_others" BOOLEAN NOT NULL DEFAULT true;
