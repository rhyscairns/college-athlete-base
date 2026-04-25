/**
 * Unit tests for messages DB query module
 * @jest-environment node
 */

import * as dbClient from '@/authentication/db/client';
import {
    getConversationsForCoach,
    getConversationsForPlayer,
    getMessageThread,
    insertMessage,
    softDeleteMessage,
    markThreadAsRead,
    getUnreadCount,
    getUnreadNotifications,
} from '../messages';

jest.mock('@/authentication/db/client');
jest.mock('@/lib/logger');

const mockQuery = dbClient.query as jest.MockedFunction<typeof dbClient.query>;

const COACH_ID = 'coach-uuid-111';
const PLAYER_ID = 'player-uuid-222';
const MESSAGE_ID = 'message-uuid-333';

beforeEach(() => {
    jest.clearAllMocks();
});

// ─── getConversationsForCoach ────────────────────────────────────────────────

describe('getConversationsForCoach', () => {
    const mockRow = {
        player_id: PLAYER_ID,
        first_name: 'Alice',
        last_name: 'Smith',
        sport: 'Soccer',
        position: 'Forward',
        email: 'alice@example.com',
        last_message_at: '2024-01-01T12:00:00Z',
    };

    it('should return mapped Conversation array', async () => {
        mockQuery.mockResolvedValueOnce([mockRow]);

        const result = await getConversationsForCoach(COACH_ID);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            counterpartId: PLAYER_ID,
            firstName: 'Alice',
            lastName: 'Smith',
            sport: 'Soccer',
            position: 'Forward',
            email: 'alice@example.com',
            lastMessageAt: '2024-01-01T12:00:00Z',
        });
    });

    it('should return empty array when no conversations', async () => {
        mockQuery.mockResolvedValueOnce([]);

        const result = await getConversationsForCoach(COACH_ID);

        expect(result).toEqual([]);
    });

    it('should use DISTINCT ON player_id and join players', async () => {
        mockQuery.mockResolvedValueOnce([]);

        await getConversationsForCoach(COACH_ID);

        const sql = (mockQuery.mock.calls[0][0] as string).toLowerCase();
        expect(sql).toContain('distinct on (m.player_id)');
        expect(sql).toContain('join players');
        expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [COACH_ID]);
    });

    it('should handle null sport and position as undefined', async () => {
        mockQuery.mockResolvedValueOnce([{ ...mockRow, sport: null, position: null }]);

        const result = await getConversationsForCoach(COACH_ID);

        expect(result[0].sport).toBeUndefined();
        expect(result[0].position).toBeUndefined();
    });

    it('should propagate database errors', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        await expect(getConversationsForCoach(COACH_ID)).rejects.toThrow('DB error');
    });
});

// ─── getConversationsForPlayer ───────────────────────────────────────────────

describe('getConversationsForPlayer', () => {
    const mockRow = {
        coach_id: COACH_ID,
        first_name: 'Bob',
        last_name: 'Jones',
        university: 'State University',
        position: 'Head Coach',
        sport: 'Soccer',
        email: 'bob@university.edu',
        last_message_at: '2024-01-02T10:00:00Z',
    };

    it('should return mapped Conversation array', async () => {
        mockQuery.mockResolvedValueOnce([mockRow]);

        const result = await getConversationsForPlayer(PLAYER_ID);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            counterpartId: COACH_ID,
            firstName: 'Bob',
            lastName: 'Jones',
            university: 'State University',
            position: 'Head Coach',
            sport: 'Soccer',
            email: 'bob@university.edu',
            lastMessageAt: '2024-01-02T10:00:00Z',
        });
    });

    it('should return empty array when no conversations', async () => {
        mockQuery.mockResolvedValueOnce([]);

        const result = await getConversationsForPlayer(PLAYER_ID);

        expect(result).toEqual([]);
    });

    it('should use DISTINCT ON coach_id and join coaches', async () => {
        mockQuery.mockResolvedValueOnce([]);

        await getConversationsForPlayer(PLAYER_ID);

        const sql = (mockQuery.mock.calls[0][0] as string).toLowerCase();
        expect(sql).toContain('distinct on (m.coach_id)');
        expect(sql).toContain('join coaches');
        expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [PLAYER_ID]);
    });

    it('should handle null university as undefined', async () => {
        mockQuery.mockResolvedValueOnce([{ ...mockRow, university: null }]);

        const result = await getConversationsForPlayer(PLAYER_ID);

        expect(result[0].university).toBeUndefined();
    });

    it('should propagate database errors', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        await expect(getConversationsForPlayer(PLAYER_ID)).rejects.toThrow('DB error');
    });
});

// ─── getMessageThread ────────────────────────────────────────────────────────

describe('getMessageThread', () => {
    const mockRow = {
        id: MESSAGE_ID,
        coach_id: COACH_ID,
        player_id: PLAYER_ID,
        sender_type: 'coach' as const,
        sender_id: COACH_ID,
        content: 'Hello!',
        created_at: '2024-01-01T12:00:00Z',
        read_at: null,
        deleted_at: null,
    };

    it('should return mapped Message array ordered by created_at ASC', async () => {
        mockQuery.mockResolvedValueOnce([mockRow]);

        const result = await getMessageThread(COACH_ID, PLAYER_ID);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            id: MESSAGE_ID,
            coachId: COACH_ID,
            playerId: PLAYER_ID,
            senderType: 'coach',
            senderId: COACH_ID,
            content: 'Hello!',
            createdAt: '2024-01-01T12:00:00Z',
            readAt: null,
            deletedAt: null,
        });
    });

    it('should return empty array when no messages', async () => {
        mockQuery.mockResolvedValueOnce([]);

        const result = await getMessageThread(COACH_ID, PLAYER_ID);

        expect(result).toEqual([]);
    });

    it('should filter deleted messages and order ASC', async () => {
        mockQuery.mockResolvedValueOnce([]);

        await getMessageThread(COACH_ID, PLAYER_ID);

        const sql = (mockQuery.mock.calls[0][0] as string).toLowerCase();
        expect(sql).toContain('deleted_at is null');
        expect(sql).toContain('order by created_at asc');
        expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [COACH_ID, PLAYER_ID]);
    });

    it('should propagate database errors', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        await expect(getMessageThread(COACH_ID, PLAYER_ID)).rejects.toThrow('DB error');
    });
});

// ─── insertMessage ───────────────────────────────────────────────────────────

describe('insertMessage', () => {
    const mockRow = {
        id: MESSAGE_ID,
        coach_id: COACH_ID,
        player_id: PLAYER_ID,
        sender_type: 'coach' as const,
        sender_id: COACH_ID,
        content: 'Hello player!',
        created_at: '2024-01-01T12:00:00Z',
        read_at: null,
        deleted_at: null,
    };

    it('should insert and return the full Message row', async () => {
        mockQuery.mockResolvedValueOnce([mockRow]);

        const result = await insertMessage(COACH_ID, PLAYER_ID, 'coach', COACH_ID, 'Hello player!');

        expect(result).toEqual({
            id: MESSAGE_ID,
            coachId: COACH_ID,
            playerId: PLAYER_ID,
            senderType: 'coach',
            senderId: COACH_ID,
            content: 'Hello player!',
            createdAt: '2024-01-01T12:00:00Z',
            readAt: null,
            deletedAt: null,
        });
    });

    it('should call query with INSERT and RETURNING', async () => {
        mockQuery.mockResolvedValueOnce([mockRow]);

        await insertMessage(COACH_ID, PLAYER_ID, 'coach', COACH_ID, 'Hello player!');

        const sql = (mockQuery.mock.calls[0][0] as string).toLowerCase();
        expect(sql).toContain('insert into messages');
        expect(sql).toContain('returning');
        expect(mockQuery).toHaveBeenCalledWith(
            expect.any(String),
            [COACH_ID, PLAYER_ID, 'coach', COACH_ID, 'Hello player!']
        );
    });

    it('should propagate database errors', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        await expect(insertMessage(COACH_ID, PLAYER_ID, 'coach', COACH_ID, 'Hi')).rejects.toThrow('DB error');
    });
});

// ─── softDeleteMessage ───────────────────────────────────────────────────────

describe('softDeleteMessage', () => {
    it('should return true when message is soft-deleted', async () => {
        mockQuery.mockResolvedValueOnce([{ id: MESSAGE_ID }]);

        const result = await softDeleteMessage(MESSAGE_ID, COACH_ID);

        expect(result).toBe(true);
    });

    it('should return false when message not found or wrong owner', async () => {
        mockQuery.mockResolvedValueOnce([]);

        const result = await softDeleteMessage(MESSAGE_ID, 'wrong-user-id');

        expect(result).toBe(false);
    });

    it('should return false when message is already deleted', async () => {
        mockQuery.mockResolvedValueOnce([]);

        const result = await softDeleteMessage(MESSAGE_ID, COACH_ID);

        expect(result).toBe(false);
    });

    it('should set deleted_at and check sender_id', async () => {
        mockQuery.mockResolvedValueOnce([{ id: MESSAGE_ID }]);

        await softDeleteMessage(MESSAGE_ID, COACH_ID);

        const sql = (mockQuery.mock.calls[0][0] as string).toLowerCase();
        expect(sql).toContain('set deleted_at');
        expect(sql).toContain('sender_id = $2');
        expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [MESSAGE_ID, COACH_ID]);
    });

    it('should propagate database errors', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        await expect(softDeleteMessage(MESSAGE_ID, COACH_ID)).rejects.toThrow('DB error');
    });
});

// ─── markThreadAsRead ────────────────────────────────────────────────────────

describe('markThreadAsRead', () => {
    it('should call query with correct params for coach reader', async () => {
        mockQuery.mockResolvedValueOnce([]);

        await markThreadAsRead(COACH_ID, PLAYER_ID, 'coach');

        // Coach is reading, so messages sent by 'player' get marked read
        expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [COACH_ID, PLAYER_ID, 'player']);
    });

    it('should call query with correct params for player reader', async () => {
        mockQuery.mockResolvedValueOnce([]);

        await markThreadAsRead(COACH_ID, PLAYER_ID, 'player');

        // Player is reading, so messages sent by 'coach' get marked read
        expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [COACH_ID, PLAYER_ID, 'coach']);
    });

    it('should set read_at and filter unread non-deleted messages', async () => {
        mockQuery.mockResolvedValueOnce([]);

        await markThreadAsRead(COACH_ID, PLAYER_ID, 'coach');

        const sql = (mockQuery.mock.calls[0][0] as string).toLowerCase();
        expect(sql).toContain('set read_at');
        expect(sql).toContain('read_at is null');
        expect(sql).toContain('deleted_at is null');
    });

    it('should propagate database errors', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        await expect(markThreadAsRead(COACH_ID, PLAYER_ID, 'coach')).rejects.toThrow('DB error');
    });
});

// ─── getUnreadCount ──────────────────────────────────────────────────────────

describe('getUnreadCount', () => {
    it('should return parsed count for coach', async () => {
        mockQuery.mockResolvedValueOnce([{ count: '5' }]);

        const result = await getUnreadCount(COACH_ID, 'coach');

        expect(result).toBe(5);
    });

    it('should return parsed count for player', async () => {
        mockQuery.mockResolvedValueOnce([{ count: '3' }]);

        const result = await getUnreadCount(PLAYER_ID, 'player');

        expect(result).toBe(3);
    });

    it('should return 0 when no unread messages', async () => {
        mockQuery.mockResolvedValueOnce([{ count: '0' }]);

        const result = await getUnreadCount(COACH_ID, 'coach');

        expect(result).toBe(0);
    });

    it('should query messages sent by opposite role', async () => {
        mockQuery.mockResolvedValueOnce([{ count: '2' }]);

        await getUnreadCount(COACH_ID, 'coach');

        // Coach reads messages sent by players
        expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('coach_id'), [COACH_ID, 'player']);
    });

    it('should filter read_at IS NULL and deleted_at IS NULL', async () => {
        mockQuery.mockResolvedValueOnce([{ count: '0' }]);

        await getUnreadCount(COACH_ID, 'coach');

        const sql = (mockQuery.mock.calls[0][0] as string).toLowerCase();
        expect(sql).toContain('read_at is null');
        expect(sql).toContain('deleted_at is null');
    });

    it('should propagate database errors', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        await expect(getUnreadCount(COACH_ID, 'coach')).rejects.toThrow('DB error');
    });
});

// ─── getUnreadNotifications ──────────────────────────────────────────────────

describe('getUnreadNotifications', () => {
    const mockRow = {
        message_id: MESSAGE_ID,
        first_name: 'Alice',
        last_name: 'Smith',
        content: 'Hey coach, I wanted to follow up on my application to your program.',
        created_at: '2024-01-01T12:00:00Z',
        coach_id: COACH_ID,
        player_id: PLAYER_ID,
    };

    it('should return mapped NotificationItem array for coach', async () => {
        mockQuery.mockResolvedValueOnce([mockRow]);

        const result = await getUnreadNotifications(COACH_ID, 'coach');

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            messageId: MESSAGE_ID,
            senderName: 'Alice Smith',
            preview: 'Hey coach, I wanted to follow up on my application to your p',
            sentAt: '2024-01-01T12:00:00Z',
            coachId: COACH_ID,
            playerId: PLAYER_ID,
        });
    });

    it('should truncate preview to 60 characters', async () => {
        const longContent = 'A'.repeat(100);
        mockQuery.mockResolvedValueOnce([{ ...mockRow, content: longContent }]);

        const result = await getUnreadNotifications(COACH_ID, 'coach');

        expect(result[0].preview).toHaveLength(60);
    });

    it('should return empty array when no unread notifications', async () => {
        mockQuery.mockResolvedValueOnce([]);

        const result = await getUnreadNotifications(COACH_ID, 'coach');

        expect(result).toEqual([]);
    });

    it('should limit results to 5', async () => {
        mockQuery.mockResolvedValueOnce([]);

        await getUnreadNotifications(COACH_ID, 'coach');

        const sql = (mockQuery.mock.calls[0][0] as string).toLowerCase();
        expect(sql).toContain('limit 5');
    });

    it('should join players table for coach notifications', async () => {
        mockQuery.mockResolvedValueOnce([]);

        await getUnreadNotifications(COACH_ID, 'coach');

        const sql = (mockQuery.mock.calls[0][0] as string).toLowerCase();
        expect(sql).toContain('join players');
    });

    it('should join coaches table for player notifications', async () => {
        mockQuery.mockResolvedValueOnce([]);

        await getUnreadNotifications(PLAYER_ID, 'player');

        const sql = (mockQuery.mock.calls[0][0] as string).toLowerCase();
        expect(sql).toContain('join coaches');
    });

    it('should propagate database errors', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        await expect(getUnreadNotifications(COACH_ID, 'coach')).rejects.toThrow('DB error');
    });
});
