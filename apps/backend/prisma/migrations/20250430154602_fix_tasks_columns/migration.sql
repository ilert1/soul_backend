/*
  Warnings:

  - You are about to drop the column `createdAt` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `rewardSp` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `user_task_progress` table. All the data in the column will be lost.
  - You are about to drop the column `taskKey` on the `user_task_progress` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_task_progress` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,task_key]` on the table `user_task_progress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `task_key` to the `user_task_progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `user_task_progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `user_task_progress` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LeaderboardType" AS ENUM ('XP', 'SP');

-- AlterEnum
ALTER TYPE "TaskStatus" ADD VALUE 'PENDING_CHECK';

-- DropForeignKey
ALTER TABLE "user_task_progress" DROP CONSTRAINT "user_task_progress_taskKey_fkey";

-- DropForeignKey
ALTER TABLE "user_task_progress" DROP CONSTRAINT "user_task_progress_userId_fkey";

-- DropIndex
DROP INDEX "user_task_progress_userId_taskKey_key";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "createdAt",
DROP COLUMN "rewardSp",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "parent_key" "TaskList",
ADD COLUMN     "reward_sp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user_task_progress" DROP COLUMN "created_at",
DROP COLUMN "taskKey",
DROP COLUMN "userId",
ADD COLUMN     "task_key" "TaskList" NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_task_progress_user_id_task_key_key" ON "user_task_progress"("user_id", "task_key");

-- AddForeignKey
ALTER TABLE "user_task_progress" ADD CONSTRAINT "user_task_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_task_progress" ADD CONSTRAINT "user_task_progress_task_key_fkey" FOREIGN KEY ("task_key") REFERENCES "tasks"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
