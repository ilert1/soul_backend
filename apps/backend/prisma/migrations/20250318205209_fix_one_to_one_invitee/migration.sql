/*
  Warnings:

  - A unique constraint covering the columns `[inviteeId]` on the table `Invite` will be added. If there are existing duplicate values, this will fail.

*/
-- DropEnum
DROP TYPE "InviteStatus";

-- CreateIndex
CREATE UNIQUE INDEX "Invite_inviteeId_key" ON "Invite"("inviteeId");
