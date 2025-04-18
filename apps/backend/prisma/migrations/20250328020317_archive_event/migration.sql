/*
  Warnings:

  - The values [CREATION_EVENT_CHARGE] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `date` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Event` table. All the data in the column will be lost.
  - Added the required column `finish_date` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('WELCOME_BONUS', 'FARM_REWARD', 'REFERRAL_REWARD', 'TASK_REWARD', 'FORUM_REWARD', 'BUST_FRIENDS_CHARGE', 'EVENT_FUND_DEPOSIT', 'EVENT_FUND_DISTRIBUTION', 'EVENT_FUND_REFUND', 'EVENT_CREATION_CHARGE');
ALTER TABLE "Transaction" ALTER COLUMN "type" TYPE "TransactionType_new" USING ("type"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "TransactionType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "date",
DROP COLUMN "duration",
ADD COLUMN     "finish_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL;
