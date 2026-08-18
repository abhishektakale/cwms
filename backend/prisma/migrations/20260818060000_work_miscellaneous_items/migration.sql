-- CreateTable
CREATE TABLE "work_miscellaneous_items" (
    "id" UUID NOT NULL,
    "work_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "work_miscellaneous_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_work_misc_work" ON "work_miscellaneous_items"("work_id");

-- AddForeignKey
ALTER TABLE "work_miscellaneous_items" ADD CONSTRAINT "work_miscellaneous_items_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "works"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill one line from the old single label + amount
INSERT INTO "work_miscellaneous_items" ("id", "work_id", "name", "amount", "sort_order")
SELECT
    gen_random_uuid(),
    "id",
    COALESCE(NULLIF(BTRIM("miscellaneous_label"), ''), 'Miscellaneous'),
    "miscellaneous_value",
    0
FROM "works"
WHERE "miscellaneous_value" <> 0
   OR ("miscellaneous_label" IS NOT NULL AND BTRIM("miscellaneous_label") <> '');
