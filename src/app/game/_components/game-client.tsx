"use client";

import { useState, useCallback, useEffect } from "react";
import { ChessBoard } from "./chess-board";
import { GameInfo } from "./game-info";
import { PlayerTimer } from "./play-timer";
import { MoveHistory } from "./move-history";
import { GameActions } from "./game-action";
import { FirstMoveTimer } from "./first-move-timer";
import { useGameSocket } from "./use-game-socket";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

interface Move {
  number: number;
  white: string;
  black?: string;
}

interface GameConfig {
  timeControl: string;
  initialTime: number; // in seconds
  increment: number; // in seconds
  gameType: string;
  variant: string;
}

interface GameClientProps {
  gameId: string;
  playerColor: "white" | "black";
  config: GameConfig;
}

export function GameClient({ gameId, playerColor, config }: GameClientProps) {
  const [chatEnabled, setChatEnabled] = useState(true);
  const [moves, setMoves] = useState<Move[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState("");
  const [boardFen, setBoardFen] = useState<string | undefined>(undefined);

  // Initialize WebSocket connection
  const { isConnected, lastMessage, sendMessage } = useGameSocket({
    url: process.env.WS_URL || "ws://localhost:8080",
    gameId,
    reconnect: true,
  });

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    console.log("WebSocket message received:", lastMessage);

    switch (lastMessage.type) {
      case 'GAME_STATE':
        if (lastMessage.payload?.position) {
          setBoardFen(lastMessage.payload.position);
        }
        if (lastMessage.payload?.gameStarted !== undefined) {
          setGameStarted(lastMessage.payload.gameStarted);
        }
        break;
      case 'PLAYER_JOINED':


        break;
      case 'MOVE_MADE':
        if(lastMessage.payload?.move){
          const move = lastMessage.payload.move;
          const moveColor = lastMessage.payload.playerColor;

          if(moveColor && moveColor !== playerColor){
            setMoves((prev) => {
              const newMoves = [...prev];
              if(moveColor === "white") {
                newMoves.push({
                  number: newMoves.length + 1,
                  white: move.san,
                });
              }else {
                if (newMoves.length > 0) {
                  newMoves[newMoves.length - 1].black = move.san;
                }
              }
              return newMoves;
            });
            setIsWhiteTurn((prev) => !prev);
          }
        }
        break;
      case 'CHAT_MESSAGE':
        break;
      case 'PLAYER_LEFT':
        break;
      case 'DRAW_OFFER':
        break;
      case 'DRAW_RESPONSE':
        break;
      case 'GAME_OVER':
        if (lastMessage.payload?.result) {
          handleGameOver(lastMessage.payload.result);
        }
        break;
      case 'RESIGN':
        break;
      case 'ERROR':
        break;
      default: 
        break;
    }
  }, [lastMessage]);

  const handleMove = useCallback(
    (move: { from: string; to: string; san: string; promotion?: string }) => {
      if (!gameStarted) {
        setGameStarted(true);
      }

      setMoves((prev) => {
        const newMoves = [...prev];
        if (isWhiteTurn) {
          // White's move - create new entry
          newMoves.push({
            number: newMoves.length + 1,
            white: move.san,
          });
        } else {
          // Black's move - add to last entry
          if (newMoves.length > 0) {
            newMoves[newMoves.length - 1].black = move.san;
          }
        }
        return newMoves;
      });

      // Send move to server via WebSocket
      if (isConnected) {
        sendMessage("move", {
          gameId,
          playerColor,
          move: {
            from: move.from,
            to: move.to,
            san: move.san,
            promotion: move.promotion,
          },
        });
      }

      setCurrentMoveIndex((prev) => prev + 1);
      setIsWhiteTurn((prev) => !prev);
    },
    [isWhiteTurn, gameStarted, isConnected, gameId, playerColor, sendMessage]
  );

  const handleGameOver = useCallback((result: string) => {
    setGameOver(true);
    setGameResult(result);
  }, []);

  const handleResign = useCallback(() => {
    const winner = playerColor === "white" ? "Black" : "White";
    handleGameOver(`${winner} wins by resignation`);
  }, [playerColor, handleGameOver]);

  const handleOfferDraw = useCallback(() => {
    // In a real app, this would send a draw offer to the opponent
    console.log("Draw offered");
  }, []);

  const handleReport = useCallback(() => {
    // In a real app, this would open a report dialog
    console.log("Report clicked");
  }, []);

  const handleFirstMoveTimeout = useCallback(() => {
    if (!gameStarted) {
      const winner = playerColor === "white" ? "Black" : "White";
      handleGameOver(`${winner} wins - opponent didn't move`);
    }
  }, [gameStarted, playerColor, handleGameOver]);

  // Navigation handlers
  const handleFirst = () => setCurrentMoveIndex(-1);
  const handlePrevious = () =>
    setCurrentMoveIndex((prev) => Math.max(-1, prev - 1));
  const handleNext = () =>
    setCurrentMoveIndex((prev) =>
      Math.min(moves.length * 2 - (moves[moves.length - 1]?.black ? 0 : 1) - 1, prev + 1)
    );
  const handleLast = () =>
    setCurrentMoveIndex(
      moves.length * 2 - (moves[moves.length - 1]?.black ? 0 : 1) - 1
    );

  const opponentColor = playerColor === "white" ? "black" : "white";
  const isPlayerTurn =
    (isWhiteTurn && playerColor === "white") ||
    (!isWhiteTurn && playerColor === "black");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6 max-w-7xl mx-auto">
          {/* Left Sidebar - Game Info */}
          <div className="hidden lg:block">
            <GameInfo
              timeControl={config.timeControl}
              gameType={config.gameType}
              variant={config.variant}
              whitePlayer="Anonymous"
              blackPlayer="Anonymous"
              chatEnabled={chatEnabled}
              onChatToggle={setChatEnabled}
            />
          </div>

          {/* Center - Chess Board */}
          <div className="flex flex-col items-center justify-center">
            <ChessBoard
              playerColor={playerColor}
              onMove={handleMove}
              onGameOver={handleGameOver}
              position={boardFen}
            />
            {!isConnected && (
              <div className="mt-2 text-sm text-amber-600">
                Connecting to server...
              </div>
            )}
          </div>

          {/* Right Sidebar - Timers & Controls */}
          <div className="flex flex-col gap-3">
            {/* Opponent Timer (top) */}
            {/* <PlayerTimer
              initialTime={config.initialTime}
              isActive={!gameOver && gameStarted && !isPlayerTurn}
              increment={config.increment}
              playerName="Anonymous"
              isOnline={true}
              onTimeOut={() => handleGameOver(`${playerColor === "white" ? "White" : "Black"} wins on time`)}
            /> */}

            {/* Move History */}
            <MoveHistory
              moves={moves}
              currentMoveIndex={currentMoveIndex}
              onMoveClick={setCurrentMoveIndex}
              onFirst={handleFirst}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onLast={handleLast}
            />

            {/* Game Actions */}
            <GameActions
              onResign={handleResign}
              onOfferDraw={handleOfferDraw}
              onReport={handleReport}
              canResign={gameStarted && !gameOver}
              canOfferDraw={gameStarted && !gameOver}
            />

            {/* Player Timer (bottom) */}
            {/* <PlayerTimer
              initialTime={config.initialTime}
              isActive={!gameOver && gameStarted && isPlayerTurn}
              increment={config.increment}
              playerName="Anonymous"
              isOnline={true}
              isCurrentPlayer={true}
              onTimeOut={() => handleGameOver(`${opponentColor === "white" ? "White" : "Black"} wins on time`)}
            /> */}

            {/* First Move Timer */}
            {!gameStarted && playerColor === "white" && (
              <FirstMoveTimer
                totalSeconds={30}
                isActive={!gameStarted}
                onTimeOut={handleFirstMoveTimeout}
              />
            )}
          </div>
        </div>

        {/* Mobile: Game Info */}
        <div className="lg:hidden mt-6">
          <GameInfo
            timeControl={config.timeControl}
            gameType={config.gameType}
            variant={config.variant}
            whitePlayer="Anonymous"
            blackPlayer="Anonymous"
            chatEnabled={chatEnabled}
            onChatToggle={setChatEnabled}
          />
        </div>
      </div>

      {/* Game Over Dialog */}
      <Dialog open={gameOver} onOpenChange={() => {}}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2 text-foreground">
              <Crown className="h-6 w-6 text-accent" />
              Game Over
            </DialogTitle>
            <DialogDescription className="text-lg pt-2 text-muted-foreground">
              {gameResult}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            <Button
              className="w-full"
              onClick={() => (window.location.href = "/play")}
            >
              New Game
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => (window.location.href = "/")}
            >
              Return to Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
