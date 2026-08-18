-- AlterTable
ALTER TABLE "bill_deductions" ADD COLUMN "code" VARCHAR(20);

-- CreateTable
CREATE TABLE "bill_additions" (
    "id" UUID NOT NULL,
    "bill_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "bill_additions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_bill_additions_bill" ON "bill_additions"("bill_id");

-- AddForeignKey
ALTER TABLE "bill_additions" ADD CONSTRAINT "bill_additions_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
