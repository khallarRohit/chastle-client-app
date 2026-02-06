import { MessageType, WebSocketConfig, WebSocketMessage } from "./ws-types"


type MessageHandler = (message: WebSocketMessage) => void
type ConnectionHandler = () => void
type ErrorHandler = (error: Error) => void


export class WebSocketService {
    private ws: WebSocket | null = null
    private config: WebSocketConfig
    
    private messageHandlers: Set<MessageHandler> = new Set()
    private connectionHandlers: Set<ConnectionHandler> = new Set()
    private disconnectionHandlers: Set<ConnectionHandler> = new Set()
    private errorHandlers: Set<ErrorHandler> = new Set()

    private reconnectAttempts = 0
    private maxReconnectAttempts: number
    private reconnectTimeout: NodeJS.Timeout | null = null
    private heartbeatInterval: NodeJS.Timeout | null = null
    private isIntentionalDisconnect = false

    constructor(config: WebSocketConfig) {
        this.config = config;
        this.maxReconnectAttempts = config.maxReconnectAttempts ?? 5;
    }

    public connect(): Promise<void>{
        return new Promise((resolve, reject) => {
            try{
                const wsUrl = new URL(this.config.url); 
                wsUrl.searchParams.set('gameId', this.config.gameId);
                
                this.ws = new WebSocket(wsUrl.toString());

                this.ws.onopen = () => {
                    console.log("Websocket connected to game: ", this.config.gameId);
                    this.reconnectAttempts = 0;
                    this.startHeartbeat();
                    this.notifyConnectionHandlers();
                    resolve();
                } 

                this.ws.onmessage = (event) => {
                    try{
                        const message: WebSocketMessage = JSON.parse(event.data.toString());
                        this.handleMessage(message);
                    }catch(error){
                        console.error('Failed to parse WebSocket message:', error);
                    }
                }

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error)
                    if(this.ws?.readyState !== WebSocket.OPEN) {
                        reject(new Error("WebSocket connection failed"));
                    }
                    this.notifyErrorHandlers(new Error('WebSocket connection error'));
                }

                this.ws.onclose = (event) => {
                    console.log('WebSocket disconnected:', event.code, event.reason)
                    this.stopHeartbeat()
                    this.notifyDisconnectionHandlers()

                    if (!this.isIntentionalDisconnect && this.config.reconnect !== false) {
                        this.attemptReconnect()
                    }
                }
            }catch(error){
                reject(error);
            }
        })
    }

    private handleMessage(message: WebSocketMessage): void {
        this.messageHandlers.forEach((handler) => {
            try {
                handler(message)
            } catch (error) {
                console.error('Error in message handler:', error)
            }
        })
    }
        
    public disconnect(): void {
        this.isIntentionalDisconnect = true;
        this.stopHeartbeat();
        
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }
    }

    public send(type: MessageType, payload: any): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not connected')
        return
        }

        const message: WebSocketMessage = {
            type,
            payload,
            timestamp: Date.now(),
        }

        this.ws.send(JSON.stringify(message))
    }

    private notifyConnectionHandlers(): void {
        this.connectionHandlers.forEach((handler) => handler())
    }

    private notifyDisconnectionHandlers(): void {
        this.disconnectionHandlers.forEach((handler) => handler())
    }

    private notifyErrorHandlers(error: Error): void {
        this.errorHandlers.forEach((handler) => handler(error))
    }

    public onMessage(handler: MessageHandler): () => void {
        this.messageHandlers.add(handler);
        return () => this.messageHandlers.delete(handler); 
    }

    public onConnect(handler: ConnectionHandler): () => void {
        this.connectionHandlers.add(handler);
        return () => this.connectionHandlers.delete(handler);
    }

    public onDisconnect(handler: ConnectionHandler): () => void {
        this.disconnectionHandlers.add(handler);
        return () => this.disconnectionHandlers.delete(handler);
    }

    public onError(handler: ErrorHandler): () => void {
        this.errorHandlers.add(handler)
        return () => this.errorHandlers.delete(handler)
    }

    private isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached')
            this.notifyErrorHandlers(new Error('Failed to reconnect'))
            return
        }

        this.reconnectAttempts++
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

        console.log(`Reconnecting in ${delay}ms`)

        this.reconnectTimeout = setTimeout(() => {
            console.log('Attempting to reconnect...');
            this.isIntentionalDisconnect = false
            this.connect().catch((error) => {
                console.error('Reconnection failed:', error);
            })
        }, delay)
    }

    private startHeartbeat(): void {
        this.stopHeartbeat()
        this.heartbeatInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'PING' }))
            }
        }, 30000) // Every 30 seconds
    }

    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
            this.heartbeatInterval = null
        }
    }
}