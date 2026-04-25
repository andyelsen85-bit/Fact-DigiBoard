import { Router } from "express";
import { db, icd10CodesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/icd10", requireAuth, requireAdmin, async (req, res) => {
  const rows = await db
    .select()
    .from(icd10CodesTable)
    .orderBy(icd10CodesTable.code);
  res.json(rows);
});

router.post("/icd10", requireAuth, requireAdmin, async (req, res) => {
  const { code, title, description, risks, isFavorite } = req.body as {
    code: string;
    title: string;
    description?: string;
    risks?: string;
    isFavorite?: boolean;
  };

  if (!code || !title) {
    return res.status(400).json({ error: "code and title are required" });
  }

  const existing = await db
    .select()
    .from(icd10CodesTable)
    .where(eq(icd10CodesTable.code, code))
    .limit(1);

  if (existing.length > 0) {
    return res.status(409).json({ error: "Code already exists" });
  }

  const [row] = await db
    .insert(icd10CodesTable)
    .values({ code, title, description, risks, isFavorite: isFavorite ?? false })
    .returning();

  res.status(201).json(row);
});

router.patch("/icd10/:code", requireAuth, requireAdmin, async (req, res) => {
  const { code } = req.params;
  const { title, description, risks, isFavorite } = req.body as {
    title?: string;
    description?: string;
    risks?: string;
    isFavorite?: boolean;
  };

  const updates: Partial<typeof icd10CodesTable.$inferInsert> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (risks !== undefined) updates.risks = risks;
  if (isFavorite !== undefined) updates.isFavorite = isFavorite;

  const [row] = await db
    .update(icd10CodesTable)
    .set(updates)
    .where(eq(icd10CodesTable.code, code))
    .returning();

  if (!row) return res.status(404).json({ error: "Code not found" });

  res.json(row);
});

router.delete("/icd10/:code", requireAuth, requireAdmin, async (req, res) => {
  const { code } = req.params;
  const [row] = await db
    .delete(icd10CodesTable)
    .where(eq(icd10CodesTable.code, code))
    .returning();

  if (!row) return res.status(404).json({ error: "Code not found" });

  res.json({ ok: true });
});

export default router;
