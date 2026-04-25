import { Router } from "express";
import { db, settingsTable, icd10CodesTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

const SETTING_KEYS = ["psychiatrists", "casemanagers", "medecinsfamille", "articles", "curatelles", "icd10favorites"];
const SETTING_SCALAR_DEFAULTS: Record<string, string> = {
  defaultStatsPeriod: "6m",
};

async function ensureDefaults() {
  for (const key of SETTING_KEYS) {
    const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, key)).limit(1);
    if (!existing[0]) {
      await db.insert(settingsTable).values({ key, value: "[]" });
    }
  }
  for (const [key, value] of Object.entries(SETTING_SCALAR_DEFAULTS)) {
    const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, key)).limit(1);
    if (!existing[0]) {
      await db.insert(settingsTable).values({ key, value });
    }
  }
}

router.get("/settings", requireAuth, requireAdmin, async (_req, res) => {
  await ensureDefaults();
  const rows = await db.select().from(settingsTable);
  const result: Record<string, unknown> = {};
  for (const row of rows) {
    try {
      result[row.key] = JSON.parse(row.value);
    } catch {
      result[row.key] = row.value;
    }
  }
  res.json(result);
});

const FORM_OPTION_KEYS = ["psychiatrists", "casemanagers", "medecinsfamille", "articles", "curatelles", "icd10favorites"];

router.get("/form-options", requireAuth, async (_req, res) => {
  const settingRows = await db.select().from(settingsTable).where(inArray(settingsTable.key, FORM_OPTION_KEYS));
  const result: Record<string, unknown> = {};
  for (const row of settingRows) {
    try {
      result[row.key] = JSON.parse(row.value);
    } catch {
      result[row.key] = row.value;
    }
  }
  const icd10Codes = await db.select().from(icd10CodesTable).orderBy(icd10CodesTable.code);
  res.json({ ...result, icd10Codes });
});

router.put("/settings/:key", requireAuth, requireAdmin, async (req, res) => {
  const key = String(req.params["key"]);
  const { value } = req.body as { value: unknown };

  const serialized = typeof value === "string" ? value : JSON.stringify(value);

  const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, key)).limit(1);
  if (!existing[0]) {
    const [row] = await db.insert(settingsTable).values({ key, value: serialized }).returning();
    res.json({ key, value: row?.value });
    return;
  }

  const [updated] = await db.update(settingsTable)
    .set({ value: serialized })
    .where(eq(settingsTable.key, key))
    .returning();

  res.json({ key, value: updated?.value });
});

export default router;
