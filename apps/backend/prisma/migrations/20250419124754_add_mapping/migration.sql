/*
  Warnings:

  - You are about to drop the column `eventId` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `receivedPoints` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `averageRating` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `currencyId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `isArchived` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `placeId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Experience` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Experience` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Farming` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedAt` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `inviteeId` on the `Invite` table. All the data in the column will be lost.
  - You are about to drop the column `inviterId` on the `Invite` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `votesForFive` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `votesForFour` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `votesForOne` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `votesForThree` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `votesForTwo` on the `Rating` table. All the data in the column will be lost.
  - The primary key for the `TelegramUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `countryId` on the `TelegramUser` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TelegramUser` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `TelegramUser` table. All the data in the column will be lost.
  - You are about to drop the column `isBot` on the `TelegramUser` table. All the data in the column will be lost.
  - You are about to drop the column `languageCode` on the `TelegramUser` table. All the data in the column will be lost.
  - You are about to drop the column `telegramId` on the `TelegramUser` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TelegramUser` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `TelegramUser` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `fromWalletId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `toWalletId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `availableInvites` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `avatarImageId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `countryId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `farmingRate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `farmingTime` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hashedRefreshToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalInvites` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `Wallet` table. All the data in the column will be lost.
  - You are about to drop the column `isSystem` on the `Wallet` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Wallet` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `Farming` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invitee_id]` on the table `Invite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[telegram_id]` on the table `TelegramUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `TelegramUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[event_id]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `event_id` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `place_id` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Experience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Farming` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mime_type` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invitee_id` to the `Invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inviter_id` to the `Invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Place` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `TelegramUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telegram_id` to the `TelegramUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `TelegramUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `from_wallet_id` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to_wallet_id` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_userId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_placeId_fkey";

-- DropForeignKey
ALTER TABLE "Experience" DROP CONSTRAINT "Experience_userId_fkey";

-- DropForeignKey
ALTER TABLE "Farming" DROP CONSTRAINT "Farming_userId_fkey";

-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_inviteeId_fkey";

-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_inviterId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "TelegramUser" DROP CONSTRAINT "TelegramUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_fromWalletId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_toWalletId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_avatarImageId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_countryId_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_userId_fkey";

-- DropIndex
DROP INDEX "Farming_userId_key";

-- DropIndex
DROP INDEX "Invite_inviteeId_key";

-- DropIndex
DROP INDEX "TelegramUser_telegramId_key";

-- DropIndex
DROP INDEX "TelegramUser_userId_key";

-- DropIndex
DROP INDEX "Wallet_eventId_key";

-- DropIndex
DROP INDEX "Wallet_userId_key";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "eventId",
DROP COLUMN "receivedPoints",
DROP COLUMN "userId",
ADD COLUMN     "event_id" TEXT NOT NULL,
ADD COLUMN     "received_points" INTEGER,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "averageRating",
DROP COLUMN "currencyId",
DROP COLUMN "isArchived",
DROP COLUMN "placeId",
ADD COLUMN     "average_rating" DOUBLE PRECISION,
ADD COLUMN     "currency_id" INTEGER,
ADD COLUMN     "is_archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "place_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Experience" DROP COLUMN "createdAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Farming" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "mimeType",
DROP COLUMN "uploadedAt",
ADD COLUMN     "mime_type" TEXT NOT NULL,
ADD COLUMN     "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Invite" DROP COLUMN "inviteeId",
DROP COLUMN "inviterId",
ADD COLUMN     "invitee_id" TEXT NOT NULL,
ADD COLUMN     "inviter_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "createdAt",
DROP COLUMN "isRead",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Place" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Rating" DROP COLUMN "votesForFive",
DROP COLUMN "votesForFour",
DROP COLUMN "votesForOne",
DROP COLUMN "votesForThree",
DROP COLUMN "votesForTwo",
ADD COLUMN     "votes_for_five" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "votes_for_four" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "votes_for_one" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "votes_for_three" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "votes_for_two" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TelegramUser" DROP CONSTRAINT "TelegramUser_pkey",
DROP COLUMN "countryId",
DROP COLUMN "createdAt",
DROP COLUMN "fullName",
DROP COLUMN "isBot",
DROP COLUMN "languageCode",
DROP COLUMN "telegramId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "country_id" INTEGER,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "full_name" TEXT NOT NULL,
ADD COLUMN     "is_bot" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "language_code" TEXT,
ADD COLUMN     "telegram_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT,
ADD CONSTRAINT "TelegramUser_pkey" PRIMARY KEY ("telegram_id");

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "createdAt",
DROP COLUMN "fromWalletId",
DROP COLUMN "toWalletId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "from_wallet_id" TEXT NOT NULL,
ADD COLUMN     "to_wallet_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "availableInvites",
DROP COLUMN "avatarImageId",
DROP COLUMN "countryId",
DROP COLUMN "createdAt",
DROP COLUMN "farmingRate",
DROP COLUMN "farmingTime",
DROP COLUMN "fullName",
DROP COLUMN "hashedRefreshToken",
DROP COLUMN "isActive",
DROP COLUMN "totalInvites",
DROP COLUMN "updatedAt",
ADD COLUMN     "available_invites" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "avatar_image_id" TEXT,
ADD COLUMN     "country_id" INTEGER,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "farming_rate" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "farming_time" INTEGER NOT NULL DEFAULT 28800000,
ADD COLUMN     "full_name" TEXT NOT NULL,
ADD COLUMN     "hashed_refresh_token" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "total_invites" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "eventId",
DROP COLUMN "isSystem",
DROP COLUMN "userId",
ADD COLUMN     "event_id" TEXT,
ADD COLUMN     "is_system" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "user_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Farming_user_id_key" ON "Farming"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_invitee_id_key" ON "Invite"("invitee_id");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramUser_telegram_id_key" ON "TelegramUser"("telegram_id");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramUser_user_id_key" ON "TelegramUser"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_user_id_key" ON "Wallet"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_event_id_key" ON "Wallet"("event_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatar_image_id_fkey" FOREIGN KEY ("avatar_image_id") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelegramUser" ADD CONSTRAINT "TelegramUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_from_wallet_id_fkey" FOREIGN KEY ("from_wallet_id") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_to_wallet_id_fkey" FOREIGN KEY ("to_wallet_id") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_invitee_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Farming" ADD CONSTRAINT "Farming_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
