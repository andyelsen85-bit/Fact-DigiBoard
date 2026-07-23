import { useState, useRef, useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useCreatePatient, getListPatientsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { PatientList } from "@/components/PatientList";
import { PatientDetail } from "@/components/PatientDetail";
import { PatientModal } from "@/components/PatientModal";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { StatsView } from "@/components/StatsView";
import { ActView } from "@/components/ActView";
import { PatientKpiView } from "@/components/PatientKpiView";
import { PatientMedicationView } from "@/components/PatientMedicationView";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/i18n";
import "@/i18n/dict/board";

const BOARD_NAV = [
  { value: "Tous" },
  { value: "PréAdmission" },
  { value: "FactBoard" },
  { value: "RecoveryBoard" },
  { value: "Irrecevable" },
  { value: "Clôturé" },
];

const TOOL_NAV = [
  { key: "toolAct", value: "ACT" },
  { key: "toolStats", value: "Statistiques" },
  { key: "toolPatientKpi", value: "PatientKPI" },
  { key: "toolPatientMedication", value: "PatientMedication" },
];

export default function BoardPage() {
  const t = useT();
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeBoard, setActiveBoard] = useState("Tous");
  const [search, setSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useLocalStorage("board-sidebar-width", 256);
  const [sidebarVisible, setSidebarVisible] = useLocalStorage("board-sidebar-visible", window.innerWidth >= 640);
  const isResizing = useRef(false);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    const startX = e.clientX;
    const startWidth = sidebarWidth;
    const onMove = (ev: MouseEvent) => {
      if (!isResizing.current) return;
      const next = Math.min(600, Math.max(200, startWidth + ev.clientX - startX));
      setSidebarWidth(next);
    };
    const onUp = () => {
      isResizing.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [sidebarWidth]);

  const createPatient = useCreatePatient();

  function handleCreatePatient(values: any) {
    createPatient.mutate(
      { data: values },
      {
        onSuccess: (patient) => {
          queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
          setShowNewPatientModal(false);
          setSelectedPatientId(patient.id);
          toast({ title: t("board.patientCreated") });
        },
        onError: () => toast({ title: t("common.error"), description: t("board.createPatientError"), variant: "destructive" }),
      }
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
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
                {item.value === "Tous"
                  ? t("board.navAll")
                  : item.value === "PréAdmission"
                    ? t("board.navPreAdmission")
                    : t("common.board." + item.value)}
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
                {t("board." + item.key)}
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
            {t("board.newPatient")}
          </button>
          <button
            className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
            onClick={() => setShowChangePassword(true)}
            title={t("board.changePassword")}
          >
            {user?.username}
          </button>
          {user?.role === "admin" && (
            <button
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setLocation("/settings")}
              data-testid="button-settings"
            >
              {t("common.settings")}
            </button>
          )}
          <button
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={logout}
            data-testid="button-logout"
          >
            {t("common.logout")}
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
        ) : activeBoard === "PatientKPI" ? (
          <div className="flex-1 overflow-hidden">
            <PatientKpiView />
          </div>
        ) : activeBoard === "PatientMedication" ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            <PatientMedicationView />
          </div>
        ) : (
          <>
            {sidebarVisible ? (
              <aside className="border-r bg-card flex flex-col shrink-0" style={{ width: sidebarWidth }}>
                <div className="p-3 border-b flex items-center gap-2">
                  <input
                    type="search"
                    placeholder={t("common.search") + "..."}
                    className="flex-1 min-w-0 px-2.5 py-1.5 border rounded bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    data-testid="input-search"
                  />
                  <button
                    onClick={() => setSidebarVisible(false)}
                    className="shrink-0 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title={t("board.hideList")}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>
                <PatientList
                  board={activeBoard}
                  search={search}
                  selectedId={selectedPatientId}
                  onSelect={(id) => {
                    setSelectedPatientId(id);
                    if (window.innerWidth < 640) setSidebarVisible(false);
                  }}
                />
              </aside>
            ) : (
              <div className="flex flex-col shrink-0 border-r bg-card">
                <button
                  onClick={() => setSidebarVisible(true)}
                  className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title={t("board.showList")}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M6 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
            {sidebarVisible && (
              <div
                className="w-1 cursor-col-resize shrink-0 hover:bg-primary/40 active:bg-primary/60 transition-colors"
                onMouseDown={startResize}
              />
            )}
            <main className="flex-1 overflow-hidden flex flex-col">
              {selectedPatientId ? (
                <PatientDetail
                  patientId={selectedPatientId}
                  onDeleted={() => setSelectedPatientId(null)}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                  {t("board.selectPatient")}
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
        title={t("board.newPatientTitle")}
      />
      <ChangePasswordModal
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </div>
  );
}