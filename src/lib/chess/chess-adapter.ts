import { 
  ChessEngine, 
  Move as EngineMove, 
  Piece, PieceType, 
  Color, 
  Square,
  MoveResult
} from './chess-engine'

export class ChessAdapter {
  private engine: ChessEngine

  constructor(fen?: string) {
    this.engine = new ChessEngine(fen)
  }

  /**
   * Get current FEN string
   */
  fen(): string {
    return this.engine.toFEN()
  }

  /**
   * Load a position from FEN
   */
  load(fen: string): void {
    this.engine.loadFEN(fen)
  }

  /**
   * Get piece at square
   */
  get(square: string): { type: string; color: string } | null {
    const piece = this.engine.getPiece(square)
    if (!piece) return null

    return {
      type: piece.type.charAt(0), // 'pawn' -> 'p'
      color: piece.color.charAt(0) as 'w' | 'b', // 'white' -> 'w'
    }
  }

  /**
   * Get current turn
   */
  turn(): 'w' | 'b' {
    const turn = this.engine.getTurn();
    return turn === 'white' ? 'w' : 'b';
  }

  /**
   * Make a move
   */
  move(move: {
    from: Square,
    to: Square,
    promotion?: PieceType,
  }): MoveResult {
    const piece = this.engine.getPiece(move.from);
    const turn = this.engine.getTurn();
    if (!piece){
      return 'no_piece';
    }

    const moveSuccess = this.engine.makeMove({
      from: move.from,
      to: move.to,
      piece: piece.type,
      promotion: move.promotion
    });
    
    return moveSuccess;
  }

  /**
   * Get all legal moves
   * Returns in SAN notation (simplified)
   */
  moves(options?: { square?: string; verbose?: boolean }): any[] {
    const square = options?.square
    const verbose = options?.verbose || false

    const legalMoves = square 
      ? this.engine.getLegalMoves(square)
      : this.engine.getLegalMoves()

    if (verbose) {
      return legalMoves.map(move => ({
        from: move.from,
        to: move.to,
        piece: move.piece.charAt(0),
        captured: move.captured?.charAt(0),
        promotion: move.promotion?.charAt(0),
        san: this.moveToSAN(move),
      }))
    } else {
      return legalMoves.map(move => this.moveToSAN(move))
    }
  }

  /**
   * Check if in check
   */
  isCheck(): boolean {
    return this.engine.getGameState().isCheck
  }

  /**
   * Check if checkmate
   */
  isCheckmate(): boolean {
    return this.engine.getGameState().isCheckmate
  }

  /**
   * Check if stalemate
   */
  isStalemate(): boolean {
    return this.engine.getGameState().isStalemate
  }

  /**
   * Check if game is over
   */
  isGameOver(): boolean {
    const state = this.engine.getGameState()
    return state.isCheckmate || state.isStalemate
  }

  /**
   * Reset to initial position
   */
  reset(): void {
    this.engine.loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
  }

  /**
   * Undo last move (not implemented in base engine)
   */
  undo(): void {
    // Not implemented - would need move history
    console.warn('Undo not implemented in custom engine')
  }

  /**
   * Get board as 2D array
   */
  board(): any[][] {
    const state = this.engine.getGameState()
    return state.board.map((row, rank) =>
      row.map((piece, file) => {
        if (!piece) return null
        
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']
        
        return {
          square: files[file] + ranks[rank],
          type: piece.type.charAt(0),
          color: piece.color.charAt(0),
        }
      })
    )
  }

  // ==================== HELPER METHODS ====================

  private moveToSAN(move: EngineMove): string {
    // Simplified SAN notation
    let san = ''

    if (move.castle) {
      return move.castle === 'kingside' ? 'O-O' : 'O-O-O'
    }

    if (move.piece !== 'pawn') {
      san += move.piece.charAt(0).toUpperCase()
    }

    if (move.captured) {
      if (move.piece === 'pawn') {
        san += move.from.charAt(0)
      }
      san += 'x'
    }

    san += move.to

    if (move.promotion) {
      san += '=' + move.promotion.charAt(0).toUpperCase()
    }

    // Add check/checkmate notation
    const currentFen = this.engine.toFEN()
    if (this.engine.isCheckmate()) {
      san += '#'
    } else if (this.engine.isInCheck()) {
      san += '+'
    }

    return san
  }
}

// Export a factory function similar to chess.js
export function createChessGame(fen?: string): ChessAdapter {
  return new ChessAdapter(fen)
}
