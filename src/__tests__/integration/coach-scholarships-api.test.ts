/**
 * @jest-environment node
 *
 * Integration tests for coach scholarships API endpoints
 * Tests GET and POST /api/coach/[coachId]/scholarships
 * Tests GET and PATCH /api/coach/[coachId]/scholarships/[playerId]
 *
 * Requirements covered: 10.1, 10.2, 10.3, 10.4, 10.7, 10.8
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/coach/[coachId]/scholarships/route';
import { GET as getByPlayer, PATCH } from '@/app/api/coach/[coachId]/scholarships/[playerId]/route';
import {
    getScholarshipsByCoach,
    getScholarshipByCoachAndPlayer,
    createScholarship,
    updateScholarship,
} from '@/scholarships/db/queries';
import { validateSession } from '@/authentication/middleware/session';

jest.mock('@/scholarships/db/queries');
jest.mock('@/authentication/middleware/session');
jest.mock('@/lib/logger');

const mockGetScholarshipsByCoach = getScholarshipsByCoach as jest.MockedFunction<typeof getScholarshipsByCoach>;
const mockGetScholarshipByCoachAndPlayer = getScholarshipByCoachAndPlayer as jest.MockedFunction<typeof getScholarshipByCoachAndPlayer>;
const mockCreateScholarship = createScholarship as jest.MockedFunction<typeof createScholarship>;
const mockUpdateScholarship = updateScholarship as jest.MockedFunction<typeof updateScholarship>;
const mockValidateSession = validateSession as jest.MockedFunction<typeof validateSession>;

const COACH_ID = '123e4567-e89b-12d3-a456-426614174000';
const OTHER_COACH_ID = '987e6543-e21b-12d3-a456-426614174999';
const PLAYER_ID = 'aabbccdd-e89b-12d3-a456-426614174000';

const mockScholarship = {
    id: 'dddddddd-e89b-12d3-a456-426614174001',
    coachId: COACH_ID,
    playerId: PLAYER_ID,
    status: 'pending' as const,
    schoolName: 'State University',
    sport: 'Basketball',
    scholarshipAmount: 15000,
    requiredGpa: 3.0,
    division: 'Division I',
    startYear: 2025,
    durationYears: 4,
    notes: 'Great prospect',
    counterAmount: null,
    counterGpa: null,
    counterNotes: null,
    playerFirstName: 'Jane',
    playerLastName: 'Doe',
    playerEmail: 'jane@test.com',
    coachFirstName: 'Bob',
    coachLastName: 'Smith',
    coachUniversity: 'State University',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
};

const validPostBody = {
    playerId: PLAYER_ID,
    schoolName: 'State University',
    sport: 'Basketball',
    scholarshipAmount: 15000,
    requiredGpa: 3.0,
    division: 'Division I',
    startYear: 2025,
    durationYears: 4,
    notes: 'Great prospect',
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
});

// ─── GET /api/coach/[coachId]/scholarships ────────────────────────────────────

describe('GET /api/coach/[coachId]/scholarships', () => {
    const params = Promise.resolve({ coachId: COACH_ID });

    it('returns 200 with scholarships list (Req 10.2)', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockGetScholarshipsByCoach.mockResolvedValue([mockScholarship]);

        const res = await GET(makeRequest('GET', `http://localhost/api/coach/${COACH_ID}/scholarships`), { params });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toHaveLength(1);
        expect(body.data[0]).toMatchObject({ id: mockScholarship.id, schoolName: 'State University' });
        expect(mockGetScholarshipsByCoach).toHaveBeenCalledWith(COACH_ID);
    });

    it('returns 200 with empty array when no scholarships (Req 10.2)', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockGetScholarshipsByCoach.mockResolvedValue([]);

        const res = await GET(makeRequest('GET', `http://localhost/api/coach/${COACH_ID}/scholarships`), { params });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toEqual([]);
    });

    it('returns 401 without a valid session (Req 10.7)', async () => {
        mockValidateSession.mockResolvedValue(noSession);

        const res = await GET(makeRequest('GET', `http://localhost/api/coach/${COACH_ID}/scholarships`), { params });
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body.success).toBe(false);
        expect(mockGetScholarshipsByCoach).not.toHaveBeenCalled();
    });

    it('returns 403 when session belongs to a different coach (Req 10.8)', async () => {
        mockValidateSession.mockResolvedValue(coachSession(OTHER_COACH_ID));

        const res = await GET(makeRequest('GET', `http://localhost/api/coach/${COACH_ID}/scholarships`), { params });
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.success).toBe(false);
        expect(mockGetScholarshipsByCoach).not.toHaveBeenCalled();
    });

    it('returns 403 when a player session is used (Req 10.8)', async () => {
        mockValidateSession.mockResolvedValue(playerSession(COACH_ID));

        const res = await GET(makeRequest('GET', `http://localhost/api/coach/${COACH_ID}/scholarships`), { params });

        expect(res.status).toBe(403);
        expect(mockGetScholarshipsByCoach).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid coachId format', async () => {
        const res = await GET(
            makeRequest('GET', 'http://localhost/api/coach/not-a-uuid/scholarships'),
            { params: Promise.resolve({ coachId: 'not-a-uuid' }) }
        );

        expect(res.status).toBe(400);
        expect(mockGetScholarshipsByCoach).not.toHaveBeenCalled();
    });

    it('returns 500 on database error', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockGetScholarshipsByCoach.mockRejectedValue(new Error('connection refused'));

        const res = await GET(makeRequest('GET', `http://localhost/api/coach/${COACH_ID}/scholarships`), { params });
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.success).toBe(false);
    });
});

// ─── POST /api/coach/[coachId]/scholarships ───────────────────────────────────

describe('POST /api/coach/[coachId]/scholarships', () => {
    const params = Promise.resolve({ coachId: COACH_ID });

    it('creates a scholarship and returns 201 (Req 10.1)', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockCreateScholarship.mockResolvedValue(mockScholarship);

        const res = await POST(makeRequest('POST', `http://localhost/api/coach/${COACH_ID}/scholarships`, validPostBody), { params });
        const body = await res.json();

        expect(res.status).toBe(201);
        expect(body.success).toBe(true);
        expect(body.data).toMatchObject({ schoolName: 'State University', status: 'pending' });
        expect(mockCreateScholarship).toHaveBeenCalledWith(expect.objectContaining({
            coachId: COACH_ID,
            playerId: PLAYER_ID,
            scholarshipAmount: 15000,
            requiredGpa: 3.0,
        }));
    });

    it('returns 401 without a valid session (Req 10.7)', async () => {
        mockValidateSession.mockResolvedValue(noSession);

        const res = await POST(makeRequest('POST', `http://localhost/api/coach/${COACH_ID}/scholarships`, validPostBody), { params });
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body.success).toBe(false);
        expect(mockCreateScholarship).not.toHaveBeenCalled();
    });

    it('returns 403 when session belongs to a different coach (Req 10.8)', async () => {
        mockValidateSession.mockResolvedValue(coachSession(OTHER_COACH_ID));

        const res = await POST(makeRequest('POST', `http://localhost/api/coach/${COACH_ID}/scholarships`, validPostBody), { params });
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.success).toBe(false);
        expect(mockCreateScholarship).not.toHaveBeenCalled();
    });

    it('returns 400 when playerId is missing', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        const { playerId: _, ...bodyWithoutPlayer } = validPostBody;

        const res = await POST(makeRequest('POST', `http://localhost/api/coach/${COACH_ID}/scholarships`, bodyWithoutPlayer), { params });

        expect(res.status).toBe(400);
        expect(mockCreateScholarship).not.toHaveBeenCalled();
    });

    it('returns 400 when playerId is not a valid UUID', async () => {
        mockValidateSession.mockResolvedValue(coachSession());

        const res = await POST(makeRequest('POST', `http://localhost/api/coach/${COACH_ID}/scholarships`, { ...validPostBody, playerId: 'not-a-uuid' }), { params });

        expect(res.status).toBe(400);
        expect(mockCreateScholarship).not.toHaveBeenCalled();
    });

    it('returns 400 when schoolName is missing', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        const { schoolName: _, ...body } = validPostBody;

        const res = await POST(makeRequest('POST', `http://localhost/api/coach/${COACH_ID}/scholarships`, body), { params });

        expect(res.status).toBe(400);
        expect(mockCreateScholarship).not.toHaveBeenCalled();
    });

    it('returns 400 when sport is missing', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        const { sport: _, ...body } = validPostBody;

        const res = await POST(makeRequest('POST', `http://localhost/api/coach/${COACH_ID}/scholarships`, body), { params });

        expect(res.status).toBe(400);
        expect(mockCreateScholarship).not.toHaveBeenCalled();
    });

    it('returns 400 when scholarshipAmount is zero or negative (Req 2.7)', async () => {
        mockValidateSession.mockResolvedValue(coachSession());

        const res = await POST(makeRequest('POST', `http://localhost/api/coach/${COACH_ID}/scholarships`, { ...validPostBody, scholarshipAmount: 0 }), { params });

        expect(res.status).toBe(400);
        expect(mockCreateScholarship).not.toHaveBeenCalled();
    });

    it('returns 400 when requiredGpa is above 4.0 (Req 2.8)', async () => {
        mockValidateSession.mockResolvedValue(coachSession());

        const res = await POST(makeRequest('POST', `http://localhost/api/coach/${COACH_ID}/scholarships`, { ...validPostBody, requiredGpa: 4.5 }), { params });

        expect(res.status).toBe(400);
        expect(mockCreateScholarship).not.toHaveBeenCalled();
    });

    it('returns 400 when requiredGpa is negative (Req 2.8)', async () => {
        mockValidateSession.mockResolvedValue(coachSession());

        const res = await POST(makeRequest('POST', `http://localhost/api/coach/${COACH_ID}/scholarships`, { ...validPostBody, requiredGpa: -1 }), { params });

        expect(res.status).toBe(400);
        expect(mockCreateScholarship).not.toHaveBeenCalled();
    });

    it('returns 500 on database error', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockCreateScholarship.mockRejectedValue(new Error('connection refused'));

        const res = await POST(makeRequest('POST', `http://localhost/api/coach/${COACH_ID}/scholarships`, validPostBody), { params });
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.success).toBe(false);
    });
});

// ─── GET /api/coach/[coachId]/scholarships/[playerId] ─────────────────────────

describe('GET /api/coach/[coachId]/scholarships/[playerId]', () => {
    const params = Promise.resolve({ coachId: COACH_ID, playerId: PLAYER_ID });

    it('returns 200 with the scholarship (Req 10.3)', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockGetScholarshipByCoachAndPlayer.mockResolvedValue(mockScholarship);

        const res = await getByPlayer(makeRequest('GET', `http://localhost/api/coach/${COACH_ID}/scholarships/${PLAYER_ID}`), { params });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toMatchObject({ id: mockScholarship.id });
        expect(mockGetScholarshipByCoachAndPlayer).toHaveBeenCalledWith(COACH_ID, PLAYER_ID);
    });

    it('returns 404 when scholarship not found', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockGetScholarshipByCoachAndPlayer.mockResolvedValue(null);

        const res = await getByPlayer(makeRequest('GET', `http://localhost/api/coach/${COACH_ID}/scholarships/${PLAYER_ID}`), { params });
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.success).toBe(false);
    });

    it('returns 401 without a valid session (Req 10.7)', async () => {
        mockValidateSession.mockResolvedValue(noSession);

        const res = await getByPlayer(makeRequest('GET', `http://localhost/api/coach/${COACH_ID}/scholarships/${PLAYER_ID}`), { params });

        expect(res.status).toBe(401);
        expect(mockGetScholarshipByCoachAndPlayer).not.toHaveBeenCalled();
    });

    it('returns 403 when session belongs to a different coach (Req 10.8)', async () => {
        mockValidateSession.mockResolvedValue(coachSession(OTHER_COACH_ID));

        const res = await getByPlayer(makeRequest('GET', `http://localhost/api/coach/${COACH_ID}/scholarships/${PLAYER_ID}`), { params });

        expect(res.status).toBe(403);
        expect(mockGetScholarshipByCoachAndPlayer).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid playerId format', async () => {
        mockValidateSession.mockResolvedValue(coachSession());

        const res = await getByPlayer(
            makeRequest('GET', `http://localhost/api/coach/${COACH_ID}/scholarships/not-a-uuid`),
            { params: Promise.resolve({ coachId: COACH_ID, playerId: 'not-a-uuid' }) }
        );

        expect(res.status).toBe(400);
        expect(mockGetScholarshipByCoachAndPlayer).not.toHaveBeenCalled();
    });
});

// ─── PATCH /api/coach/[coachId]/scholarships/[playerId] ──────────────────────

describe('PATCH /api/coach/[coachId]/scholarships/[playerId]', () => {
    const params = Promise.resolve({ coachId: COACH_ID, playerId: PLAYER_ID });
    const patchBody = { scholarshipAmount: 20000, notes: 'Updated terms' };

    it('updates the scholarship and returns 200 (Req 10.4)', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockGetScholarshipByCoachAndPlayer.mockResolvedValue(mockScholarship);
        mockUpdateScholarship.mockResolvedValue({ ...mockScholarship, scholarshipAmount: 20000, status: 'pending' });

        const res = await PATCH(makeRequest('PATCH', `http://localhost/api/coach/${COACH_ID}/scholarships/${PLAYER_ID}`, patchBody), { params });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data.scholarshipAmount).toBe(20000);
        expect(mockUpdateScholarship).toHaveBeenCalledWith(
            mockScholarship.id,
            expect.objectContaining({ scholarshipAmount: 20000, status: 'pending' })
        );
    });

    it('returns 404 when scholarship not found', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockGetScholarshipByCoachAndPlayer.mockResolvedValue(null);

        const res = await PATCH(makeRequest('PATCH', `http://localhost/api/coach/${COACH_ID}/scholarships/${PLAYER_ID}`, patchBody), { params });
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.success).toBe(false);
        expect(mockUpdateScholarship).not.toHaveBeenCalled();
    });

    it('returns 401 without a valid session (Req 10.7)', async () => {
        mockValidateSession.mockResolvedValue(noSession);

        const res = await PATCH(makeRequest('PATCH', `http://localhost/api/coach/${COACH_ID}/scholarships/${PLAYER_ID}`, patchBody), { params });

        expect(res.status).toBe(401);
        expect(mockUpdateScholarship).not.toHaveBeenCalled();
    });

    it('returns 403 when session belongs to a different coach (Req 10.8)', async () => {
        mockValidateSession.mockResolvedValue(coachSession(OTHER_COACH_ID));

        const res = await PATCH(makeRequest('PATCH', `http://localhost/api/coach/${COACH_ID}/scholarships/${PLAYER_ID}`, patchBody), { params });

        expect(res.status).toBe(403);
        expect(mockUpdateScholarship).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid playerId format', async () => {
        mockValidateSession.mockResolvedValue(coachSession());

        const res = await PATCH(
            makeRequest('PATCH', `http://localhost/api/coach/${COACH_ID}/scholarships/not-a-uuid`, patchBody),
            { params: Promise.resolve({ coachId: COACH_ID, playerId: 'not-a-uuid' }) }
        );

        expect(res.status).toBe(400);
        expect(mockUpdateScholarship).not.toHaveBeenCalled();
    });

    it('returns 400 when scholarshipAmount is zero or negative (Req 2.7)', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockGetScholarshipByCoachAndPlayer.mockResolvedValue(mockScholarship);

        const res = await PATCH(makeRequest('PATCH', `http://localhost/api/coach/${COACH_ID}/scholarships/${PLAYER_ID}`, { scholarshipAmount: -100 }), { params });

        expect(res.status).toBe(400);
        expect(mockUpdateScholarship).not.toHaveBeenCalled();
    });

    it('returns 400 when requiredGpa is out of range (Req 2.8)', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockGetScholarshipByCoachAndPlayer.mockResolvedValue(mockScholarship);

        const res = await PATCH(makeRequest('PATCH', `http://localhost/api/coach/${COACH_ID}/scholarships/${PLAYER_ID}`, { requiredGpa: 5.0 }), { params });

        expect(res.status).toBe(400);
        expect(mockUpdateScholarship).not.toHaveBeenCalled();
    });

    it('returns 500 on database error', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockGetScholarshipByCoachAndPlayer.mockResolvedValue(mockScholarship);
        mockUpdateScholarship.mockRejectedValue(new Error('connection refused'));

        const res = await PATCH(makeRequest('PATCH', `http://localhost/api/coach/${COACH_ID}/scholarships/${PLAYER_ID}`, patchBody), { params });
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.success).toBe(false);
    });
});
