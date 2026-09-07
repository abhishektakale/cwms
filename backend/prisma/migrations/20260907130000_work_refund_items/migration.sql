-- CreateEnum
CREATE TYPE "work_refund_source" AS ENUM ('WorkDeposit', 'BillDeduction');

-- CreateEnum
CREATE TYPE "work_refund_kind" AS ENUM ('EMD', 'SecurityDeposit', 'PartV');

-- CreateEnum
CREATE TYPE "work_refund_status" AS ENUM ('Withheld', 'Claimable', 'Claimed', 'Received');

-- AlterEnum
ALTER TYPE "report_type" ADD VALUE 'refund-claims';

-- CreateTable
CREATE TABLE "work_refund_items" (
    "id" UUID NOT NULL,
    "work_id" UUID NOT NULL,
    "source" "work_refund_source" NOT NULL,
    "kind" "work_refund_kind" NOT NULL,
    "label" VARCHAR(200) NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "source_bill_id" UUID,
    "source_deduction_id" UUID,
    "claim_due_date" DATE,
    "status" "work_refund_status" NOT NULL DEFAULT 'Withheld',
    "remark" TEXT,
    "claimed_at" TIMESTAMPTZ(3),
    "received_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "work_refund_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_work_refund_items_work_source_kind" ON "work_refund_items"("work_id", "source", "kind");

-- CreateIndex
CREATE INDEX "ix_work_refund_items_work" ON "work_refund_items"("work_id");

-- CreateIndex
CREATE INDEX "ix_work_refund_items_claim_due" ON "work_refund_items"("claim_due_date");

-- CreateIndex
CREATE INDEX "ix_work_refund_items_status" ON "work_refund_items"("status");

-- AddForeignKey
ALTER TABLE "work_refund_items" ADD CONSTRAINT "work_refund_items_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_refund_items" ADD CONSTRAINT "work_refund_items_source_bill_id_fkey" FOREIGN KEY ("source_bill_id") REFERENCES "bills"("id") ON DELETE SET NULL ON UPDATE CASCADE;
