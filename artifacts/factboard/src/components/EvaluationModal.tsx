import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { IrockEval, HonosEval } from "@/hooks/use-evaluations";

const IROCK_QUESTIONS = [
  "J'ai des activités qui me procurent du plaisir régulièrement",
  "Je me sens appartenir à une communauté",
  "Je me sens en sécurité dans ma vie",
  "J'ai de l'espoir pour mon avenir",
  "J'ai des objectifs importants pour moi",
  "Je gère bien mes difficultés quotidiennes",
  "Je suis satisfait(e) de ma santé physique",
  "Je gère bien ma santé mentale",
  "Mes relations avec les autres me satisfont",
  "J'ai une occupation (travail, études, bénévolat)",
];

const IROCK_LABELS = ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"];

const HONOS_QUESTIONS = [
  "Comportement hyperactif, agressif, perturbateur ou agité",
  "Automutilation non accidentelle",
  "Problèmes liés à l'alcool ou aux drogues",
  "Problèmes cognitifs",
  "Problèmes de maladie physique ou de handicap",
  "Problèmes liés aux hallucinations et délires",
  "Problèmes d'humeur dépressive",
  "Autres problèmes mentaux et comportementaux",
  "Problèmes relationnels",
  "Problèmes dans les activités de la vie quotidienne",
  "Problèmes de conditions de vie",
  "Problèmes d'occupation et d'activités",
];

const HONOS_LABELS = ["Aucun", "Minime", "Léger", "Modéré", "Grave"];

type EvalType = "iRock" | "HoNOS";

interface Props {
  type: EvalType;
  initial?: Partial<IrockEval | HonosEval>;
  onSave: (data: any) => void;
  onClose: () => void;
  isPending?: boolean;
}

function makeInitial(type: EvalType, initial?: any) {
  const today = new Date().toISOString().slice(0, 10);
  const n = type === "iRock" ? 10 : 12;
  const qs: Record<string, number> = {};
  for (let i = 1; i <= n; i++) qs[`q${i}`] = initial?.[`q${i}`] ?? 0;
  return { date: initial?.date ?? today, ...qs };
}

export function EvaluationModal({ type, initial, onSave, onClose, isPending }: Props) {
  const questions = type === "iRock" ? IROCK_QUESTIONS : HONOS_QUESTIONS;
  const labels = type === "iRock" ? IROCK_LABELS : HONOS_LABELS;
  const [form, setForm] = useState(() => makeInitial(type, initial));

  function setQ(q: string, v: number) {
    setForm((f) => ({ ...f, [q]: v }));
  }

  const total = questions.reduce((sum, _, i) => sum + ((form as any)[`q${i + 1}`] ?? 0), 0);
  const max = questions.length * 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
          <h2 className="text-base font-semibold">Évaluation {type}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Date de l'évaluation</label>
            <input
              type="date"
              className="mt-1 block w-48 border rounded px-2 py-1 text-sm bg-background"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>

          <div className="space-y-3">
            {questions.map((q, i) => {
              const key = `q${i + 1}`;
              const val = (form as any)[key] ?? 0;
              return (
                <div key={key} className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-xs font-mono text-muted-foreground shrink-0 w-5">{i + 1}.</span>
                    <span className="text-sm">{q}</span>
                  </div>
                  <div className="flex gap-1 pl-7">
                    {[0, 1, 2, 3, 4].map((v) => (
                      <button
                        key={v}
                        onClick={() => setQ(key, v)}
                        className={`flex-1 py-1.5 rounded text-xs font-medium border transition-colors ${
                          val === v
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-border hover:border-primary/50"
                        }`}
                        title={labels[v]}
                      >
                        {v}
                        <span className="hidden sm:block text-[10px] font-normal truncate">{labels[v]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-3 border-t shrink-0 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Score total : <span className="font-mono font-semibold text-foreground">{total}</span>
            <span className="text-xs"> / {max}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Annuler</Button>
            <Button size="sm" onClick={() => onSave(form)} disabled={isPending}>
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
