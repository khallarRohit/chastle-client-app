"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerTimerProps {
  initialTime: number; // in seconds
  isActive: boolean;
  increment: number; // in seconds
  playerName: string;
  isOnline: boolean;
  isCurrentPlayer?: boolean;
  onTimeOut?: () => void;
}

export function PlayerTimer({
  initialTime,
  isActive,
  increment,
  playerName,
  isOnline,
  isCurrentPlayer = false,
  onTimeOut,
}: PlayerTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          onTimeOut?.();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onTimeOut]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const isLowTime = timeLeft < 30;

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg p-4 transition-all",
        isActive && "ring-2 ring-primary",
        isCurrentPlayer && "border-primary/50"
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "font-mono text-4xl font-bold tracking-tight",
            isLowTime && isActive ? "text-destructive" : "text-foreground"
          )}
        >
          {formatTime(timeLeft)}
        </div>
        {increment > 0 && (
          <button className="flex items-center justify-center h-8 w-8 rounded bg-muted hover:bg-muted/80 transition-colors">
            <Plus className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <div
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            isOnline ? "bg-primary" : "bg-muted-foreground"
          )}
        />
        <span className="text-sm text-foreground">{playerName}</span>
      </div>
    </div>
  );
}
