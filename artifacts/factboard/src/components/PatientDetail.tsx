import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetPatient, getGetPatientQueryKey,
  useUpdatePatient, useDeletePatient, useMovePatientBoard,
  useUpdatePatientPassages, useUpdatePatientPhase,
  useUpdatePatientRecovery, useUpdatePatientInfosRecoltees, useUpdatePatientMotifIrrecevable,
  useListPatientNotes, getListPatientNotesQueryKey,
  useCreatePatientNote, useUpdatePatientNote, useDeletePatientNote,
  useListPatientHistory, getListPatientHistoryQueryKey,
  useUpdatePatientHistoryEntry,
  getListPatientsQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BoardBadge } from "./BoardBadge";
import { AggBadge } from "./AggBadge";
import { CIM10_DATA } from "@/data/cim10";
import { MoveBoardModal } from "./MoveBoardModal";
import { PatientModal } from "./PatientModal";
import { useToast } from "@/hooks/use-toast";

const PHASES = [
  "1. Prévention de Crise",
  "2. Traitement intensif court terme",
  "3. Traitement intensif long terme",
  "4a. Évitement de traitement",
  "4b. Évitement à haut risque",
  "5a. Admission Prison",
  "5b. Admission Psychiatrie",
  "6. Nouveau Client",
];

const DAYS = [
  { key: "lundi", label: "Lundi" },
  { key: "mardi", label: "Mardi" },
  { key: "mercredi", label: "Mercredi" },
  { key: "jeudi", label: "Jeudi" },
  { key: "vendredi", label: "Vendredi" },
];

const DAYS_RDVSPEC = [
  { key: "lundi_rdv", label: "Lundi" },
  { key: "mardi_rdv", label: "Mardi" },
  { key: "mercredi_rdv", label: "Mercredi" },
  { key: "jeudi_rdv", label: "Jeudi" },
  { key: "vendredi_rdv", label: "Vendredi" },
];

function daysBetween(d1: string, d2?: string): number {
  const a = new Date(d1);
  const b = d2 ? new Date(d2) : new Date();
  return Math.max(0, Math.floor((b.getTime() - a.getTime()) / (1000 * 3600 * 24)));
}

interface PatientDetailProps {
  patientId: number;
  onDeleted: () => void;
}

export function PatientDetail({ patientId, onDeleted }: PatientDetailProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: patient, isLoading } = useGetPatient(patientId, {
    query: { queryKey: getGetPatientQueryKey(patientId) },
  });
  const { data: notes = [] } = useListPatientNotes(patientId, {
    query: { queryKey: getListPatientNotesQueryKey(patientId) },
  });
  const { data: history = [] } = useListPatientHistory(patientId, {
    query: { queryKey: getListPatientHistoryQueryKey(patientId) },
  });

  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();
  const moveBoard = useMovePatientBoard();
  const updatePassages = useUpdatePatientPassages();
  const updatePhase = useUpdatePatientPhase();
  const updateRecovery = useUpdatePatientRecovery();
  const updateInfosRecoltees = useUpdatePatientInfosRecoltees();
  const updateMotifIrrecevable = useUpdatePatientMotifIrrecevable();

  const createNote = useCreatePatientNote();
  const updateNote = useUpdatePatientNote();
  const deleteNote = useDeletePatientNote();
  const updateHistoryEntry = useUpdatePatientHistoryEntry();

  const invalidatePatient = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getGetPatientQueryKey(patientId) });
    queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
  }, [queryClient, patientId]);

  const invalidateNotes = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getListPatientNotesQueryKey(patientId) });
  }, [queryClient, patientId]);

  const invalidateHistory = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getListPatientHistoryQueryKey(patientId) });
  }, [queryClient, patientId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!patient) return null;

  const pathoInfo = CIM10_DATA.find((d) => d.c === patient.patho);
  const passages = (patient.passages ?? {}) as Record<string, string>;
  const showBoard = patient.board;
  const showPassages = showBoard !== "Clôturé" && showBoard !== "Irrecevable";
  const sortedNotes = [...notes].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  const sortedHistory = [...history].sort((a, b) => a.date.localeCompare(b.date));

  function handleDelete() {
    if (!confirm(`Supprimer le patient ${patient!.prenom} ${patient!.nom} ?`)) return;
    deletePatient.mutate(
      { id: patientId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
          onDeleted();
          toast({ title: "Patient supprimé" });
        },
        onError: () => toast({ title: "Erreur", description: "Impossible de supprimer le patient", variant: "destructive" }),
      }
    );
  }

  function handleMove(board: string, date: string) {
    moveBoard.mutate(
      { id: patientId, data: { board, date } },
      {
        onSuccess: () => {
          setShowMoveModal(false);
          invalidatePatient();
          invalidateHistory();
          toast({ title: `Déplacé vers ${board}` });
        },
        onError: () => toast({ title: "Erreur", description: "Impossible de déplacer le patient", variant: "destructive" }),
      }
    );
  }

  function handleEdit(values: any) {
    updatePatient.mutate(
      { id: patientId, data: values },
      {
        onSuccess: () => {
          setShowEditModal(false);
          invalidatePatient();
          toast({ title: "Patient mis à jour" });
        },
        onError: () => toast({ title: "Erreur", description: "Impossible de modifier le patient", variant: "destructive" }),
      }
    );
  }

  function handlePassageBlur(key: string, value: string) {
    const updated = { ...passages, [key]: value };
    updatePassages.mutate(
      { id: patientId, data: { passages: updated } },
      { onSuccess: () => invalidatePatient() }
    );
  }

  function handlePhaseChange(phase: string) {
    updatePhase.mutate(
      { id: patientId, data: { phase } },
      { onSuccess: () => invalidatePatient() }
    );
  }

  function handleAddNote() {
    createNote.mutate(
      { id: patientId, data: { date: new Date().toISOString().slice(0, 10), texte: "" } },
      { onSuccess: () => invalidateNotes() }
    );
  }

  function handleDeleteNote(noteId: number) {
    deleteNote.mutate(
      { patientId, noteId },
      { onSuccess: () => invalidateNotes() }
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4" data-testid="patient-detail">
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-light tracking-tight">
              {patient.prenom} <span className="font-medium">{patient.nom}</span>
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm text-muted-foreground">{patient.clientNum}</span>
              <BoardBadge board={patient.board} />
              {patient.agressivite > 0 && <AggBadge level={patient.agressivite} />}
              {patient.boardEntryDate && (
                <span className="text-xs text-muted-foreground">
                  depuis le {patient.boardEntryDate}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowMoveModal(true)} data-testid="button-move-board">
              Changer de board
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowEditModal(true)} data-testid="button-edit-patient">
              Modifier
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDelete} data-testid="button-delete-patient">
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Informations générales</h3>
        <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-sm">
          {patient.dob && <InfoRow label="Date de naissance" value={patient.dob} />}
          {patient.sexe && <InfoRow label="Sexe" value={patient.sexe} />}
          {patient.tel && <InfoRow label="Téléphone" value={patient.tel} />}
          {patient.adresse && <InfoRow label="Adresse" value={patient.adresse} col3 />}
          {patient.medecinFamille && <InfoRow label="Médecin de famille" value={patient.medecinFamille} />}
          {patient.psy && <InfoRow label="Psychiatre" value={patient.psy} />}
          {patient.responsable && <InfoRow label="Case Manager" value={patient.responsable} />}
          {patient.casemanager2 && <InfoRow label="Case Manager 2" value={patient.casemanager2} />}
          {patient.article && <InfoRow label="Article légal" value={patient.article} />}
          {patient.curatelle && <InfoRow label="Curatelle / Tutelle" value={patient.curatelle} />}
          {patient.datePremierContact && <InfoRow label="1er contact" value={patient.datePremierContact} />}
          {patient.dateEntree && <InfoRow label="Date d'entrée" value={patient.dateEntree} />}
          {patient.dateSortie && <InfoRow label="Date de sortie" value={patient.dateSortie} />}
          {patient.demande && <InfoRow label="Motif de demande" value={patient.demande} col3 />}
          {patient.remarques && <InfoRow label="Remarques" value={patient.remarques} col3 />}
        </div>
        {patient.patho && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground">Pathologie</span>
              <span className="font-mono text-xs font-medium">{patient.patho}</span>
              {pathoInfo && <span className="text-sm text-foreground">{pathoInfo.t}</span>}
            </div>
            {pathoInfo && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="p-2 bg-muted/40 rounded text-xs text-muted-foreground">{pathoInfo.d}</div>
                <div className="p-2 bg-[#fdeaea] rounded text-xs text-[#7a0000]">Risques : {pathoInfo.r}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {patient.board === "FactBoard" && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Phase</h3>
          <div className="grid grid-cols-2 gap-2">
            {PHASES.map((phase) => (
              <button
                key={phase}
                type="button"
                data-testid={`phase-option-${phase.slice(0, 2)}`}
                className={`text-left text-sm px-3 py-2 rounded border transition-colors ${
                  patient.phase === phase
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                }`}
                onClick={() => handlePhaseChange(phase)}
              >
                {phase}
              </button>
            ))}
          </div>
        </div>
      )}

      {patient.board === "RecoveryBoard" && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Rétablissement</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Objectifs</label>
              <Textarea
                data-testid="textarea-recovery-objectifs"
                defaultValue={patient.recoveryObjectifs ?? ""}
                rows={3}
                onBlur={(e) => {
                  if (e.target.value !== patient.recoveryObjectifs) {
                    updateRecovery.mutate({ id: patientId, data: { recoveryObjectifs: e.target.value } }, { onSuccess: invalidatePatient });
                  }
                }}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Étape en cours</label>
              <Textarea
                data-testid="textarea-recovery-etape"
                defaultValue={patient.recoveryEtape ?? ""}
                rows={3}
                onBlur={(e) => {
                  if (e.target.value !== patient.recoveryEtape) {
                    updateRecovery.mutate({ id: patientId, data: { recoveryEtape: e.target.value } }, { onSuccess: invalidatePatient });
                  }
                }}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Action planifiée</label>
              <Textarea
                data-testid="textarea-recovery-action"
                defaultValue={patient.recoveryAction ?? ""}
                rows={3}
                onBlur={(e) => {
                  if (e.target.value !== patient.recoveryAction) {
                    updateRecovery.mutate({ id: patientId, data: { recoveryAction: e.target.value } }, { onSuccess: invalidatePatient });
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {patient.board === "PréAdmission" && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Informations recoltées</h3>
          <Textarea
            data-testid="textarea-infos-recoltees"
            defaultValue={patient.infosRecoltees ?? ""}
            rows={5}
            onBlur={(e) => {
              if (e.target.value !== patient.infosRecoltees) {
                updateInfosRecoltees.mutate({ id: patientId, data: { infosRecoltees: e.target.value } }, { onSuccess: invalidatePatient });
              }
            }}
          />
        </div>
      )}

      {patient.board === "Irrecevable" && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Motif d'irrecevabilité</h3>
          <Textarea
            data-testid="textarea-motif-irrecevable"
            defaultValue={patient.motifIrrecevable ?? ""}
            rows={4}
            onBlur={(e) => {
              if (e.target.value !== patient.motifIrrecevable) {
                updateMotifIrrecevable.mutate({ id: patientId, data: { motifIrrecevable: e.target.value } }, { onSuccess: invalidatePatient });
              }
            }}
          />
        </div>
      )}

      {showPassages && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Passages hebdomadaires</h3>
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-2">Passages</p>
            <div className="grid grid-cols-5 gap-2">
              {DAYS.map(({ key, label }) => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground">{label}</label>
                  <Textarea
                    data-testid={`passage-${key}`}
                    key={`${patientId}-${key}`}
                    defaultValue={passages[key] ?? ""}
                    rows={3}
                    className="text-xs"
                    onBlur={(e) => handlePassageBlur(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Rendez-vous spécifiques</p>
            <div className="grid grid-cols-5 gap-2">
              {DAYS_RDVSPEC.map(({ key, label }) => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground">{label}</label>
                  <Textarea
                    data-testid={`passage-${key}`}
                    key={`${patientId}-${key}`}
                    defaultValue={passages[key] ?? ""}
                    rows={3}
                    className="text-xs"
                    onBlur={(e) => handlePassageBlur(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Notes de réunion</h3>
          <Button size="sm" variant="outline" onClick={handleAddNote} disabled={createNote.isPending} data-testid="button-add-note">
            + Ajouter
          </Button>
        </div>
        <div className="space-y-2">
          {sortedNotes.map((note) => (
            <div key={note.id} className="flex gap-2 items-start border rounded-md p-2">
              <input
                type="date"
                className="text-xs border rounded px-1 h-7 w-32 bg-background"
                defaultValue={note.date ?? ""}
                data-testid={`note-date-${note.id}`}
                onBlur={(e) => {
                  if (e.target.value !== note.date) {
                    updateNote.mutate(
                      { patientId, noteId: note.id, data: { date: e.target.value } },
                      { onSuccess: invalidateNotes }
                    );
                  }
                }}
              />
              <textarea
                className="flex-1 text-sm border rounded px-2 py-1 bg-background resize-none min-h-[60px]"
                defaultValue={note.texte ?? ""}
                data-testid={`note-text-${note.id}`}
                onBlur={(e) => {
                  if (e.target.value !== note.texte) {
                    updateNote.mutate(
                      { patientId, noteId: note.id, data: { texte: e.target.value } },
                      { onSuccess: invalidateNotes }
                    );
                  }
                }}
              />
              <button
                className="text-xs text-destructive hover:text-destructive/80 px-1 py-1"
                data-testid={`button-delete-note-${note.id}`}
                onClick={() => handleDeleteNote(note.id)}
              >
                Supprimer
              </button>
            </div>
          ))}
          {sortedNotes.length === 0 && (
            <p className="text-xs text-muted-foreground py-2">Aucune note</p>
          )}
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Historique des mouvements</h3>
        {sortedHistory.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucun historique</p>
        ) : (
          <div className="space-y-2">
            {sortedHistory.map((entry, idx) => {
              const nextDate = sortedHistory[idx + 1]?.date;
              const duration = daysBetween(entry.date, nextDate);
              return (
                <div key={entry.id} className="flex items-center gap-3 text-sm border-b pb-2">
                  <input
                    type="date"
                    className="text-xs border rounded px-1 h-7 w-32 bg-background font-mono"
                    defaultValue={entry.date}
                    data-testid={`history-date-${entry.id}`}
                    onBlur={(e) => {
                      if (e.target.value !== entry.date) {
                        updateHistoryEntry.mutate(
                          { patientId, entryId: entry.id, data: { date: e.target.value } },
                          { onSuccess: invalidateHistory }
                        );
                      }
                    }}
                  />
                  <span className="flex-1 text-foreground">{entry.action}</span>
                  {entry.boardTo && <BoardBadge board={entry.boardTo} />}
                  <span className="font-mono text-xs text-muted-foreground">{duration} j</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MoveBoardModal
        open={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        currentBoard={patient.board}
        onMove={handleMove}
        isPending={moveBoard.isPending}
      />

      <PatientModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEdit}
        isPending={updatePatient.isPending}
        title="Modifier le patient"
        initialValues={patient}
      />
    </div>
  );
}

function InfoRow({ label, value, col3 }: { label: string; value: string; col3?: boolean }) {
  return (
    <div className={col3 ? "col-span-3" : ""}>
      <span className="text-muted-foreground text-xs">{label} : </span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
