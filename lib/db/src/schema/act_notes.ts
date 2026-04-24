import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { actRegionsTable } from "./act_regions";

export const actNotesTable = pgTable("act_notes", {
  id: serial("id").primaryKey(),
  regionId: integer("region_id").notNull().references(() => actRegionsTable.id, { onDelete: "cascade" }),
  date: text("date"),
  texte: text("texte"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertActNoteSchema = createInsertSchema(actNotesTable).omit({ id: true, createdAt: true });
export type InsertActNote = z.infer<typeof insertActNoteSchema>;
export type ActNote = typeof actNotesTable.$inferSelect;
