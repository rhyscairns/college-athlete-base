/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react';

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

// --- Mock fetch ---
global.fetch = jest.fn();

import { useUnreadCount } from '../useUnreadCount';
import type { NotificationItem } from '@/messages/types';

const mockNotification: NotificationItem = {
    messageId: 'msg-1',
    senderName: 'Coach Smith',
    preview: 'Hey, are you interested in our program?',
    sentAt: '2026-04-21T10:00:00Z',
    coachId: 'coach-1',
    playerId: 'player-1',
};

function mockFetchSuccess(count: number, notifications: NotificationItem[]) {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { count, notifications } }),
    });
}

function mockFetchFailure() {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
}

describe('useUnreadCount', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSocket.connected = false;
    });

    it('initialises with count=0 and empty notifications', () => {
        mockFetchSuccess(0, []);
        const { result } = renderHook(() => useUnreadCount('coach-1', 'coach'));

        expect(result.current.unreadCount).toBe(0);
        expect(result.current.notifications).toEqual([]);
    });

    it('fetches initial unread count and notifications on mount (coach)', async () => {
        mockFetchSuccess(3, [mockNotification]);

        const { result } = renderHook(() => useUnreadCount('coach-1', 'coach'));

        await waitFor(() => {
            expect(result.current.unreadCount).toBe(3);
        });

        expect(result.current.notifications).toEqual([mockNotification]);
        expect(global.fetch).toHaveBeenCalledWith('/api/coach/coach-1/messages/unread', { credentials: 'same-origin' });
    });

    it('fetches initial unread count and notifications on mount (player)', async () => {
        mockFetchSuccess(1, [mockNotification]);

        const { result } = renderHook(() => useUnreadCount('player-1', 'player'));

        await waitFor(() => {
            expect(result.current.unreadCount).toBe(1);
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/player/player-1/messages/unread', { credentials: 'same-origin' });
    });

    it('silently defaults to 0 when fetch fails', async () => {
        mockFetchFailure();

        const { result } = renderHook(() => useUnreadCount('coach-1', 'coach'));

        // Give it time to settle
        await act(async () => {
            await new Promise((r) => setTimeout(r, 50));
        });

        expect(result.current.unreadCount).toBe(0);
        expect(result.current.notifications).toEqual([]);
    });

    it('joins notification room on socket connect', () => {
        mockFetchSuccess(0, []);
        renderHook(() => useUnreadCount('coach-1', 'coach'));

        const onConnect = (mockSocket.on as jest.Mock).mock.calls.find(
            ([e]) => e === 'connect'
        )![1];

        act(() => { onConnect(); });

        expect(mockSocket.emit).toHaveBeenCalledWith('join_room', {
            room: 'notifications:coach-1',
        });
    });

    it('increments count and prepends notification on unread_update event', async () => {
        mockFetchSuccess(2, []);

        const { result } = renderHook(() => useUnreadCount('coach-1', 'coach'));

        await waitFor(() => expect(result.current.unreadCount).toBe(2));

        const onUnreadUpdate = (mockSocket.on as jest.Mock).mock.calls.find(
            ([e]) => e === 'unread_update'
        )![1];

        const newNotification: NotificationItem = {
            messageId: 'msg-2',
            senderName: 'Player Jones',
            preview: 'Thanks for reaching out!',
            sentAt: '2026-04-21T11:00:00Z',
            coachId: 'coach-1',
            playerId: 'player-2',
        };

        act(() => {
            onUnreadUpdate({ count: 3, notification: newNotification });
        });

        expect(result.current.unreadCount).toBe(3);
        expect(result.current.notifications[0]).toEqual(newNotification);
    });

    it('caps notifications list at 5 items on unread_update', async () => {
        const existing: NotificationItem[] = Array.from({ length: 5 }, (_, i) => ({
            messageId: `msg-${i}`,
            senderName: `Player ${i}`,
            preview: 'preview',
            sentAt: '2026-04-21T10:00:00Z',
            coachId: 'coach-1',
            playerId: `player-${i}`,
        }));

        mockFetchSuccess(5, existing);

        const { result } = renderHook(() => useUnreadCount('coach-1', 'coach'));
        await waitFor(() => expect(result.current.notifications).toHaveLength(5));

        const onUnreadUpdate = (mockSocket.on as jest.Mock).mock.calls.find(
            ([e]) => e === 'unread_update'
        )![1];

        const newNotification: NotificationItem = {
            messageId: 'msg-new',
            senderName: 'New Player',
            preview: 'new message',
            sentAt: '2026-04-21T12:00:00Z',
            coachId: 'coach-1',
            playerId: 'player-new',
        };

        act(() => {
            onUnreadUpdate({ count: 6, notification: newNotification });
        });

        expect(result.current.notifications).toHaveLength(5);
        expect(result.current.notifications[0]).toEqual(newNotification);
    });

    it('markThreadAsRead removes thread notifications and decrements count', async () => {
        const threadNotification: NotificationItem = {
            messageId: 'msg-thread',
            senderName: 'Coach Smith',
            preview: 'Hello',
            sentAt: '2026-04-21T10:00:00Z',
            coachId: 'coach-1',
            playerId: 'player-1',
        };

        mockFetchSuccess(1, [threadNotification]);
        // Mock the thread fetch triggered by markThreadAsRead
        (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });

        const { result } = renderHook(() => useUnreadCount('coach-1', 'coach'));
        await waitFor(() => expect(result.current.unreadCount).toBe(1));

        act(() => {
            result.current.markThreadAsRead('coach-1', 'player-1');
        });

        expect(result.current.unreadCount).toBe(0);
        expect(result.current.notifications).toHaveLength(0);
    });

    it('markThreadAsRead calls the correct thread endpoint for coach', async () => {
        mockFetchSuccess(0, []);
        (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });

        const { result } = renderHook(() => useUnreadCount('coach-1', 'coach'));

        act(() => {
            result.current.markThreadAsRead('coach-1', 'player-1');
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/coach/coach-1/messages/player-1');
    });

    it('markThreadAsRead calls the correct thread endpoint for player', async () => {
        mockFetchSuccess(0, []);
        (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });

        const { result } = renderHook(() => useUnreadCount('player-1', 'player'));

        act(() => {
            result.current.markThreadAsRead('coach-1', 'player-1');
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/player/player-1/messages/coach-1');
    });

    it('disconnects socket on unmount', () => {
        mockFetchSuccess(0, []);
        const { unmount } = renderHook(() => useUnreadCount('coach-1', 'coach'));

        unmount();

        expect(mockSocket.disconnect).toHaveBeenCalled();
        expect(mockSocket.off).toHaveBeenCalledWith('connect', expect.any(Function));
        expect(mockSocket.off).toHaveBeenCalledWith('unread_update', expect.any(Function));
    });
});
