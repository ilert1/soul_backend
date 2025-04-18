-- AlterTable
ALTER TABLE
    "Activity"
ADD
    COLUMN "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
ADD
    COLUMN "is_confirmed_at" TIMESTAMP(3);