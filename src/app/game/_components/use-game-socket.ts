import { useEffect, useRef, useState } from 'react';
import { WebSocketService } from '@/lib/ws/web-socket-service';
import { WebSocketConfig, WebSocketMessage } from '@/lib/ws/ws-types';


// export interface WebSocketConfig {
//   url: string
//   gameId: string
//   reconnect?: boolean
//   maxReconnectAttempts?: number
// }
export function useGameSocket(config: WebSocketConfig){
    const socketRef = useRef<WebSocketService | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

    useEffect(() => {
        const socket = new WebSocketService(config);
        socketRef.current = socket;

        const cleanupConnect = socket.onConnect(() => setIsConnected(true));
        const cleanupDisconnect = socket.onDisconnect(() => setIsConnected(false));
        const cleanupMessage = socket.onMessage((msg) => setLastMessage(msg));

        socket.connect();

        return () => {
            cleanupConnect();
            cleanupDisconnect();
            cleanupMessage();
            socket.disconnect();
        };
    }, [config]);

    return { 
        isConnected, 
        lastMessage, 
        sendMessage: (type: any, payload: any) => socketRef.current?.send(type, payload)
    };

}