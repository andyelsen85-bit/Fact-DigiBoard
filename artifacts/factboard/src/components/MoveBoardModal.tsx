import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BOARDS, BoardBadge } from "./BoardBadge";

interface MoveBoardModalProps {
  open: boolean;
  onClose: () => void;
  currentBoard: string;
  onMove: (board: string, date: string) => void;
  isPending?: boolean;
}

export function MoveBoardModal({ open, onClose, currentBoard, onMove, isPending }: MoveBoardModalProps) {
  const [selectedBoard, setSelectedBoard] = useState(currentBoard);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  function handleMove() {
    if (selectedBoard !== currentBoard) {
      onMove(selectedBoard, date);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Changer de board</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nouveau board</Label>
            <div className="grid grid-cols-1 gap-2">
              {BOARDS.map((b) => (
                <button
                  key={b}
                  type="button"
                  data-testid={`board-option-${b}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border text-left text-sm transition-colors ${
                    selectedBoard === b
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-border hover:bg-muted"
                  }`}
                  onClick={() => setSelectedBoard(b)}
                >
                  <BoardBadge board={b} />
                  {b === currentBoard && (
                    <span className="text-xs text-muted-foreground">(actuel)</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="move-date">Date du mouvement</Label>
            <Input
              id="move-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-testid="input-move-date"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-move">Annuler</Button>
          <Button
            onClick={handleMove}
            disabled={isPending || selectedBoard === currentBoard}
            data-testid="button-confirm-move"
          >
            {isPending ? "Déplacement..." : "Déplacer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
