import { pgTable, serial, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { patientsTable } from "./patients";

export const honosEvaluationsTable = pgTable("honos_evaluations", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientsTable.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  q1: integer("q1").notNull().default(0),
  q2: integer("q2").notNull().default(0),
  q3: integer("q3").notNull().default(0),
  q4: integer("q4").notNull().default(0),
  q5: integer("q5").notNull().default(0),
  q6: integer("q6").notNull().default(0),
  q7: integer("q7").notNull().default(0),
  q8: integer("q8").notNull().default(0),
  q9: integer("q9").notNull().default(0),
  q10: integer("q10").notNull().default(0),
  q11: integer("q11").notNull().default(0),
  q12: integer("q12").notNull().default(0),
  notes: text("notes"),
  questionNotes: jsonb("question_notes"),
  createdByUsername: text("created_by_username"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type HonosEvaluation = typeof honosEvaluationsTable.$inferSelect;
