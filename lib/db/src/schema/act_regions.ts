import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const actRegionsTable = pgTable("act_regions", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertActRegionSchema = createInsertSchema(actRegionsTable).omit({ id: true, createdAt: true });
export type InsertActRegion = z.infer<typeof insertActRegionSchema>;
export type ActRegion = typeof actRegionsTable.$inferSelect;
