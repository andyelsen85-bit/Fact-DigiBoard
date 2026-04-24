import { Router } from "express";
import { db, patientsTable, historyEntriesTable } from "@workspace/db";
import { eq, and, ilike, or } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/patients", requireAuth, async (req, res) => {
  const { board, search } = req.query as { board?: string; search?: string };

  const conditions = [];
  if (board) conditions.push(eq(patientsTable.board, board));
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
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(patientsTable.nom);

  res.json(patients);
});

router.post("/patients", requireAuth, async (req, res) => {
  const body = req.body;
  const today = new Date().toISOString().slice(0, 10);

  const [patient] = await db.insert(patientsTable).values({
    ...body,
    board: body.board ?? "PréAdmission",
    boardEntryDate: body.boardEntryDate ?? today,
  }).returning();

  if (patient) {
    await db.insert(historyEntriesTable).values({
      patientId: patient.id,
      date: today,
      action: `Ajouté au board ${patient.board}`,
      boardTo: patient.board,
    });
  }

  res.status(201).json(patient);
});

router.get("/patients/:id", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, id)).limit(1);
  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(patient);
});

router.put("/patients/:id", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  const [updated] = await db.update(patientsTable)
    .set({ ...req.body, updatedAt: new Date() })
    .where(eq(patientsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(updated);
});

router.delete("/patients/:id", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  await db.delete(patientsTable).where(eq(patientsTable.id, id));
  res.json({ message: "Deleted" });
});

router.post("/patients/:id/move-board", requireAuth, async (req, res) => {
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
});

router.put("/patients/:id/passages", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  const { passages } = req.body as { passages: Record<string, string> };

  const [updated] = await db.update(patientsTable)
    .set({ passages, updatedAt: new Date() })
    .where(eq(patientsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(updated);
});

router.put("/patients/:id/phase", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  const { phase } = req.body as { phase: string };

  const [updated] = await db.update(patientsTable)
    .set({ phase, updatedAt: new Date() })
    .where(eq(patientsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(updated);
});

router.put("/patients/:id/recovery", requireAuth, async (req, res) => {
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

  if (!updated) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(updated);
});

router.put("/patients/:id/infos-recoltees", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  const { infosRecoltees } = req.body as { infosRecoltees: string };

  const [updated] = await db.update(patientsTable)
    .set({ infosRecoltees, updatedAt: new Date() })
    .where(eq(patientsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(updated);
});

router.put("/patients/:id/motif-irrecevable", requireAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  const { motifIrrecevable } = req.body as { motifIrrecevable: string };

  const [updated] = await db.update(patientsTable)
    .set({ motifIrrecevable, updatedAt: new Date() })
    .where(eq(patientsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(updated);
});

export default router;
