import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import common from "./dict/common";

export type Lang = "fr" | "en" | "de" | "nl";
export const SUPPORTED_LANGS: Lang[] = ["fr", "en", "de", "nl"];
export const LANG_LABELS: Record<Lang, string> = {
  fr: "Français",
  en: "English",
  de: "Deutsch",
  nl: "Nederlands",
};

export type Dict = Record<Lang, Record<string, string>>;

// Namespaces are registered lazily so each dictionary file stays independent.
const namespaces: Record<string, Dict> = { common };

export function registerNamespace(name: string, dict: Dict) {
  namespaces[name] = dict;
}

const STORAGE_KEY = "app-language";

function readCachedLang(): Lang {
  const v = localStorage.getItem(STORAGE_KEY);
  return SUPPORTED_LANGS.includes(v as Lang) ? (v as Lang) : "fr";
}

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const dot = key.indexOf(".");
  const ns = dot === -1 ? "common" : key.slice(0, dot);
  const k = dot === -1 ? key : key.slice(dot + 1);
  const dict = namespaces[ns];
  let out = dict?.[lang]?.[k] ?? dict?.fr?.[k] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      out = out.replaceAll(`{${name}}`, String(value));
    }
  }
  return out;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readCachedLang);

  useEffect(() => {
    // The server-side setting (chosen by the admin) is authoritative.
    const base = import.meta.env.BASE_URL; // includes trailing slash
    fetch(`${base}api/language`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && SUPPORTED_LANGS.includes(data.language)) {
          setLangState(data.language);
          localStorage.setItem(STORAGE_KEY, data.language);
        }
      })
      .catch(() => {
        /* offline / server starting: keep cached language */
      });
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  const t = (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars);

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}

export function useT() {
  return useLang().t;
}
