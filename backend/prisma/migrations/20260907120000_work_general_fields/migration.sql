-- AlterTable
ALTER TABLE "works" ADD COLUMN "e_tender_id" VARCHAR(100),
ADD COLUMN "emd_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN "security_deposit_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN "completion_duration_months" DECIMAL(9,2),
ADD COLUMN "dlp_months" INTEGER;
