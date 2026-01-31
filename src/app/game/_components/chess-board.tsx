"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { ChessAdapter, createChessGame } from "@/lib/chess/chess-adapter";

type Square = string;

interface ChessBoardProps {
  playerColor: "white" | "black";
  initialFen?: string;
  onMove?: (move: { from: string; to: string; san: string }) => void;
  onGameOver?: (result: string) => void;
}

export function ChessBoard({
  playerColor,
  initialFen,
  onMove,
  onGameOver,
}: ChessBoardProps) {
  const [game, setGame] = useState<ChessAdapter>(() =>
    createChessGame(initialFen)
  );
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<{
    [key: string]: { background: string; borderRadius?: string };
  }>({});
  const [rightClickedSquares, setRightClickedSquares] = useState<{
    [key: string]: { backgroundColor: string };
  }>({});
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    null
  );

  const gameRef = useRef(game);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  const makeMove = useCallback(
    (sourceSquare: Square, targetSquare: Square): boolean => {
      const gameCopy = createChessGame(gameRef.current.fen());

      const isPlayerTurn =
        (gameCopy.turn() === "w" && playerColor === "white") ||
        (gameCopy.turn() === "b" && playerColor === "black");

      if (!isPlayerTurn) {
        return false;
      }

      try {
        const move = gameCopy.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });

        if (move) {
          setGame(gameCopy);
          setLastMove({ from: sourceSquare, to: targetSquare });
          setMoveFrom(null);
          setOptionSquares({});

          // Generate SAN notation
          const moves = gameRef.current.moves({ square: sourceSquare, verbose: true });
          const matchingMove = moves.find(
            (m: { from: string; to: string; san: string }) =>
              m.from === sourceSquare && m.to === targetSquare
          );

          onMove?.({
            from: sourceSquare,
            to: targetSquare,
            san: matchingMove?.san || targetSquare,
          });

          // Check for game over
          if (gameCopy.isGameOver()) {
            if (gameCopy.isCheckmate()) {
              onGameOver?.(
                gameCopy.turn() === "w" ? "Black wins" : "White wins"
              );
            } else if (gameCopy.isStalemate()) {
              onGameOver?.("Draw by stalemate");
            }
          }

          return true;
        }
      } catch {
        // Invalid move
      }

      return false;
    },
    [playerColor, onMove, onGameOver]
  );

  function onDrop(sourceSquare: Square, targetSquare: Square): boolean {
    return makeMove(sourceSquare, targetSquare);
  }

  function onSquareClick(square: Square) {
    setRightClickedSquares({});

    if (!moveFrom) {
      const piece = game.get(square);
      if (
        piece &&
        ((piece.color === "w" && playerColor === "white") ||
          (piece.color === "b" && playerColor === "black"))
      ) {
        setMoveFrom(square);
        getMoveOptions(square);
      }
      return;
    }

    const moveSuccessful = makeMove(moveFrom, square);

    if (!moveSuccessful) {
      const piece = game.get(square);
      if (
        piece &&
        ((piece.color === "w" && playerColor === "white") ||
          (piece.color === "b" && playerColor === "black"))
      ) {
        setMoveFrom(square);
        getMoveOptions(square);
      } else {
        setMoveFrom(null);
        setOptionSquares({});
      }
    }
  }

  function getMoveOptions(square: Square) {
    const moves = game.moves({ square, verbose: true });

    if (moves.length === 0) {
      setOptionSquares({});
      return;
    }

    const newSquares: {
      [key: string]: { background: string; borderRadius?: string };
    } = {};

    moves.forEach((move: { to: string; captured?: string }) => {
      newSquares[move.to] = {
        background: move.captured
          ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
          : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
    });

    newSquares[square] = {
      background: "rgba(186, 202, 68, 0.6)",
    };

    setOptionSquares(newSquares);
  }

  function onSquareRightClick(square: Square) {
    const color = "rgba(235, 97, 80, 0.8)";
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square]?.backgroundColor === color
          ? { backgroundColor: "transparent" }
          : { backgroundColor: color },
    });
  }

  // Highlight last move
  const lastMoveSquares: { [key: string]: { background: string } } = {};
  if (lastMove) {
    lastMoveSquares[lastMove.from] = { background: "rgba(186, 202, 68, 0.4)" };
    lastMoveSquares[lastMove.to] = { background: "rgba(186, 202, 68, 0.4)" };
  }

  return (
    <div className="w-full aspect-square max-w-[600px] mx-auto">
      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop}
        onSquareClick={onSquareClick}
        onSquareRightClick={onSquareRightClick}
        boardOrientation={playerColor}
        customSquareStyles={{
          ...lastMoveSquares,
          ...optionSquares,
          ...rightClickedSquares,
        }}
        customBoardStyle={{
          borderRadius: "4px",
        }}
        customDarkSquareStyle={{
          backgroundColor: "#b58863",
        }}
        customLightSquareStyle={{
          backgroundColor: "#f0d9b5",
        }}
        arePiecesDraggable={true}
        showBoardNotation={true}
      />
    </div>
  );
}
