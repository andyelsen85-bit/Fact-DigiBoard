import { Router } from "express";
import { db, actRegionsTable, actNotesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/act/regions", requireAuth, async (_req, res) => {
  const regions = await db.select().from(actRegionsTable).orderBy(actRegionsTable.nom);
  res.json(regions);
});

router.post("/act/regions", requireAuth, async (req, res) => {
  const { nom } = req.body as { nom: string };
  if (!nom) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  const [region] = await db.insert(actRegionsTable).values({ nom }).returning();
  res.status(201).json(region);
});

router.put("/act/regions/:id", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  const { nom } = req.body as { nom: string };

  const [updated] = await db.update(actRegionsTable)
    .set({ nom })
    .where(eq(actRegionsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Region not found" });
    return;
  }
  res.json(updated);
});

router.delete("/act/regions/:id", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  await db.delete(actRegionsTable).where(eq(actRegionsTable.id, id));
  res.json({ message: "Deleted" });
});

router.get("/act/regions/:id/notes", requireAuth, async (req, res) => {
  const regionId = Number(req.params["id"]);
  const notes = await db.select().from(actNotesTable)
    .where(eq(actNotesTable.regionId, regionId))
    .orderBy(actNotesTable.createdAt);
  res.json(notes);
});

router.post("/act/regions/:id/notes", requireAuth, async (req, res) => {
  const regionId = Number(req.params["id"]);
  const { date, texte } = req.body as { date?: string; texte?: string };

  const [note] = await db.insert(actNotesTable).values({
    regionId,
    date: date ?? new Date().toISOString().slice(0, 10),
    texte: texte ?? "",
  }).returning();

  res.status(201).json(note);
});

router.put("/act/regions/:regionId/notes/:noteId", requireAuth, async (req, res) => {
  const noteId = Number(req.params["noteId"]);
  const { date, texte } = req.body as { date?: string; texte?: string };

  const [updated] = await db.update(actNotesTable)
    .set({ ...(date !== undefined && { date }), ...(texte !== undefined && { texte }) })
    .where(eq(actNotesTable.id, noteId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json(updated);
});

router.delete("/act/regions/:regionId/notes/:noteId", requireAuth, async (req, res) => {
  const noteId = Number(req.params["noteId"]);
  await db.delete(actNotesTable).where(eq(actNotesTable.id, noteId));
  res.json({ message: "Deleted" });
});

export default router;
