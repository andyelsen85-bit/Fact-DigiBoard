import type { Lang } from "./index";

// ICD-10 rows come from the API with French base fields (title, description,
// risks) plus per-language columns (titleEn, titleDe, titleNl, ...).
// Falls back to French when a translation is missing (e.g. admin-added codes).
type IcdLike = Record<string, unknown>;

const SUFFIX: Record<Exclude<Lang, "fr">, string> = { en: "En", de: "De", nl: "Nl" };

export function icdText(
  item: IcdLike | null | undefined,
  field: "title" | "description" | "risks",
  lang: Lang,
): string | null {
  if (!item) return null;
  if (lang !== "fr") {
    const translated = item[`${field}${SUFFIX[lang]}`];
    if (typeof translated === "string" && translated.trim()) return translated;
  }
  const base = item[field];
  return typeof base === "string" && base.trim() ? base : null;
}
