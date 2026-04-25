import { useState, useEffect } from "react";
import { useGetSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useStats, type StatsPeriod } from "@/hooks/use-stats";

const BOARD_COLORS: Record<string, string> = {
  FactBoard: "#2d5a2d",
  RecoveryBoard: "#1e3a6e",
  "PréAdmission": "#6b4c1e",
  Irrecevable: "#6b1e1e",
  "Clôturé": "#555555",
};

const AGG_COLORS: Record<string, string> = {
  "0": "#aaaaaa",
  "1": "#f0c040",
  "2": "#e08020",
  "3": "#d03030",
};

const AGG_LABELS: Record<string, string> = {
  "0": "😄 Calme",
  "1": "😐 Niveau 1",
  "2": "😤 Niveau 2",
  "3": "😡 Niveau 3",
};

const PERIOD_OPTIONS: { value: StatsPeriod; label: string }[] = [
  { value: "1m", label: "1 mois" },
  { value: "6m", label: "6 mois" },
  { value: "12m", label: "12 mois" },
  { value: "all", label: "Tout le temps" },
];

const AGE_ORDER = ["0-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70+"];

export function StatsView() {
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const defaultPeriod = ((settings as any)?.defaultStatsPeriod as StatsPeriod) ?? "6m";

  const [period, setPeriod] = useState<StatsPeriod | null>(null);
  const activePeriod: StatsPeriod = period ?? defaultPeriod;

  useEffect(() => {
    if (period === null && defaultPeriod) {
      setPeriod(defaultPeriod);
    }
  }, [defaultPeriod]);

  const { data: stats, isLoading } = useStats(activePeriod);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) return null;

  const boardCounts = stats.boardCounts ?? {};
  const sexeCounts = stats.sexeCounts ?? {};
  const pathoCounts = stats.pathoCounts ?? [];
  const aggCounts = stats.aggCounts ?? {};
  const avgDurations = stats.avgDurations ?? {};
  const ageCounts = stats.ageCounts ?? {};

  const maxBoardCount = Math.max(...Object.values(boardCounts), 1);
  const maxPathoCount = Math.max(...pathoCounts.map((p) => p.count), 1);
  const maxAge = Math.max(...Object.values(ageCounts), 1);

  const sortedAges = AGE_ORDER.filter((k) => ageCounts[k] !== undefined)
    .concat(Object.keys(ageCounts).filter((k) => !AGE_ORDER.includes(k)).sort());

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto" data-testid="stats-view">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Statistiques</h2>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activePeriod === opt.value
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-3xl font-light font-mono">{stats.total ?? 0}</div>
          <div className="text-sm text-muted-foreground mt-1">Total clients</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-3xl font-light font-mono">{stats.active ?? 0}</div>
          <div className="text-sm text-muted-foreground mt-1">Clients actifs</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex gap-2 flex-wrap">
            {Object.entries(sexeCounts).map(([sexe, count]) => (
              <div key={sexe} className="text-center">
                <div className="text-2xl font-light font-mono">{count}</div>
                <div className="text-xs text-muted-foreground">{sexe || "?"}</div>
              </div>
            ))}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Répartition par sexe</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="text-3xl font-light font-mono text-blue-700">{stats.irockCount ?? 0}</div>
            <div className="text-sm text-muted-foreground mt-1">Évaluations iRock</div>
          </div>
          <span className="text-2xl font-semibold text-blue-200">iRock</span>
        </div>
        <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="text-3xl font-light font-mono text-red-700">{stats.honosCount ?? 0}</div>
            <div className="text-sm text-muted-foreground mt-1">Évaluations HoNOS</div>
          </div>
          <span className="text-2xl font-semibold text-red-200">HoNOS</span>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">Clients par board</h3>
        <div className="space-y-2">
          {Object.entries(boardCounts).map(([board, count]) => (
            <div key={board} className="flex items-center gap-2">
              <div className="w-28 text-xs text-right text-muted-foreground shrink-0">{board}</div>
              <div className="flex-1 bg-muted rounded-full h-4 relative">
                <div
                  className="h-4 rounded-full transition-all"
                  style={{
                    width: `${(count / maxBoardCount) * 100}%`,
                    backgroundColor: BOARD_COLORS[board] ?? "#888",
                  }}
                />
              </div>
              <div className="font-mono text-sm w-6 text-right">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {sortedAges.length > 0 && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium mb-3">Répartition par âge</h3>
          <div className="space-y-2">
            {sortedAges.map((group) => {
              const count = ageCounts[group] ?? 0;
              return (
                <div key={group} className="flex items-center gap-2">
                  <div className="w-14 text-xs text-right text-muted-foreground shrink-0 font-mono">{group}</div>
                  <div className="flex-1 bg-muted rounded-full h-4 relative">
                    <div
                      className="h-4 rounded-full transition-all bg-primary/60"
                      style={{ width: `${(count / maxAge) * 100}%` }}
                    />
                  </div>
                  <div className="font-mono text-sm w-6 text-right">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium mb-3">Durée moyenne par board (jours)</h3>
          <div className="space-y-2">
            {Object.entries(avgDurations).map(([board, days]) => (
              <div key={board} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{board}</span>
                <span className="font-mono font-medium">{days} j</span>
              </div>
            ))}
            {Object.keys(avgDurations).length === 0 && (
              <p className="text-xs text-muted-foreground">Aucune donnée</p>
            )}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium mb-3">Niveaux d'agressivité</h3>
          <div className="space-y-2">
            {Object.entries(aggCounts).map(([level, count]) => (
              <div key={level} className="flex items-center gap-2">
                <div className="w-16 text-xs text-muted-foreground">{AGG_LABELS[level] ?? level}</div>
                <div className="flex-1 bg-muted rounded-full h-3">
                  <div
                    className="h-3 rounded-full"
                    style={{
                      width: `${((count as number) / Math.max(...Object.values(aggCounts), 1)) * 100}%`,
                      backgroundColor: AGG_COLORS[level] ?? "#aaa",
                    }}
                  />
                </div>
                <div className="font-mono text-xs w-4">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {pathoCounts.length > 0 && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium mb-3">Pathologies les plus fréquentes</h3>
          <div className="space-y-2">
            {pathoCounts.slice(0, 10).map((p) => (
              <div key={p.patho} className="flex items-center gap-2">
                <div className="w-12 font-mono text-xs text-muted-foreground shrink-0">{p.patho}</div>
                <div className="flex-1 bg-muted rounded-full h-4">
                  <div
                    className="h-4 rounded-full bg-primary/70 transition-all"
                    style={{ width: `${(p.count / maxPathoCount) * 100}%` }}
                  />
                </div>
                <div className="font-mono text-xs w-4">{p.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
