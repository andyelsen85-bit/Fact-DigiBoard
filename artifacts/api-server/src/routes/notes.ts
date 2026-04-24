import { Router } from "express";
import { db, meetingNotesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/patients/:id/notes", requireAuth, async (req, res) => {
  const patientId = Number(req.params["id"]);
  const notes = await db.select().from(meetingNotesTable)
    .where(eq(meetingNotesTable.patientId, patientId))
    .orderBy(meetingNotesTable.createdAt);
  res.json(notes);
});

router.post("/patients/:id/notes", requireAuth, async (req, res) => {
  const patientId = Number(req.params["id"]);
  const { date, texte } = req.body as { date?: string; texte?: string };

  const [note] = await db.insert(meetingNotesTable).values({
    patientId,
    date: date ?? new Date().toISOString().slice(0, 10),
    texte: texte ?? "",
  }).returning();

  res.status(201).json(note);
});

async function updateNoteHandler(req: any, res: any) {
  const noteId = Number(req.params["noteId"]);
  const { date, texte } = req.body as { date?: string; texte?: string };

  const [updated] = await db.update(meetingNotesTable)
    .set({ ...(date !== undefined && { date }), ...(texte !== undefined && { texte }) })
    .where(eq(meetingNotesTable.id, noteId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json(updated);
}

router.put("/patients/:patientId/notes/:noteId", requireAuth, updateNoteHandler);
router.patch("/patients/:patientId/notes/:noteId", requireAuth, updateNoteHandler);

router.delete("/patients/:patientId/notes/:noteId", requireAuth, async (req, res) => {
  const noteId = Number(req.params["noteId"]);
  await db.delete(meetingNotesTable).where(eq(meetingNotesTable.id, noteId));
  res.json({ message: "Deleted" });
});

export default router;
