-- CreateEnum
CREATE TYPE "EntryCondition" AS ENUM ('FREE', 'DONATION', 'PAID');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "currencyId" INTEGER,
ADD COLUMN     "entry_condition" "EntryCondition" NOT NULL DEFAULT 'FREE';

-- CreateTable
CREATE TABLE "Currency" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Currency_code_key" ON "Currency"("code");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
