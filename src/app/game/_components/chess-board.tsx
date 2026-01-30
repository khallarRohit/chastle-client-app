"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard, PieceDropHandlerArgs } from "react-chessboard";
import { Card, CardContent } from "@/components/ui/card";


export default function ChessBoard() {
    const chessGameRef = useRef(new Chess());
    const chessGame = chessGameRef.current;

    const [chessPosition, setChessPosition] = useState(chessGame.fen());
    function makeRandomMove() {
      // get all possible moves`
      const possibleMoves = chessGame.moves();

      // exit if the game is over
      if (chessGame.isGameOver()) {
        return;
      }

      // pick a random move
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

      // make the move
      chessGame.move(randomMove);

      // update the position state
      setChessPosition(chessGame.fen());
    }

    function onPieceDrop({
      sourceSquare,
      targetSquare
    }: PieceDropHandlerArgs) {
      // type narrow targetSquare potentially being null (e.g. if dropped off board)
      if (!targetSquare) {
        return false;
      }

      // try to make the move according to chess.js logic
      try {
        chessGame.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: 'q' // always promote to a queen for example simplicity
        });

        // update the position state upon successful move to trigger a re-render of the chessboard
        setChessPosition(chessGame.fen());

        // make random cpu move after a short delay
        setTimeout(makeRandomMove, 500);

        // return true as the move was successful
        return true;
      } catch {
        // return false as the move was not successful
        return false;
      }
    }
    const chessboardOptions = {
      position: chessPosition,
      onPieceDrop,
      id: 'play-vs-random'
    };

    // render the chessboard
    return <Chessboard options={chessboardOptions} />;



}