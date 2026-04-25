import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const patientsTable = pgTable("patients", {
  id: serial("id").primaryKey(),
  clientNum: text("client_num").notNull(),
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  dob: text("dob"),
  adresse: text("adresse"),
  tel: text("tel"),
  sexe: text("sexe"),
  medecinFamille: text("medecin_famille"),
  patho: text("patho"),
  pathos: jsonb("pathos").$type<string[]>(),
  psy: text("psy"),
  responsable: text("responsable"),
  casemanager2: text("casemanager2"),
  demande: text("demande"),
  datePremierContact: text("date_premier_contact"),
  dateEntree: text("date_entree"),
  dateAdmission: text("date_admission"),
  dateSortie: text("date_sortie"),
  dateFinSuivi: text("date_fin_suivi"),
  agressivite: integer("agressivite").notNull().default(-1),
  article: text("article"),
  curatelle: text("curatelle"),
  remarques: text("remarques"),
  board: text("board").notNull().default("PréAdmission"),
  phase: text("phase"),
  boardEntryDate: text("board_entry_date"),
  passages: jsonb("passages").$type<Record<string, string>>().default({}),
  recoveryObjectifs: text("recovery_objectifs"),
  recoveryEtape: text("recovery_etape"),
  recoveryAction: text("recovery_action"),
  infosRecoltees: text("infos_recoltees"),
  motifIrrecevable: text("motif_irrecevable"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  photo: text("photo"),
  boardDaysOffset: jsonb("board_days_offset").$type<Record<string, number>>().default({}),
});

export const insertPatientSchema = createInsertSchema(patientsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patientsTable.$inferSelect;
