import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const icd10CodesTable = pgTable("icd10_codes", {
  code: text("code").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  risks: text("risks"),
  titleEn: text("title_en"),
  titleDe: text("title_de"),
  titleNl: text("title_nl"),
  descriptionEn: text("description_en"),
  descriptionDe: text("description_de"),
  descriptionNl: text("description_nl"),
  risksEn: text("risks_en"),
  risksDe: text("risks_de"),
  risksNl: text("risks_nl"),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
