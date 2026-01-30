'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess, Square } from 'chess.js'
import { Crown, UserCircle2, Clock, Copy, Check, LogOut, Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ChessBoardProps {
  gameId: string
  playerId: string
  playerColor: 'white' | 'black'
  websocketUrl: string
}

interface GameState {
  fen: string
  turn: 'w' | 'b'
  gameOver: boolean
  winner?: string
}

export default function ChessBoard({ 
  gameId, 
  playerId, 
  playerColor,
  websocketUrl 
}: ChessBoardProps) {
  const [game, setGame] = useState(new Chess())
  const [localFen, setLocalFen] = useState(game.fen())
  const [remoteFen, setRemoteFen] = useState(game.fen())
  const [moveFrom, setMoveFrom] = useState<Square | null>(null)
  const [rightClickedSquares, setRightClickedSquares] = useState<{ [key: string]: { backgroundColor: string } }>({})
  const [optionSquares, setOptionSquares] = useState<{ [key: string]: { background: string; borderRadius?: string } }>({})
  const [gameStatus, setGameStatus] = useState<string>('Waiting for opponent...')
  const [isConnected, setIsConnected] = useState(false)
  const [opponentConnected, setOpponentConnected] = useState(false)
  const [copied, setCopied] = useState(false)
  const [gameOverDialog, setGameOverDialog] = useState(false)
  const [gameResult, setGameResult] = useState<string>('')
  
  const wsRef = useRef<WebSocket | null>(null)
  const gameRef = useRef(game)
  const { toast } = useToast()

  useEffect(() => {
    gameRef.current = game
  }, [game])

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(websocketUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      ws.send(JSON.stringify({
        type: 'JOIN_GAME',
        payload: { gameId, playerId, playerColor }
      }))
      toast({
        title: "Connected",
        description: "Successfully connected to game server",
      })
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      handleWebSocketMessage(message)
    }

    ws.onerror = () => {
      setIsConnected(false)
      toast({
        title: "Connection Error",
        description: "Failed to connect to game server",
        variant: "destructive",
      })
    }

    ws.onclose = () => {
      setIsConnected(false)
      setGameStatus('Disconnected')
    }

    return () => {
      ws.close()
    }
  }, [gameId, playerId, playerColor, websocketUrl])

  useEffect(() => {
    if (remoteFen !== localFen) {
      const timer = setTimeout(() => {
        setLocalFen(remoteFen)
        const newGame = new Chess(remoteFen)
        setGame(newGame)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [remoteFen])

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'GAME_STATE':
        const gameState: GameState = message.payload
        setRemoteFen(gameState.fen)
        updateGameStatus(gameState)
        break
      
      case 'MOVE_MADE':
        setRemoteFen(message.payload.fen)
        toast({
          title: "Move played",
          description: `${message.payload.move.san}`,
        })
        break
      
      case 'PLAYER_JOINED':
        setOpponentConnected(true)
        setGameStatus('Game started!')
        toast({
          title: "Opponent joined!",
          description: "The game has begun",
        })
        break
      
      case 'PLAYER_LEFT':
        setOpponentConnected(false)
        setGameStatus('Opponent disconnected')
        toast({
          title: "Opponent left",
          description: "Your opponent has disconnected",
          variant: "destructive",
        })
        break
      
      case 'GAME_OVER':
        setGameStatus(`Game Over: ${message.payload.result}`)
        setGameResult(message.payload.result)
        setGameOverDialog(true)
        break
      
      case 'ERROR':
        toast({
          title: "Error",
          description: message.payload.message || "An error occurred",
          variant: "destructive",
        })
        break
    }
  }

  const updateGameStatus = (gameState: GameState) => {
    if (gameState.gameOver) {
      setGameStatus(`Game Over: ${gameState.winner || 'Draw'}`)
      setGameResult(gameState.winner || 'Draw')
      setGameOverDialog(true)
    } else {
      const isMyTurn = (gameState.turn === 'w' && playerColor === 'white') || 
                       (gameState.turn === 'b' && playerColor === 'black')
      setGameStatus(isMyTurn ? 'Your turn' : "Opponent's turn")
    }
  }

  const sendMove = (move: { from: string; to: string; promotion?: string }) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'MAKE_MOVE',
        payload: { gameId, playerId, move }
      }))
    }
  }

  const makeMove = useCallback((sourceSquare: Square, targetSquare: Square): boolean => {
    const gameCopy = new Chess(gameRef.current.fen())
    
    const isPlayerTurn = (gameCopy.turn() === 'w' && playerColor === 'white') || 
                         (gameCopy.turn() === 'b' && playerColor === 'black')
    
    if (!isPlayerTurn) {
      return false
    }

    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      })

      if (move) {
        setGame(gameCopy)
        setLocalFen(gameCopy.fen())
        sendMove({
          from: sourceSquare,
          to: targetSquare,
          promotion: move.promotion ? 'q' : undefined
        })
        
        setMoveFrom(null)
        setOptionSquares({})
        return true
      }
    } catch (error) {
      console.error('Invalid move:', error)
    }
    
    return false
  }, [playerColor])

  function onDrop(sourceSquare: Square, targetSquare: Square): boolean {
    return makeMove(sourceSquare, targetSquare)
  }

  function onSquareClick(square: Square) {
    setRightClickedSquares({})

    if (!moveFrom) {
      const piece = game.get(square)
      if (piece && 
          ((piece.color === 'w' && playerColor === 'white') || 
           (piece.color === 'b' && playerColor === 'black'))) {
        setMoveFrom(square)
        getMoveOptions(square)
      }
      return
    }

    const moveSuccessful = makeMove(moveFrom, square)
    
    if (!moveSuccessful) {
      const piece = game.get(square)
      if (piece && 
          ((piece.color === 'w' && playerColor === 'white') || 
           (piece.color === 'b' && playerColor === 'black'))) {
        setMoveFrom(square)
        getMoveOptions(square)
      } else {
        setMoveFrom(null)
        setOptionSquares({})
      }
    }
  }

  function getMoveOptions(square: Square) {
    const moves = game.moves({ square, verbose: true })

    if (moves.length === 0) {
      setOptionSquares({})
      return
    }

    const newSquares: { [key: string]: { background: string; borderRadius?: string } } = {}
    
    moves.forEach((move) => {
      newSquares[move.to] = {
        background: game.get(move.to) 
          ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
          : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%'
      }
    })
    
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    }
    
    setOptionSquares(newSquares)
  }

  function onSquareRightClick(square: Square) {
    const color = 'rgba(59, 130, 246, 0.5)'
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]: rightClickedSquares[square]?.backgroundColor === color
        ? { backgroundColor: 'transparent' }
        : { backgroundColor: color }
    })
  }

  const copyGameId = () => {
    navigator.clipboard.writeText(gameId)
    setCopied(true)
    toast({
      title: "Game ID copied!",
      description: "Share this with your opponent",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleResign = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'RESIGN',
        payload: { gameId, playerId }
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            <Crown className="inline-block w-10 h-10 mr-3 text-amber-400" />
            Multiplayer Chess
          </h1>
          <p className="text-slate-400">Real-time online chess battle</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
          {/* Left Panel - Player Info */}
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <UserCircle2 className="w-5 h-5" />
                You
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Playing as</span>
                <Badge variant={playerColor === 'white' ? 'default' : 'secondary'} className="capitalize">
                  {playerColor}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status</span>
                <Badge variant={isConnected ? 'default' : 'destructive'}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <p className="text-sm text-slate-400 mb-2">Game ID</p>
                <div className="flex gap-2">
                  <code className="flex-1 bg-slate-950 px-3 py-2 rounded text-xs text-amber-400 font-mono break-all">
                    {gameId}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyGameId}
                    className="shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleResign}
                disabled={!isConnected || !opponentConnected}
              >
                <Flag className="w-4 h-4 mr-2" />
                Resign
              </Button>
            </CardContent>
          </Card>

          {/* Center - Chess Board */}
          <div className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur p-4">
              <div className="mb-4 text-center">
                <Badge 
                  variant={gameStatus.includes('Your turn') ? 'default' : 'secondary'}
                  className="text-sm px-4 py-2"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {gameStatus}
                </Badge>
              </div>
              
              <div 
                className="w-full max-w-[600px] mx-auto rounded-lg overflow-hidden shadow-2xl"
                style={{
                  boxShadow: '0 0 80px rgba(168, 85, 247, 0.15)',
                }}
              >
                <Chessboard
                  position={localFen}
                  onPieceDrop={onDrop}
                  onSquareClick={onSquareClick}
                  onSquareRightClick={onSquareRightClick}
                  boardOrientation={playerColor}
                  customSquareStyles={{
                    ...optionSquares,
                    ...rightClickedSquares
                  }}
                  customBoardStyle={{
                    borderRadius: '0.5rem',
                  }}
                  customDarkSquareStyle={{ 
                    backgroundColor: '#7c3aed'
                  }}
                  customLightSquareStyle={{ 
                    backgroundColor: '#a78bfa'
                  }}
                  arePiecesDraggable={true}
                />
              </div>

              <div className="mt-4 text-center text-sm text-slate-400">
                <p>💡 <span className="text-slate-300">Tip:</span> Drag pieces or click to select, then click destination</p>
              </div>
            </Card>
          </div>

          {/* Right Panel - Opponent Info */}
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <UserCircle2 className="w-5 h-5" />
                Opponent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Playing as</span>
                <Badge 
                  variant={playerColor === 'white' ? 'secondary' : 'default'} 
                  className="capitalize"
                >
                  {playerColor === 'white' ? 'black' : 'white'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status</span>
                <Badge variant={opponentConnected ? 'default' : 'secondary'}>
                  {opponentConnected ? 'Connected' : 'Waiting...'}
                </Badge>
              </div>

              {!opponentConnected && (
                <div className="pt-4 border-t border-slate-800">
                  <div className="bg-amber-950/30 border border-amber-900/50 rounded-lg p-4">
                    <p className="text-amber-400 text-sm font-medium mb-2">
                      Waiting for opponent
                    </p>
                    <p className="text-amber-300/70 text-xs">
                      Share the Game ID with your friend to start playing
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Game Over Dialog */}
      <Dialog open={gameOverDialog} onOpenChange={setGameOverDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-400" />
              Game Over
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-lg pt-2">
              {gameResult}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Button
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              Return to Home
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Leave Game
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}