import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { patientsTable } from "./patients";

export const historyEntriesTable = pgTable("history_entries", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientsTable.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  action: text("action").notNull(),
  boardTo: text("board_to"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertHistoryEntrySchema = createInsertSchema(historyEntriesTable).omit({ id: true, createdAt: true });
export type InsertHistoryEntry = z.infer<typeof insertHistoryEntrySchema>;
export type HistoryEntry = typeof historyEntriesTable.$inferSelect;
