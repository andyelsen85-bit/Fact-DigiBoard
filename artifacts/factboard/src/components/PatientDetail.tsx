import { useState, useCallback, useRef } from "react";
import { Trash2 } from "lucide-react";
import { EvaluationModal } from "./EvaluationModal";
import {
  useListIrock, useCreateIrock, useUpdateIrock, useDeleteIrock,
  useListHonos, useCreateHonos, useUpdateHonos, useDeleteHonos,
  type IrockEval, type HonosEval,
} from "@/hooks/use-evaluations";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetPatient, getGetPatientQueryKey,
  useUpdatePatient, useDeletePatient, useMovePatientBoard,
  useUpdatePatientPassages, useUpdatePatientPhase,
  useUpdatePatientRecovery, useUpdatePatientInfosRecoltees, useUpdatePatientMotifIrrecevable,
  useListPatientNotes, getListPatientNotesQueryKey,
  useCreatePatientNote, useUpdatePatientNote, useDeletePatientNote,
  useListPatientHistory, getListPatientHistoryQueryKey,
  useUpdatePatientHistoryEntry, useDeletePatientHistoryEntry,
  getListPatientsQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { BoardBadge } from "./BoardBadge";
import { AggBadge } from "./AggBadge";
import { useFormOptions } from "@/hooks/use-form-options";
import { usePatientPhotoUpload } from "@/hooks/use-patient-photo";
import { MoveBoardModal } from "./MoveBoardModal";
import { PatientModal } from "./PatientModal";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/i18n";
import { icdText } from "@/i18n/icd";
import "@/i18n/dict/patients";

// PHASES values are stored in the DB (French); phaseKey maps them to a translation key.
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

const PHASE_KEY: Record<string, string> = {
  "1. Prévention de Crise": "phase.1",
  "2. Traitement intensif court terme": "phase.2",
  "3. Traitement intensif long terme": "phase.3",
  "4a. Évitement de traitement": "phase.4a",
  "4b. Évitement à haut risque": "phase.4b",
  "5a. Admission Prison": "phase.5a",
  "5b. Admission Psychiatrie": "phase.5b",
  "6. Nouveau Client": "phase.6",
};

const DAYS = [
  { key: "lundi", labelKey: "lundi" },
  { key: "mardi", labelKey: "mardi" },
  { key: "mercredi", labelKey: "mercredi" },
  { key: "jeudi", labelKey: "jeudi" },
  { key: "vendredi", labelKey: "vendredi" },
];

const DAYS_RDVSPEC = [
  { key: "lundi_rdv", labelKey: "lundi" },
  { key: "mardi_rdv", labelKey: "mardi" },
  { key: "mercredi_rdv", labelKey: "mercredi" },
  { key: "jeudi_rdv", labelKey: "jeudi" },
  { key: "vendredi_rdv", labelKey: "vendredi" },
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
  const { t, lang } = useLang();
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [showPhotoOverlay, setShowPhotoOverlay] = useState(false);
  const [evalModal, setEvalModal] = useState<{ type: "I•ROC" | "HoNOS"; edit?: IrockEval | HonosEval } | null>(null);
  const [notesPage, setNotesPage] = useState(0);
  const [deleteHistoryConfirmId, setDeleteHistoryConfirmId] = useState<number | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const { uploadPhoto } = usePatientPhotoUpload(patientId);

  const { data: patient, isLoading } = useGetPatient(patientId, {
    query: { queryKey: getGetPatientQueryKey(patientId) },
  });
  const { data: formOptions } = useFormOptions();
  const icd10Codes = formOptions?.icd10Codes ?? [];
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
  const deleteHistoryEntry = useDeletePatientHistoryEntry();

  const { data: irockEvals = [] } = useListIrock(patientId);
  const { data: honosEvals = [] } = useListHonos(patientId);
  const createIrock = useCreateIrock(patientId);
  const updateIrock = useUpdateIrock(patientId);
  const deleteIrock = useDeleteIrock(patientId);
  const createHonos = useCreateHonos(patientId);
  const updateHonos = useUpdateHonos(patientId);
  const deleteHonos = useDeleteHonos(patientId);

  const invalidatePatient = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getGetPatientQueryKey(patientId) });
    queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
  }, [queryClient, patientId]);

  const invalidateNotes = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getListPatientNotesQueryKey(patientId) });
  }, [queryClient, patientId]);

  const invalidateHistory = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getListPatientHistoryQueryKey(patientId) });
    queryClient.invalidateQueries({ queryKey: getGetPatientQueryKey(patientId) });
    queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
  }, [queryClient, patientId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!patient) return null;

  const activeCodes: string[] = Array.isArray((patient as any).pathos) && (patient as any).pathos.length > 0
    ? (patient as any).pathos
    : (patient.patho ? [patient.patho] : []);
  const passages = (patient.passages ?? {}) as Record<string, string>;
  const board = patient.board;
  const isCloture = board === "Clôturé";
  const showPassages = board !== "Irrecevable";
  const sortedNotes = [...notes].sort((a, b) => {
    const dateDiff = (b.date ?? "").localeCompare(a.date ?? "");
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const sortedHistory = [...history].sort((a, b) => a.date.localeCompare(b.date));

  function handleDelete() {
    if (!confirm(t("patients.confirmDeleteClient", { name: `${patient!.prenom} ${patient!.nom}` }))) return;
    deletePatient.mutate(
      { id: patientId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
          onDeleted();
          toast({ title: t("patients.clientDeleted") });
        },
        onError: () => toast({ title: t("common.error"), description: t("patients.cannotDeleteClient"), variant: "destructive" }),
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
          toast({ title: t("patients.movedTo", { board: t("common.board." + board) }) });
        },
        onError: () => toast({ title: t("common.error"), description: t("patients.cannotMoveClient"), variant: "destructive" }),
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
          toast({ title: t("patients.clientUpdated") });
        },
        onError: () => toast({ title: t("common.error"), description: t("patients.cannotUpdateClient"), variant: "destructive" }),
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
      {
        onSuccess: () => {
          invalidatePatient();
          toast({ title: t("patients.phaseUpdated") });
        },
        onError: () => toast({ title: t("common.error"), description: t("patients.cannotUpdatePhase"), variant: "destructive" }),
      }
    );
  }

  function handleAddNote() {
    createNote.mutate(
      { id: patientId, data: { date: new Date().toISOString().slice(0, 10), texte: "" } },
      { onSuccess: () => { invalidateNotes(); setNotesPage(0); } }
    );
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      await uploadPhoto(file);
      toast({ title: t("patients.photoUpdated") });
    } catch {
      toast({ title: t("common.error"), description: t("patients.cannotSavePhoto"), variant: "destructive" });
    } finally {
      setPhotoUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  }

  function handleEvalSave(data: any) {
    if (!evalModal) return;
    if (evalModal.type === "I•ROC") {
      if (evalModal.edit) {
        updateIrock.mutate(
          { evalId: evalModal.edit.id, data },
          { onSuccess: () => { setEvalModal(null); toast({ title: t("patients.irockUpdated") }); } }
        );
      } else {
        createIrock.mutate(data, {
          onSuccess: () => { setEvalModal(null); toast({ title: t("patients.irockSaved") }); },
        });
      }
    } else {
      if (evalModal.edit) {
        updateHonos.mutate(
          { evalId: evalModal.edit.id, data },
          { onSuccess: () => { setEvalModal(null); toast({ title: t("patients.honosUpdated") }); } }
        );
      } else {
        createHonos.mutate(data, {
          onSuccess: () => { setEvalModal(null); toast({ title: t("patients.honosSaved") }); },
        });
      }
    }
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
          <div className="flex items-start gap-4">
            <div className="relative group shrink-0">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
                disabled={photoUploading}
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                onMouseEnter={() => patient.photo && setShowPhotoOverlay(true)}
                onMouseLeave={() => setShowPhotoOverlay(false)}
                className="w-16 h-16 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary relative"
                title={t("patients.changePhoto")}
                disabled={photoUploading}
              >
                {patient.photo ? (
                  <img src={patient.photo} alt={t("patients.photoAlt")} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {photoUploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
              </button>
              {showPhotoOverlay && patient.photo && (
                <div className="absolute left-20 top-0 z-50 pointer-events-none">
                  <img
                    src={patient.photo}
                    alt={t("patients.photoZoomAlt")}
                    className="max-w-[320px] max-h-[320px] w-auto h-auto rounded-lg shadow-2xl border border-border object-contain bg-black/80"
                  />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-light tracking-tight">
                {patient.prenom} <span className="font-medium">{patient.nom}</span>
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm text-muted-foreground">{patient.clientNum}</span>
                <BoardBadge board={patient.board} />
                <AggBadge level={patient.agressivite ?? -1} />
                {patient.boardEntryDate && (
                  <span className="text-xs text-muted-foreground">
                    {t("patients.since", { date: patient.boardEntryDate })}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <Button size="sm" variant="outline" onClick={() => setShowMoveModal(true)} data-testid="button-move-board">
              {t("patients.changeBoard")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowEditModal(true)} data-testid="button-edit-patient">
              {t("common.edit")}
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDelete} data-testid="button-delete-patient">
              {t("common.delete")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={() => setEvalModal({ type: "I•ROC" })}
              data-testid="button-irock"
            >
              I•ROC
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
              onClick={() => setEvalModal({ type: "HoNOS" })}
              data-testid="button-honos"
            >
              HoNOS
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">{t("patients.infosGenerales")}</h3>
        <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-sm">
          {patient.dob && <InfoRow label={t("patients.dob")} value={patient.dob} />}
          {patient.sexe && <InfoRow label={t("patients.sexe")} value={patient.sexe} />}
          {patient.tel && <InfoRow label={t("patients.tel")} value={patient.tel} />}
          {patient.adresse && <InfoRow label={t("patients.adresse")} value={patient.adresse} col3 />}
          {patient.medecinFamille && <InfoRow label={t("patients.medecinFamille")} value={patient.medecinFamille} />}
          {patient.psy && <InfoRow label={t("patients.psy")} value={patient.psy} />}
          {patient.responsable && <InfoRow label={t("patients.caseManager")} value={patient.responsable} />}
          {patient.casemanager2 && <InfoRow label={t("patients.caseManager2")} value={patient.casemanager2} />}
          {patient.article && <InfoRow label={t("patients.articleLegal")} value={patient.article} />}
          {patient.curatelle && <InfoRow label={t("patients.curatelle")} value={patient.curatelle} />}
          {patient.datePremierContact && <InfoRow label={t("patients.premierContact")} value={patient.datePremierContact} />}
          {patient.dateEntree && <InfoRow label={t("patients.dateEntree")} value={patient.dateEntree} />}
          {patient.dateSortie && <InfoRow label={t("patients.dateSortie")} value={patient.dateSortie} />}
          {(patient as any).dateFinSuivi && <InfoRow label={t("patients.dateFinSuivi")} value={(patient as any).dateFinSuivi} />}
          {patient.demande && <InfoRow label={t("patients.motifDemande")} value={patient.demande} col3 />}
          {patient.remarques && <InfoRow label={t("patients.remarques")} value={patient.remarques} col3 />}
        </div>
        {activeCodes.length > 0 && (
          <div className="mt-3 pt-3 border-t space-y-2">
            <span className="text-xs text-muted-foreground">{t("patients.diagnosticsCim10")}</span>
            <div className="flex flex-col gap-2">
              {activeCodes.map((code) => {
                const info = icd10Codes.find((d) => d.code === code);
                return (
                  <div key={code} className="rounded-md border bg-muted/20 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-muted-foreground">{code}</span>
                      {info && <span className="text-sm text-foreground">{icdText(info, "title", lang)}</span>}
                    </div>
                    {info && (
                      <div className="mt-1.5 space-y-1.5">
                        {icdText(info, "description", lang) && (
                          <div className="p-2 bg-muted/40 rounded text-xs text-muted-foreground">{icdText(info, "description", lang)}</div>
                        )}
                        <div className={`p-2 rounded text-xs ${info.risks ? "bg-[#fdeaea] text-[#7a0000]" : "bg-muted/40 text-muted-foreground italic"}`}>
                          {info.risks ? t("patients.risksLabel", { risks: icdText(info, "risks", lang) ?? "" }) : t("patients.noClinicalRisk")}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {(board === "FactBoard" || isCloture) && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">{t("patients.phaseFactboard")}</h3>
          <div className="mb-3">
            <label className="text-xs text-muted-foreground block mb-1">{t("patients.dateAdmission")}</label>
            <input
              type="date"
              defaultValue={(patient as any).dateAdmission ?? ""}
              className="w-full px-3 py-1.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              onBlur={(e) => {
                const val = e.target.value;
                if (val !== ((patient as any).dateAdmission ?? "")) {
                  updatePatient.mutate(
                    { id: patientId, data: { dateAdmission: val || null } },
                    { onSuccess: invalidatePatient }
                  );
                }
              }}
            />
          </div>
          <Select
            value={patient.phase ?? ""}
            onValueChange={handlePhaseChange}
          >
            <SelectTrigger data-testid="select-phase" className="w-full">
              <SelectValue placeholder={t("patients.selectPhase")} />
            </SelectTrigger>
            <SelectContent>
              {PHASES.map((phase) => (
                <SelectItem key={phase} value={phase} data-testid={`phase-option-${phase.slice(0, 2)}`}>
                  {t("patients." + (PHASE_KEY[phase] ?? "")) }
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {(board === "RecoveryBoard" || isCloture) && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">{t("patients.recoveryTitle")}</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">{t("patients.objectifs")}</label>
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
              <label className="text-xs text-muted-foreground">{t("patients.etapeEnCours")}</label>
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
              <label className="text-xs text-muted-foreground">{t("patients.actionPlanifiee")}</label>
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

      {(board === "PréAdmission" || isCloture) && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">{t("patients.infosRecoltees")}</h3>
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

      {(board === "Irrecevable" || isCloture) && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">{t("patients.motifIrrecevable")}</h3>
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
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">{t("patients.passagesHebdo")}</h3>
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-2">{t("patients.passages")}</p>
            <div className="grid grid-cols-5 gap-2">
              {DAYS.map(({ key, labelKey }) => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground">{t("patients." + labelKey)}</label>
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
            <p className="text-xs text-muted-foreground mb-2">{t("patients.rdvSpecifiques")}</p>
            <div className="grid grid-cols-5 gap-2">
              {DAYS_RDVSPEC.map(({ key, labelKey }) => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground">{t("patients." + labelKey)}</label>
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
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("patients.notesReunion")}</h3>
          <Button size="sm" variant="outline" onClick={handleAddNote} disabled={createNote.isPending} data-testid="button-add-note">
            {t("patients.addNote")}
          </Button>
        </div>
        {(() => {
          const NOTES_PER_PAGE = 5;
          const totalPages = Math.max(1, Math.ceil(sortedNotes.length / NOTES_PER_PAGE));
          const safePage = Math.min(notesPage, totalPages - 1);
          const pagedNotes = sortedNotes.slice(safePage * NOTES_PER_PAGE, (safePage + 1) * NOTES_PER_PAGE);
          return (
            <>
              <div className="space-y-2">
                {pagedNotes.map((note) => (
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
                      {t("common.delete")}
                    </button>
                  </div>
                ))}
                {sortedNotes.length === 0 && (
                  <p className="text-xs text-muted-foreground py-2">{t("patients.aucuneNote")}</p>
                )}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <button
                    className="text-xs px-3 py-1 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    onClick={() => setNotesPage((p) => Math.max(0, p - 1))}
                    disabled={safePage === 0}
                  >
                    {t("patients.previous")}
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {t("patients.pageOf", { page: safePage + 1, total: totalPages })}
                    <span className="ml-2 text-muted-foreground/60">{t("patients.notesCount", { count: sortedNotes.length })}</span>
                  </span>
                  <button
                    className="text-xs px-3 py-1 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    onClick={() => setNotesPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={safePage === totalPages - 1}
                  >
                    {t("patients.next")}
                  </button>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Evaluations history */}
      {(irockEvals.length > 0 || honosEvals.length > 0) && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">{t("patients.evaluations")}</h3>
          <div className="space-y-2">
            {[
              ...irockEvals.map((e) => ({ ...e, type: "I•ROC" as const })),
              ...honosEvals.map((e) => ({ ...e, type: "HoNOS" as const })),
            ]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((e) => {
                const isIroc = e.type === "I•ROC";
                const qCount = 12;
                const total = Array.from({ length: qCount }, (_, i) => (e as any)[`q${i + 1}`] ?? 0)
                  .reduce((s, v) => s + v, 0);
                return (
                  <div key={`${e.type}-${e.id}`} className="flex items-center gap-3 border rounded-md px-3 py-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                        isIroc
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {e.type}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">{e.date}</span>
                    <span className="text-xs text-muted-foreground">{t("patients.score")} <span className="font-mono font-medium text-foreground">{total}</span>/{isIroc ? 72 : 48}</span>
                    {(e as any).createdByUsername && (
                      <span className="text-xs text-muted-foreground/70 italic">{t("patients.by", { name: (e as any).createdByUsername })}</span>
                    )}
                    <div className="ml-auto flex gap-1">
                      <button
                        className="text-xs text-primary hover:underline px-1"
                        onClick={() => setEvalModal({ type: e.type, edit: e as any })}
                      >
                        {t("common.edit")}
                      </button>
                      <button
                        className="text-xs text-destructive hover:underline px-1"
                        onClick={() => {
                          if (!confirm(t("patients.confirmDeleteEval", { type: e.type }))) return;
                          if (isIroc) deleteIrock.mutate(e.id);
                          else deleteHonos.mutate(e.id);
                        }}
                      >
                        {t("common.delete")}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">{t("patients.historiqueMouvements")}</h3>
        {sortedHistory.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("patients.aucunHistorique")}</p>
        ) : (
          <div className="space-y-2">
            {sortedHistory.map((entry, idx) => {
              const nextDate = sortedHistory[idx + 1]?.date;
              const duration = daysBetween(entry.date, nextDate);
              const isConfirming = deleteHistoryConfirmId === entry.id;
              return (
                <div key={entry.id} className="flex items-center gap-3 text-sm border-b pb-2">
                  <input
                    type="date"
                    className="text-xs border rounded px-1 h-7 w-32 bg-background font-mono"
                    defaultValue={entry.date}
                    key={`history-date-${entry.id}-${entry.date}`}
                    data-testid={`history-date-${entry.id}`}
                    onBlur={(e) => {
                      if (e.target.value !== entry.date) {
                        updateHistoryEntry.mutate(
                          { id: patientId, historyId: entry.id, data: { date: e.target.value } },
                          { onSuccess: invalidateHistory }
                        );
                      }
                    }}
                  />
                  <span className="flex-1 text-foreground">{entry.action}</span>
                  {entry.boardTo && <BoardBadge board={entry.boardTo} />}
                  {(entry as any).createdByUsername && (
                    <span className="text-xs text-muted-foreground/70 italic">{t("patients.by", { name: (entry as any).createdByUsername })}</span>
                  )}
                  <span className="font-mono text-xs text-muted-foreground">{t("patients.daysShort", { days: duration })}</span>
                  {isConfirming ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        className="text-xs text-red-600 font-medium hover:underline"
                        disabled={deleteHistoryEntry.isPending}
                        onClick={() => {
                          deleteHistoryEntry.mutate(
                            { id: patientId, historyId: entry.id },
                            {
                              onSuccess: () => {
                                setDeleteHistoryConfirmId(null);
                                invalidateHistory();
                                toast({ title: t("patients.movementDeleted") });
                              },
                            }
                          );
                        }}
                      >
                        {t("common.confirm")}
                      </button>
                      <span className="text-muted-foreground">·</span>
                      <button
                        className="text-xs text-muted-foreground hover:underline"
                        onClick={() => setDeleteHistoryConfirmId(null)}
                      >
                        {t("common.cancel")}
                      </button>
                    </div>
                  ) : (
                    <button
                      className="shrink-0 text-muted-foreground/40 hover:text-red-500 transition-colors"
                      title={t("patients.deleteMovement")}
                      onClick={() => setDeleteHistoryConfirmId(entry.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {evalModal && (
        <EvaluationModal
          type={evalModal.type}
          initial={evalModal.edit}
          onSave={handleEvalSave}
          onClose={() => setEvalModal(null)}
          isPending={
            evalModal.type === "I•ROC"
              ? (createIrock.isPending || updateIrock.isPending)
              : (createHonos.isPending || updateHonos.isPending)
          }
        />
      )}

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
        title={t("patients.editClient")}
        initialValues={patient}
        isEdit
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
