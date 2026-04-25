/**
 * @jest-environment node
 *
 * Integration tests for messaging API endpoints
 *
 * Requirements covered: 2.4, 2.5, 2.6, 3.5, 4.4, 4.5, 5.5
 */

import { NextRequest } from 'next/server';
import { GET as coachGetConversations } from '@/app/api/coach/[coachId]/messages/route';
import { GET as coachGetThread, POST as coachPostMessage } from '@/app/api/coach/[coachId]/messages/[playerId]/route';
import { DELETE as coachDeleteMessage } from '@/app/api/coach/[coachId]/messages/[playerId]/[messageId]/route';
import { GET as coachGetUnread } from '@/app/api/coach/[coachId]/messages/unread/route';
import { GET as playerGetConversations } from '@/app/api/player/[playerId]/messages/route';
import { GET as playerGetThread, POST as playerPostMessage } from '@/app/api/player/[playerId]/messages/[coachId]/route';
import { DELETE as playerDeleteMessage } from '@/app/api/player/[playerId]/messages/[coachId]/[messageId]/route';
import { GET as playerGetUnread } from '@/app/api/player/[playerId]/messages/unread/route';
import {
    getConversationsForCoach,
    getConversationsForPlayer,
    getMessageThread,
    insertMessage,
    softDeleteMessage,
    getUnreadCount,
    getUnreadNotifications,
    markThreadAsRead,
} from '@/lib/db/queries/messages';
import { validateSession } from '@/authentication/middleware/session';

jest.mock('@/lib/db/queries/messages');
jest.mock('@/authentication/middleware/session');
jest.mock('@/lib/logger');
jest.mock('@/lib/socket/server', () => ({ getSocketServer: () => null }));

const mockGetConversationsForCoach = getConversationsForCoach as jest.MockedFunction<typeof getConversationsForCoach>;
const mockGetConversationsForPlayer = getConversationsForPlayer as jest.MockedFunction<typeof getConversationsForPlayer>;
const mockGetMessageThread = getMessageThread as jest.MockedFunction<typeof getMessageThread>;
const mockInsertMessage = insertMessage as jest.MockedFunction<typeof insertMessage>;
const mockSoftDeleteMessage = softDeleteMessage as jest.MockedFunction<typeof softDeleteMessage>;
const mockGetUnreadCount = getUnreadCount as jest.MockedFunction<typeof getUnreadCount>;
const mockGetUnreadNotifications = getUnreadNotifications as jest.MockedFunction<typeof getUnreadNotifications>;
const mockMarkThreadAsRead = markThreadAsRead as jest.MockedFunction<typeof markThreadAsRead>;
const mockValidateSession = validateSession as jest.MockedFunction<typeof validateSession>;

const COACH_ID = '123e4567-e89b-12d3-a456-426614174000';
const OTHER_COACH_ID = '987e6543-e21b-12d3-a456-426614174999';
const PLAYER_ID = 'aabbccdd-e89b-12d3-a456-426614174000';
const OTHER_PLAYER_ID = 'bbccddee-e89b-12d3-a456-426614174001';
const MESSAGE_ID = 'ccddee11-e89b-12d3-a456-426614174002';

const mockConversation = {
    counterpartId: PLAYER_ID,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@test.com',
    lastMessageAt: '2024-01-01T00:00:00Z',
};

const mockMessage = {
    id: MESSAGE_ID,
    coachId: COACH_ID,
    playerId: PLAYER_ID,
    senderType: 'coach' as const,
    senderId: COACH_ID,
    content: 'Hello player',
    createdAt: '2024-01-01T00:00:00Z',
    readAt: null,
    deletedAt: null,
};

const mockNotification = {
    messageId: MESSAGE_ID,
    senderName: 'Jane Doe',
    preview: 'Hello coach',
    sentAt: '2024-01-01T00:00:00Z',
    coachId: COACH_ID,
    playerId: PLAYER_ID,
};

function makeRequest(method: string, url: string, body?: unknown): NextRequest {
    return new NextRequest(url, {
        method,
        headers: { 'Content-Type': 'application/json', Cookie: 'session=mock-token' },
        body: body ? JSON.stringify(body) : undefined,
    });
}

function coachSession(id = COACH_ID) {
    return { isValid: true as const, playerId: id, type: 'coach' as const, email: 'coach@test.com' };
}

function playerSession(id = PLAYER_ID) {
    return { isValid: true as const, playerId: id, type: 'player' as const, email: 'player@test.com' };
}

const noSession = { isValid: false as const, error: 'No session token found' };

beforeEach(() => {
    jest.clearAllMocks();
    mockMarkThreadAsRead.mockResolvedValue(undefined);
});

// ─── Coach API ────────────────────────────────────────────────────────────────

describe('GET /api/coach/[coachId]/messages', () => {
    const params = Promise.resolve({ coachId: COACH_ID });

    it('returns 200 with conversations array (Req 2.4)', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockGetConversationsForCoach.mockResolvedValue([mockConversation]);

        const res = await coachGetConversations(makeRequest('GET', `http://localhost/api/coach/${COACH_ID}/messages`), { params });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toHaveLength(1);
        expect(body.data[0]).toMatchObject({ counterpartId: PLAYER_ID, firstName: 'Jane' });
    });

    it('returns 200 with empty array when no conversations (Req 2.4)', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockGetConversationsForCoach.mockResolvedValue([]);

        const res = await coachGetConversations(makeRequest('GET', `http://localhost/api/coach/${COACH_ID}/messages`), { params });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.data).toEqual([]);
    });

    it('returns 401 without a valid session (Req 3.5)', async () => {
        mockValidateSession.mockResolvedValue(noSession);

        const res = await coachGetConversations(makeRequest('GET', `http://localhost/api/coach/${COACH_ID}/messages`), { params });

        expect(res.status).toBe(401);
        expect(mockGetConversationsForCoach).not.toHaveBeenCalled();
    });

    it('returns 403 when session belongs to a different coach (Req 2.6)', async () => {
        mockValidateSession.mockResolvedValue(coachSession(OTHER_COACH_ID));

        const res = await coachGetConversations(makeRequest('GET', `http://localhost/api/coach/${COACH_ID}/messages`), { params });

        expect(res.status).toBe(403);
        expect(mockGetConversationsForCoach).not.toHaveBeenCalled();
    });

    it('returns 403 when a player session is used (Req 2.6)', async () => {
        mockValidateSession.mockResolvedValue(playerSession(COACH_ID));

        const res = await coachGetConversations(makeRequest('GET', `http://localhost/api/coach/${COACH_ID}/messages`), { params });

        expect(res.status).toBe(403);
        expect(mockGetConversationsForCoach).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid coachId format', async () => {
        const res = await coachGetConversations(
            makeRequest('GET', 'http://localhost/api/coach/not-a-uuid/messages'),
            { params: Promise.resolve({ coachId: 'not-a-uuid' }) }
        );

        expect(res.status).toBe(400);
        expect(mockGetConversationsForCoach).not.toHaveBeenCalled();
    });
});

describe('POST /api/coach/[coachId]/messages/[playerId]', () => {
    const params = Promise.resolve({ coachId: COACH_ID, playerId: PLAYER_ID });

    it('creates a message and returns 201 (Req 4.4)', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockInsertMessage.mockResolvedValue(mockMessage);

        const res = await coachPostMessage(
            makeRequest('POST', `http://localhost/api/coach/${COACH_ID}/messages/${PLAYER_ID}`, { content: 'Hello player' }),
            { params }
        );
        const body = await res.json();

        expect(res.status).toBe(201);
        expect(body.success).toBe(true);
        expect(body.data).toMatchObject({ content: 'Hello player', senderType: 'coach' });
        expect(mockInsertMessage).toHaveBeenCalledWith(COACH_ID, PLAYER_ID, 'coach', COACH_ID, 'Hello player');
    });

    it('returns 400 on empty content (Req 4.4)', async () => {
        mockValidateSession.mockResolvedValue(coachSession());

        const res = await coachPostMessage(
            makeRequest('POST', `http://localhost/api/coach/${COACH_ID}/messages/${PLAYER_ID}`, { content: '   ' }),
            { params }
        );

        expect(res.status).toBe(400);
        expect(mockInsertMessage).not.toHaveBeenCalled();
    });

    it('returns 400 on missing content (Req 4.4)', async () => {
        mockValidateSession.mockResolvedValue(coachSession());

        const res = await coachPostMessage(
            makeRequest('POST', `http://localhost/api/coach/${COACH_ID}/messages/${PLAYER_ID}`, {}),
            { params }
        );

        expect(res.status).toBe(400);
        expect(mockInsertMessage).not.toHaveBeenCalled();
    });

    it('returns 401 without a valid session (Req 3.5)', async () => {
        mockValidateSession.mockResolvedValue(noSession);

        const res = await coachPostMessage(
            makeRequest('POST', `http://localhost/api/coach/${COACH_ID}/messages/${PLAYER_ID}`, { content: 'Hi' }),
            { params }
        );

        expect(res.status).toBe(401);
        expect(mockInsertMessage).not.toHaveBeenCalled();
    });

    it('returns 403 when session belongs to a different coach (Req 2.6)', async () => {
        mockValidateSession.mockResolvedValue(coachSession(OTHER_COACH_ID));

        const res = await coachPostMessage(
            makeRequest('POST', `http://localhost/api/coach/${COACH_ID}/messages/${PLAYER_ID}`, { content: 'Hi' }),
            { params }
        );

        expect(res.status).toBe(403);
        expect(mockInsertMessage).not.toHaveBeenCalled();
    });
});

describe('DELETE /api/coach/[coachId]/messages/[playerId]/[messageId]', () => {
    const params = Promise.resolve({ coachId: COACH_ID, playerId: PLAYER_ID, messageId: MESSAGE_ID });

    it('soft-deletes a message and returns 200 (Req 4.5)', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockSoftDeleteMessage.mockResolvedValue(true);

        const res = await coachDeleteMessage(
            makeRequest('DELETE', `http://localhost/api/coach/${COACH_ID}/messages/${PLAYER_ID}/${MESSAGE_ID}`),
            { params }
        );
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockSoftDeleteMessage).toHaveBeenCalledWith(MESSAGE_ID, COACH_ID);
    });

    it('returns 404 when message not found or already deleted (Req 4.5)', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockSoftDeleteMessage.mockResolvedValue(false);

        const res = await coachDeleteMessage(
            makeRequest('DELETE', `http://localhost/api/coach/${COACH_ID}/messages/${PLAYER_ID}/${MESSAGE_ID}`),
            { params }
        );

        expect(res.status).toBe(404);
    });

    it('returns 403 when session belongs to a different coach (Req 2.6)', async () => {
        mockValidateSession.mockResolvedValue(coachSession(OTHER_COACH_ID));

        const res = await coachDeleteMessage(
            makeRequest('DELETE', `http://localhost/api/coach/${COACH_ID}/messages/${PLAYER_ID}/${MESSAGE_ID}`),
            { params }
        );

        expect(res.status).toBe(403);
        expect(mockSoftDeleteMessage).not.toHaveBeenCalled();
    });

    it('returns 401 without a valid session (Req 3.5)', async () => {
        mockValidateSession.mockResolvedValue(noSession);

        const res = await coachDeleteMessage(
            makeRequest('DELETE', `http://localhost/api/coach/${COACH_ID}/messages/${PLAYER_ID}/${MESSAGE_ID}`),
            { params }
        );

        expect(res.status).toBe(401);
        expect(mockSoftDeleteMessage).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid messageId format', async () => {
        mockValidateSession.mockResolvedValue(coachSession());

        const res = await coachDeleteMessage(
            makeRequest('DELETE', `http://localhost/api/coach/${COACH_ID}/messages/${PLAYER_ID}/bad-id`),
            { params: Promise.resolve({ coachId: COACH_ID, playerId: PLAYER_ID, messageId: 'bad-id' }) }
        );

        expect(res.status).toBe(400);
        expect(mockSoftDeleteMessage).not.toHaveBeenCalled();
    });
});

describe('GET /api/coach/[coachId]/messages/unread', () => {
    const params = Promise.resolve({ coachId: COACH_ID });

    it('returns 200 with count and notifications (Req 5.5)', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockGetUnreadCount.mockResolvedValue(3);
        mockGetUnreadNotifications.mockResolvedValue([mockNotification]);

        const res = await coachGetUnread(makeRequest('GET', `http://localhost/api/coach/${COACH_ID}/messages/unread`), { params });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data.count).toBe(3);
        expect(body.data.notifications).toHaveLength(1);
        expect(body.data.notifications[0]).toMatchObject({ senderName: 'Jane Doe' });
    });

    it('returns 200 with count 0 and empty notifications when none (Req 5.5)', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockGetUnreadCount.mockResolvedValue(0);
        mockGetUnreadNotifications.mockResolvedValue([]);

        const res = await coachGetUnread(makeRequest('GET', `http://localhost/api/coach/${COACH_ID}/messages/unread`), { params });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.data.count).toBe(0);
        expect(body.data.notifications).toEqual([]);
    });

    it('returns 401 without a valid session (Req 3.5)', async () => {
        mockValidateSession.mockResolvedValue(noSession);

        const res = await coachGetUnread(makeRequest('GET', `http://localhost/api/coach/${COACH_ID}/messages/unread`), { params });

        expect(res.status).toBe(401);
        expect(mockGetUnreadCount).not.toHaveBeenCalled();
    });

    it('returns 403 when session belongs to a different coach (Req 2.6)', async () => {
        mockValidateSession.mockResolvedValue(coachSession(OTHER_COACH_ID));

        const res = await coachGetUnread(makeRequest('GET', `http://localhost/api/coach/${COACH_ID}/messages/unread`), { params });

        expect(res.status).toBe(403);
        expect(mockGetUnreadCount).not.toHaveBeenCalled();
    });

    it('returns 403 when a player session is used (Req 2.6)', async () => {
        mockValidateSession.mockResolvedValue(playerSession(COACH_ID));

        const res = await coachGetUnread(makeRequest('GET', `http://localhost/api/coach/${COACH_ID}/messages/unread`), { params });

        expect(res.status).toBe(403);
        expect(mockGetUnreadCount).not.toHaveBeenCalled();
    });
});

// ─── Player API ───────────────────────────────────────────────────────────────

describe('GET /api/player/[playerId]/messages', () => {
    const params = Promise.resolve({ playerId: PLAYER_ID });

    it('returns 200 with conversations array (Req 2.4)', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockGetConversationsForPlayer.mockResolvedValue([{ ...mockConversation, counterpartId: COACH_ID }]);

        const res = await playerGetConversations(makeRequest('GET', `http://localhost/api/player/${PLAYER_ID}/messages`), { params });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toHaveLength(1);
    });

    it('returns 200 with empty array when no conversations (Req 2.4)', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockGetConversationsForPlayer.mockResolvedValue([]);

        const res = await playerGetConversations(makeRequest('GET', `http://localhost/api/player/${PLAYER_ID}/messages`), { params });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.data).toEqual([]);
    });

    it('returns 401 without a valid session (Req 3.5)', async () => {
        mockValidateSession.mockResolvedValue(noSession);

        const res = await playerGetConversations(makeRequest('GET', `http://localhost/api/player/${PLAYER_ID}/messages`), { params });

        expect(res.status).toBe(401);
        expect(mockGetConversationsForPlayer).not.toHaveBeenCalled();
    });

    it('returns 403 when session belongs to a different player (Req 2.6)', async () => {
        mockValidateSession.mockResolvedValue(playerSession(OTHER_PLAYER_ID));

        const res = await playerGetConversations(makeRequest('GET', `http://localhost/api/player/${PLAYER_ID}/messages`), { params });

        expect(res.status).toBe(403);
        expect(mockGetConversationsForPlayer).not.toHaveBeenCalled();
    });

    it('returns 403 when a coach session is used (Req 2.6)', async () => {
        mockValidateSession.mockResolvedValue(coachSession(PLAYER_ID));

        const res = await playerGetConversations(makeRequest('GET', `http://localhost/api/player/${PLAYER_ID}/messages`), { params });

        expect(res.status).toBe(403);
        expect(mockGetConversationsForPlayer).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid playerId format', async () => {
        const res = await playerGetConversations(
            makeRequest('GET', 'http://localhost/api/player/not-a-uuid/messages'),
            { params: Promise.resolve({ playerId: 'not-a-uuid' }) }
        );

        expect(res.status).toBe(400);
        expect(mockGetConversationsForPlayer).not.toHaveBeenCalled();
    });
});

describe('POST /api/player/[playerId]/messages/[coachId]', () => {
    const params = Promise.resolve({ playerId: PLAYER_ID, coachId: COACH_ID });
    const playerMessage = { ...mockMessage, senderType: 'player' as const, senderId: PLAYER_ID, content: 'Hello coach' };

    it('creates a message and returns 201 (Req 4.4)', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockInsertMessage.mockResolvedValue(playerMessage);

        const res = await playerPostMessage(
            makeRequest('POST', `http://localhost/api/player/${PLAYER_ID}/messages/${COACH_ID}`, { content: 'Hello coach' }),
            { params }
        );
        const body = await res.json();

        expect(res.status).toBe(201);
        expect(body.success).toBe(true);
        expect(body.data).toMatchObject({ content: 'Hello coach', senderType: 'player' });
        expect(mockInsertMessage).toHaveBeenCalledWith(COACH_ID, PLAYER_ID, 'player', PLAYER_ID, 'Hello coach');
    });

    it('returns 400 on empty content (Req 4.4)', async () => {
        mockValidateSession.mockResolvedValue(playerSession());

        const res = await playerPostMessage(
            makeRequest('POST', `http://localhost/api/player/${PLAYER_ID}/messages/${COACH_ID}`, { content: '' }),
            { params }
        );

        expect(res.status).toBe(400);
        expect(mockInsertMessage).not.toHaveBeenCalled();
    });

    it('returns 400 on missing content (Req 4.4)', async () => {
        mockValidateSession.mockResolvedValue(playerSession());

        const res = await playerPostMessage(
            makeRequest('POST', `http://localhost/api/player/${PLAYER_ID}/messages/${COACH_ID}`, {}),
            { params }
        );

        expect(res.status).toBe(400);
        expect(mockInsertMessage).not.toHaveBeenCalled();
    });

    it('returns 401 without a valid session (Req 3.5)', async () => {
        mockValidateSession.mockResolvedValue(noSession);

        const res = await playerPostMessage(
            makeRequest('POST', `http://localhost/api/player/${PLAYER_ID}/messages/${COACH_ID}`, { content: 'Hi' }),
            { params }
        );

        expect(res.status).toBe(401);
        expect(mockInsertMessage).not.toHaveBeenCalled();
    });

    it('returns 403 when session belongs to a different player (Req 2.6)', async () => {
        mockValidateSession.mockResolvedValue(playerSession(OTHER_PLAYER_ID));

        const res = await playerPostMessage(
            makeRequest('POST', `http://localhost/api/player/${PLAYER_ID}/messages/${COACH_ID}`, { content: 'Hi' }),
            { params }
        );

        expect(res.status).toBe(403);
        expect(mockInsertMessage).not.toHaveBeenCalled();
    });
});

describe('DELETE /api/player/[playerId]/messages/[coachId]/[messageId]', () => {
    const params = Promise.resolve({ playerId: PLAYER_ID, coachId: COACH_ID, messageId: MESSAGE_ID });

    it('soft-deletes a message and returns 200 (Req 4.5)', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockSoftDeleteMessage.mockResolvedValue(true);

        const res = await playerDeleteMessage(
            makeRequest('DELETE', `http://localhost/api/player/${PLAYER_ID}/messages/${COACH_ID}/${MESSAGE_ID}`),
            { params }
        );
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockSoftDeleteMessage).toHaveBeenCalledWith(MESSAGE_ID, PLAYER_ID);
    });

    it('returns 404 when message not found or already deleted (Req 4.5)', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockSoftDeleteMessage.mockResolvedValue(false);

        const res = await playerDeleteMessage(
            makeRequest('DELETE', `http://localhost/api/player/${PLAYER_ID}/messages/${COACH_ID}/${MESSAGE_ID}`),
            { params }
        );

        expect(res.status).toBe(404);
    });

    it('returns 403 when session belongs to a different player (Req 2.6)', async () => {
        mockValidateSession.mockResolvedValue(playerSession(OTHER_PLAYER_ID));

        const res = await playerDeleteMessage(
            makeRequest('DELETE', `http://localhost/api/player/${PLAYER_ID}/messages/${COACH_ID}/${MESSAGE_ID}`),
            { params }
        );

        expect(res.status).toBe(403);
        expect(mockSoftDeleteMessage).not.toHaveBeenCalled();
    });

    it('returns 401 without a valid session (Req 3.5)', async () => {
        mockValidateSession.mockResolvedValue(noSession);

        const res = await playerDeleteMessage(
            makeRequest('DELETE', `http://localhost/api/player/${PLAYER_ID}/messages/${COACH_ID}/${MESSAGE_ID}`),
            { params }
        );

        expect(res.status).toBe(401);
        expect(mockSoftDeleteMessage).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid messageId format', async () => {
        const res = await playerDeleteMessage(
            makeRequest('DELETE', `http://localhost/api/player/${PLAYER_ID}/messages/${COACH_ID}/bad-id`),
            { params: Promise.resolve({ playerId: PLAYER_ID, coachId: COACH_ID, messageId: 'bad-id' }) }
        );

        expect(res.status).toBe(400);
        expect(mockSoftDeleteMessage).not.toHaveBeenCalled();
    });
});

describe('GET /api/player/[playerId]/messages/unread', () => {
    const params = Promise.resolve({ playerId: PLAYER_ID });

    it('returns 200 with count and notifications (Req 5.5)', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockGetUnreadCount.mockResolvedValue(2);
        mockGetUnreadNotifications.mockResolvedValue([mockNotification]);

        const res = await playerGetUnread(makeRequest('GET', `http://localhost/api/player/${PLAYER_ID}/messages/unread`), { params });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data.count).toBe(2);
        expect(body.data.notifications).toHaveLength(1);
    });

    it('returns 200 with count 0 and empty notifications when none (Req 5.5)', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockGetUnreadCount.mockResolvedValue(0);
        mockGetUnreadNotifications.mockResolvedValue([]);

        const res = await playerGetUnread(makeRequest('GET', `http://localhost/api/player/${PLAYER_ID}/messages/unread`), { params });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.data.count).toBe(0);
        expect(body.data.notifications).toEqual([]);
    });

    it('returns 401 without a valid session (Req 3.5)', async () => {
        mockValidateSession.mockResolvedValue(noSession);

        const res = await playerGetUnread(makeRequest('GET', `http://localhost/api/player/${PLAYER_ID}/messages/unread`), { params });

        expect(res.status).toBe(401);
        expect(mockGetUnreadCount).not.toHaveBeenCalled();
    });

    it('returns 403 when session belongs to a different player (Req 2.6)', async () => {
        mockValidateSession.mockResolvedValue(playerSession(OTHER_PLAYER_ID));

        const res = await playerGetUnread(makeRequest('GET', `http://localhost/api/player/${PLAYER_ID}/messages/unread`), { params });

        expect(res.status).toBe(403);
        expect(mockGetUnreadCount).not.toHaveBeenCalled();
    });

    it('returns 403 when a coach session is used (Req 2.6)', async () => {
        mockValidateSession.mockResolvedValue(coachSession(PLAYER_ID));

        const res = await playerGetUnread(makeRequest('GET', `http://localhost/api/player/${PLAYER_ID}/messages/unread`), { params });

        expect(res.status).toBe(403);
        expect(mockGetUnreadCount).not.toHaveBeenCalled();
    });
});
