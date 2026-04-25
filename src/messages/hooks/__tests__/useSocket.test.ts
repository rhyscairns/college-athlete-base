/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';

// --- Mock socket.io-client ---
const mockSocket = {
    connected: false,
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
};

jest.mock('socket.io-client', () => ({
    io: jest.fn(() => mockSocket),
}));

import { io } from 'socket.io-client';
import { useSocket } from '../useSocket';

describe('useSocket', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSocket.connected = false;
    });

    it('returns socket and isConnected=false initially', () => {
        const { result } = renderHook(() => useSocket('conversation:coach1:player1'));

        expect(result.current.isConnected).toBe(false);
        expect(io).toHaveBeenCalledWith({ path: '/socket.io', autoConnect: true });
    });

    it('sets isConnected=true and emits join_room on connect event', () => {
        const { result } = renderHook(() => useSocket('conversation:coach1:player1'));

        // Grab the 'connect' handler registered via socket.on
        const connectCall = (mockSocket.on as jest.Mock).mock.calls.find(
            ([event]) => event === 'connect'
        );
        expect(connectCall).toBeDefined();
        const onConnect = connectCall![1];

        act(() => {
            onConnect();
        });

        expect(result.current.isConnected).toBe(true);
        expect(mockSocket.emit).toHaveBeenCalledWith('join_room', {
            room: 'conversation:coach1:player1',
        });
    });

    it('sets isConnected=false on disconnect event', () => {
        const { result } = renderHook(() => useSocket('conversation:coach1:player1'));

        // Trigger connect first
        const onConnect = (mockSocket.on as jest.Mock).mock.calls.find(
            ([e]) => e === 'connect'
        )![1];
        act(() => { onConnect(); });

        // Now trigger disconnect
        const onDisconnect = (mockSocket.on as jest.Mock).mock.calls.find(
            ([e]) => e === 'disconnect'
        )![1];
        act(() => { onDisconnect(); });

        expect(result.current.isConnected).toBe(false);
    });

    it('joins room immediately if socket is already connected', () => {
        mockSocket.connected = true;

        renderHook(() => useSocket('notifications:user1'));

        expect(mockSocket.emit).toHaveBeenCalledWith('join_room', {
            room: 'notifications:user1',
        });
    });

    it('disconnects and removes listeners on unmount', () => {
        const { unmount } = renderHook(() => useSocket('conversation:coach1:player1'));

        unmount();

        expect(mockSocket.off).toHaveBeenCalledWith('connect', expect.any(Function));
        expect(mockSocket.off).toHaveBeenCalledWith('disconnect', expect.any(Function));
        expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('reconnects when room prop changes', () => {
        const { rerender } = renderHook(({ room }) => useSocket(room), {
            initialProps: { room: 'conversation:coach1:player1' },
        });

        rerender({ room: 'conversation:coach1:player2' });

        // disconnect called for old room, new io() call for new room
        expect(mockSocket.disconnect).toHaveBeenCalled();
        expect(io).toHaveBeenCalledTimes(2);
    });
});
