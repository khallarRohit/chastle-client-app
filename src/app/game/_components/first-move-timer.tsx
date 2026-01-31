"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface FirstMoveTimerProps {
  totalSeconds: number;
  isActive: boolean;
  onTimeOut?: () => void;
}

export function FirstMoveTimer({
  totalSeconds,
  isActive,
  onTimeOut,
}: FirstMoveTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    if (!isActive || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          onTimeOut?.();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, secondsLeft, onTimeOut]);

  if (!isActive || secondsLeft <= 0) return null;

  const percentage = (secondsLeft / totalSeconds) * 100;

  return (
    <div className="relative overflow-hidden rounded-lg bg-primary">
      <div
        className="absolute inset-0 bg-primary/50 transition-all duration-1000"
        style={{ width: `${percentage}%` }}
      />
      <div className="relative px-4 py-2 text-center">
        <span className="text-sm font-medium text-primary-foreground">
          <span className="font-bold">{secondsLeft}</span> seconds to play the
          first move
        </span>
      </div>
    </div>
  );
}
