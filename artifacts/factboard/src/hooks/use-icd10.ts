import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL ?? "/";

export interface Icd10Code {
  code: string;
  title: string;
  description: string | null;
  risks: string | null;
  isFavorite: boolean;
  createdAt: string;
}

async function apiFetch(path: string, init?: RequestInit) {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("auth-token") : null;
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${BASE}api/${path}`, {
    credentials: "include",
    ...init,
    headers: { "Content-Type": "application/json", ...authHeader, ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const ICD10_QUERY_KEY = ["icd10-codes"] as const;

export function useIcd10Codes() {
  return useQuery<Icd10Code[]>({
    queryKey: ICD10_QUERY_KEY,
    queryFn: () => apiFetch("icd10"),
  });
}

export function useCreateIcd10Code() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<Icd10Code, "createdAt">) =>
      apiFetch("icd10", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ICD10_QUERY_KEY }),
  });
}

export function useUpdateIcd10Code() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, ...body }: Partial<Icd10Code> & { code: string }) =>
      apiFetch(`icd10/${encodeURIComponent(code)}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ICD10_QUERY_KEY }),
  });
}

export function useDeleteIcd10Code() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) =>
      apiFetch(`icd10/${encodeURIComponent(code)}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ICD10_QUERY_KEY }),
  });
}
