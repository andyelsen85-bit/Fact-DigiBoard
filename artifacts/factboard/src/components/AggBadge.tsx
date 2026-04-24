interface AggBadgeProps {
  level: number;
}

const AGG_STYLES: Record<number, { bg: string; text: string; label: string }> = {
  0: { bg: "bg-gray-100 border-gray-300", text: "text-gray-600", label: "Aucune" },
  1: { bg: "bg-[#fffbea] border-[#f0c040]", text: "text-[#7a5c00]", label: "Niveau 1" },
  2: { bg: "bg-[#fff2e0] border-[#e08020]", text: "text-[#7a3800]", label: "Niveau 2" },
  3: { bg: "bg-[#fdeaea] border-[#d03030]", text: "text-[#7a0000]", label: "Niveau 3" },
};

export function AggBadge({ level }: AggBadgeProps) {
  const style = AGG_STYLES[level] ?? AGG_STYLES[0];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}
