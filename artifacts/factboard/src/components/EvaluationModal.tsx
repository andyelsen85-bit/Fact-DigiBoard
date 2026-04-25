import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { IrockEval, HonosEval } from "@/hooks/use-evaluations";

// ─── I•ROC ────────────────────────────────────────────────────────────────────

const IROC_QUESTIONS: { label: string; description: string }[] = [
  {
    label: "J'ai des activités qui me procurent du plaisir régulièrement",
    description: "Loisirs, passe-temps, sport, culture – activités choisies librement et procurant satisfaction.",
  },
  {
    label: "Je me sens appartenir à une communauté",
    description: "Sentiment d'inclusion et de lien avec un groupe, un voisinage ou un réseau social.",
  },
  {
    label: "Je me sens en sécurité dans ma vie",
    description: "Sécurité physique et émotionnelle dans le logement et l'environnement quotidien.",
  },
  {
    label: "J'ai de l'espoir pour mon avenir",
    description: "Sentiment que les choses peuvent s'améliorer ; confiance dans les possibilités à venir.",
  },
  {
    label: "J'ai des objectifs importants pour moi",
    description: "Avoir des buts personnels significatifs qui donnent un sens à sa vie, quels qu'ils soient.",
  },
  {
    label: "Je gère bien mes difficultés quotidiennes",
    description: "Capacité à faire face aux problèmes courants et aux imprévus de la vie de tous les jours.",
  },
  {
    label: "Je suis satisfait(e) de ma santé physique",
    description: "Évaluation personnelle de l'état physique général et du bien-être corporel.",
  },
  {
    label: "Je gère bien ma santé mentale",
    description: "Sentiment de contrôle sur l'état psychologique et émotionnel ; gestion des symptômes.",
  },
  {
    label: "Mes relations avec les autres me satisfont",
    description: "Qualité des relations familiales, amicales ou sociales et satisfaction générale.",
  },
  {
    label: "J'ai une occupation (travail, études, bénévolat)",
    description: "Toute activité principale donnant structure et sens à la semaine (emploi, formation, engagement).",
  },
  {
    label: "Je me sens libre de faire mes propres choix",
    description: "Autodétermination – sentiment de pouvoir décider de sa propre vie sans contrainte excessive.",
  },
  {
    label: "Je gère bien mon budget et mes finances",
    description: "Capacité à gérer l'argent, payer les factures et faire face aux dépenses courantes.",
  },
];

const IROC_LABELS = ["Jamais", "Rarement", "Parfois", "Assez souvent", "Souvent", "Toujours"];

// ─── HoNOS ───────────────────────────────────────────────────────────────────

const HONOS_QUESTIONS: { label: string; include: string; exclude: string }[] = [
  {
    label: "Comportement hyperactif, agressif, perturbateur ou agité",
    include: "Toute agression quelle qu'en soit la cause · Désinhibition sexuelle · Résistance active ou agressive",
    exclude: "Comportement étrange (→ item 6)",
  },
  {
    label: "Auto-agressivité / risque de passage à l'acte",
    include: "Suicidalité · Lésions auto-infligées intentionnelles",
    exclude: "Blessures accidentelles · Atteintes dues directement à alcool/drogues",
  },
  {
    label: "Troubles liés à la consommation d'alcool ou de drogues",
    include: "Consommation incontrôlée · Abus de médicaments",
    exclude: "Prise de médicaments prescrits correctement · Agressivité liée (→ item 1)",
  },
  {
    label: "Troubles cognitifs",
    include: "Mémoire, orientation, pensée · Compréhension, langage, reconnaissance",
    exclude: "Troubles mentaux sans atteinte cognitive",
  },
  {
    label: "Maladie physique ou handicap",
    include: "Maladie/handicap limitant l'activité · Douleur, effets secondaires",
    exclude: "Troubles mentaux",
  },
  {
    label: "Hallucinations et délires",
    include: "Hallucinations, délires · Comportements bizarres associés",
    exclude: "Agressivité (→ item 1)",
  },
  {
    label: "Humeur dépressive",
    include: "Humeur dépressive · Culpabilité, dévalorisation",
    exclude: "Suicidalité (→ item 2) · Psychose (→ item 6)",
  },
  {
    label: "Autres troubles mentaux (principal)",
    include: "Trouble principal non couvert par les items 1–7",
    exclude: "Plusieurs troubles simultanés",
  },
  {
    label: "Relations sociales",
    include: "Retrait social · Relations négatives ou destructrices",
    exclude: "—",
  },
  {
    label: "Activités de la vie quotidienne",
    include: "Soins personnels · Tâches complexes",
    exclude: "Limites environnementales seules",
  },
  {
    label: "Conditions de vie (logement)",
    include: "Qualité du logement",
    exclude: "Handicap fonctionnel",
  },
  {
    label: "Occupation et activités",
    include: "Accès aux activités de jour",
    exclude: "Capacités personnelles",
  },
];

const HONOS_LABELS = ["Aucun", "Minime", "Léger", "Modéré", "Grave"];

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
  const qs: Record<string, number> = {};
  for (let i = 1; i <= 12; i++) qs[`q${i}`] = initial?.[`q${i}`] ?? 0;
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
  const isIroc = type === "I•ROC";
  const questions = isIroc ? IROC_QUESTIONS : HONOS_QUESTIONS;
  const labels = isIroc ? IROC_LABELS : HONOS_LABELS;
  const levels = isIroc ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 4];

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

  const total = questions.reduce((sum, _, i) => sum + ((form as any)[`q${i + 1}`] ?? 0), 0);
  const max = questions.length * (isIroc ? 5 : 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
          <h2 className="text-base font-semibold">Évaluation {type}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Date */}
          <div>
            <label className="text-xs text-muted-foreground">Date de l'évaluation</label>
            <input
              type="date"
              className="mt-1 block w-48 border rounded px-2 py-1 text-sm bg-background"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {questions.map((q, i) => {
              const key = `q${i + 1}`;
              const val = (form as any)[key] ?? 0;
              const qNote = form.questionNotes[key] ?? "";

              return (
                <div key={key} className="bg-muted/30 rounded-lg p-3 space-y-2">

                  {/* Question header */}
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-mono text-muted-foreground shrink-0 w-5 mt-0.5">{i + 1}.</span>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-snug">{q.label}</p>

                      {/* I•ROC description */}
                      {isIroc && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {(q as typeof IROC_QUESTIONS[0]).description}
                        </p>
                      )}

                      {/* HoNOS SAISIR / NE PAS SAISIR */}
                      {!isIroc && (
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs">
                          <span className="text-green-700 dark:text-green-400">
                            <span className="font-semibold">✓ Saisir :</span>{" "}
                            {(q as typeof HONOS_QUESTIONS[0]).include}
                          </span>
                          <span className="text-red-600 dark:text-red-400">
                            <span className="font-semibold">✗ Exclure :</span>{" "}
                            {(q as typeof HONOS_QUESTIONS[0]).exclude}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Score buttons */}
                  <div className="flex gap-1 pl-7">
                    {levels.map((v) => (
                      <button
                        key={v}
                        onClick={() => setQ(key, v)}
                        title={labels[v]}
                        className={`flex-1 py-1.5 rounded text-xs font-medium border transition-colors ${
                          val === v
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-border hover:border-primary/50"
                        }`}
                      >
                        {v}
                        <span className="hidden sm:block text-[10px] font-normal truncate">{labels[v]}</span>
                      </button>
                    ))}
                  </div>

                  {/* Per-question free-text note */}
                  <div className="pl-7">
                    <textarea
                      rows={1}
                      placeholder="Note pour cette question…"
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
              );
            })}
          </div>

          {/* General notes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes générales</label>
            <textarea
              rows={3}
              placeholder="Observations libres, contexte clinique, remarques…"
              value={form.notes ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="mt-1 w-full text-sm border rounded px-3 py-2 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t shrink-0 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Score total : <span className="font-mono font-semibold text-foreground">{total}</span>
            <span className="text-xs"> / {max}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Annuler</Button>
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
