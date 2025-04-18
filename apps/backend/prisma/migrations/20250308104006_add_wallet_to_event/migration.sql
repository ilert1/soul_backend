/*
  Warnings:

  - A unique constraint covering the columns `[eventId]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "eventId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_eventId_key" ON "Wallet"("eventId");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
