/*
  Warnings:

  - You are about to drop the column `joinedAt` on the `Activity` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[image_id]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creator_id` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "joinedAt",
ADD COLUMN     "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creator_id" TEXT NOT NULL,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "entry_fee" DOUBLE PRECISION,
ADD COLUMN     "guest_limit" INTEGER,
ADD COLUMN     "image_id" TEXT,
ADD COLUMN     "start_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "title" VARCHAR(255) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Event_image_id_key" ON "Event"("image_id");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
