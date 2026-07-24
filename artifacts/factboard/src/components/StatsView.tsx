import { useState, useEffect } from "react";
import { useGetSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useStats, type StatsPeriod } from "@/hooks/use-stats";
import { useIrocEnabled } from "@/hooks/use-form-options";
import { useT } from "@/i18n";
import "@/i18n/dict/views";

const BOARD_COLORS: Record<string, string> = {
  FactBoard: "#2d5a2d",
  RecoveryBoard: "#1e3a6e",
  "PréAdmission": "#6b4c1e",
  Irrecevable: "#6b1e1e",
  "Clôturé": "#555555",
};

const AGG_COLORS: Record<string, string> = {
  "-1": "#cccccc",
  "0": "#aaaaaa",
  "1": "#f0c040",
  "2": "#e08020",
  "3": "#d03030",
};

const AGG_LABEL_KEYS: Record<string, string> = {
  "-1": "views.stats.agg.unknown",
  "0": "views.stats.agg.calm",
  "1": "views.stats.agg.level1",
  "2": "views.stats.agg.level2",
  "3": "views.stats.agg.level3",
};

const PERIOD_OPTIONS: { value: StatsPeriod; labelKey: string }[] = [
  { value: "1m", labelKey: "views.stats.period.1m" },
  { value: "6m", labelKey: "views.stats.period.6m" },
  { value: "12m", labelKey: "views.stats.period.12m" },
  { value: "all", labelKey: "views.stats.period.all" },
];

const AGE_ORDER = ["0-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70+"];

export function StatsView() {
  const t = useT();
  const irocEnabled = useIrocEnabled();
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
  const visitsByLieu: { lieu: string; count: number }[] = (stats as any).visitsByLieu ?? [];

  const maxBoardCount = Math.max(...Object.values(boardCounts), 1);
  const maxPathoCount = Math.max(...pathoCounts.map((p) => p.count), 1);
  const maxAge = Math.max(...Object.values(ageCounts), 1);

  const sortedAges = AGE_ORDER.filter((k) => ageCounts[k] !== undefined)
    .concat(Object.keys(ageCounts).filter((k) => !AGE_ORDER.includes(k)).sort());

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto" data-testid="stats-view">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t("views.stats.title")}</h2>
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
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-3xl font-light font-mono">{stats.total ?? 0}</div>
          <div className="text-sm text-muted-foreground mt-1">{t("views.stats.totalClients")}</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-3xl font-light font-mono">{stats.active ?? 0}</div>
          <div className="text-sm text-muted-foreground mt-1">{t("views.stats.activeClients")}</div>
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
          <div className="text-sm text-muted-foreground mt-1">{t("views.stats.bySexe")}</div>
        </div>
      </div>

      <div className={`grid gap-4 ${irocEnabled ? "grid-cols-2" : "grid-cols-1"}`}>
        {irocEnabled && (
        <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="text-3xl font-light font-mono text-blue-700">{stats.irockCount ?? 0}</div>
            <div className="text-sm text-muted-foreground mt-1">{t("views.stats.irockEvals")}</div>
          </div>
          <span className="text-2xl font-semibold text-blue-200">I•ROC</span>
        </div>
        )}
        <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="text-3xl font-light font-mono text-red-700">{stats.honosCount ?? 0}</div>
            <div className="text-sm text-muted-foreground mt-1">{t("views.stats.honosEvals")}</div>
          </div>
          <span className="text-2xl font-semibold text-red-200">HoNOS</span>
        </div>
      </div>

      {visitsByLieu.length > 0 && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium mb-3">{t("views.stats.visitsByLieu")}</h3>
          <div className="space-y-2">
            {visitsByLieu.map((item) => (
              <div key={item.lieu} className="flex items-center gap-2">
                <div className="w-32 text-xs text-right text-muted-foreground shrink-0 truncate">{item.lieu}</div>
                <div className="flex-1 bg-muted rounded-full h-4 relative">
                  <div
                    className="h-4 rounded-full transition-all bg-emerald-700/70"
                    style={{ width: `${(item.count / visitsByLieu[0].count) * 100}%` }}
                  />
                </div>
                <div className="font-mono text-sm w-6 text-right shrink-0">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">{t("views.stats.clientsByBoard")}</h3>
        <div className="space-y-2">
          {Object.entries(boardCounts).map(([board, count]) => (
            <div key={board} className="flex items-center gap-2">
              <div className="w-28 text-xs text-right text-muted-foreground shrink-0">{t("common.board." + board)}</div>
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
          <h3 className="text-sm font-medium mb-3">{t("views.stats.byAge")}</h3>
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
          <h3 className="text-sm font-medium mb-3">{t("views.stats.avgDuration")}</h3>
          <div className="space-y-2">
            {Object.entries(avgDurations).map(([board, days]) => (
              <div key={board} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("common.board." + board)}</span>
                <span className="font-mono font-medium">{t("views.stats.days", { count: days as number })}</span>
              </div>
            ))}
            {Object.keys(avgDurations).length === 0 && (
              <p className="text-xs text-muted-foreground">{t("views.stats.noData")}</p>
            )}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium mb-3">{t("views.stats.aggLevels")}</h3>
          <div className="space-y-2">
            {Object.entries(aggCounts).map(([level, count]) => (
              <div key={level} className="flex items-center gap-2">
                <div className="w-16 text-xs text-muted-foreground">{AGG_LABEL_KEYS[level] ? t(AGG_LABEL_KEYS[level]) : level}</div>
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
          <h3 className="text-sm font-medium mb-3">{t("views.stats.topPathologies")}</h3>
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
