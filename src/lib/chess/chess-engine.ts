/**
 * Custom Chess Engine
 * A simplified chess implementation for multiplayer chess applications
 */

export type Color = 'white' | 'black'
export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king'

export type Square = string // e.g., 'e4', 'a1'

export interface Piece {
  type: PieceType
  color: Color
}

export interface Move {
  from: Square
  to: Square
  piece: PieceType
  captured?: PieceType
  promotion?: PieceType
  castle?: 'kingside' | 'queenside'
  enPassant?: boolean
}

export type MoveResult = 
  | 'success' 
  | 'no_piece' 
  | 'no_turn' 
  | 'no_move' 
  | 'castle_not_found' 
  | 'wrong_castle'
  | 'promotion_not_found'
  | 'wrong_promotion' 


export interface GameState {
  board: (Piece | null)[][]
  turn: Color
  castlingRights: {
    white: { kingside: boolean; queenside: boolean }
    black: { kingside: boolean; queenside: boolean }
  }
  enPassantSquare: Square | null
  halfMoveClock: number
  fullMoveNumber: number
  isCheck: boolean
  isCheckmate: boolean
  isStalemate: boolean
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1']

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export class ChessEngine {
  private board: (Piece | null)[][] = []
  private turn: Color = 'white'
  private castlingRights = {
    white: { kingside: true, queenside: true },
    black: { kingside: true, queenside: true },
  }
  private enPassantSquare: Square | null = null
  private halfMoveClock = 0
  private fullMoveNumber = 1
  private moveHistory: Move[] = []

  constructor(fen: string = INITIAL_FEN) {
    this.loadFEN(fen)
  }

  /**
   * Load a position from FEN notation
   */
  loadFEN(fen: string): void {
    const parts = fen.split(' ')
    const position = parts[0]
    
    // Initialize empty board
    this.board = Array(8).fill(null).map(() => Array(8).fill(null))
    
    // Parse board position
    const ranks = position.split('/')
    for (let rank = 0; rank < 8; rank++) {
      let file = 0
      for (const char of ranks[rank]) {
        if (char >= '1' && char <= '8') {
          file += parseInt(char)
        } else {
          const color: Color = char === char.toUpperCase() ? 'white' : 'black'
          const type = this.charToPieceType(char.toLowerCase())
          this.board[rank][file] = { type, color }
          file++
        }
      }
    }

    // Parse turn
    this.turn = parts[1] === 'w' ? 'white' : 'black'

    // Parse castling rights
    const castling = parts[2]
    this.castlingRights = {
      white: {
        kingside: castling.includes('K'),
        queenside: castling.includes('Q'),
      },
      black: {
        kingside: castling.includes('k'),
        queenside: castling.includes('q'),
      },
    }

    // Parse en passant square
    this.enPassantSquare = parts[3] !== '-' ? parts[3] : null

    // Parse move counters
    this.halfMoveClock = parseInt(parts[4] || '0')
    this.fullMoveNumber = parseInt(parts[5] || '1')
  }

  /**
   * Export current position to FEN notation
   */
  toFEN(): string {
    let fen = ''

    // Board position
    for (let rank = 0; rank < 8; rank++) {
      let emptyCount = 0
      for (let file = 0; file < 8; file++) {
        const piece = this.board[rank][file]
        if (piece === null) {
          emptyCount++
        } else {
          if (emptyCount > 0) {
            fen += emptyCount
            emptyCount = 0
          }
          const char = this.pieceTypeToChar(piece.type)
          fen += piece.color === 'white' ? char.toUpperCase() : char
        }
      }
      if (emptyCount > 0) fen += emptyCount
      if (rank < 7) fen += '/'
    }

    // Turn
    fen += ' ' + (this.turn === 'white' ? 'w' : 'b')

    // Castling rights
    let castling = ''
    if (this.castlingRights.white.kingside) castling += 'K'
    if (this.castlingRights.white.queenside) castling += 'Q'
    if (this.castlingRights.black.kingside) castling += 'k'
    if (this.castlingRights.black.queenside) castling += 'q'
    fen += ' ' + (castling || '-')

    // En passant
    fen += ' ' + (this.enPassantSquare || '-')

    // Move counters
    fen += ` ${this.halfMoveClock} ${this.fullMoveNumber}`

    return fen
  }

  getTurn(): Color {
    return this.turn;
  }

  /**
   * Get piece at a square
   */
  getPiece(square: Square): Piece | null {
    const [file, rank] = this.squareToCoords(square)
    return this.board[rank][file]
  }

  /**
   * Get all legal moves for current position
   */
  getLegalMoves(fromSquare?: Square): Move[] {
    const moves: Move[] = []
    
    if (fromSquare) {
      const [file, rank] = this.squareToCoords(fromSquare)
      const piece = this.board[rank][file]
      
      if (piece && piece.color === this.turn) {
        return this.getPieceMoves(rank, file, piece)
      }
      return []
    }

    // Get all moves for current player
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = this.board[rank][file]
        if (piece && piece.color === this.turn) {
          moves.push(...this.getPieceMoves(rank, file, piece))
        }
      }
    }

    return moves
  }


  /**
   * Make a move
   */
  makeMove(move: Move): MoveResult {
    const [fromFile, fromRank] = this.squareToCoords(move.from)
    const [toFile, toRank] = this.squareToCoords(move.to)
    
    const piece = this.board[fromRank][fromFile]
    if(!piece){
      return 'no_piece';
    }

    if(piece.color !== this.turn){
      return 'no_turn';
    }

    // Validate move is legal
    const legalMoves = this.getLegalMoves(move.from)
    const possibleMoves = legalMoves.filter(
      (thisMove) => thisMove.from === move.from && thisMove.to === move.to
    );
    
    if (!possibleMoves.length) {
      return 'no_move';
    }

    // Execute move
    this.board[toRank][toFile] = piece
    this.board[fromRank][fromFile] = null

    // Handle special moves
    const isCastlePossible = possibleMoves.length === 1 && possibleMoves.every(
      (thisMove) => thisMove.castle
    );

    if(isCastlePossible){
      if(!move.castle){
        return 'castle_not_found';
      }
      if(move.castle !== possibleMoves[0].castle){
        return 'wrong_castle';
      }
      this.executeCastle(move.castle);
    }

    // if (possibleMove.enPassant) {
    //   const captureRank = this.turn === 'white' ? toRank + 1 : toRank - 1
    //   this.board[captureRank][toFile] = null
    // }

    const isPromotionPossible = possibleMoves.every(
      (thisMove) => thisMove.promotion
    )

    if(isPromotionPossible){
      if(!move.promotion){
        return 'promotion_not_found';
      }
      const isValidPromotion = possibleMoves.some(
        (thisMove) => thisMove.promotion === move.promotion
      )
      if(isValidPromotion){
        this.board[toRank][toFile] = { type: move.promotion, color: this.turn }
      }else{
        return 'wrong_promotion';
      }
    }

    // Update castling rights
    this.updateCastlingRights(move)

    // Update en passant square
    // this.updateEnPassant(move, piece)

    // Update move counters
    if (piece.type === 'pawn' || move.captured) {
      this.halfMoveClock = 0
    } else {
      this.halfMoveClock++
    }

    if (this.turn === 'black') {
      this.fullMoveNumber++
    }

    // Switch turn
    this.turn = this.turn === 'white' ? 'black' : 'white'

    // Add to history
    this.moveHistory.push(move)
    return 'success';
  }

  /**
   * Check if current player is in check
   */
  isInCheck(): boolean {
    const kingSquare = this.findKing(this.turn)
    if (!kingSquare) return false

    return this.isSquareAttacked(kingSquare, this.turn === 'white' ? 'black' : 'white')
  }

  /**
   * Check if current position is checkmate
   */
  isCheckmate(): boolean {
    return this.isInCheck() && this.getLegalMoves().length === 0
  }

  /**
   * Check if current position is stalemate
   */
  isStalemate(): boolean {
    return !this.isInCheck() && this.getLegalMoves().length === 0
  }

  /**
   * Get current game state
   */
  getGameState(): GameState {
    return {
      board: this.board.map(row => [...row]),
      turn: this.turn,
      castlingRights: JSON.parse(JSON.stringify(this.castlingRights)),
      enPassantSquare: this.enPassantSquare,
      halfMoveClock: this.halfMoveClock,
      fullMoveNumber: this.fullMoveNumber,
      isCheck: this.isInCheck(),
      isCheckmate: this.isCheckmate(),
      isStalemate: this.isStalemate(),
    }
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private getPieceMoves(rank: number, file: number, piece: Piece): Move[] {
    const moves: Move[] = []
    const fromSquare = this.coordsToSquare(file, rank)

    switch (piece.type) {
      case 'pawn':
        moves.push(...this.getPawnMoves(rank, file, piece.color))
        break
      case 'knight':
        moves.push(...this.getKnightMoves(rank, file, piece.color))
        break
      case 'bishop':
        moves.push(...this.getBishopMoves(rank, file, piece.color))
        break
      case 'rook':
        moves.push(...this.getRookMoves(rank, file, piece.color))
        break
      case 'queen':
        moves.push(...this.getQueenMoves(rank, file, piece.color))
        break
      case 'king':
        moves.push(...this.getKingMoves(rank, file, piece.color))
        break
    }

    // Filter out moves that leave king in check
    return moves.filter(move => !this.wouldBeInCheck(move))
  }

  private getPawnMoves(rank: number, file: number, color: Color): Move[] {
    const moves: Move[] = []
    const direction = color === 'white' ? -1 : 1
    const startRank = color === 'white' ? 6 : 1
    const fromSquare = this.coordsToSquare(file, rank)

    // Forward move
    const newRank = rank + direction
    if (this.isInBounds(newRank, file) && !this.board[newRank][file]) {
      const toSquare = this.coordsToSquare(file, newRank)
      
      // Promotion
      if (newRank === 0 || newRank === 7) {
        for (const promotion of ['queen', 'rook', 'bishop', 'knight'] as PieceType[]) {
          moves.push({ from: fromSquare, to: toSquare, piece: 'pawn', promotion })
        }
      } else {
        moves.push({ from: fromSquare, to: toSquare, piece: 'pawn' })
      }

      // Double move from start
      if (rank === startRank && !this.board[rank + 2 * direction][file]) {
        const doubleSquare = this.coordsToSquare(file, rank + 2 * direction)
        moves.push({ from: fromSquare, to: doubleSquare, piece: 'pawn' })
      }
    }

    // Captures
    for (const fileOffset of [-1, 1]) {
      const newFile = file + fileOffset
      if (this.isInBounds(newRank, newFile)) {
        const target = this.board[newRank][newFile]
        const toSquare = this.coordsToSquare(newFile, newRank)

        if (target && target.color !== color) {
          if (newRank === 0 || newRank === 7) {
            for (const promotion of ['queen', 'rook', 'bishop', 'knight'] as PieceType[]) {
              moves.push({ 
                from: fromSquare, 
                to: toSquare, 
                piece: 'pawn', 
                captured: target.type,
                promotion 
              })
            }
          } else {
            moves.push({ 
              from: fromSquare, 
              to: toSquare, 
              piece: 'pawn', 
              captured: target.type 
            })
          }
        }

        // En passant
        if (this.enPassantSquare === toSquare) {
          moves.push({ 
            from: fromSquare, 
            to: toSquare, 
            piece: 'pawn', 
            captured: 'pawn',
            enPassant: true 
          })
        }
      }
    }

    return moves
  }

  private getKnightMoves(rank: number, file: number, color: Color): Move[] {
    const moves: Move[] = []
    const offsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ]
    const fromSquare = this.coordsToSquare(file, rank)

    for (const [rankOffset, fileOffset] of offsets) {
      const newRank = rank + rankOffset
      const newFile = file + fileOffset

      if (this.isInBounds(newRank, newFile)) {
        const target = this.board[newRank][newFile]
        const toSquare = this.coordsToSquare(newFile, newRank)

        if (!target) {
          moves.push({ from: fromSquare, to: toSquare, piece: 'knight' })
        } else if (target.color !== color) {
          moves.push({ 
            from: fromSquare, 
            to: toSquare, 
            piece: 'knight', 
            captured: target.type 
          })
        }
      }
    }

    return moves
  }

  private getBishopMoves(rank: number, file: number, color: Color): Move[] {
    return this.getSlidingMoves(rank, file, color, 'bishop', [
      [-1, -1], [-1, 1], [1, -1], [1, 1]
    ])
  }

  private getRookMoves(rank: number, file: number, color: Color): Move[] {
    return this.getSlidingMoves(rank, file, color, 'rook', [
      [-1, 0], [1, 0], [0, -1], [0, 1]
    ])
  }

  private getQueenMoves(rank: number, file: number, color: Color): Move[] {
    return this.getSlidingMoves(rank, file, color, 'queen', [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ])
  }

  private getKingMoves(rank: number, file: number, color: Color): Move[] {
    const moves: Move[] = []
    const fromSquare = this.coordsToSquare(file, rank)

    // Normal moves
    for (let rankOffset = -1; rankOffset <= 1; rankOffset++) {
      for (let fileOffset = -1; fileOffset <= 1; fileOffset++) {
        if (rankOffset === 0 && fileOffset === 0) continue

        const newRank = rank + rankOffset
        const newFile = file + fileOffset

        if (this.isInBounds(newRank, newFile)) {
          const target = this.board[newRank][newFile]
          const toSquare = this.coordsToSquare(newFile, newRank)

          if (!target) {
            moves.push({ from: fromSquare, to: toSquare, piece: 'king' })
          } else if (target.color !== color) {
            moves.push({ 
              from: fromSquare, 
              to: toSquare, 
              piece: 'king', 
              captured: target.type 
            })
          }
        }
      }
    }

    // Castling
    if (!this.isInCheck()) {
      moves.push(...this.getCastlingMoves(rank, file, color))
    }

    return moves
  }

  private getSlidingMoves(
    rank: number, 
    file: number, 
    color: Color, 
    piece: PieceType,
    directions: number[][]
  ): Move[] {
    const moves: Move[] = []
    const fromSquare = this.coordsToSquare(file, rank)

    for (const [rankDir, fileDir] of directions) {
      let newRank = rank + rankDir
      let newFile = file + fileDir

      while (this.isInBounds(newRank, newFile)) {
        const target = this.board[newRank][newFile]
        const toSquare = this.coordsToSquare(newFile, newRank)

        if (!target) {
          moves.push({ from: fromSquare, to: toSquare, piece })
        } else {
          if (target.color !== color) {
            moves.push({ 
              from: fromSquare, 
              to: toSquare, 
              piece, 
              captured: target.type 
            })
          }
          break
        }

        newRank += rankDir
        newFile += fileDir
      }
    }

    return moves
  }

  private getCastlingMoves(rank: number, file: number, color: Color): Move[] {
    const moves: Move[] = []
    const rights = this.castlingRights[color]
    const fromSquare = this.coordsToSquare(file, rank)

    // Kingside
    if (rights.kingside) {
      if (!this.board[rank][5] && !this.board[rank][6]) {
        if (!this.isSquareAttacked(this.coordsToSquare(5, rank), color === 'white' ? 'black' : 'white') &&
            !this.isSquareAttacked(this.coordsToSquare(6, rank), color === 'white' ? 'black' : 'white')) {
          moves.push({ 
            from: fromSquare, 
            to: this.coordsToSquare(6, rank), 
            piece: 'king',
            castle: 'kingside'
          })
        }
      }
    }

    // Queenside
    if (rights.queenside) {
      if (!this.board[rank][3] && !this.board[rank][2] && !this.board[rank][1]) {
        if (!this.isSquareAttacked(this.coordsToSquare(3, rank), color === 'white' ? 'black' : 'white') &&
            !this.isSquareAttacked(this.coordsToSquare(2, rank), color === 'white' ? 'black' : 'white')) {
          moves.push({ 
            from: fromSquare, 
            to: this.coordsToSquare(2, rank), 
            piece: 'king',
            castle: 'queenside'
          })
        }
      }
    }

    return moves
  }

  private isSquareAttacked(square: Square, byColor: Color): boolean {
    const [file, rank] = this.squareToCoords(square)

    // Check all opponent pieces
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = this.board[r][f]
        if (piece && piece.color === byColor) {
          const attacks = this.getPieceAttacks(r, f, piece)
          if (attacks.includes(square)) {
            return true
          }
        }
      }
    }

    return false
  }

  private getPieceAttacks(rank: number, file: number, piece: Piece): Square[] {
    // Simplified: just get target squares without validation
    const attacks: Square[] = []

    switch (piece.type) {
      case 'pawn': {
        const direction = piece.color === 'white' ? -1 : 1
        for (const fileOffset of [-1, 1]) {
          const newRank = rank + direction
          const newFile = file + fileOffset
          if (this.isInBounds(newRank, newFile)) {
            attacks.push(this.coordsToSquare(newFile, newRank))
          }
        }
        break
      }
      case 'knight': {
        const offsets = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ]
        for (const [r, f] of offsets) {
          if (this.isInBounds(rank + r, file + f)) {
            attacks.push(this.coordsToSquare(file + f, rank + r))
          }
        }
        break
      }
      case 'king': {
        for (let r = -1; r <= 1; r++) {
          for (let f = -1; f <= 1; f++) {
            if (r === 0 && f === 0) continue
            if (this.isInBounds(rank + r, file + f)) {
              attacks.push(this.coordsToSquare(file + f, rank + r))
            }
          }
        }
        break
      }
      default: {
        // Sliding pieces
        const directions = piece.type === 'bishop' 
          ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
          : piece.type === 'rook'
          ? [[-1, 0], [1, 0], [0, -1], [0, 1]]
          : [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]

        for (const [rankDir, fileDir] of directions) {
          let r = rank + rankDir
          let f = file + fileDir
          while (this.isInBounds(r, f)) {
            attacks.push(this.coordsToSquare(f, r))
            if (this.board[r][f]) break
            r += rankDir
            f += fileDir
          }
        }
      }
    }

    return attacks
  }

  private wouldBeInCheck(move: Move): boolean {
    // Temporarily make the move
    const [fromFile, fromRank] = this.squareToCoords(move.from)
    const [toFile, toRank] = this.squareToCoords(move.to)
    
    const movedPiece = this.board[fromRank][fromFile]
    const capturedPiece = this.board[toRank][toFile]
    
    this.board[toRank][toFile] = movedPiece
    this.board[fromRank][fromFile] = null

    const kingSquare = movedPiece?.type === 'king' 
      ? move.to 
      : this.findKing(this.turn)
    
    const inCheck = kingSquare 
      ? this.isSquareAttacked(kingSquare, this.turn === 'white' ? 'black' : 'white')
      : true

    // Undo the move
    this.board[fromRank][fromFile] = movedPiece
    this.board[toRank][toFile] = capturedPiece

    return inCheck
  }

  private findKing(color: Color): Square | null {
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = this.board[rank][file]
        if (piece?.type === 'king' && piece.color === color) {
          return this.coordsToSquare(file, rank)
        }
      }
    }
    return null
  }

  private executeCastle(side: 'kingside' | 'queenside'): void {
    const rank = this.turn === 'white' ? 7 : 0
    
    if (side === 'kingside') {
      const rook = this.board[rank][7]
      this.board[rank][7] = null
      this.board[rank][5] = rook
    } else {
      const rook = this.board[rank][0]
      this.board[rank][0] = null
      this.board[rank][3] = rook
    }
  }

  private updateCastlingRights(move: Move): void {
    const piece = this.getPiece(move.to)
    if (!piece) return

    if (piece.type === 'king') {
      this.castlingRights[piece.color].kingside = false
      this.castlingRights[piece.color].queenside = false
    }

    if (piece.type === 'rook') {
      const [file, rank] = this.squareToCoords(move.from)
      if (piece.color === 'white' && rank === 7) {
        if (file === 0) this.castlingRights.white.queenside = false
        if (file === 7) this.castlingRights.white.kingside = false
      }
      if (piece.color === 'black' && rank === 0) {
        if (file === 0) this.castlingRights.black.queenside = false
        if (file === 7) this.castlingRights.black.kingside = false
      }
    }
  }

  private updateEnPassant(move: Move, piece: Piece): void {
    if (piece.type === 'pawn') {
      const [fromFile, fromRank] = this.squareToCoords(move.from)
      const [toFile, toRank] = this.squareToCoords(move.to)
      
      if (Math.abs(toRank - fromRank) === 2) {
        const epRank = piece.color === 'white' ? toRank + 1 : toRank - 1
        this.enPassantSquare = this.coordsToSquare(toFile, epRank)
        return
      }
    }
    this.enPassantSquare = null
  }

  private squareToCoords(square: Square): [number, number] {
    const file = FILES.indexOf(square[0])
    const rank = RANKS.indexOf(square[1])
    return [file, rank]
  }

  private coordsToSquare(file: number, rank: number): Square {
    return FILES[file] + RANKS[rank]
  }

  private isInBounds(rank: number, file: number): boolean {
    return rank >= 0 && rank < 8 && file >= 0 && file < 8
  }

  private charToPieceType(char: string): PieceType {
    const map: Record<string, PieceType> = {
      p: 'pawn', n: 'knight', b: 'bishop',
      r: 'rook', q: 'queen', k: 'king'
    }
    return map[char]
  }

  private pieceTypeToChar(type: PieceType): string {
    const map: Record<PieceType, string> = {
      pawn: 'p', knight: 'n', bishop: 'b',
      rook: 'r', queen: 'q', king: 'k'
    }
    return map[type]
  }
}
