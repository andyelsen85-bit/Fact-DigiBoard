interface AggBadgeProps {
  level: number;
}

const AGG_LEVELS: Record<number, { emoji: string; bg: string; border: string; title: string }> = {
  0: { emoji: "😄", bg: "bg-green-100",  border: "border-green-400",  title: "Calme" },
  1: { emoji: "😐", bg: "bg-yellow-100", border: "border-yellow-400", title: "Niveau 1 — légère vigilance" },
  2: { emoji: "😤", bg: "bg-orange-100", border: "border-orange-400", title: "Niveau 2 — vigilance modérée" },
  3: { emoji: "😡", bg: "bg-red-100",    border: "border-red-400",    title: "Niveau 3 — risque élevé" },
};

export function AggBadge({ level }: AggBadgeProps) {
  const cfg = AGG_LEVELS[level] ?? AGG_LEVELS[0];
  return (
    <span
      title={cfg.title}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full border text-base leading-none select-none ${cfg.bg} ${cfg.border}`}
    >
      {cfg.emoji}
    </span>
  );
}

export const AGG_EMOJI: Record<number, string> = {
  0: "😄",
  1: "😐",
  2: "😤",
  3: "😡",
};
