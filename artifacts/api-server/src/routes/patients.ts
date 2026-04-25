import { Router } from "express";
import { db, patientsTable, historyEntriesTable } from "@workspace/db";
import { eq, and, ilike, or, isNull, isNotNull, ne } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/patients", requireAuth, async (req, res) => {
  const { board, search } = req.query as { board?: string; search?: string };

  const conditions: any[] = [isNull(patientsTable.deletedAt)];
  if (board) {
    conditions.push(eq(patientsTable.board, board));
  } else {
    conditions.push(ne(patientsTable.board, "Clôturé"));
    conditions.push(ne(patientsTable.board, "Irrecevable"));
  }
  if (search) {
    conditions.push(
      or(
        ilike(patientsTable.nom, `%${search}%`),
        ilike(patientsTable.prenom, `%${search}%`),
        ilike(patientsTable.psy, `%${search}%`),
        ilike(patientsTable.clientNum, `%${search}%`)
      )
    );
  }

  const patients = await db.select().from(patientsTable)
    .where(and(...conditions))
    .orderBy(patientsTable.nom);

  res.json(patients);
});

router.get("/patients/deleted", requireAuth, async (req, res) => {
  const patients = await db.select().from(patientsTable)
    .where(isNotNull(patientsTable.deletedAt))
    .orderBy(patientsTable.deletedAt);
  res.json(patients);
});

router.post("/patients", requireAuth, async (req, res) => {
  const body = req.body;
  const today = new Date().toISOString().slice(0, 10);

  const [patient] = await db.insert(patientsTable).values({
    ...body,
    clientNum: "TEMP",
    board: body.board ?? "PréAdmission",
    boardEntryDate: body.boardEntryDate ?? today,
  }).returning();

  const clientNum = `FACT-${String(patient!.id).padStart(4, "0")}`;
  const [finalPatient] = await db.update(patientsTable)
    .set({ clientNum })
    .where(eq(patientsTable.id, patient!.id))
    .returning();

  await db.insert(historyEntriesTable).values({
    patientId: finalPatient!.id,
    date: today,
    action: `Ajouté au board ${finalPatient!.board}`,
    boardTo: finalPatient!.board,
  });

  res.status(201).json(finalPatient);
});

router.get("/patients/:id", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  const [patient] = await db.select().from(patientsTable)
    .where(and(eq(patientsTable.id, id), isNull(patientsTable.deletedAt)))
    .limit(1);
  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(patient);
});

router.post("/patients/:id/restore", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  const [restored] = await db.update(patientsTable)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(and(eq(patientsTable.id, id), isNotNull(patientsTable.deletedAt)))
    .returning();
  if (!restored) {
    res.status(404).json({ error: "Deleted patient not found" });
    return;
  }
  res.json(restored);
});

async function updatePatientById(id: number, body: Record<string, unknown>, res: any) {
  const [updated] = await db.update(patientsTable)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(patientsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(updated);
}

router.put("/patients/:id", requireAuth, async (req, res) => {
  await updatePatientById(Number(req.params["id"]), req.body, res);
});
router.patch("/patients/:id", requireAuth, async (req, res) => {
  await updatePatientById(Number(req.params["id"]), req.body, res);
});

router.delete("/patients/:id", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  const [flagged] = await db.update(patientsTable)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(patientsTable.id, id), isNull(patientsTable.deletedAt)))
    .returning();
  if (!flagged) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json({ message: "Deleted", id });
});

async function moveBoardHandler(req: any, res: any) {
  const id = Number(req.params["id"]);
  const { board, date } = req.body as { board: string; date?: string };
  const today = date ?? new Date().toISOString().slice(0, 10);

  const [updated] = await db.update(patientsTable)
    .set({ board, boardEntryDate: today, updatedAt: new Date() })
    .where(eq(patientsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }

  await db.insert(historyEntriesTable).values({
    patientId: id,
    date: today,
    action: `Déplacé vers ${board}`,
    boardTo: board,
  });

  res.json(updated);
}

router.patch("/patients/:id/move-board", requireAuth, moveBoardHandler);
router.patch("/patients/:id/board", requireAuth, moveBoardHandler);

async function updatePassagesHandler(req: any, res: any) {
  const id = Number(req.params["id"]);
  const { passages } = req.body as { passages: Record<string, string> };
  const [updated] = await db.update(patientsTable)
    .set({ passages, updatedAt: new Date() })
    .where(eq(patientsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Patient not found" }); return; }
  res.json(updated);
}
router.put("/patients/:id/passages", requireAuth, updatePassagesHandler);
router.patch("/patients/:id/passages", requireAuth, updatePassagesHandler);

async function updatePhaseHandler(req: any, res: any) {
  const id = Number(req.params["id"]);
  const { phase } = req.body as { phase: string };
  const [updated] = await db.update(patientsTable)
    .set({ phase, updatedAt: new Date() })
    .where(eq(patientsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Patient not found" }); return; }
  res.json(updated);
}
router.put("/patients/:id/phase", requireAuth, updatePhaseHandler);
router.patch("/patients/:id/phase", requireAuth, updatePhaseHandler);

async function updateRecoveryHandler(req: any, res: any) {
  const id = Number(req.params["id"]);
  const { recoveryObjectifs, recoveryEtape, recoveryAction } = req.body as {
    recoveryObjectifs?: string;
    recoveryEtape?: string;
    recoveryAction?: string;
  };
  const [updated] = await db.update(patientsTable)
    .set({ recoveryObjectifs, recoveryEtape, recoveryAction, updatedAt: new Date() })
    .where(eq(patientsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Patient not found" }); return; }
  res.json(updated);
}
router.put("/patients/:id/recovery", requireAuth, updateRecoveryHandler);
router.patch("/patients/:id/recovery", requireAuth, updateRecoveryHandler);

async function updateInfosRecolteesHandler(req: any, res: any) {
  const id = Number(req.params["id"]);
  const { infosRecoltees } = req.body as { infosRecoltees: string };
  const [updated] = await db.update(patientsTable)
    .set({ infosRecoltees, updatedAt: new Date() })
    .where(eq(patientsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Patient not found" }); return; }
  res.json(updated);
}
router.put("/patients/:id/infos-recoltees", requireAuth, updateInfosRecolteesHandler);
router.patch("/patients/:id/infos-recoltees", requireAuth, updateInfosRecolteesHandler);

async function updateMotifIrrecevableHandler(req: any, res: any) {
  const id = Number(req.params["id"]);
  const { motifIrrecevable } = req.body as { motifIrrecevable: string };
  const [updated] = await db.update(patientsTable)
    .set({ motifIrrecevable, updatedAt: new Date() })
    .where(eq(patientsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Patient not found" }); return; }
  res.json(updated);
}
router.put("/patients/:id/motif-irrecevable", requireAuth, updateMotifIrrecevableHandler);
router.patch("/patients/:id/motif-irrecevable", requireAuth, updateMotifIrrecevableHandler);

async function updatePhotoHandler(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { photo } = req.body as { photo: string | null };
  const [updated] = await db
    .update(patientsTable)
    .set({ photo: photo ?? null, updatedAt: new Date() })
    .where(eq(patientsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Patient not found" }); return; }
  res.json(updated);
}
router.patch("/patients/:id/photo", requireAuth, updatePhotoHandler);

export default router;
