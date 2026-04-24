import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  const defaults: Record<string, string[]> = {
    casemanagers: [],
    psychiatrists: [],
    medecinsfamille: [],
    articles: ["Article 71", "Article 72", "Article 73", "CAPL"],
    curatelles: ["Curatelle totale", "Curatelle partielle", "Tutelle", "Sauvegarde de justice"],
  };

  for (const [key, value] of Object.entries(defaults)) {
    const existing = await db.select().from(settingsTable)
      .where(eq(settingsTable.key, key))
      .limit(1);

    if (!existing[0]) {
      await db.insert(settingsTable).values({ key, value: JSON.stringify(value) });
    }
  }
}
