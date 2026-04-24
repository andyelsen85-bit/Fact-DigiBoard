import bcrypt from "bcrypt";
import { db, usersTable, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  const adminExists = await db.select().from(usersTable)
    .where(eq(usersTable.username, "admin"))
    .limit(1);

  if (!adminExists[0]) {
    const passwordHash = await bcrypt.hash("admin123", 12);
    await db.insert(usersTable).values({
      username: "admin",
      email: "admin@digiboard.local",
      passwordHash,
      role: "admin",
      mustChangePassword: true,
    });
    console.log("Created default admin user (admin/admin123) - must change password on first login");
  }

  const defaults: Record<string, string[]> = {
    psychiatrists: [],
    casemanagers: [],
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
