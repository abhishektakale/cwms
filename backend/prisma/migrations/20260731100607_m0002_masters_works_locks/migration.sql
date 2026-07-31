-- CreateEnum
CREATE TYPE "master_type" AS ENUM ('work-categories', 'document-types', 'deduction-heads', 'expense-categories', 'client-department-formats');

-- CreateEnum
CREATE TYPE "gst_type" AS ENUM ('GstExtra', 'GstIncluded');

-- CreateEnum
CREATE TYPE "work_status" AS ENUM ('Planned', 'InProgress', 'Hold', 'Completed');

-- CreateEnum
CREATE TYPE "side_code" AS ENUM ('LHS', 'RHS', 'Both');

-- CreateEnum
CREATE TYPE "traffic_light" AS ENUM ('Green', 'Yellow', 'Red');

-- CreateTable
CREATE TABLE "master_options" (
    "id" UUID NOT NULL,
    "master_type" "master_type" NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by_user_id" UUID,
    "updated_by_user_id" UUID,

    CONSTRAINT "master_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "id_sequences" (
    "id" VARCHAR(40) NOT NULL,
    "next_value" INTEGER NOT NULL,

    CONSTRAINT "id_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "works" (
    "id" UUID NOT NULL,
    "work_code" VARCHAR(20) NOT NULL,
    "project_name" VARCHAR(200),
    "work_name" VARCHAR(300) NOT NULL,
    "work_category_id" UUID,
    "client" VARCHAR(300),
    "contractor" VARCHAR(300),
    "client_department_format_id" UUID,
    "work_order_no" VARCHAR(100) NOT NULL,
    "work_order_date" DATE NOT NULL,
    "gst_type" "gst_type" NOT NULL,
    "work_portion_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "gst_percent" DECIMAL(9,4) NOT NULL DEFAULT 0,
    "gst_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "total_work_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "balance_work_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "financial_progress_percent" DECIMAL(9,4) NOT NULL DEFAULT 0,
    "gross_bills_raised" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "payments_received" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "outstanding_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "total_expenditure" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "estimated_profit_loss" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "state" VARCHAR(100),
    "district" VARCHAR(100),
    "taluka" VARCHAR(100),
    "village" VARCHAR(100),
    "existing_chainage" VARCHAR(100),
    "design_chainage" VARCHAR(100),
    "side_code" "side_code",
    "structure_type" VARCHAR(200),
    "start_date" DATE,
    "scheduled_completion" DATE,
    "actual_completion" DATE,
    "physical_progress_percent" DECIMAL(9,4) NOT NULL DEFAULT 0,
    "status" "work_status" NOT NULL,
    "traffic_light" "traffic_light" NOT NULL DEFAULT 'Green',
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" UUID,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by_user_id" UUID,

    CONSTRAINT "works_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_edit_locks" (
    "work_id" UUID NOT NULL,
    "locked_by_user_id" UUID NOT NULL,
    "acquired_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "lock_token" UUID NOT NULL,

    CONSTRAINT "work_edit_locks_pkey" PRIMARY KEY ("work_id")
);

-- CreateIndex
CREATE INDEX "ix_master_type_active" ON "master_options"("master_type", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "uq_master_type_name" ON "master_options"("master_type", "name");

-- CreateIndex
CREATE UNIQUE INDEX "works_work_code_key" ON "works"("work_code");

-- CreateIndex
CREATE INDEX "ix_works_status" ON "works"("status");

-- CreateIndex
CREATE INDEX "ix_works_project_name" ON "works"("project_name");

-- CreateIndex
CREATE INDEX "ix_works_client" ON "works"("client");

-- CreateIndex
CREATE INDEX "ix_works_contractor" ON "works"("contractor");

-- CreateIndex
CREATE INDEX "ix_works_wo_date" ON "works"("work_order_date");

-- CreateIndex
CREATE INDEX "ix_works_category" ON "works"("work_category_id");

-- CreateIndex
CREATE INDEX "ix_works_traffic" ON "works"("traffic_light");

-- CreateIndex
CREATE UNIQUE INDEX "uq_works_work_order_no" ON "works"("work_order_no");

-- CreateIndex
CREATE UNIQUE INDEX "work_edit_locks_lock_token_key" ON "work_edit_locks"("lock_token");

-- CreateIndex
CREATE INDEX "ix_work_locks_expires" ON "work_edit_locks"("expires_at");

-- AddForeignKey
ALTER TABLE "master_options" ADD CONSTRAINT "master_options_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_options" ADD CONSTRAINT "master_options_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "works" ADD CONSTRAINT "works_work_category_id_fkey" FOREIGN KEY ("work_category_id") REFERENCES "master_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "works" ADD CONSTRAINT "works_client_department_format_id_fkey" FOREIGN KEY ("client_department_format_id") REFERENCES "master_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "works" ADD CONSTRAINT "works_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "works" ADD CONSTRAINT "works_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_edit_locks" ADD CONSTRAINT "work_edit_locks_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_edit_locks" ADD CONSTRAINT "work_edit_locks_locked_by_user_id_fkey" FOREIGN KEY ("locked_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
