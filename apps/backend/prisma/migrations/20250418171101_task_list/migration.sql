/*
  Warnings:

  - The primary key for the `Task` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `taskId` on the `UserTaskProgress` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,taskKey]` on the table `UserTaskProgress` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `key` on the `Task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `taskKey` to the `UserTaskProgress` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaskList" AS ENUM ('CHECKIN', 'PROFILE_COMPLETED');

-- DropForeignKey
ALTER TABLE "UserTaskProgress" DROP CONSTRAINT "UserTaskProgress_taskId_fkey";

-- DropIndex
DROP INDEX "UserTaskProgress_userId_taskId_key";

-- AlterTable
ALTER TABLE "Task" DROP CONSTRAINT "Task_pkey",
DROP COLUMN "key",
ADD COLUMN     "key" "TaskList" NOT NULL,
ADD CONSTRAINT "Task_pkey" PRIMARY KEY ("key");

-- AlterTable
ALTER TABLE "UserTaskProgress" DROP COLUMN "taskId",
ADD COLUMN     "taskKey" "TaskList" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserTaskProgress_userId_taskKey_key" ON "UserTaskProgress"("userId", "taskKey");

-- AddForeignKey
ALTER TABLE "UserTaskProgress" ADD CONSTRAINT "UserTaskProgress_taskKey_fkey" FOREIGN KEY ("taskKey") REFERENCES "Task"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
