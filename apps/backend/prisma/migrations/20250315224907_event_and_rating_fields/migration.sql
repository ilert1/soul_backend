-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "rating" INTEGER;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "averageRating" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "event_id" TEXT,
    "votesForOne" INTEGER NOT NULL DEFAULT 0,
    "votesForTwo" INTEGER NOT NULL DEFAULT 0,
    "votesForThree" INTEGER NOT NULL DEFAULT 0,
    "votesForFour" INTEGER NOT NULL DEFAULT 0,
    "votesForFive" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rating_event_id_key" ON "Rating"("event_id");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
