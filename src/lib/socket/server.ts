import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

/**
 * Returns the shared Socket.IO server instance.
 * Returns null if called before the server has been initialized
 * (e.g. during Next.js build or in test environments).
 */
export function getSocketServer(): SocketIOServer | null {
    return io;
}

/**
 * Initializes the Socket.IO server singleton.
 * Called once from the custom HTTP server at startup.
 */
export function initSocketServer(socketServer: SocketIOServer): void {
    io = socketServer;
}
