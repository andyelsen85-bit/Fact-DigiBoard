import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { patientsTable } from "./patients";

export const meetingNotesTable = pgTable("meeting_notes", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientsTable.id, { onDelete: "cascade" }),
  date: text("date"),
  texte: text("texte"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMeetingNoteSchema = createInsertSchema(meetingNotesTable).omit({ id: true, createdAt: true });
export type InsertMeetingNote = z.infer<typeof insertMeetingNoteSchema>;
export type MeetingNote = typeof meetingNotesTable.$inferSelect;
