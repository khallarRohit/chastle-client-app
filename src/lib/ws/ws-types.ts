export type MessageType =
    | 'AUTHENTICATE'
    | 'GAME_STATE'
    | 'MOVE'
    | 'MOVE_MADE'
    | 'PLAYER_JOINED'
    | 'PLAYER_LEFT'
    | 'CHAT_MESSAGE'
    | 'DRAW_OFFER'
    | 'DRAW_RESPONSE'
    | 'RESIGN'
    | 'GAME_OVER'
    | 'TIME_UPDATE'
    | 'PING'
    | 'PONG'
    | 'ERROR'


export interface WebSocketMessage {
  type: MessageType
  payload: any
  timestamp?: number
}

export interface WebSocketConfig {
  url: string
  gameId: string
  reconnect?: boolean
  maxReconnectAttempts?: number
}