import { useT } from "@/i18n";
import "@/i18n/dict/board";

interface AggBadgeProps {
  level: number;
}

const AGG_LEVELS: Record<number, { emoji: string; bg: string; border: string; titleKey: string }> = {
  0: { emoji: "😄", bg: "bg-green-100",  border: "border-green-400",  titleKey: "board.aggCalm" },
  1: { emoji: "😐", bg: "bg-yellow-100", border: "border-yellow-400", titleKey: "board.aggLevel1" },
  2: { emoji: "😤", bg: "bg-orange-100", border: "border-orange-400", titleKey: "board.aggLevel2" },
  3: { emoji: "😡", bg: "bg-red-100",    border: "border-red-400",    titleKey: "board.aggLevel3" },
};

export function AggBadge({ level }: AggBadgeProps) {
  const t = useT();
  if (level === -1 || !(level in AGG_LEVELS)) return null;
  const cfg = AGG_LEVELS[level]!;
  return (
    <span
      title={t(cfg.titleKey)}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full border text-base leading-none select-none ${cfg.bg} ${cfg.border}`}
    >
      {cfg.emoji}
    </span>
  );
}

export const AGG_EMOJI: Record<number, string> = {
  "-1": "",
  0: "😄",
  1: "😐",
  2: "😤",
  3: "😡",
};
