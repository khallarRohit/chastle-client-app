"use client";

import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Move {
  number: number;
  white: string;
  black?: string;
}

interface MoveHistoryProps {
  moves: Move[];
  currentMoveIndex: number;
  onMoveClick: (index: number) => void;
  onFirst: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLast: () => void;
}

export function MoveHistory({
  moves,
  currentMoveIndex,
  onMoveClick,
  onFirst,
  onPrevious,
  onNext,
  onLast,
}: MoveHistoryProps) {
  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-1 p-2 border-b border-border">
        <button
          onClick={onFirst}
          className="p-2 rounded hover:bg-muted transition-colors"
          aria-label="First move"
        >
          <ChevronsLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          onClick={onPrevious}
          className="p-2 rounded hover:bg-muted transition-colors"
          aria-label="Previous move"
        >
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          onClick={onNext}
          className="p-2 rounded hover:bg-muted transition-colors"
          aria-label="Next move"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          onClick={onLast}
          className="p-2 rounded hover:bg-muted transition-colors"
          aria-label="Last move"
        >
          <ChevronsRight className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          className="p-2 rounded hover:bg-muted transition-colors ml-2"
          aria-label="Menu"
        >
          <Menu className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Move List */}
      <ScrollArea className="h-[120px]">
        <div className="p-2">
          {moves.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No moves yet
            </p>
          ) : (
            <div className="space-y-1">
              {moves.map((move, idx) => {
                const whiteMoveIndex = idx * 2;
                const blackMoveIndex = idx * 2 + 1;
                return (
                  <div key={move.number} className="flex items-center text-sm">
                    <span className="w-8 text-muted-foreground">
                      {move.number}
                    </span>
                    <button
                      onClick={() => onMoveClick(whiteMoveIndex)}
                      className={cn(
                        "flex-1 px-2 py-1 rounded text-left transition-colors",
                        currentMoveIndex === whiteMoveIndex
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      {move.white}
                    </button>
                    {move.black && (
                      <button
                        onClick={() => onMoveClick(blackMoveIndex)}
                        className={cn(
                          "flex-1 px-2 py-1 rounded text-left transition-colors",
                          currentMoveIndex === blackMoveIndex
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        {move.black}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
