import { Router } from "express";
import { db, historyEntriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/patients/:id/history", requireAuth, async (req, res) => {
  const patientId = Number(req.params["id"]);
  const entries = await db.select().from(historyEntriesTable)
    .where(eq(historyEntriesTable.patientId, patientId))
    .orderBy(historyEntriesTable.date);
  res.json(entries);
});

async function updateHistoryEntryHandler(req: any, res: any) {
  const entryId = Number(req.params["entryId"] ?? req.params["historyId"]);
  const { date, action, boardTo } = req.body as { date?: string; action?: string; boardTo?: string };

  const [updated] = await db.update(historyEntriesTable)
    .set({
      ...(date !== undefined && { date }),
      ...(action !== undefined && { action }),
      ...(boardTo !== undefined && { boardTo }),
    })
    .where(eq(historyEntriesTable.id, entryId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }
  res.json(updated);
}

router.put("/patients/:patientId/history/:entryId", requireAuth, updateHistoryEntryHandler);
router.patch("/patients/:id/history/:historyId", requireAuth, updateHistoryEntryHandler);

export default router;
