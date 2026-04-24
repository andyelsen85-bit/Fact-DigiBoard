interface BoardBadgeProps {
  board: string;
  className?: string;
}

const BOARD_STYLES: Record<string, string> = {
  FactBoard: "bg-[#e8f0e8] text-[#2d5a2d] border border-[#c5d9c5]",
  RecoveryBoard: "bg-[#e8eef8] text-[#1e3a6e] border border-[#c0cfeb]",
  "PréAdmission": "bg-[#f5f0e8] text-[#6b4c1e] border border-[#e0d0b8]",
  Irrecevable: "bg-[#f5e8e8] text-[#6b1e1e] border border-[#dcc0c0]",
  "Clôturé": "bg-[#eeeeee] text-[#555555] border border-[#cccccc]",
};

export function BoardBadge({ board, className = "" }: BoardBadgeProps) {
  const style = BOARD_STYLES[board] ?? "bg-gray-100 text-gray-600 border border-gray-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style} ${className}`}>
      {board}
    </span>
  );
}

export const BOARDS = ["PréAdmission", "FactBoard", "RecoveryBoard", "Irrecevable", "Clôturé"] as const;
export type Board = typeof BOARDS[number];
