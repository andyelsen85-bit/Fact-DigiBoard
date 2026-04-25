import { useQuery } from "@tanstack/react-query";

function getToken(): string | null {
  return localStorage.getItem("auth-token");
}

async function apiFetch<T>(url: string): Promise<T> {
  const token = getToken();
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export type StatsPeriod = "all" | "1m" | "6m";

export function periodToSince(period: StatsPeriod): string | undefined {
  if (period === "all") return undefined;
  const d = new Date();
  if (period === "1m") d.setMonth(d.getMonth() - 1);
  if (period === "6m") d.setMonth(d.getMonth() - 6);
  return d.toISOString().slice(0, 10);
}

export interface StatsData {
  total: number;
  active: number;
  boardCounts: Record<string, number>;
  sexeCounts: Record<string, number>;
  pathoCounts: { patho: string; count: number }[];
  aggCounts: Record<string, number>;
  avgDurations: Record<string, number>;
  ageCounts: Record<string, number>;
  irockCount: number;
  honosCount: number;
}

export function useStats(period: StatsPeriod) {
  const since = periodToSince(period);
  const url = since ? `/api/stats?since=${since}` : "/api/stats";
  return useQuery<StatsData>({
    queryKey: ["stats", period],
    queryFn: () => apiFetch<StatsData>(url),
  });
}
