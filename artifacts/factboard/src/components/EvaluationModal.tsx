import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { IrockEval, HonosEval } from "@/hooks/use-evaluations";
import { useLang } from "@/i18n";
import { IROC_QUESTIONS, IROC_LABELS, HONOS_QUESTIONS, HONOS_LABELS } from "@/i18n/dict/evaluations";

const IROC_LEVELS = [1, 2, 3, 4, 5, 6];
const HONOS_LEVELS = [0, 1, 2, 3, 4];

// ─── Types ────────────────────────────────────────────────────────────────────

type EvalType = "I•ROC" | "HoNOS";

interface Props {
  type: EvalType;
  initial?: Partial<IrockEval | HonosEval>;
  onSave: (data: any) => void;
  onClose: () => void;
  isPending?: boolean;
}

function makeInitial(type: EvalType, initial?: any) {
  const today = new Date().toISOString().slice(0, 10);
  const defaultScore = type === "I•ROC" ? 1 : 0;
  const qs: Record<string, number> = {};
  for (let i = 1; i <= 12; i++) qs[`q${i}`] = initial?.[`q${i}`] ?? defaultScore;
  const qn: Record<string, string> = {};
  for (let i = 1; i <= 12; i++) qn[`q${i}`] = initial?.questionNotes?.[`q${i}`] ?? "";
  return {
    date: initial?.date ?? today,
    notes: initial?.notes ?? "",
    questionNotes: qn,
    ...qs,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EvaluationModal({ type, initial, onSave, onClose, isPending }: Props) {
  const { lang, t } = useLang();
  const isIroc = type === "I•ROC";
  const irocQuestions = IROC_QUESTIONS[lang];
  const irocLabels = IROC_LABELS[lang];
  const honosQuestions = HONOS_QUESTIONS[lang];
  const honosLabels = HONOS_LABELS[lang];
  const levels = isIroc ? IROC_LEVELS : HONOS_LEVELS;

  const [form, setForm] = useState(() => makeInitial(type, initial));

  function setQ(q: string, v: number) {
    setForm((f) => ({ ...f, [q]: v }));
  }

  function setQNote(q: string, v: string) {
    setForm((f) => ({ ...f, questionNotes: { ...f.questionNotes, [q]: v } }));
  }

  function handleSave() {
    const payload = { ...form };
    const cleanedQn: Record<string, string> = {};
    for (const k of Object.keys(form.questionNotes)) {
      if (form.questionNotes[k].trim()) cleanedQn[k] = form.questionNotes[k].trim();
    }
    payload.questionNotes = Object.keys(cleanedQn).length > 0 ? cleanedQn : null as any;
    payload.notes = form.notes?.trim() || null as any;
    onSave(payload);
  }

  const total = [...Array(12)].reduce((sum, _, i) => sum + ((form as any)[`q${i + 1}`] ?? 0), 0);
  const max = isIroc ? 72 : 48;

  // For I•ROC: track which domain headers have been rendered
  let lastDomain = "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
          <h2 className="text-base font-semibold">{t("evaluations.title", { type })}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Date */}
          <div>
            <label className="text-xs text-muted-foreground">{t("evaluations.evalDate")}</label>
            <input
              type="date"
              className="mt-1 block w-48 border rounded px-2 py-1 text-sm bg-background"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>

          {/* I•ROC: scale legend */}
          {isIroc && (
            <div className="flex gap-1 text-[10px] text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
              {IROC_LEVELS.map((v) => (
                <span key={v} className="flex-1 text-center">
                  <span className="font-mono font-semibold block">{v}</span>
                  <span className="leading-tight block">{irocLabels[v - 1]}</span>
                </span>
              ))}
            </div>
          )}

          {/* Questions */}
          <div className="space-y-3">
            {(isIroc ? irocQuestions : honosQuestions).map((q, i) => {
              const key = `q${i + 1}`;
              const val = (form as any)[key] ?? (isIroc ? 1 : 0);
              const qNote = form.questionNotes[key] ?? "";

              // Domain separator for I•ROC
              const iroc = q as (typeof irocQuestions)[0];
              let domainHeader: React.ReactNode = null;
              if (isIroc && iroc.domain !== lastDomain) {
                lastDomain = iroc.domain;
                domainHeader = (
                  <div key={`domain-${iroc.domain}`} className="pt-2 pb-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary/70 border-b border-primary/20 pb-0.5">
                      {iroc.domain}
                    </span>
                  </div>
                );
              }

              return (
                <div key={key}>
                  {domainHeader}
                  <div className="bg-muted/30 rounded-lg p-3 space-y-2">

                    {/* Question header */}
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-mono text-muted-foreground shrink-0 w-5 mt-0.5">{i + 1}.</span>
                      <div className="flex-1 space-y-0.5">

                        {/* I•ROC: subdomain + preamble + question */}
                        {isIroc && (
                          <>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              {iroc.subdomain}
                            </p>
                            <p className="text-[11px] text-muted-foreground italic">{t("evaluations.last3Months")}</p>
                            <p className="text-sm font-medium leading-snug">{iroc.label}</p>
                          </>
                        )}

                        {/* HoNOS: question + 2-line guidance */}
                        {!isIroc && (
                          <>
                            <p className="text-sm font-medium leading-snug">
                              {(q as (typeof honosQuestions)[0]).label}
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-400 leading-snug">
                              <span className="font-semibold">✓ {t("evaluations.include")}</span>{" "}
                              {(q as (typeof honosQuestions)[0]).include}
                            </p>
                            <p className="text-xs text-red-600 dark:text-red-400 leading-snug">
                              <span className="font-semibold">✗ {t("evaluations.exclude")}</span>{" "}
                              {(q as (typeof honosQuestions)[0]).exclude}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Score buttons */}
                    <div className="flex gap-1 pl-7">
                      {levels.map((v) => {
                        const labelText = isIroc ? irocLabels[v - 1] : honosLabels[v];
                        return (
                          <button
                            key={v}
                            onClick={() => setQ(key, v)}
                            title={labelText}
                            className={`flex-1 py-1.5 rounded text-xs font-medium border transition-colors ${
                              val === v
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-muted-foreground border-border hover:border-primary/50"
                            }`}
                          >
                            {v}
                            <span className="hidden sm:block text-[10px] font-normal truncate">{labelText}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Per-question free-text note */}
                    <div className="pl-7">
                      <textarea
                        rows={1}
                        placeholder={t("common.remarks")}
                        value={qNote}
                        onChange={(e) => setQNote(key, e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50 leading-relaxed"
                        onInput={(e) => {
                          const el = e.currentTarget;
                          el.style.height = "auto";
                          el.style.height = `${el.scrollHeight}px`;
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* General notes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("evaluations.generalNotes")}</label>
            <textarea
              rows={3}
              placeholder={t("common.remarks")}
              value={form.notes ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="mt-1 w-full text-sm border rounded px-3 py-2 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t shrink-0 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {t("evaluations.totalScore")} : <span className="font-mono font-semibold text-foreground">{total}</span>
            <span className="text-xs"> / {max}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>{t("common.cancel")}</Button>
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? t("common.loading") : t("common.save")}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
