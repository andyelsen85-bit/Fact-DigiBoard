ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "pathos" jsonb;
UPDATE "patients" SET "pathos" = jsonb_build_array("patho") WHERE "patho" IS NOT NULL AND "patho" != '';
