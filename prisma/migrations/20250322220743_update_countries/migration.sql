/*
  Warnings:

  - You are about to drop the column `emoji` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the column `unicode` on the `Country` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Country" DROP COLUMN "emoji",
DROP COLUMN "unicode";
