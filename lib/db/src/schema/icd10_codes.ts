import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const icd10CodesTable = pgTable("icd10_codes", {
  code: text("code").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  risks: text("risks"),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
