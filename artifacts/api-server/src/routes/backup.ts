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
  actRegionsTable,
  actNotesTable,
  usersTable,
} from "@workspace/db";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

function coerceDates(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
      out[k] = new Date(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

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
    actRegions,
    actNotes,
    users,
  ] = await Promise.all([
    db.select().from(patientsTable),
    db.select().from(historyEntriesTable),
    db.select().from(meetingNotesTable),
    db.select().from(irockEvaluationsTable),
    db.select().from(honosEvaluationsTable),
    db.select().from(settingsTable),
    db.select().from(icd10CodesTable),
    db.select().from(actRegionsTable),
    db.select().from(actNotesTable),
    db.select().from(usersTable),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    version: 2,
    patients,
    history_entries: history,
    meeting_notes: notes,
    irock_evaluations: irock,
    honos_evaluations: honos,
    settings,
    icd10_codes: icd10,
    act_regions: actRegions,
    act_notes: actNotes,
    users,
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

  if (!payload || (payload.version !== 1 && payload.version !== 2)) {
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
    act_regions = null,
    act_notes = null,
    users = null,
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

      // ACT data — only wipe if backup contains a valid array (v2 backups), otherwise leave intact.
      // We require Array.isArray so a malformed non-null/non-array value cannot wipe without restoring.
      if (Array.isArray(act_notes)) await tx.delete(actNotesTable);
      if (Array.isArray(act_regions)) await tx.delete(actRegionsTable);

      // Users — only wipe if backup contains a valid array (v2 backups). Sessions cascade.
      if (Array.isArray(users)) await tx.delete(usersTable);

      // Re-insert patients first (other tables FK to them)
      if (patients.length > 0) {
        for (const p of patients) {
          await tx.insert(patientsTable).values(coerceDates(p) as any).onConflictDoNothing();
        }
        await tx.execute(
          `SELECT setval('patients_id_seq', (SELECT COALESCE(MAX(id), 1) FROM patients))`
        );
      }

      if (history_entries.length > 0) {
        for (const h of history_entries) {
          await tx.insert(historyEntriesTable).values(coerceDates(h) as any).onConflictDoNothing();
        }
        await tx.execute(
          `SELECT setval('history_entries_id_seq', (SELECT COALESCE(MAX(id), 1) FROM history_entries))`
        );
      }

      if (meeting_notes.length > 0) {
        for (const n of meeting_notes) {
          await tx.insert(meetingNotesTable).values(coerceDates(n) as any).onConflictDoNothing();
        }
        await tx.execute(
          `SELECT setval('meeting_notes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM meeting_notes))`
        );
      }

      if (irock_evaluations.length > 0) {
        for (const e of irock_evaluations) {
          await tx.insert(irockEvaluationsTable).values(coerceDates(e) as any).onConflictDoNothing();
        }
        await tx.execute(
          `SELECT setval('irock_evaluations_id_seq', (SELECT COALESCE(MAX(id), 1) FROM irock_evaluations))`
        );
      }

      if (honos_evaluations.length > 0) {
        for (const e of honos_evaluations) {
          await tx.insert(honosEvaluationsTable).values(coerceDates(e) as any).onConflictDoNothing();
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

      // ACT regions must be inserted before act_notes (FK)
      if (Array.isArray(act_regions) && act_regions.length > 0) {
        for (const r of act_regions) {
          await tx.insert(actRegionsTable).values(coerceDates(r) as any).onConflictDoNothing();
        }
        await tx.execute(
          `SELECT setval('act_regions_id_seq', (SELECT COALESCE(MAX(id), 1) FROM act_regions))`
        );
      }

      if (Array.isArray(act_notes) && act_notes.length > 0) {
        for (const n of act_notes) {
          await tx.insert(actNotesTable).values(coerceDates(n) as any).onConflictDoNothing();
        }
        await tx.execute(
          `SELECT setval('act_notes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM act_notes))`
        );
      }

      if (Array.isArray(users) && users.length > 0) {
        for (const u of users) {
          await tx.insert(usersTable).values(coerceDates(u) as any).onConflictDoNothing();
        }
        await tx.execute(
          `SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users))`
        );
      }
    });

    res.json({ message: "Restauration effectuée avec succès" });
  } catch (err: any) {
    console.error("Restore error:", err);
    res.status(500).json({ error: "Erreur lors de la restauration", detail: err.message });
  }
});

export default router;
