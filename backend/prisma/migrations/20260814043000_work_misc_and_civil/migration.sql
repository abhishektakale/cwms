-- AlterTable
ALTER TABLE "works" ADD COLUMN "miscellaneous_label" VARCHAR(200),
ADD COLUMN "miscellaneous_value" DECIMAL(18, 2) NOT NULL DEFAULT 0;
