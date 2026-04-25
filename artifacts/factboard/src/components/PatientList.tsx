import { useListPatients, getListPatientsQueryKey } from "@workspace/api-client-react";
import { BoardBadge } from "./BoardBadge";
import { AggBadge } from "./AggBadge";

interface PatientListProps {
  board: string;
  search: string;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function PatientList({ board, search, selectedId, onSelect }: PatientListProps) {
  const params = board !== "Tous" ? { board, search: search || undefined } : { search: search || undefined };
  const { data: patients = [], isLoading } = useListPatients(
    params,
    { query: { queryKey: getListPatientsQueryKey(params) } }
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-xs text-muted-foreground text-center">Aucun client</p>
      </div>
    );
  }

  const PHASE_ORDER = [
    "1. Prévention de Crise",
    "2. Traitement intensif court terme",
    "3. Traitement intensif long terme",
    "4a. Évitement de traitement",
    "4b. Évitement à haut risque",
    "5a. Admission Prison",
    "5b. Admission Psychiatrie",
    "6. Nouveau Client",
  ];

  const sorted = [...patients].sort((a, b) => {
    if (board === "FactBoard") {
      const ai = a.phase ? PHASE_ORDER.indexOf(a.phase) : PHASE_ORDER.length;
      const bi = b.phase ? PHASE_ORDER.indexOf(b.phase) : PHASE_ORDER.length;
      if (ai !== bi) return ai - bi;
      return (a.nom ?? "").localeCompare(b.nom ?? "", "fr");
    }
    return (a.nom ?? "").localeCompare(b.nom ?? "", "fr");
  });

  return (
    <div className="flex-1 overflow-y-auto">
      {sorted.map((patient) => (
        <button
          key={patient.id}
          data-testid={`patient-item-${patient.id}`}
          className={`w-full text-left px-3 py-2.5 border-b border-border hover:bg-muted/40 transition-colors ${
            selectedId === patient.id ? "bg-muted/60 border-l-2 border-l-primary" : ""
          }`}
          onClick={() => onSelect(patient.id)}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-border bg-muted shrink-0 flex items-center justify-center">
              {(patient as any).photo ? (
                <img src={(patient as any).photo} alt="" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1 mb-0.5">
                <span className="font-medium text-xs text-foreground truncate">
                  {patient.nom} {patient.prenom}
                </span>
                {patient.patho && (
                  <span className="font-mono text-xs text-muted-foreground shrink-0">{patient.patho}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-xs text-muted-foreground">{patient.clientNum}</span>
                <BoardBadge board={patient.board} />
              </div>
              <div className="flex items-center justify-between gap-1 mt-0.5">
                {patient.psy && (
                  <p className="text-xs text-muted-foreground truncate">{patient.psy}</p>
                )}
                <AggBadge level={patient.agressivite ?? 0} />
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
