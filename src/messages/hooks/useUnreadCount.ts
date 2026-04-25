'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { NotificationItem } from '@/messages/types';

interface UnreadCountState {
    unreadCount: number;
    notifications: NotificationItem[];
    markThreadAsRead: (coachId: string, playerId: string) => void;
}

/**
 * Hook that manages unread message count and notification items.
 * - Fetches initial state from the unread API on mount.
 * - Listens for `unread_update` Socket.IO events to update in real time.
 * - Exposes `markThreadAsRead` which hits the GET thread endpoint (triggering
 *   the DB read-tracking) and decrements the local count.
 */
export function useUnreadCount(userId: string, userType: 'coach' | 'player'): UnreadCountState {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const socketRef = useRef<Socket | null>(null);

    // Build the correct API base path for this user type
    const apiBase = userType === 'coach'
        ? `/api/coach/${userId}/messages`
        : `/api/player/${userId}/messages`;

    // Fetch initial unread count + notifications
    useEffect(() => {
        if (!userId) return;

        fetch(`${apiBase}/unread`, { credentials: 'same-origin' })
            .then((res) => res.json())
            .then((json) => {
                if (json?.success && json.data) {
                    setUnreadCount(json.data.count ?? 0);
                    setNotifications(json.data.notifications ?? []);
                }
            })
            .catch(() => {
                // Non-critical — silently default to 0
            });
    }, [userId, apiBase]);

    // Subscribe to real-time unread_update events via the notification room
    useEffect(() => {
        if (!userId) return;

        const notificationRoom = `notifications:${userId}`;
        const socket = io({ path: '/socket.io', autoConnect: true });
        socketRef.current = socket;

        const onConnect = () => {
            socket.emit('join_room', { room: notificationRoom });
        };

        const onUnreadUpdate = ({ count, notification }: { count: number; notification: NotificationItem }) => {
            setUnreadCount(count);
            setNotifications((prev) => [notification, ...prev].slice(0, 5));
        };

        socket.on('connect', onConnect);
        socket.on('unread_update', onUnreadUpdate);

        if (socket.connected) {
            socket.emit('join_room', { room: notificationRoom });
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('unread_update', onUnreadUpdate);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [userId]);

    // Calling the GET thread endpoint triggers markThreadAsRead in the DB.
    // We then decrement the local count by the number of notifications from that thread.
    const markThreadAsRead = useCallback(
        (coachId: string, playerId: string) => {
            const threadPath = userType === 'coach'
                ? `/api/coach/${coachId}/messages/${playerId}`
                : `/api/player/${playerId}/messages/${coachId}`;

            fetch(threadPath).catch(() => {
                // Best-effort — ignore failures
            });

            // Remove notifications belonging to this thread and adjust count
            setNotifications((prev) => {
                const removed = prev.filter(
                    (n) => n.coachId === coachId && n.playerId === playerId
                );
                setUnreadCount((c) => Math.max(0, c - removed.length));
                return prev.filter(
                    (n) => !(n.coachId === coachId && n.playerId === playerId)
                );
            });
        },
        [userType]
    );

    return { unreadCount, notifications, markThreadAsRead };
}
