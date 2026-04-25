'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * Hook that manages a Socket.IO connection for a given room.
 * Joins the room on connect and leaves on cleanup.
 * Reconnection is handled automatically by socket.io-client.
 */
export function useSocket(room: string): { socket: Socket | null; isConnected: boolean } {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socket = io({ path: '/socket.io', autoConnect: true });
        socketRef.current = socket;

        const onConnect = () => {
            setIsConnected(true);
            socket.emit('join_room', { room });
        };

        const onDisconnect = () => {
            setIsConnected(false);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        // If already connected when effect runs, join immediately
        if (socket.connected) {
            setIsConnected(true);
            socket.emit('join_room', { room });
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [room]);

    return { socket: socketRef.current, isConnected };
}
