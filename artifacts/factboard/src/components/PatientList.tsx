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
        <p className="text-xs text-muted-foreground text-center">Aucun patient</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {patients.map((patient) => (
        <button
          key={patient.id}
          data-testid={`patient-item-${patient.id}`}
          className={`w-full text-left px-3 py-2.5 border-b border-border hover:bg-muted/40 transition-colors ${
            selectedId === patient.id ? "bg-muted/60 border-l-2 border-l-primary" : ""
          }`}
          onClick={() => onSelect(patient.id)}
        >
          <div className="flex items-start justify-between gap-1 mb-0.5">
            <span className="font-medium text-xs text-foreground truncate">
              {patient.nom} {patient.prenom}
            </span>
            {patient.agressivite > 0 && <AggBadge level={patient.agressivite} />}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">{patient.clientNum}</span>
            <BoardBadge board={patient.board} />
          </div>
          {patient.psy && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{patient.psy}</p>
          )}
        </button>
      ))}
    </div>
  );
}
