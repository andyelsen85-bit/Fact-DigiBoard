import { useQuery } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL ?? "/";

async function apiFetch(path: string) {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("auth-token") : null;
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${BASE}api/${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...authHeader },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const FORM_OPTIONS_QUERY_KEY = ["form-options"] as const;

export interface FormOptions {
  psychiatrists: string[];
  casemanagers: string[];
  medecinsfamille: string[];
  articles: string[];
  curatelles: string[];
  icd10favorites: string[];
  icd10Codes: Array<{
    code: string;
    title: string;
    description: string | null;
    risks: string | null;
    isFavorite: boolean;
    createdAt: string;
  }>;
}

const EMPTY: FormOptions = {
  psychiatrists: [],
  casemanagers: [],
  medecinsfamille: [],
  articles: [],
  curatelles: [],
  icd10favorites: [],
  icd10Codes: [],
};

export function useFormOptions() {
  return useQuery<FormOptions>({
    queryKey: FORM_OPTIONS_QUERY_KEY,
    queryFn: () => apiFetch("form-options"),
    placeholderData: EMPTY,
  });
}
