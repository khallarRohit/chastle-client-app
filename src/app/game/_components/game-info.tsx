"use client";

import { Flame, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface GameInfoProps {
  timeControl: string;
  gameType: string;
  variant: string;
  whitePlayer: string;
  blackPlayer: string;
  chatEnabled: boolean;
  onChatToggle: (enabled: boolean) => void;
}

export function GameInfo({
  timeControl,
  gameType,
  variant,
  whitePlayer,
  blackPlayer,
  chatEnabled,
  onChatToggle,
}: GameInfoProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Game Details Card */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Flame className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-foreground font-medium">{timeControl}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{gameType}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{variant}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">right now</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-muted-foreground/50" />
            <span className="text-sm text-foreground">{whitePlayer}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full border-2 border-muted-foreground/50" />
            <span className="text-sm text-foreground">{blackPlayer}</span>
          </div>
        </div>
      </div>

      {/* Chat Room Card */}
      <div className="bg-card border border-border rounded-lg flex-1 flex flex-col">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <Label htmlFor="chat-toggle" className="text-sm text-foreground">
            Chat room
          </Label>
          <Switch
            id="chat-toggle"
            checked={chatEnabled}
            onCheckedChange={onChatToggle}
          />
        </div>
        {chatEnabled && (
          <>
            <div className="flex-1 min-h-[200px] p-3">
              {/* Chat messages would go here */}
            </div>
            <div className="p-3 border-t border-border">
              <Input
                placeholder="Sign in to chat"
                disabled
                className="bg-muted text-sm"
              />
            </div>
            <div className="flex border-t border-border">
              <button className="flex-1 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors">
                HI
              </button>
              <button className="flex-1 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors border-l border-border">
                GL
              </button>
              <button className="flex-1 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors border-l border-border">
                HF
              </button>
              <button className="flex-1 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors border-l border-border">
                U2
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
