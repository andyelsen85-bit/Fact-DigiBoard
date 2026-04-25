CREATE TABLE IF NOT EXISTS "irock_evaluations" (
"id" serial PRIMARY KEY NOT NULL,
"patient_id" integer NOT NULL,
"date" text NOT NULL,
"q1" integer DEFAULT 0 NOT NULL,
"q2" integer DEFAULT 0 NOT NULL,
"q3" integer DEFAULT 0 NOT NULL,
"q4" integer DEFAULT 0 NOT NULL,
"q5" integer DEFAULT 0 NOT NULL,
"q6" integer DEFAULT 0 NOT NULL,
"q7" integer DEFAULT 0 NOT NULL,
"q8" integer DEFAULT 0 NOT NULL,
"q9" integer DEFAULT 0 NOT NULL,
"q10" integer DEFAULT 0 NOT NULL,
"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "honos_evaluations" (
"id" serial PRIMARY KEY NOT NULL,
"patient_id" integer NOT NULL,
"date" text NOT NULL,
"q1" integer DEFAULT 0 NOT NULL,
"q2" integer DEFAULT 0 NOT NULL,
"q3" integer DEFAULT 0 NOT NULL,
"q4" integer DEFAULT 0 NOT NULL,
"q5" integer DEFAULT 0 NOT NULL,
"q6" integer DEFAULT 0 NOT NULL,
"q7" integer DEFAULT 0 NOT NULL,
"q8" integer DEFAULT 0 NOT NULL,
"q9" integer DEFAULT 0 NOT NULL,
"q10" integer DEFAULT 0 NOT NULL,
"q11" integer DEFAULT 0 NOT NULL,
"q12" integer DEFAULT 0 NOT NULL,
"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "irock_evaluations" ADD CONSTRAINT "irock_evaluations_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "honos_evaluations" ADD CONSTRAINT "honos_evaluations_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
