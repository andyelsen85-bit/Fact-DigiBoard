ALTER TABLE "icd10_codes" ADD COLUMN IF NOT EXISTS "title_en" text;--> statement-breakpoint
ALTER TABLE "icd10_codes" ADD COLUMN IF NOT EXISTS "title_de" text;--> statement-breakpoint
ALTER TABLE "icd10_codes" ADD COLUMN IF NOT EXISTS "title_nl" text;--> statement-breakpoint
ALTER TABLE "icd10_codes" ADD COLUMN IF NOT EXISTS "description_en" text;--> statement-breakpoint
ALTER TABLE "icd10_codes" ADD COLUMN IF NOT EXISTS "description_de" text;--> statement-breakpoint
ALTER TABLE "icd10_codes" ADD COLUMN IF NOT EXISTS "description_nl" text;--> statement-breakpoint
ALTER TABLE "icd10_codes" ADD COLUMN IF NOT EXISTS "risks_en" text;--> statement-breakpoint
ALTER TABLE "icd10_codes" ADD COLUMN IF NOT EXISTS "risks_de" text;--> statement-breakpoint
ALTER TABLE "icd10_codes" ADD COLUMN IF NOT EXISTS "risks_nl" text;
