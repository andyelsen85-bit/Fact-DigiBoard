import { useState, useEffect, useRef, useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList,
} from "recharts";
import {
  usePatientSelector, useListIrock, useListHonos, usePatientKpi,
  useUpdateBoardDaysOffset,
} from "@/hooks/use-evaluations";
import { useGetSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { type StatsPeriod, periodToSince } from "@/hooks/use-stats";

const IROCK_QUESTIONS = [
  "Activités plaisantes",
  "Sentiment d'appartenance",
  "Sentiment de sécurité",
  "Espoir pour l'avenir",
  "Objectifs importants",
  "Gestion des difficultés",
  "Santé physique",
  "Santé mentale",
  "Relations avec les autres",
  "Occupation (travail/études/bénévolat)",
  "Liberté de choix",
  "Gestion budget/finances",
];

const HONOS_QUESTIONS = [
  "Comportement hyperactif/agressif",
  "Automutilation",
  "Alcool ou drogues",
  "Problèmes cognitifs",
  "Maladie physique",
  "Hallucinations/délires",
  "Humeur dépressive",
  "Autres troubles mentaux",
  "Relations",
  "Vie quotidienne",
  "Conditions de vie",
  "Occupation et activités",
];

const CLINICAL_BOARDS = ["PréAdmission", "FactBoard", "RecoveryBoard"];

const BOARD_COLORS: Record<string, string> = {
  "PréAdmission": "#6b4c1e",
  FactBoard: "#2d5a2d",
  RecoveryBoard: "#1e3a6e",
};

const IROCK_COLOR = "#2563eb";
const HONOS_COLOR = "#dc2626";

interface ChartPanelProps {
  title: string;
  data: Record<string, any>[];
  questions: string[];
  color: string;
  yLabel: string;
  yMax: number;
  qCount: number;
}

function ChartPanel({ title, data, questions, color, yLabel, yMax, qCount }: ChartPanelProps) {
  if (data.length < 1) {
    return (
      <div className="bg-card border rounded-lg p-4">
        <h4 className="text-sm font-medium mb-2">{title}</h4>
        <p className="text-xs text-muted-foreground">Aucune évaluation enregistrée</p>
      </div>
    );
  }

  const totalMax = yMax * qCount;
  const lastEntry = data[data.length - 1];
  const lastTotal = lastEntry?.total ?? 0;
  const lastDate = lastEntry?.date ?? "";

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{title}</h4>

        {/* ─── Last score highlight ─── */}
        <div
          className="flex items-baseline gap-1.5 px-3 py-1.5 rounded-lg border"
          style={{ borderColor: color, background: `${color}10` }}
        >
          <span
            className="text-2xl font-bold font-mono leading-none"
            style={{ color }}
          >
            {lastTotal}
          </span>
          <span className="text-sm text-muted-foreground font-mono">/ {totalMax}</span>
          <span className="text-xs text-muted-foreground ml-1">{lastDate}</span>
        </div>
      </div>

      {/* ─── Per-question rows ─── */}
      {questions.map((label, i) => {
        const key = `q${i + 1}`;
        return (
          <div key={key}>
            <p className="text-xs text-muted-foreground mb-1">{i + 1}. {label}</p>
            <ResponsiveContainer width="100%" height={70}>
              <LineChart data={data} margin={{ top: 14, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                <YAxis domain={[0, yMax]} ticks={Array.from({ length: yMax + 1 }, (_, i) => i)} tick={{ fontSize: 9 }} width={22} />
                <Tooltip
                  formatter={(v: any) => [`${v} — ${yLabel}`, label]}
                  labelFormatter={(l) => `Date: ${l}`}
                  contentStyle={{ fontSize: 11 }}
                />
                <Line
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 4, fill: color, stroke: "#fff", strokeWidth: 1.5 }}
                  activeDot={{ r: 6 }}
                >
                  <LabelList
                    dataKey={key}
                    position="top"
                    style={{ fontSize: 9, fontWeight: 700, fill: color }}
                  />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}

function KpiContent({ patientId, period }: { patientId: number; period: StatsPeriod }) {
  const { data: irockRaw = [], isLoading: irockLoading } = useListIrock(patientId);
  const { data: honosRaw = [], isLoading: honosLoading } = useListHonos(patientId);
  const { data: kpi, isLoading: kpiLoading } = usePatientKpi(patientId);
  const updateOffset = useUpdateBoardDaysOffset(patientId);
  const [editingOffset, setEditingOffset] = useState(false);
  const [offsetDraft, setOffsetDraft] = useState<Record<string, number>>({});

  function openOffsetEditor() {
    setOffsetDraft({
      PréAdmission: kpi?.boardDaysOffset?.["PréAdmission"] ?? 0,
      FactBoard: kpi?.boardDaysOffset?.["FactBoard"] ?? 0,
      RecoveryBoard: kpi?.boardDaysOffset?.["RecoveryBoard"] ?? 0,
    });
    setEditingOffset(true);
  }

  function saveOffset() {
    updateOffset.mutate(offsetDraft, {
      onSuccess: () => setEditingOffset(false),
    });
  }

  if (irockLoading || honosLoading || kpiLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  const since = periodToSince(period);
  const irockData = since ? irockRaw.filter((e) => e.date >= since) : irockRaw;
  const honosData = since ? honosRaw.filter((e) => e.date >= since) : honosRaw;

  const irockChartData = irockData.map((e) => {
    const qs = [e.q1, e.q2, e.q3, e.q4, e.q5, e.q6, e.q7, e.q8, e.q9, e.q10, e.q11, e.q12];
    return {
      date: e.date,
      q1: e.q1, q2: e.q2, q3: e.q3, q4: e.q4, q5: e.q5,
      q6: e.q6, q7: e.q7, q8: e.q8, q9: e.q9, q10: e.q10,
      q11: e.q11, q12: e.q12,
      total: qs.reduce((s, v) => s + v, 0),
    };
  });

  const honosChartData = honosData.map((e) => {
    const qs = [e.q1, e.q2, e.q3, e.q4, e.q5, e.q6, e.q7, e.q8, e.q9, e.q10, e.q11, e.q12];
    return {
      date: e.date,
      q1: e.q1, q2: e.q2, q3: e.q3, q4: e.q4, q5: e.q5,
      q6: e.q6, q7: e.q7, q8: e.q8, q9: e.q9, q10: e.q10,
      q11: e.q11, q12: e.q12,
      total: qs.reduce((s, v) => s + v, 0),
    };
  });

  const daysPerBoard = kpi?.daysPerBoard ?? {};
  const regressions = kpi?.regressions ?? 0;

  return (
    <div className="space-y-6">
      {/* Board stability */}
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Stabilité par board
          </h3>
          {!editingOffset ? (
            <button
              onClick={openOffsetEditor}
              className="text-xs px-2.5 py-1 rounded border border-border hover:bg-muted transition-colors text-muted-foreground"
            >
              Ajuster jours initiaux
            </button>
          ) : (
            <div className="flex gap-1.5">
              <button
                onClick={() => setEditingOffset(false)}
                className="text-xs px-2.5 py-1 rounded border border-border hover:bg-muted transition-colors text-muted-foreground"
              >
                Annuler
              </button>
              <button
                onClick={saveOffset}
                disabled={updateOffset.isPending}
                className="text-xs px-2.5 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {updateOffset.isPending ? "…" : "Enregistrer"}
              </button>
            </div>
          )}
        </div>

        {editingOffset ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Saisissez les jours déjà passés sur chaque board avant l'entrée dans DigiBoard.
              Le calcul automatique s'ajoutera à ces valeurs.
            </p>
            {CLINICAL_BOARDS.map((board) => (
              <div key={board} className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: BOARD_COLORS[board] }}
                />
                <span className="text-xs text-muted-foreground w-32 shrink-0">{board}</span>
                <input
                  type="number"
                  min={0}
                  value={offsetDraft[board] ?? 0}
                  onChange={(e) =>
                    setOffsetDraft((d) => ({ ...d, [board]: Math.max(0, parseInt(e.target.value) || 0) }))
                  }
                  className="w-24 border rounded px-2 py-1 text-sm bg-background font-mono"
                />
                <span className="text-xs text-muted-foreground">jours</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-2">Jours par board (incluant ajustement initial)</p>
              {CLINICAL_BOARDS.map((board) => {
                const offset = kpi?.boardDaysOffset?.[board] ?? 0;
                return (
                  <div key={board} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: BOARD_COLORS[board] }}
                    />
                    <span className="text-xs text-muted-foreground w-32 shrink-0">{board}</span>
                    <span className="font-mono text-sm font-medium">{daysPerBoard[board] ?? 0} j</span>
                    {offset > 0 && (
                      <span className="text-[10px] text-muted-foreground">(dont {offset} j initiaux)</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg p-4">
              <div className="text-4xl font-light font-mono text-destructive">{regressions}</div>
              <div className="text-xs text-muted-foreground mt-1 text-center">
                Retours de RecoveryBoard → FactBoard
              </div>
              <div className="text-xs text-muted-foreground mt-1 text-center italic">
                (indicateur d'instabilité)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* iRock charts */}
      <div>
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
          iRock — Évaluations ({irockData.length})
        </h3>
        <ChartPanel
          title="iRock · Score 0–5 par question (0 = Jamais, 5 = Toujours)"
          data={irockChartData}
          questions={IROCK_QUESTIONS}
          color={IROCK_COLOR}
          yLabel="0=Jamais / 5=Toujours"
          yMax={5}
          qCount={12}
        />
      </div>

      {/* HoNOS charts */}
      <div>
        <h3 className="text-sm font-semibold text-destructive uppercase tracking-wider mb-3">
          HoNOS — Évaluations ({honosData.length})
        </h3>
        <ChartPanel
          title="HoNOS · Score 0–4 par question (0 = Aucun problème, 4 = Problème grave)"
          data={honosChartData}
          questions={HONOS_QUESTIONS}
          color={HONOS_COLOR}
          yLabel="0=Aucun / 4=Grave"
          yMax={4}
          qCount={12}
        />
      </div>
    </div>
  );
}

const HIDDEN_BOARDS = ["Clôturé", "Irrecevable"];

const PERIOD_OPTIONS: { value: StatsPeriod; label: string }[] = [
  { value: "1m", label: "1 mois" },
  { value: "6m", label: "6 mois" },
  { value: "12m", label: "12 mois" },
  { value: "all", label: "Tout" },
];

export function PatientKpiView() {
  const { data: patients = [], isLoading } = usePatientSelector();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const [period, setPeriod] = useState<StatsPeriod | null>(null);
  const [sidebarWidth, setSidebarWidth] = useLocalStorage("kpi-sidebar-width", 256);
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

  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const defaultPeriod = ((settings as any)?.defaultStatsPeriod as StatsPeriod) ?? "6m";
  const activePeriod: StatsPeriod = period ?? defaultPeriod;

  useEffect(() => {
    if (period === null && defaultPeriod) {
      setPeriod(defaultPeriod);
    }
  }, [defaultPeriod]);

  const hiddenCount = patients.filter((p) => HIDDEN_BOARDS.includes(p.board)).length;

  const filtered = patients.filter((p) => {
    if (!showHidden && HIDDEN_BOARDS.includes(p.board)) return false;
    return `${p.nom} ${p.prenom} ${p.clientNum}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar — patient picker */}
      <aside className="border-r bg-card flex flex-col shrink-0" style={{ width: sidebarWidth }}>
        <div className="p-3 border-b space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client KPI</p>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`flex-1 py-1 rounded-md text-xs font-medium transition-colors ${
                  activePeriod === opt.value
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <input
            type="search"
            placeholder="Rechercher un client…"
            className="w-full px-2.5 py-1.5 border rounded bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border text-xs transition-colors ${
              showHidden
                ? "bg-muted border-border text-foreground"
                : "border-dashed border-border text-muted-foreground hover:text-foreground hover:border-border"
            }`}
            onClick={() => setShowHidden((v) => !v)}
          >
            <span>{showHidden ? "Masquer les archivés" : "Afficher les archivés"}</span>
            {hiddenCount > 0 && (
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted-foreground/15">
                {hiddenCount}
              </span>
            )}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            </div>
          ) : (
            filtered.map((p) => {
              const isArchived = HIDDEN_BOARDS.includes(p.board);
              return (
                <button
                  key={p.id}
                  className={`w-full text-left px-3 py-2 border-b border-border hover:bg-muted/40 transition-colors flex items-center gap-2.5 ${
                    selectedId === p.id ? "bg-muted/60 border-l-2 border-l-primary" : ""
                  } ${isArchived ? "opacity-60" : ""}`}
                  onClick={() => setSelectedId(p.id)}
                >
                  <div className="w-16 h-16 rounded-full bg-muted border shrink-0 overflow-hidden flex items-center justify-center text-sm font-medium text-muted-foreground">
                    {p.photo
                      ? <img src={p.photo} alt="" className="w-full h-full object-cover" />
                      : `${p.prenom[0] ?? ""}${p.nom[0] ?? ""}`.toUpperCase()
                    }
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-xs truncate">{p.nom} {p.prenom}</div>
                    <div className="text-xs text-muted-foreground font-mono">{p.clientNum}</div>
                    <div className={`text-xs truncate ${isArchived ? "text-muted-foreground/60 italic" : "text-muted-foreground"}`}>
                      {p.board}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Resize handle */}
      <div
        onMouseDown={startResize}
        className="w-1 cursor-col-resize hover:bg-primary/40 active:bg-primary/60 shrink-0 transition-colors"
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        {selectedId ? (
          <KpiContent patientId={selectedId} period={activePeriod} />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Sélectionnez un client pour afficher ses KPI
          </div>
        )}
      </main>
    </div>
  );
}
