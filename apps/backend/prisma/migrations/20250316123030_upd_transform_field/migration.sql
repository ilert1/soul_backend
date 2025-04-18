/*
  Warnings:

  - The values [EARNING,SPENDING,TRANSFER,FUNDING,REFUND,PENALTY,BONUS] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('WELCOME_BONUS', 'FARM_REWARD', 'REFERRAL_REWARD', 'TASK_REWARD', 'FORUM_REWARD', 'BUST_FRIENDS_CHARGE', 'CREATION_EVENT_CHARGE', 'EVENT_FUND_DEPOSIT', 'EVENT_FUND_DISTRIBUTION', 'EVENT_FUND_REFUND');
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "TransactionType_old";
COMMIT;
