"use client";

import { X, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface GameActionsProps {
  onResign: () => void;
  onOfferDraw: () => void;
  onReport: () => void;
  canResign?: boolean;
  canOfferDraw?: boolean;
}

export function GameActions({
  onResign,
  onOfferDraw,
  onReport,
  canResign = true,
  canOfferDraw = true,
}: GameActionsProps) {
  return (
    <div className="flex items-center justify-center gap-6 py-3">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            disabled={!canResign}
            className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Resign"
          >
            <X className="h-5 w-5 text-muted-foreground hover:text-destructive" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Resign Game
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to resign? This will end the game and count
              as a loss.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted text-foreground hover:bg-muted/80">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onResign}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Resign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <button
        onClick={onOfferDraw}
        disabled={!canOfferDraw}
        className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Offer draw"
      >
        <span className="text-lg font-medium text-muted-foreground">1/2</span>
      </button>

      <button
        onClick={onReport}
        className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-muted transition-colors"
        aria-label="Report"
      >
        <Flag className="h-5 w-5 text-muted-foreground" />
      </button>
    </div>
  );
}
