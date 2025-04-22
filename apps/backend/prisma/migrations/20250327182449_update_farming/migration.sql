/*
  Warnings:

  - You are about to drop the column `collected` on the `Farming` table. All the data in the column will be lost.
  - You are about to drop the column `finishDate` on the `Farming` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Farming` table. All the data in the column will be lost.
  - Added the required column `finish_date` to the `Farming` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `Farming` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Farming" DROP COLUMN "collected",
DROP COLUMN "finishDate",
DROP COLUMN "startDate",
ADD COLUMN     "finish_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL;
