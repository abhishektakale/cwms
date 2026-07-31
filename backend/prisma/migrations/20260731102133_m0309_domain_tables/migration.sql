-- CreateEnum
CREATE TYPE "bill_type" AS ENUM ('RaBill', 'FinalBill');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('Pending', 'PartiallyReceived', 'FullyReceived');

-- CreateEnum
CREATE TYPE "deduction_kind" AS ENUM ('Standard', 'Other');

-- CreateEnum
CREATE TYPE "expense_type" AS ENUM ('WorkSpecific', 'General');

-- CreateEnum
CREATE TYPE "expense_status" AS ENUM ('Draft', 'Paid', 'AssignedToWork', 'Cancelled');

-- CreateEnum
CREATE TYPE "payment_mode" AS ENUM ('Cash', 'BankTransfer', 'Cheque', 'UPI');

-- CreateEnum
CREATE TYPE "backup_type" AS ENUM ('Automatic', 'Initial');

-- CreateEnum
CREATE TYPE "backup_status" AS ENUM ('Success', 'Failed', 'Running');

-- CreateEnum
CREATE TYPE "report_type" AS ENUM ('work-register', 'billing', 'expenditure', 'financial-summary', 'work-wise-summary', 'pending-payment', 'document-register', 'general-expense', 'dashboard-summary');

-- CreateTable
CREATE TABLE "app_settings" (
    "key" VARCHAR(100) NOT NULL,
    "value_json" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "stored_files" (
    "id" UUID NOT NULL,
    "storage_key" VARCHAR(500) NOT NULL,
    "original_file_name" VARCHAR(255) NOT NULL,
    "content_type" VARCHAR(100) NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "checksum_sha256" CHAR(64),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stored_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "document_code" VARCHAR(20),
    "work_id" UUID NOT NULL,
    "document_type_id" UUID NOT NULL,
    "document_number" VARCHAR(100),
    "title" VARCHAR(300),
    "stored_file_id" UUID NOT NULL,
    "remarks" TEXT,
    "uploaded_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimates" (
    "id" UUID NOT NULL,
    "work_id" UUID NOT NULL,
    "estimate_no" VARCHAR(100) NOT NULL,
    "estimate_date" DATE NOT NULL,
    "estimated_amount" DECIMAL(18,2) NOT NULL,
    "revised_estimate" DECIMAL(18,2),
    "approved_by" VARCHAR(200),
    "document_id" UUID,
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" UUID,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by_user_id" UUID,

    CONSTRAINT "estimates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_activities" (
    "id" UUID NOT NULL,
    "work_id" UUID NOT NULL,
    "activity" VARCHAR(300) NOT NULL,
    "start_date" DATE,
    "finish_date" DATE,
    "actual_start" DATE,
    "actual_finish" DATE,
    "progress_percent" DECIMAL(9,4) NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by_user_id" UUID,
    "updated_by_user_id" UUID,

    CONSTRAINT "schedule_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bills" (
    "id" UUID NOT NULL,
    "system_bill_number" VARCHAR(20) NOT NULL,
    "work_id" UUID NOT NULL,
    "bill_type" "bill_type" NOT NULL,
    "ra_bill_no" VARCHAR(50),
    "bill_date" DATE NOT NULL,
    "period_from" DATE,
    "period_to" DATE,
    "previous_bill_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "current_work_portion_amount" DECIMAL(18,2) NOT NULL,
    "gst_amount" DECIMAL(18,2) NOT NULL,
    "gross_bill_amount" DECIMAL(18,2) NOT NULL,
    "total_deductions" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "net_bill_amount" DECIMAL(18,2) NOT NULL,
    "payment_status" "payment_status" NOT NULL,
    "payment_date" DATE,
    "amount_received" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "outstanding_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "utr_cheque_no" VARCHAR(100),
    "bank_name" VARCHAR(200),
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" UUID,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by_user_id" UUID,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bill_deductions" (
    "id" UUID NOT NULL,
    "bill_id" UUID NOT NULL,
    "deduction_head_id" UUID,
    "name" VARCHAR(200) NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "kind" "deduction_kind" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "bill_deductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL,
    "expense_code" VARCHAR(20),
    "expense_type" "expense_type" NOT NULL,
    "work_id" UUID,
    "expense_date" DATE NOT NULL,
    "expense_head_id" UUID NOT NULL,
    "vendor" VARCHAR(300),
    "description" TEXT,
    "invoice_no" VARCHAR(100),
    "invoice_date" DATE,
    "expense_value" DECIMAL(18,2) NOT NULL,
    "gst_percent" DECIMAL(9,4) NOT NULL DEFAULT 0,
    "gst_amount" DECIMAL(18,2) NOT NULL,
    "total_amount" DECIMAL(18,2) NOT NULL,
    "payment_mode" "payment_mode",
    "payment_reference" VARCHAR(100),
    "payment_date" DATE,
    "status" "expense_status" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" UUID,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by_user_id" UUID,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_attachments" (
    "id" UUID NOT NULL,
    "expense_id" UUID NOT NULL,
    "stored_file_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_report_filters" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "report_type" "report_type" NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "filters_json" JSONB NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "saved_report_filters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_records" (
    "id" UUID NOT NULL,
    "identifier" VARCHAR(100) NOT NULL,
    "backup_type" "backup_type" NOT NULL,
    "status" "backup_status" NOT NULL,
    "started_at" TIMESTAMPTZ(3) NOT NULL,
    "finished_at" TIMESTAMPTZ(3),
    "retain_until" TIMESTAMPTZ(3),
    "message" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backup_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_artifacts" (
    "id" UUID NOT NULL,
    "backup_record_id" UUID NOT NULL,
    "storage_prefix" VARCHAR(500) NOT NULL,
    "db_dump_key" VARCHAR(500),
    "manifest_json" JSONB,
    "size_bytes" BIGINT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backup_artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stored_files_storage_key_key" ON "stored_files"("storage_key");

-- CreateIndex
CREATE UNIQUE INDEX "documents_document_code_key" ON "documents"("document_code");

-- CreateIndex
CREATE UNIQUE INDEX "documents_stored_file_id_key" ON "documents"("stored_file_id");

-- CreateIndex
CREATE INDEX "ix_documents_work" ON "documents"("work_id");

-- CreateIndex
CREATE INDEX "ix_documents_type" ON "documents"("document_type_id");

-- CreateIndex
CREATE INDEX "ix_documents_uploaded" ON "documents"("uploaded_at");

-- CreateIndex
CREATE INDEX "ix_estimates_work" ON "estimates"("work_id");

-- CreateIndex
CREATE INDEX "ix_schedule_work" ON "schedule_activities"("work_id");

-- CreateIndex
CREATE INDEX "ix_schedule_finish" ON "schedule_activities"("finish_date");

-- CreateIndex
CREATE UNIQUE INDEX "bills_system_bill_number_key" ON "bills"("system_bill_number");

-- CreateIndex
CREATE INDEX "ix_bills_work" ON "bills"("work_id");

-- CreateIndex
CREATE INDEX "ix_bills_date" ON "bills"("bill_date");

-- CreateIndex
CREATE INDEX "ix_bills_payment_status" ON "bills"("payment_status");

-- CreateIndex
CREATE INDEX "ix_bills_type" ON "bills"("bill_type");

-- CreateIndex
CREATE INDEX "ix_bill_deductions_bill" ON "bill_deductions"("bill_id");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_expense_code_key" ON "expenses"("expense_code");

-- CreateIndex
CREATE INDEX "ix_expenses_work" ON "expenses"("work_id");

-- CreateIndex
CREATE INDEX "ix_expenses_type" ON "expenses"("expense_type");

-- CreateIndex
CREATE INDEX "ix_expenses_status" ON "expenses"("status");

-- CreateIndex
CREATE INDEX "ix_expenses_date" ON "expenses"("expense_date");

-- CreateIndex
CREATE INDEX "ix_expenses_head" ON "expenses"("expense_head_id");

-- CreateIndex
CREATE INDEX "ix_expenses_vendor" ON "expenses"("vendor");

-- CreateIndex
CREATE UNIQUE INDEX "expense_attachments_stored_file_id_key" ON "expense_attachments"("stored_file_id");

-- CreateIndex
CREATE INDEX "ix_expense_attachments_expense" ON "expense_attachments"("expense_id");

-- CreateIndex
CREATE INDEX "ix_saved_filters_user_report" ON "saved_report_filters"("user_id", "report_type");

-- CreateIndex
CREATE UNIQUE INDEX "backup_records_identifier_key" ON "backup_records"("identifier");

-- CreateIndex
CREATE INDEX "ix_backup_status" ON "backup_records"("status");

-- CreateIndex
CREATE INDEX "ix_backup_retain" ON "backup_records"("retain_until");

-- CreateIndex
CREATE UNIQUE INDEX "backup_artifacts_backup_record_id_key" ON "backup_artifacts"("backup_record_id");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "master_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_stored_file_id_fkey" FOREIGN KEY ("stored_file_id") REFERENCES "stored_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_activities" ADD CONSTRAINT "schedule_activities_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_deductions" ADD CONSTRAINT "bill_deductions_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_deductions" ADD CONSTRAINT "bill_deductions_deduction_head_id_fkey" FOREIGN KEY ("deduction_head_id") REFERENCES "master_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_expense_head_id_fkey" FOREIGN KEY ("expense_head_id") REFERENCES "master_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_attachments" ADD CONSTRAINT "expense_attachments_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_attachments" ADD CONSTRAINT "expense_attachments_stored_file_id_fkey" FOREIGN KEY ("stored_file_id") REFERENCES "stored_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_report_filters" ADD CONSTRAINT "saved_report_filters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backup_artifacts" ADD CONSTRAINT "backup_artifacts_backup_record_id_fkey" FOREIGN KEY ("backup_record_id") REFERENCES "backup_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
