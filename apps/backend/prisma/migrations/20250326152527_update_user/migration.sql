/*
  Warnings:

  - You are about to drop the column `firstName` on the `TelegramUser` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `TelegramUser` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - Added the required column `fullName` to the `TelegramUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRanks" AS ENUM ('user', 'ambassador');

-- AlterTable
ALTER TABLE "TelegramUser" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "fullName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "experience" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "rank" "UserRanks" NOT NULL DEFAULT 'user';
