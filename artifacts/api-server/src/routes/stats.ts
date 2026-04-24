import { Router } from "express";
import { db, patientsTable } from "@workspace/db";
import { sql, eq, not } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/stats", requireAuth, async (_req, res) => {
  const all = await db.select().from(patientsTable);

  const total = all.length;
  const activeBoards = ["FactBoard", "RecoveryBoard", "PréAdmission"];
  const active = all.filter((p) => activeBoards.includes(p.board)).length;

  const boardCounts: Record<string, number> = {};
  const sexeCounts: Record<string, number> = {};
  const pathoCounts: Record<string, number> = {};
  const aggCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };

  for (const p of all) {
    boardCounts[p.board] = (boardCounts[p.board] ?? 0) + 1;
    if (p.sexe) sexeCounts[p.sexe] = (sexeCounts[p.sexe] ?? 0) + 1;
    if (p.patho) pathoCounts[p.patho] = (pathoCounts[p.patho] ?? 0) + 1;
    aggCounts[p.agressivite] = (aggCounts[p.agressivite] ?? 0) + 1;
  }

  const pathoArray = Object.entries(pathoCounts)
    .map(([patho, count]) => ({ patho, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const today = new Date();
  const avgDurations: Record<string, number> = {};
  for (const board of activeBoards) {
    const pts = all.filter((p) => p.board === board && p.boardEntryDate);
    if (pts.length === 0) { avgDurations[board] = 0; continue; }
    const totalDays = pts.reduce((sum, p) => {
      const entry = new Date(p.boardEntryDate!);
      const days = Math.floor((today.getTime() - entry.getTime()) / (1000 * 3600 * 24));
      return sum + (isNaN(days) ? 0 : days);
    }, 0);
    avgDurations[board] = Math.round(totalDays / pts.length);
  }

  res.json({
    total,
    active,
    boardCounts,
    sexeCounts,
    pathoCounts: pathoArray,
    aggCounts,
    avgDurations,
  });
});

export default router;
