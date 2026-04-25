import { Router } from "express";
import { db, patientsTable, irockEvaluationsTable, honosEvaluationsTable, actNotesTable, actRegionsTable } from "@workspace/db";
import { isNull, sql, eq, and, gte } from "drizzle-orm";
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
  const aggCounts: Record<number, number> = { "-1": 0, 0: 0, 1: 0, 2: 0, 3: 0 };

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

  // Calculate average days on current board per board using pure SQL.
  // For each active patient, the effective entry date is:
  //   1. The most recent history entry date where board_to = patient's current board
  //   2. Falling back to board_entry_date if no matching history entry exists.
  // This is computed entirely in the database to avoid JS type/comparison issues.
  const durationRows = await db.execute<{ board: string; avg_days: string }>(sql`
    SELECT
      p.board,
      ROUND(AVG(CURRENT_DATE - effective_date::date))::text AS avg_days
    FROM (
      SELECT
        p.id,
        p.board,
        COALESCE(
          (SELECT MAX(h.date)
           FROM history_entries h
           WHERE h.patient_id = p.id
             AND h.board_to = p.board),
          p.board_entry_date
        ) AS effective_date
      FROM patients p
      WHERE p.deleted_at IS NULL
        AND p.board IN ('FactBoard', 'RecoveryBoard', 'PréAdmission')
    ) p
    WHERE p.effective_date IS NOT NULL
    GROUP BY p.board
  `);

  const avgDurations: Record<string, number> = {
    FactBoard: 0,
    RecoveryBoard: 0,
    "PréAdmission": 0,
  };
  for (const row of durationRows.rows) {
    avgDurations[row.board] = Math.round(Number(row.avg_days));
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

  // Join evaluations with patients so deleted patients are excluded.
  const irockRows = await db
    .select({ date: irockEvaluationsTable.date })
    .from(irockEvaluationsTable)
    .innerJoin(patientsTable, eq(irockEvaluationsTable.patientId, patientsTable.id))
    .where(since
      ? and(isNull(patientsTable.deletedAt), gte(irockEvaluationsTable.date, since))
      : isNull(patientsTable.deletedAt));
  const irockCount = irockRows.length;

  const honosRows = await db
    .select({ date: honosEvaluationsTable.date })
    .from(honosEvaluationsTable)
    .innerJoin(patientsTable, eq(honosEvaluationsTable.patientId, patientsTable.id))
    .where(since
      ? and(isNull(patientsTable.deletedAt), gte(honosEvaluationsTable.date, since))
      : isNull(patientsTable.deletedAt));
  const honosCount = honosRows.length;

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
