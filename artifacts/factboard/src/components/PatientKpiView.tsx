import { useState, useEffect, useRef, useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
} from "recharts";
import {
  usePatientSelector, useListIrock, useListHonos, usePatientKpi,
  useUpdateBoardDaysOffset,
} from "@/hooks/use-evaluations";
import { useGetSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { type StatsPeriod, periodToSince } from "@/hooks/use-stats";

const IROCK_QUESTIONS = [
  "Santé mentale",
  "Compétence de vie",
  "Sécurité et confort",
  "Santé physique",
  "Exercice et activité",
  "Objectif et orientation",
  "Entourage",
  "Réseau social",
  "Se valoriser",
  "Participation et contrôle",
  "Autogestion",
  "Espoir d'avenir",
];

const HONOS_QUESTIONS = [
  "Comportement hyperactif/agressif",
  "Auto-agressivité / passage à l'acte",
  "Alcool ou drogues",
  "Troubles cognitifs",
  "Maladie physique ou handicap",
  "Hallucinations et délires",
  "Humeur dépressive",
  "Autres troubles mentaux",
  "Relations sociales",
  "Activités vie quotidienne",
  "Conditions de vie",
  "Occupation et activités",
];

const IROCK_DOMAINS = [
  { label: "Domicile",       color: "#3b82f6" },
  { label: "Opportunité",    color: "#22c55e" },
  { label: "Personnes",      color: "#f97316" },
  { label: "Autonomisation", color: "#a855f7" },
];

const HONOS_DOMAINS = [
  { label: "Comportement", color: "#ef4444" },
  { label: "Déficiences",  color: "#f59e0b" },
  { label: "Symptômes",    color: "#ec4899" },
  { label: "Social",       color: "#06b6d4" },
];

const CLINICAL_BOARDS = ["PréAdmission", "FactBoard", "RecoveryBoard"];

const BOARD_COLORS: Record<string, string> = {
  "PréAdmission": "#6b4c1e",
  FactBoard: "#2d5a2d",
  RecoveryBoard: "#1e3a6e",
};

const IROCK_COLOR = "#2563eb";
const HONOS_COLOR = "#dc2626";

interface Domain { label: string; color: string; }

interface SpiderPanelProps {
  title: string;
  subtitle: string;
  data: Array<{ date: string; total: number; [key: string]: any }>;
  questions: string[];
  domains: Domain[];
  color: string;
  yMax: number;
  qCount: number;
}

function SpiderPanel({ title, subtitle, data, questions, domains, color, yMax, qCount }: SpiderPanelProps) {
  const [compareIdx, setCompareIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="bg-card border rounded-lg p-4">
        <h4 className="text-sm font-medium mb-2">{title}</h4>
        <p className="text-xs text-muted-foreground">Aucune évaluation enregistrée</p>
      </div>
    );
  }

  const latest = data[data.length - 1];
  const compareEntry = compareIdx !== null ? data[compareIdx] : null;
  const totalMax = yMax * qCount;

  const radarData = questions.map((label, i) => {
    const key = `q${i + 1}`;
    const row: Record<string, any> = {
      label: label.length > 20 ? label.slice(0, 19) + "…" : label,
      fullMark: yMax,
      current: latest[key] ?? 0,
    };
    if (compareEntry) row.compare = compareEntry[key] ?? 0;
    return row;
  });

  return (
    <div className="bg-card border rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-medium">{title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {data.length > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Comparer avec :</span>
              <select
                className="text-xs border rounded px-1.5 py-0.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                value={compareIdx ?? ""}
                onChange={(e) => setCompareIdx(e.target.value === "" ? null : Number(e.target.value))}
              >
                <option value="">—</option>
                {data.slice(0, -1).map((d, i) => (
                  <option key={i} value={i}>{d.date}</option>
                ))}
              </select>
            </div>
          )}
          <div
            className="flex items-baseline gap-1 px-3 py-1.5 rounded-lg border"
            style={{ borderColor: color, background: `${color}12` }}
          >
            <span className="text-2xl font-bold font-mono leading-none" style={{ color }}>
              {latest.total}
            </span>
            <span className="text-sm text-muted-foreground font-mono">/ {totalMax}</span>
            <span className="text-xs text-muted-foreground ml-1.5">{latest.date}</span>
          </div>
        </div>
      </div>

      {/* Radar */}
      <ResponsiveContainer width="100%" height={360}>
        <RadarChart data={radarData} margin={{ top: 16, right: 48, bottom: 16, left: 48 }}>
          <PolarGrid gridType="polygon" stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#6b7280" }}
          />
          <PolarRadiusAxis
            domain={[0, yMax]}
            tickCount={yMax + 1}
            tick={{ fontSize: 9, fill: "#9ca3af" }}
            angle={90}
          />
          <Tooltip
            contentStyle={{ fontSize: 11 }}
            formatter={(val: any, name: string) => [
              `${val} / ${yMax}`,
              name === "current" ? `Actuel (${latest.date})` : compareEntry?.date ?? name,
            ]}
          />
          <Radar
            name="current"
            dataKey="current"
            stroke={color}
            fill={color}
            fillOpacity={0.22}
            strokeWidth={2}
            dot={{ r: 4, fill: color, stroke: "#fff", strokeWidth: 1.5 }}
            activeDot={{ r: 6 }}
          />
          {compareEntry && (
            <Radar
              name="compare"
              dataKey="compare"
              stroke="#94a3b8"
              fill="#94a3b8"
              fillOpacity={0.12}
              strokeWidth={1.5}
              strokeDasharray="5 3"
              dot={{ r: 3, fill: "#94a3b8" }}
            />
          )}
          {compareEntry && (
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
              formatter={(value) =>
                value === "current"
                  ? `Actuel (${latest.date})`
                  : `Comparaison (${compareEntry.date})`
              }
            />
          )}
        </RadarChart>
      </ResponsiveContainer>

      {/* Domain colour legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 pt-1 border-t">
        {domains.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-muted-foreground">
              {d.label} <span className="font-mono text-[10px]">(Q{i * 3 + 1}–Q{i * 3 + 3})</span>
            </span>
          </div>
        ))}
      </div>

      {/* Past evaluations mini-list */}
      {data.length > 1 && (
        <div className="pt-1 border-t">
          <p className="text-xs text-muted-foreground mb-1.5">Historique des scores totaux</p>
          <div className="flex flex-wrap gap-1.5">
            {data.map((d, i) => {
              const isLatest = i === data.length - 1;
              const isCompare = i === compareIdx;
              return (
                <button
                  key={i}
                  onClick={() => setCompareIdx(isCompare || isLatest ? null : i)}
                  disabled={isLatest}
                  className={`px-2.5 py-1 rounded-full text-xs font-mono border transition-colors ${
                    isLatest
                      ? "border-current opacity-100 font-semibold cursor-default"
                      : isCompare
                      ? "bg-muted border-muted-foreground text-foreground"
                      : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                  }`}
                  style={isLatest ? { borderColor: color, color, background: `${color}12` } : undefined}
                  title={isLatest ? "Évaluation actuelle" : "Cliquer pour comparer"}
                >
                  {d.date} · {d.total}/{totalMax}
                </button>
              );
            })}
          </div>
        </div>
      )}
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

      {/* I•ROC spider */}
      <div>
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
          I•ROC — Évaluations ({irockData.length})
        </h3>
        <SpiderPanel
          title="I•ROC · Diagramme en araignée"
          subtitle="Modèle HOPE · Score 1–6 par indicateur (1 = Jamais · 6 = Tout le temps)"
          data={irockChartData}
          questions={IROCK_QUESTIONS}
          domains={IROCK_DOMAINS}
          color={IROCK_COLOR}
          yMax={6}
          qCount={12}
        />
      </div>

      {/* HoNOS spider */}
      <div>
        <h3 className="text-sm font-semibold text-destructive uppercase tracking-wider mb-3">
          HoNOS — Évaluations ({honosData.length})
        </h3>
        <SpiderPanel
          title="HoNOS · Diagramme en araignée"
          subtitle="Score 0–4 par échelle (0 = Aucun problème · 4 = Problème grave)"
          data={honosChartData}
          questions={HONOS_QUESTIONS}
          domains={HONOS_DOMAINS}
          color={HONOS_COLOR}
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
