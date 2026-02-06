"use client";

import React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { ChessAdapter, createChessGame } from "@/lib/chess/chess-adapter";
import { Move, PieceType, Square} from "@/lib/chess/chess-engine"

// Types matching react-chessboard's handler argument types
type PieceDataType = {
  pieceType: string;
};

type DraggingPieceDataType = {
  isSparePiece: boolean;
  position: string;
  pieceType: string;
};

type SquareHandlerArgs = {
  piece: PieceDataType | null;
  square: string;
};

type PieceHandlerArgs = {
  isSparePiece: boolean;
  piece: PieceDataType;
  square: string | null;
};

type PieceDropHandlerArgs = {
  piece: DraggingPieceDataType;
  sourceSquare: string;
  targetSquare: string | null;
};

interface ChessBoardProps {
  playerColor: "white" | "black";
  initialFen?: string;
  onMove?: (move: { from: string; to: string; san: string; promotion?: string }) => void;
  onGameOver?: (result: string) => void;
  position?: string;
}

interface PromotionState {
  isPromoting: boolean;
  from: string;
  to: string;
  sourceSquare: string;
  targetSquare: string;
}

export function ChessBoard({
  playerColor,
  initialFen,
  onMove,
  onGameOver,
  position,
}: ChessBoardProps) {
  const [game, setGame] = useState<ChessAdapter>(() =>
    createChessGame(initialFen)
  );
  const [moveFrom, setMoveFrom] = useState<string | null>(null);

  // contain all legal moves when i click a square
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({}); 
  const [rightClickedSquares, setRightClickedSquares] = useState<Record<string, React.CSSProperties>>({});
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [promotionState, setPromotionState] = useState<PromotionState | null>(null);

  const gameRef = useRef(game);
  const onMoveRef = useRef(onMove);
  const onGameOverRef = useRef(onGameOver);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    onMoveRef.current = onMove;
  }, [onMove]);

  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  // Update game state when external position changes (from WebSocket)
  useEffect(() => {
    if (position && position !== game.fen()) {
      const newGame = createChessGame(position);
      setGame(newGame);
    }
  }, [position]);
  
  const getMoveOptions = useCallback((square: string) => {
    const moves = game.moves({ square, verbose: true });

    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: Record<string, React.CSSProperties> = {};

    moves.forEach((move: Move) => {
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
    return true;
  }, [game]);

  const makeMove = useCallback(
    (move: {
      from: Square,
      to: Square,
      promotion?: PieceType,
    }): boolean => {
      try {
        // Get SAN and check for pawn promotion

        const moveResult = gameRef.current.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion,
        })

        if(moveResult === 'no_piece' || moveResult === 'no_move' || moveResult === 'no_turn'){
          return false;
        } 

        if(moveResult === 'promotion_not_found'){
            setPromotionState({
              isPromoting: true,
              from: move.from,
              to: move.to,
              sourceSquare,
              targetSquare,
            });
            return false;
        }

        const moves = gameRef.current.moves({ square: move.from, verbose: true });
        const matchingMove = moves.find(
          (m: { from: string; to: string; san: string; promotion?: string }) =>
            m.from === sourceSquare && m.to === targetSquare
        );

        // Check if this move requires promotion
        if (matchingMove && matchingMove.promotion) {
          if (!promotion) {
            // Promotion is required but not provided - show promotion dialog

          }
          // User selected a promotion piece
          const move = gameCopy.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: promotion,
          });

          if (move) {
            setGame(gameCopy);
            setLastMove({ from: sourceSquare, to: targetSquare });
            setMoveFrom(null);
            setOptionSquares({});
            setPromotionState(null);

            onMoveRef.current?.({
              from: sourceSquare,
              to: targetSquare,
              san: move.san,
              promotion,
            });

            // Check for game over
            if (gameCopy.isGameOver()) {
              if (gameCopy.isCheckmate()) {
                onGameOverRef.current?.(
                  gameCopy.turn() === "w" ? "Black wins" : "White wins"
                );
              } else if (gameCopy.isStalemate()) {
                onGameOverRef.current?.("Draw by stalemate");
              }
            }

            return true;
          }
        } else {
          // Regular move without promotion
          const move = gameCopy.move({
            from: sourceSquare,
            to: targetSquare,
          });

          if (move) {
            setGame(gameCopy);
            setLastMove({ from: sourceSquare, to: targetSquare });
            setMoveFrom(null);
            setOptionSquares({});

            onMoveRef.current?.({
              from: sourceSquare,
              to: targetSquare,
              san: move.san,
            });

            // Check for game over
            if (gameCopy.isGameOver()) {
              if (gameCopy.isCheckmate()) {
                onGameOverRef.current?.(
                  gameCopy.turn() === "w" ? "Black wins" : "White wins"
                );
              } else if (gameCopy.isStalemate()) {
                onGameOverRef.current?.("Draw by stalemate");
              }
            }

            return true;
          }
        }
      } catch {
        // Invalid move
      }

      return false;
    },
    [playerColor]
  );

  // Handle promotion selection
  const handlePromotion = useCallback(
    (piece: string) => {
      if (promotionState) {
        makeMove(promotionState.sourceSquare, promotionState.targetSquare, piece);
      }
    },
    [promotionState, makeMove]
  );

  // Handler uses object destructuring as per react-chessboard's PieceDropHandlerArgs
  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (!targetSquare) return false;
      const success = makeMove(sourceSquare, targetSquare);
      return success;
    },
    [makeMove]
  );

  // Handler uses object destructuring as per react-chessboard's SquareHandlerArgs
  const onSquareClick = useCallback(
    ({ square }: SquareHandlerArgs) => {
      setRightClickedSquares({});

      // If no piece is selected yet
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

      // Try to make a move
      const moveSuccessful = makeMove(moveFrom, square);

      if (!moveSuccessful) {
        // Check if clicking on another one of player's pieces
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
    },
    [game, moveFrom, playerColor, getMoveOptions, makeMove]
  );

  // Handler uses object destructuring as per react-chessboard's SquareHandlerArgs
  const onSquareRightClick = useCallback(
    ({ square }: SquareHandlerArgs) => {
      const color = "rgba(235, 97, 80, 0.8)";
      setRightClickedSquares((prev) => ({
        ...prev,
        [square]:
          prev[square]?.backgroundColor === color
            ? {}
            : { backgroundColor: color },
      }));
    },
    []
  );

  // Handler uses object destructuring as per react-chessboard's PieceHandlerArgs
  const onPieceClick = useCallback(
    ({ piece, square }: PieceHandlerArgs) => {
      if (square) {
        onSquareClick({ piece: { pieceType: piece.pieceType }, square });
      }
    },
    [onSquareClick]
  );

  // Handler uses object destructuring as per react-chessboard's PieceHandlerArgs
  const canDragPiece = useCallback(
    ({ piece }: PieceHandlerArgs): boolean => {
      // Only allow dragging the current player's pieces
      // pieceType is like "wP" for white pawn, "bK" for black king
      const pieceColor = piece.pieceType[0] as "w" | "b";
      const isPlayerPiece =
        (pieceColor === "w" && playerColor === "white") ||
        (pieceColor === "b" && playerColor === "black");
      
      // Only allow dragging if it's the player's turn
      const isPlayerTurn =
        (game.turn() === "w" && playerColor === "white") ||
        (game.turn() === "b" && playerColor === "black");
      
      return isPlayerPiece && isPlayerTurn;
    },
    [game, playerColor]
  );

  // Build custom square styles including last move highlight
  const customSquareStyles: Record<string, React.CSSProperties> = {};
  
  if (lastMove) {
    customSquareStyles[lastMove.from] = { background: "rgba(186, 202, 68, 0.4)" };
    customSquareStyles[lastMove.to] = { background: "rgba(186, 202, 68, 0.4)" };
  }

  // Merge all square styles
  const mergedSquareStyles = {
    ...customSquareStyles,
    ...optionSquares,
    ...rightClickedSquares,
  };

  return (
    <>
      <div className="w-full aspect-square max-w-[600px] mx-auto">
      <Chessboard
        options={{
          position: game.fen(),
          boardOrientation: playerColor,
          showNotation: true,
          allowDragging: true,
          allowDrawingArrows: true,
          animationDurationInMs: 200,
          darkSquareStyle: {
            backgroundColor: "#b58863",
          },
          lightSquareStyle: {
            backgroundColor: "#f0d9b5",
          },
          boardStyle: {
            borderRadius: "4px",
          },
          squareStyles: mergedSquareStyles,
          dropSquareStyle: {
            boxShadow: "inset 0 0 1px 4px rgba(186, 202, 68, 0.75)",
          },
          draggingPieceStyle: {
            transform: "scale(1.1)",
            cursor: "grabbing",
          },
          draggingPieceGhostStyle: {
            opacity: 0.5,
          },
          onPieceDrop,
          onSquareClick,
          onSquareRightClick,
          onPieceClick,
          canDragPiece,
          arrowOptions: {
            color: "rgba(186, 202, 68, 0.8)",
            secondaryColor: "rgba(255, 170, 0, 0.8)",
            tertiaryColor: "rgba(235, 97, 80, 0.8)",
            arrowLengthReducerDenominator: 8,
            sameTargetArrowLengthReducerDenominator: 4,
            arrowWidthDenominator: 5,
            activeArrowWidthMultiplier: 0.9,
            opacity: 0.65,
            activeOpacity: 0.5,
          },
        }}
      />
    </div>

      {/* Promotion Dialog */}
      {promotionState && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Choose a piece for promotion:
            </h3>
            <div className="flex gap-4">
              {["q", "r", "b", "n"].map((piece) => {
                const labels: { [key: string]: string } = {
                  q: "Queen",
                  r: "Rook",
                  b: "Bishop",
                  n: "Knight",
                };
                return (
                  <button
                    key={piece}
                    onClick={() => handlePromotion(piece)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
                  >
                    {labels[piece]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
