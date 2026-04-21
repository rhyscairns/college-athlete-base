/**
 * @jest-environment node
 *
 * Integration tests for coach prospects API endpoints
 * Tests GET, POST, and DELETE /api/coach/[coachId]/prospects
 *
 * Requirements covered: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.4, 3.5
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/coach/[coachId]/prospects/route';
import { DELETE } from '@/app/api/coach/[coachId]/prospects/[playerId]/route';
import { getProspectsWithPlayerData, addProspect, removeProspect } from '@/lib/db/queries/prospects';
import { validateSession } from '@/authentication/middleware/session';

jest.mock('@/lib/db/queries/prospects');
jest.mock('@/authentication/middleware/session');
jest.mock('@/lib/logger');

const mockGetProspectsWithPlayerData = getProspectsWithPlayerData as jest.MockedFunction<typeof getProspectsWithPlayerData>;
const mockAddProspect = addProspect as jest.MockedFunction<typeof addProspect>;
const mockRemoveProspect = removeProspect as jest.MockedFunction<typeof removeProspect>;
const mockValidateSession = validateSession as jest.MockedFunction<typeof validateSession>;

const COACH_ID = '123e4567-e89b-12d3-a456-426614174000';
const OTHER_COACH_ID = '987e6543-e21b-12d3-a456-426614174999';
const PLAYER_ID = 'aabbccdd-e89b-12d3-a456-426614174000';
const PLAYER_ID_2 = 'bbccddee-e89b-12d3-a456-426614174001';

const mockProspect = {
    playerId: PLAYER_ID,
    firstName: 'Jane',
    lastName: 'Doe',
    sport: 'Basketball',
    position: 'Guard',
    gpa: 3.8,
    highSchool: 'Lincoln High',
    scholarshipAmount: 15000,
    videoUrl: 'https://youtube.com/watch?v=abc123',
    videoTitle: 'Highlight Reel',
    profileImage: null,
};

function createRequest(
    method: string,
    url: string,
    body?: unknown,
    withSession = true
): NextRequest {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (withSession) headers['Cookie'] = 'session=mock-token';

    return new NextRequest(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
}

describe('Coach Prospects API - Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ─── GET /api/coach/[coachId]/prospects ───────────────────────────────────

    describe('GET /api/coach/[coachId]/prospects', () => {
        const params = Promise.resolve({ coachId: COACH_ID });

        it('returns 200 with prospects list when coach has prospects (Req 3.1)', async () => {
            mockValidateSession.mockResolvedValue({ isValid: true, playerId: COACH_ID, type: 'coach', email: 'coach@test.com' });
            mockGetProspectsWithPlayerData.mockResolvedValue([mockProspect]);

            const req = createRequest('GET', `http://localhost/api/coach/${COACH_ID}/prospects`);
            const res = await GET(req, { params });
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.success).toBe(true);
            expect(body.data).toHaveLength(1);
            expect(body.data[0]).toMatchObject({ playerId: PLAYER_ID, firstName: 'Jane' });
        });

        it('returns 200 with empty array when coach has no prospects (Req 3.4)', async () => {
            mockValidateSession.mockResolvedValue({ isValid: true, playerId: COACH_ID, type: 'coach', email: 'coach@test.com' });
            mockGetProspectsWithPlayerData.mockResolvedValue([]);

            const req = createRequest('GET', `http://localhost/api/coach/${COACH_ID}/prospects`);
            const res = await GET(req, { params });
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.success).toBe(true);
            expect(body.data).toEqual([]);
        });

        it('returns 401 without a valid session (Req 2.5, 3.5)', async () => {
            mockValidateSession.mockResolvedValue({ isValid: false, error: 'No session token found' });

            const req = createRequest('GET', `http://localhost/api/coach/${COACH_ID}/prospects`, undefined, false);
            const res = await GET(req, { params });
            const body = await res.json();

            expect(res.status).toBe(401);
            expect(body.success).toBe(false);
            expect(mockGetProspectsWithPlayerData).not.toHaveBeenCalled();
        });

        it('returns 401 with an expired/invalid token (Req 3.5)', async () => {
            mockValidateSession.mockResolvedValue({ isValid: false, error: 'Token expired' });

            const req = createRequest('GET', `http://localhost/api/coach/${COACH_ID}/prospects`);
            const res = await GET(req, { params });

            expect(res.status).toBe(401);
            expect(mockGetProspectsWithPlayerData).not.toHaveBeenCalled();
        });

        it('returns 403 when coach tries to view another coach\'s prospects (Req 2.6)', async () => {
            mockValidateSession.mockResolvedValue({ isValid: true, playerId: OTHER_COACH_ID, type: 'coach', email: 'other@test.com' });

            const req = createRequest('GET', `http://localhost/api/coach/${COACH_ID}/prospects`);
            const res = await GET(req, { params });
            const body = await res.json();

            expect(res.status).toBe(403);
            expect(body.success).toBe(false);
            expect(mockGetProspectsWithPlayerData).not.toHaveBeenCalled();
        });

        it('returns null for fields with no data (Req 3.3)', async () => {
            mockValidateSession.mockResolvedValue({ isValid: true, playerId: COACH_ID, type: 'coach', email: 'coach@test.com' });
            mockGetProspectsWithPlayerData.mockResolvedValue([{
                ...mockProspect,
                sport: null,
                position: null,
                gpa: null,
                highSchool: null,
                scholarshipAmount: null,
                videoUrl: null,
                videoTitle: null,
                profileImage: null,
            }]);

            const req = createRequest('GET', `http://localhost/api/coach/${COACH_ID}/prospects`);
            const res = await GET(req, { params });
            const body = await res.json();

            expect(res.status).toBe(200);
            const row = body.data[0];
            expect(row.sport).toBeNull();
            expect(row.gpa).toBeNull();
            expect(row.videoUrl).toBeNull();
        });

        it('returns 400 for an invalid coachId format', async () => {
            const badParams = Promise.resolve({ coachId: 'not-a-uuid' });
            const req = createRequest('GET', 'http://localhost/api/coach/not-a-uuid/prospects');
            const res = await GET(req, { params: badParams });

            expect(res.status).toBe(400);
            expect(mockGetProspectsWithPlayerData).not.toHaveBeenCalled();
        });

        it('returns 403 when a player token is used (Req 2.6)', async () => {
            mockValidateSession.mockResolvedValue({ isValid: true, playerId: COACH_ID, type: 'player', email: 'player@test.com' });

            const req = createRequest('GET', `http://localhost/api/coach/${COACH_ID}/prospects`);
            const res = await GET(req, { params: Promise.resolve({ coachId: COACH_ID }) });
            const body = await res.json();

            expect(res.status).toBe(403);
            expect(body.success).toBe(false);
            expect(mockGetProspectsWithPlayerData).not.toHaveBeenCalled();
        });
    });

    // ─── POST /api/coach/[coachId]/prospects ──────────────────────────────────

    describe('POST /api/coach/[coachId]/prospects', () => {
        const params = Promise.resolve({ coachId: COACH_ID });

        it('creates a prospect entry and returns 201 (Req 2.1)', async () => {
            mockValidateSession.mockResolvedValue({ isValid: true, playerId: COACH_ID, type: 'coach', email: 'coach@test.com' });
            mockAddProspect.mockResolvedValue({
                id: 'new-uuid',
                coachId: COACH_ID,
                playerId: PLAYER_ID,
                createdAt: new Date(),
            });

            const req = createRequest('POST', `http://localhost/api/coach/${COACH_ID}/prospects`, { playerId: PLAYER_ID });
            const res = await POST(req, { params });
            const body = await res.json();

            expect(res.status).toBe(201);
            expect(body.success).toBe(true);
            expect(mockAddProspect).toHaveBeenCalledWith(COACH_ID, PLAYER_ID);
        });

        it('returns 409 when player is already a prospect (Req 2.2)', async () => {
            mockValidateSession.mockResolvedValue({ isValid: true, playerId: COACH_ID, type: 'coach', email: 'coach@test.com' });
            const conflictError = Object.assign(new Error('duplicate key'), { code: '23505' });
            mockAddProspect.mockRejectedValue(conflictError);

            const req = createRequest('POST', `http://localhost/api/coach/${COACH_ID}/prospects`, { playerId: PLAYER_ID });
            const res = await POST(req, { params });
            const body = await res.json();

            expect(res.status).toBe(409);
            expect(body.success).toBe(false);
        });

        it('returns 401 without a valid session (Req 2.5)', async () => {
            mockValidateSession.mockResolvedValue({ isValid: false, error: 'No session token found' });

            const req = createRequest('POST', `http://localhost/api/coach/${COACH_ID}/prospects`, { playerId: PLAYER_ID }, false);
            const res = await POST(req, { params });
            const body = await res.json();

            expect(res.status).toBe(401);
            expect(body.success).toBe(false);
            expect(mockAddProspect).not.toHaveBeenCalled();
        });

        it('returns 403 when coach tries to add to another coach\'s prospects (Req 2.6)', async () => {
            mockValidateSession.mockResolvedValue({ isValid: true, playerId: OTHER_COACH_ID, type: 'coach', email: 'other@test.com' });

            const req = createRequest('POST', `http://localhost/api/coach/${COACH_ID}/prospects`, { playerId: PLAYER_ID });
            const res = await POST(req, { params });
            const body = await res.json();

            expect(res.status).toBe(403);
            expect(body.success).toBe(false);
            expect(mockAddProspect).not.toHaveBeenCalled();
        });

        it('returns 403 when a player token is used (Req 2.6)', async () => {
            mockValidateSession.mockResolvedValue({ isValid: true, playerId: COACH_ID, type: 'player', email: 'player@test.com' });

            const req = createRequest('POST', `http://localhost/api/coach/${COACH_ID}/prospects`, { playerId: PLAYER_ID });
            const res = await POST(req, { params });

            expect(res.status).toBe(403);
            expect(mockAddProspect).not.toHaveBeenCalled();
        });

        it('returns 400 when playerId is missing from body', async () => {
            mockValidateSession.mockResolvedValue({ isValid: true, playerId: COACH_ID, type: 'coach', email: 'coach@test.com' });

            const req = createRequest('POST', `http://localhost/api/coach/${COACH_ID}/prospects`, {});
            const res = await POST(req, { params });

            expect(res.status).toBe(400);
            expect(mockAddProspect).not.toHaveBeenCalled();
        });

        it('returns 400 when playerId is not a valid UUID', async () => {
            mockValidateSession.mockResolvedValue({ isValid: true, playerId: COACH_ID, type: 'coach', email: 'coach@test.com' });

            const req = createRequest('POST', `http://localhost/api/coach/${COACH_ID}/prospects`, { playerId: 'not-a-uuid' });
            const res = await POST(req, { params });

            expect(res.status).toBe(400);
            expect(mockAddProspect).not.toHaveBeenCalled();
        });

        it('returns 500 on unexpected DB error', async () => {
            mockValidateSession.mockResolvedValue({ isValid: true, playerId: COACH_ID, type: 'coach', email: 'coach@test.com' });
            mockAddProspect.mockRejectedValue(new Error('connection refused'));

            const req = createRequest('POST', `http://localhost/api/coach/${COACH_ID}/prospects`, { playerId: PLAYER_ID });
            const res = await POST(req, { params });
            const body = await res.json();

            expect(res.status).toBe(500);
            expect(body.success).toBe(false);
        });
    });

    // ─── DELETE /api/coach/[coachId]/prospects/[playerId] ─────────────────────

    describe('DELETE /api/coach/[coachId]/prospects/[playerId]', () => {
        const params = Promise.resolve({ coachId: COACH_ID, playerId: PLAYER_ID });

        it('removes a prospect and returns 200 (Req 2.3)', async () => {
            mockValidateSession.mockResolvedValue({ isValid: true, playerId: COACH_ID, type: 'coach', email: 'coach@test.com' });
            mockRemoveProspect.mockResolvedValue(true);

            const req = createRequest('DELETE', `http://localhost/api/coach/${COACH_ID}/prospects/${PLAYER_ID}`);
            const res = await DELETE(req, { params });
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.success).toBe(true);
            expect(mockRemoveProspect).toHaveBeenCalledWith(COACH_ID, PLAYER_ID);
        });

        it('returns 404 when prospect entry does not exist (Req 2.4)', async () => {
            mockValidateSession.mockResolvedValue({ isValid: true, playerId: COACH_ID, type: 'coach', email: 'coach@test.com' });
            mockRemoveProspect.mockResolvedValue(false);

            const req = createRequest('DELETE', `http://localhost/api/coach/${COACH_ID}/prospects/${PLAYER_ID_2}`);
            const res = await DELETE(req, { params: Promise.resolve({ coachId: COACH_ID, playerId: PLAYER_ID_2 }) });
            const body = await res.json();

            expect(res.status).toBe(404);
            expect(body.success).toBe(false);
        });

        it('returns 401 without a valid session (Req 2.5)', async () => {
            mockValidateSession.mockResolvedValue({ isValid: false, error: 'No session token found' });

            const req = createRequest('DELETE', `http://localhost/api/coach/${COACH_ID}/prospects/${PLAYER_ID}`, undefined, false);
            const res = await DELETE(req, { params });
            const body = await res.json();

            expect(res.status).toBe(401);
            expect(body.success).toBe(false);
            expect(mockRemoveProspect).not.toHaveBeenCalled();
        });

        it('returns 403 when coach tries to delete from another coach\'s prospects (Req 2.6)', async () => {
            mockValidateSession.mockResolvedValue({ isValid: true, playerId: OTHER_COACH_ID, type: 'coach', email: 'other@test.com' });

            const req = createRequest('DELETE', `http://localhost/api/coach/${COACH_ID}/prospects/${PLAYER_ID}`);
            const res = await DELETE(req, { params });
            const body = await res.json();

            expect(res.status).toBe(403);
            expect(body.success).toBe(false);
            expect(mockRemoveProspect).not.toHaveBeenCalled();
        });

        it('returns 400 for an invalid playerId format', async () => {
            mockValidateSession.mockResolvedValue({ isValid: true, playerId: COACH_ID, type: 'coach', email: 'coach@test.com' });
            const badParams = Promise.resolve({ coachId: COACH_ID, playerId: 'not-a-uuid' });

            const req = createRequest('DELETE', `http://localhost/api/coach/${COACH_ID}/prospects/not-a-uuid`);
            const res = await DELETE(req, { params: badParams });

            expect(res.status).toBe(400);
            expect(mockRemoveProspect).not.toHaveBeenCalled();
        });

        it('returns 403 when a player token is used (Req 2.6)', async () => {
            mockValidateSession.mockResolvedValue({ isValid: true, playerId: COACH_ID, type: 'player', email: 'player@test.com' });

            const req = createRequest('DELETE', `http://localhost/api/coach/${COACH_ID}/prospects/${PLAYER_ID}`);
            const res = await DELETE(req, { params });
            const body = await res.json();

            expect(res.status).toBe(403);
            expect(body.success).toBe(false);
            expect(mockRemoveProspect).not.toHaveBeenCalled();
        });
    });
});
