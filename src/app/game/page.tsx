import { Suspense } from "react";
import { GameClient } from "./_components/game-client";

// Server component that handles the page structure
export default function GamePage() {
  // In a real app, you would fetch game data from the database here
  // For now, we'll use default values
  const gameConfig = {
    timeControl: "5+3",
    initialTime: 300, // 5 minutes in seconds
    increment: 3, // 3 seconds increment
    gameType: "Casual",
    variant: "Blitz",
  };

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-foreground">Loading game...</div>
        </div>
      }
    >
      <GameClient
        gameId="demo-game"
        playerColor="white"
        config={gameConfig}
      />
    </Suspense>
  );
}
