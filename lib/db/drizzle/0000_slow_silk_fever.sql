CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"must_change_password" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patients" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_num" text NOT NULL,
	"nom" text NOT NULL,
	"prenom" text NOT NULL,
	"dob" text,
	"adresse" text,
	"tel" text,
	"sexe" text,
	"medecin_famille" text,
	"patho" text,
	"psy" text,
	"responsable" text,
	"casemanager2" text,
	"demande" text,
	"date_premier_contact" text,
	"date_entree" text,
	"date_sortie" text,
	"agressivite" integer DEFAULT 0 NOT NULL,
	"article" text,
	"curatelle" text,
	"remarques" text,
	"board" text DEFAULT 'PréAdmission' NOT NULL,
	"phase" text,
	"board_entry_date" text,
	"passages" jsonb DEFAULT '{}'::jsonb,
	"recovery_objectifs" text,
	"recovery_etape" text,
	"recovery_action" text,
	"infos_recoltees" text,
	"motif_irrecevable" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"photo" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meeting_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"date" text,
	"texte" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "history_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"date" text NOT NULL,
	"action" text NOT NULL,
	"board_to" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "act_regions" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "act_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"region_id" integer NOT NULL,
	"date" text,
	"texte" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "icd10_codes" (
	"code" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"risks" text,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "meeting_notes" ADD CONSTRAINT "meeting_notes_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "history_entries" ADD CONSTRAINT "history_entries_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "act_notes" ADD CONSTRAINT "act_notes_region_id_act_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."act_regions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
