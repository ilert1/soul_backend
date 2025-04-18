-- AlterTable
ALTER TABLE "User" ADD COLUMN     "farmingRate" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "Farming" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "finishDate" TIMESTAMP(3) NOT NULL,
    "collected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Farming_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Farming_userId_key" ON "Farming"("userId");

-- AddForeignKey
ALTER TABLE "Farming" ADD CONSTRAINT "Farming_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
