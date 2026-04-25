import { Router } from "express";
import { db, irockEvaluationsTable, honosEvaluationsTable, historyEntriesTable, patientsTable } from "@workspace/db";
import { eq, isNull } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// ─── iRock ───────────────────────────────────────────────────────────────────

router.get("/patients/:id/irock", requireAuth, async (req, res) => {
  const patientId = Number(req.params["id"]);
  const rows = await db.select().from(irockEvaluationsTable)
    .where(eq(irockEvaluationsTable.patientId, patientId))
    .orderBy(irockEvaluationsTable.date);
  res.json(rows);
});

router.post("/patients/:id/irock", requireAuth, async (req, res) => {
  const patientId = Number(req.params["id"]);
  const { date, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12 } = req.body;
  const createdByUsername: string | null = (req as any).user?.username ?? null;
  const [row] = await db.insert(irockEvaluationsTable).values({
    patientId,
    date: date ?? new Date().toISOString().slice(0, 10),
    q1: q1 ?? 0, q2: q2 ?? 0, q3: q3 ?? 0, q4: q4 ?? 0, q5: q5 ?? 0,
    q6: q6 ?? 0, q7: q7 ?? 0, q8: q8 ?? 0, q9: q9 ?? 0, q10: q10 ?? 0,
    q11: q11 ?? 0, q12: q12 ?? 0,
    createdByUsername,
  }).returning();
  res.status(201).json(row);
});

router.put("/patients/:patientId/irock/:evalId", requireAuth, async (req, res) => {
  const evalId = Number(req.params["evalId"]);
  const { date, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12 } = req.body;
  const [updated] = await db.update(irockEvaluationsTable)
    .set({ date, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12 })
    .where(eq(irockEvaluationsTable.id, evalId))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/patients/:patientId/irock/:evalId", requireAuth, async (req, res) => {
  const evalId = Number(req.params["evalId"]);
  await db.delete(irockEvaluationsTable).where(eq(irockEvaluationsTable.id, evalId));
  res.json({ message: "Deleted" });
});

// ─── HoNOS ───────────────────────────────────────────────────────────────────

router.get("/patients/:id/honos", requireAuth, async (req, res) => {
  const patientId = Number(req.params["id"]);
  const rows = await db.select().from(honosEvaluationsTable)
    .where(eq(honosEvaluationsTable.patientId, patientId))
    .orderBy(honosEvaluationsTable.date);
  res.json(rows);
});

router.post("/patients/:id/honos", requireAuth, async (req, res) => {
  const patientId = Number(req.params["id"]);
  const { date, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12 } = req.body;
  const createdByUsername: string | null = (req as any).user?.username ?? null;
  const [row] = await db.insert(honosEvaluationsTable).values({
    patientId,
    date: date ?? new Date().toISOString().slice(0, 10),
    q1: q1 ?? 0, q2: q2 ?? 0, q3: q3 ?? 0, q4: q4 ?? 0, q5: q5 ?? 0,
    q6: q6 ?? 0, q7: q7 ?? 0, q8: q8 ?? 0, q9: q9 ?? 0, q10: q10 ?? 0,
    q11: q11 ?? 0, q12: q12 ?? 0,
    createdByUsername,
  }).returning();
  res.status(201).json(row);
});

router.put("/patients/:patientId/honos/:evalId", requireAuth, async (req, res) => {
  const evalId = Number(req.params["evalId"]);
  const { date, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12 } = req.body;
  const [updated] = await db.update(honosEvaluationsTable)
    .set({ date, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12 })
    .where(eq(honosEvaluationsTable.id, evalId))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/patients/:patientId/honos/:evalId", requireAuth, async (req, res) => {
  const evalId = Number(req.params["evalId"]);
  await db.delete(honosEvaluationsTable).where(eq(honosEvaluationsTable.id, evalId));
  res.json({ message: "Deleted" });
});

// ─── All patients selector (for KPI patient picker) ─────────────────────────

router.get("/patients-selector", requireAuth, async (_req, res) => {
  const patients = await db
    .select({
      id: patientsTable.id,
      clientNum: patientsTable.clientNum,
      nom: patientsTable.nom,
      prenom: patientsTable.prenom,
      board: patientsTable.board,
    })
    .from(patientsTable)
    .where(isNull(patientsTable.deletedAt))
    .orderBy(patientsTable.nom);
  res.json(patients);
});

// ─── Patient KPI stats ───────────────────────────────────────────────────────

const CLINICAL_BOARDS = ["PréAdmission", "FactBoard", "RecoveryBoard"];

router.get("/patients/:id/kpi", requireAuth, async (req, res) => {
  const patientId = Number(req.params["id"]);

  const history = await db.select().from(historyEntriesTable)
    .where(eq(historyEntriesTable.patientId, patientId))
    .orderBy(historyEntriesTable.date);

  const [patient] = await db.select().from(patientsTable)
    .where(eq(patientsTable.id, patientId));

  // Count RecoveryBoard → FactBoard regressions
  let regressions = 0;
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1];
    const curr = history[i];
    if (prev?.boardTo === "RecoveryBoard" && curr?.boardTo === "FactBoard") {
      regressions++;
    }
  }

  // Compute days per clinical board from history
  const daysPerBoard: Record<string, number> = {
    "PréAdmission": 0, "FactBoard": 0, "RecoveryBoard": 0,
  };

  const today = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < history.length; i++) {
    const entry = history[i];
    if (!entry || !CLINICAL_BOARDS.includes(entry.boardTo ?? "")) continue;
    const from = new Date(entry.date);
    const toEntry = history[i + 1];
    const to = toEntry ? new Date(toEntry.date) : new Date(today);
    const days = Math.max(0, Math.floor((to.getTime() - from.getTime()) / (1000 * 3600 * 24)));
    daysPerBoard[entry.boardTo!] = (daysPerBoard[entry.boardTo!] ?? 0) + days;
  }

  // If patient is currently in a clinical board and has no later history, count today
  if (patient && CLINICAL_BOARDS.includes(patient.board)) {
    const lastEntry = history[history.length - 1];
    if (lastEntry?.boardTo === patient.board) {
      // Already counted above as "to today"
    }
  }

  res.json({ regressions, daysPerBoard });
});

export default router;
