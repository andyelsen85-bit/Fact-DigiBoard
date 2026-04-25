ALTER TABLE "irock_evaluations" ADD COLUMN IF NOT EXISTS "notes" text;
ALTER TABLE "irock_evaluations" ADD COLUMN IF NOT EXISTS "question_notes" jsonb;
ALTER TABLE "honos_evaluations" ADD COLUMN IF NOT EXISTS "notes" text;
ALTER TABLE "honos_evaluations" ADD COLUMN IF NOT EXISTS "question_notes" jsonb;
