ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "board_days_offset" jsonb NOT NULL DEFAULT '{}';
