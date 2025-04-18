-- AlterTable
ALTER TABLE "TelegramUser" ALTER COLUMN "telegramId" SET DATA TYPE TEXT,
ADD CONSTRAINT "TelegramUser_pkey" PRIMARY KEY ("telegramId");
