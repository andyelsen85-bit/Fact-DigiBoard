import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function getToken(): string | null {
  return localStorage.getItem("auth-token");
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IrockEval {
  id: number; patientId: number; date: string;
  q1: number; q2: number; q3: number; q4: number; q5: number;
  q6: number; q7: number; q8: number; q9: number; q10: number;
  q11: number; q12: number;
  notes?: string | null;
  questionNotes?: Record<string, string> | null;
  createdByUsername?: string | null;
  createdAt: string;
}

export interface HonosEval {
  id: number; patientId: number; date: string;
  q1: number; q2: number; q3: number; q4: number; q5: number;
  q6: number; q7: number; q8: number; q9: number; q10: number;
  q11: number; q12: number;
  notes?: string | null;
  questionNotes?: Record<string, string> | null;
  createdByUsername?: string | null;
  createdAt: string;
}

export interface PatientKpi {
  regressions: number;
  daysPerBoard: Record<string, number>;
  boardDaysOffset: Record<string, number>;
}

export interface PatientSelectorItem {
  id: number; clientNum: string; nom: string; prenom: string; board: string;
  photo?: string | null;
}

// ─── iRock ───────────────────────────────────────────────────────────────────

export const irockQueryKey = (patientId: number) => ["irock", patientId];

export function useListIrock(patientId: number) {
  return useQuery<IrockEval[]>({
    queryKey: irockQueryKey(patientId),
    queryFn: () => apiFetch(`/api/patients/${patientId}/irock`),
  });
}

export function useCreateIrock(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<IrockEval, "id" | "patientId" | "createdAt">) =>
      apiFetch<IrockEval>(`/api/patients/${patientId}/irock`, {
        method: "POST", body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: irockQueryKey(patientId) }),
  });
}

export function useUpdateIrock(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ evalId, data }: { evalId: number; data: Partial<IrockEval> }) =>
      apiFetch<IrockEval>(`/api/patients/${patientId}/irock/${evalId}`, {
        method: "PUT", body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: irockQueryKey(patientId) }),
  });
}

export function useDeleteIrock(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (evalId: number) =>
      apiFetch(`/api/patients/${patientId}/irock/${evalId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: irockQueryKey(patientId) }),
  });
}

// ─── HoNOS ───────────────────────────────────────────────────────────────────

export const honosQueryKey = (patientId: number) => ["honos", patientId];

export function useListHonos(patientId: number) {
  return useQuery<HonosEval[]>({
    queryKey: honosQueryKey(patientId),
    queryFn: () => apiFetch(`/api/patients/${patientId}/honos`),
  });
}

export function useCreateHonos(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<HonosEval, "id" | "patientId" | "createdAt">) =>
      apiFetch<HonosEval>(`/api/patients/${patientId}/honos`, {
        method: "POST", body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: honosQueryKey(patientId) }),
  });
}

export function useUpdateHonos(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ evalId, data }: { evalId: number; data: Partial<HonosEval> }) =>
      apiFetch<HonosEval>(`/api/patients/${patientId}/honos/${evalId}`, {
        method: "PUT", body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: honosQueryKey(patientId) }),
  });
}

export function useDeleteHonos(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (evalId: number) =>
      apiFetch(`/api/patients/${patientId}/honos/${evalId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: honosQueryKey(patientId) }),
  });
}

// ─── KPI ─────────────────────────────────────────────────────────────────────

export function usePatientKpi(patientId: number | null) {
  return useQuery<PatientKpi>({
    queryKey: ["kpi", patientId],
    queryFn: () => apiFetch(`/api/patients/${patientId}/kpi`),
    enabled: patientId !== null,
  });
}

export function usePatientSelector() {
  return useQuery<PatientSelectorItem[]>({
    queryKey: ["patients-selector"],
    queryFn: () => apiFetch("/api/patients-selector"),
  });
}

export function useUpdateBoardDaysOffset(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (boardDaysOffset: Record<string, number>) =>
      apiFetch(`/api/patients/${patientId}`, {
        method: "PATCH",
        body: JSON.stringify({ boardDaysOffset }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kpi", patientId] }),
  });
}
