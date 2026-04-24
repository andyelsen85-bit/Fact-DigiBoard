import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useCreatePatient, getListPatientsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { PatientList } from "@/components/PatientList";
import { PatientDetail } from "@/components/PatientDetail";
import { PatientModal } from "@/components/PatientModal";
import { StatsView } from "@/components/StatsView";
import { ActView } from "@/components/ActView";
import { useToast } from "@/hooks/use-toast";

const BOARD_NAV = [
  { label: "Tous", value: "Tous" },
  { label: "Pré-Admission", value: "PréAdmission" },
  { label: "FactBoard", value: "FactBoard" },
  { label: "RecoveryBoard", value: "RecoveryBoard" },
  { label: "Irrecevable", value: "Irrecevable" },
  { label: "Clôturé", value: "Clôturé" },
];

const TOOL_NAV = [
  { label: "ACT", value: "ACT" },
  { label: "Statistiques", value: "Statistiques" },
];

export default function BoardPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeBoard, setActiveBoard] = useState("Tous");
  const [search, setSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);

  const createPatient = useCreatePatient();

  function handleCreatePatient(values: any) {
    createPatient.mutate(
      { data: values },
      {
        onSuccess: (patient) => {
          queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
          setShowNewPatientModal(false);
          setSelectedPatientId(patient.id);
          toast({ title: "Patient créé" });
        },
        onError: () => toast({ title: "Erreur", description: "Impossible de créer le patient", variant: "destructive" }),
      }
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <header className="h-12 border-b bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <h1
            className="font-bold text-base tracking-tight cursor-pointer select-none"
            onClick={() => setActiveBoard("Tous")}
            data-testid="app-logo"
          >
            Digi<span className="font-light">Board</span>
          </h1>
          <nav className="flex items-center gap-0.5">
            {BOARD_NAV.map((item) => (
              <button
                key={item.value}
                data-testid={`nav-${item.value}`}
                className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                  activeBoard === item.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => { setActiveBoard(item.value); setSelectedPatientId(null); }}
              >
                {item.label}
              </button>
            ))}
            <div className="w-px h-4 bg-border mx-1 shrink-0" />
            {TOOL_NAV.map((item) => (
              <button
                key={item.value}
                data-testid={`nav-${item.value}`}
                className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                  activeBoard === item.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => setActiveBoard(item.value)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
            onClick={() => setShowNewPatientModal(true)}
            data-testid="button-new-patient"
          >
            + Nouveau patient
          </button>
          <span className="text-xs text-muted-foreground">{user?.username}</span>
          {user?.role === "admin" && (
            <button
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setLocation("/settings")}
              data-testid="button-settings"
            >
              Paramètres
            </button>
          )}
          <button
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={logout}
            data-testid="button-logout"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {activeBoard === "Statistiques" ? (
          <div className="flex-1 overflow-y-auto">
            <StatsView />
          </div>
        ) : activeBoard === "ACT" ? (
          <div className="flex-1 overflow-hidden">
            <ActView />
          </div>
        ) : (
          <>
            <aside className="w-64 border-r bg-card flex flex-col shrink-0">
              <div className="p-3 border-b">
                <input
                  type="search"
                  placeholder="Rechercher..."
                  className="w-full px-2.5 py-1.5 border rounded bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  data-testid="input-search"
                />
              </div>
              <PatientList
                board={activeBoard}
                search={search}
                selectedId={selectedPatientId}
                onSelect={setSelectedPatientId}
              />
            </aside>
            <main className="flex-1 overflow-hidden flex flex-col">
              {selectedPatientId ? (
                <PatientDetail
                  patientId={selectedPatientId}
                  onDeleted={() => setSelectedPatientId(null)}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                  Sélectionnez un patient dans la liste
                </div>
              )}
            </main>
          </>
        )}
      </div>

      <PatientModal
        open={showNewPatientModal}
        onClose={() => setShowNewPatientModal(false)}
        onSave={handleCreatePatient}
        isPending={createPatient.isPending}
        title="Nouveau patient"
      />
    </div>
  );
}