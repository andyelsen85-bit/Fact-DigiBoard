import { Router } from "express";
import { db, patientsTable, irockEvaluationsTable, honosEvaluationsTable } from "@workspace/db";
import { isNull } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/stats", requireAuth, async (req, res) => {
  const since = req.query.since as string | undefined;

  let all = await db.select().from(patientsTable).where(isNull(patientsTable.deletedAt));

  if (since) {
    all = all.filter((p) => {
      const d = p.dateEntree ?? p.createdAt?.toISOString().slice(0, 10);
      if (!d) return false;
      return d >= since;
    });
  }

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

  const ageCounts: Record<string, number> = {};
  for (const p of all) {
    if (!p.dob) continue;
    const birth = new Date(p.dob);
    if (isNaN(birth.getTime())) continue;
    const age = Math.floor((today.getTime() - birth.getTime()) / (365.25 * 24 * 3600 * 1000));
    if (age < 0 || age > 120) continue;
    const decade = Math.floor(age / 10) * 10;
    const key = decade >= 70 ? "70+" : `${decade}-${decade + 9}`;
    ageCounts[key] = (ageCounts[key] ?? 0) + 1;
  }

  const irockCount = await db.select().from(irockEvaluationsTable).then((r) => r.length);
  const honosCount = await db.select().from(honosEvaluationsTable).then((r) => r.length);

  res.json({
    total,
    active,
    boardCounts,
    sexeCounts,
    pathoCounts: pathoArray,
    aggCounts,
    avgDurations,
    ageCounts,
    irockCount,
    honosCount,
  });
});

export default router;
