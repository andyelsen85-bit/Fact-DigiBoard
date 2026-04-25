import { Router } from "express";
import { db, patientsTable, historyEntriesTable, irockEvaluationsTable, honosEvaluationsTable, actNotesTable, actRegionsTable } from "@workspace/db";
import { isNull, inArray } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/stats", requireAuth, async (req, res) => {
  const since = req.query.since as string | undefined;

  let all = await db.select().from(patientsTable).where(isNull(patientsTable.deletedAt));

  if (since) {
    const closedBoards = ["Clôturé", "Irrecevable"];
    all = all.filter((p) => {
      if (!closedBoards.includes(p.board)) return true;
      const closedDate = p.dateSortie ?? p.updatedAt?.toISOString().slice(0, 10);
      if (!closedDate) return false;
      return closedDate >= since;
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
    if (Array.isArray((p as any).pathos) && (p as any).pathos.length > 0) {
      for (const code of (p as any).pathos as string[]) {
        if (code) pathoCounts[code] = (pathoCounts[code] ?? 0) + 1;
      }
    } else if (p.patho) {
      pathoCounts[p.patho] = (pathoCounts[p.patho] ?? 0) + 1;
    }
    aggCounts[p.agressivite] = (aggCounts[p.agressivite] ?? 0) + 1;
  }

  const pathoArray = Object.entries(pathoCounts)
    .map(([patho, count]) => ({ patho, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const today = new Date();

  // Load all history entries for active patients in one query, then derive
  // the board entry date from the most recent history entry (not boardEntryDate,
  // which may be stale if history dates were manually edited).
  const activePatientIds = all
    .filter((p) => activeBoards.includes(p.board))
    .map((p) => p.id);

  const allHistory = activePatientIds.length > 0
    ? await db.select().from(historyEntriesTable)
        .where(inArray(historyEntriesTable.patientId, activePatientIds))
    : [];

  // Group history by patientId and find the most recent entry date per patient
  const latestEntryDateByPatient: Record<number, string> = {};
  for (const entry of allHistory) {
    const current = latestEntryDateByPatient[entry.patientId];
    if (!current || entry.date > current) {
      latestEntryDateByPatient[entry.patientId] = entry.date;
    }
  }

  const avgDurations: Record<string, number> = {};
  for (const board of activeBoards) {
    const pts = all.filter((p) => p.board === board);
    if (pts.length === 0) { avgDurations[board] = 0; continue; }
    let counted = 0;
    const totalDays = pts.reduce((sum, p) => {
      const entryDate = latestEntryDateByPatient[p.id] ?? p.boardEntryDate;
      if (!entryDate) return sum;
      const days = Math.floor(
        (today.getTime() - new Date(entryDate).getTime()) / (1000 * 3600 * 24)
      );
      if (isNaN(days) || days < 0) return sum;
      counted++;
      return sum + days;
    }, 0);
    avgDurations[board] = counted > 0 ? Math.round(totalDays / counted) : 0;
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

  const allIrock = await db.select().from(irockEvaluationsTable);
  const irockCount = since
    ? allIrock.filter((e) => e.date >= since).length
    : allIrock.length;

  const allHonos = await db.select().from(honosEvaluationsTable);
  const honosCount = since
    ? allHonos.filter((e) => e.date >= since).length
    : allHonos.length;

  const regions = await db.select().from(actRegionsTable);
  const regionMap: Record<number, string> = {};
  for (const r of regions) regionMap[r.id] = r.nom;

  const allActNotes = await db.select().from(actNotesTable);
  const filteredActNotes = since
    ? allActNotes.filter((n) => n.date && n.date >= since)
    : allActNotes;

  const visitCounts: Record<string, number> = {};
  for (const n of filteredActNotes) {
    const lieu = regionMap[n.regionId] ?? "Inconnu";
    visitCounts[lieu] = (visitCounts[lieu] ?? 0) + 1;
  }
  const visitsByLieu = Object.entries(visitCounts)
    .map(([lieu, count]) => ({ lieu, count }))
    .sort((a, b) => b.count - a.count);

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
    visitsByLieu,
  });
});

export default router;
