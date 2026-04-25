import { Router } from "express";
import {
  db,
  patientsTable,
  historyEntriesTable,
  irockEvaluationsTable,
  honosEvaluationsTable,
  settingsTable,
  icd10CodesTable,
  meetingNotesTable,
} from "@workspace/db";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

// ─── Export ───────────────────────────────────────────────────────────────────

router.get("/backup/export", requireAuth, requireAdmin, async (_req, res) => {
  const [
    patients,
    history,
    notes,
    irock,
    honos,
    settings,
    icd10,
  ] = await Promise.all([
    db.select().from(patientsTable),
    db.select().from(historyEntriesTable),
    db.select().from(meetingNotesTable),
    db.select().from(irockEvaluationsTable),
    db.select().from(honosEvaluationsTable),
    db.select().from(settingsTable),
    db.select().from(icd10CodesTable),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    patients,
    history_entries: history,
    meeting_notes: notes,
    irock_evaluations: irock,
    honos_evaluations: honos,
    settings,
    icd10_codes: icd10,
  };

  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="digiboard-backup-${new Date().toISOString().slice(0, 10)}.json"`
  );
  res.json(payload);
});

// ─── Restore (admin only) ─────────────────────────────────────────────────────

router.post("/backup/restore", requireAuth, requireAdmin, async (req, res) => {
  const payload = req.body;

  if (!payload || payload.version !== 1) {
    res.status(400).json({ error: "Format de sauvegarde invalide ou version incompatible" });
    return;
  }

  const {
    patients = [],
    history_entries = [],
    meeting_notes = [],
    irock_evaluations = [],
    honos_evaluations = [],
    settings: settingRows = [],
    icd10_codes = [],
  } = payload;

  try {
    await db.transaction(async (tx) => {
      // Delete in reverse FK dependency order
      await tx.delete(irockEvaluationsTable);
      await tx.delete(honosEvaluationsTable);
      await tx.delete(meetingNotesTable);
      await tx.delete(historyEntriesTable);
      await tx.delete(patientsTable);
      await tx.delete(icd10CodesTable);
      await tx.delete(settingsTable);

      // Re-insert patients first (other tables FK to them)
      if (patients.length > 0) {
        for (const p of patients) {
          await tx.insert(patientsTable).values(p).onConflictDoNothing();
        }
        await tx.execute(
          `SELECT setval('patients_id_seq', (SELECT COALESCE(MAX(id), 1) FROM patients))`
        );
      }

      if (history_entries.length > 0) {
        for (const h of history_entries) {
          await tx.insert(historyEntriesTable).values(h).onConflictDoNothing();
        }
        await tx.execute(
          `SELECT setval('history_entries_id_seq', (SELECT COALESCE(MAX(id), 1) FROM history_entries))`
        );
      }

      if (meeting_notes.length > 0) {
        for (const n of meeting_notes) {
          await tx.insert(meetingNotesTable).values(n).onConflictDoNothing();
        }
        await tx.execute(
          `SELECT setval('meeting_notes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM meeting_notes))`
        );
      }

      if (irock_evaluations.length > 0) {
        for (const e of irock_evaluations) {
          await tx.insert(irockEvaluationsTable).values(e).onConflictDoNothing();
        }
        await tx.execute(
          `SELECT setval('irock_evaluations_id_seq', (SELECT COALESCE(MAX(id), 1) FROM irock_evaluations))`
        );
      }

      if (honos_evaluations.length > 0) {
        for (const e of honos_evaluations) {
          await tx.insert(honosEvaluationsTable).values(e).onConflictDoNothing();
        }
        await tx.execute(
          `SELECT setval('honos_evaluations_id_seq', (SELECT COALESCE(MAX(id), 1) FROM honos_evaluations))`
        );
      }

      if (settingRows.length > 0) {
        for (const s of settingRows) {
          await tx.insert(settingsTable).values(s).onConflictDoUpdate({
            target: settingsTable.key,
            set: { value: s.value },
          });
        }
      }

      if (icd10_codes.length > 0) {
        for (const c of icd10_codes) {
          await tx.insert(icd10CodesTable).values(c).onConflictDoUpdate({
            target: icd10CodesTable.code,
            set: {
              title: c.title,
              description: c.description,
              risks: c.risks,
              isFavorite: c.isFavorite,
            },
          });
        }
      }
    });

    res.json({ message: "Restauration effectuée avec succès" });
  } catch (err: any) {
    console.error("Restore error:", err);
    res.status(500).json({ error: "Erreur lors de la restauration", detail: err.message });
  }
});

export default router;
