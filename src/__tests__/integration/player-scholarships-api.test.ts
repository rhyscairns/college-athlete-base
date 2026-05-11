/**
 * @jest-environment node
 *
 * Integration tests for player scholarships API endpoints
 * Tests GET /api/player/[playerId]/scholarships
 * Tests GET and PATCH /api/player/[playerId]/scholarships/[coachId]
 *
 * Requirements covered: 10.5, 10.6, 10.7
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/player/[playerId]/scholarships/route';
import {
    GET as getByCoach,
    PATCH,
} from '@/app/api/player/[playerId]/scholarships/[coachId]/route';
import {
    getScholarshipsByPlayer,
    getScholarshipByCoachAndPlayer,
    updateScholarship,
} from '@/scholarships/db/queries';
import { validateSession } from '@/authentication/middleware/session';

jest.mock('@/scholarships/db/queries');
jest.mock('@/authentication/middleware/session');
jest.mock('@/lib/logger');

const mockGetScholarshipsByPlayer = getScholarshipsByPlayer as jest.MockedFunction<typeof getScholarshipsByPlayer>;
const mockGetScholarshipByCoachAndPlayer = getScholarshipByCoachAndPlayer as jest.MockedFunction<typeof getScholarshipByCoachAndPlayer>;
const mockUpdateScholarship = updateScholarship as jest.MockedFunction<typeof updateScholarship>;
const mockValidateSession = validateSession as jest.MockedFunction<typeof validateSession>;

const PLAYER_ID = 'aabbccdd-e89b-12d3-a456-426614174000';
const OTHER_PLAYER_ID = 'bbbbbbbb-e89b-12d3-a456-426614174001';
const COACH_ID = '123e4567-e89b-12d3-a456-426614174000';

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

function makeRequest(method: string, url: string, body?: unknown): NextRequest {
    return new NextRequest(url, {
        method,
        headers: { 'Content-Type': 'application/json', Cookie: 'session=mock-token' },
        body: body ? JSON.stringify(body) : undefined,
    });
}

function playerSession(id = PLAYER_ID) {
    return { isValid: true as const, playerId: id, type: 'player' as const, email: 'player@test.com' };
}

function coachSession(id = COACH_ID) {
    return { isValid: true as const, playerId: id, type: 'coach' as const, email: 'coach@test.com' };
}

const noSession = { isValid: false as const, error: 'No session token found' };

beforeEach(() => {
    jest.clearAllMocks();
});

// ─── GET /api/player/[playerId]/scholarships ──────────────────────────────────

describe('GET /api/player/[playerId]/scholarships', () => {
    const params = Promise.resolve({ playerId: PLAYER_ID });

    it('returns 200 with scholarship offers list (Req 10.5)', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockGetScholarshipsByPlayer.mockResolvedValue([mockScholarship]);

        const res = await GET(makeRequest('GET', `http://localhost/api/player/${PLAYER_ID}/scholarships`), { params });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toHaveLength(1);
        expect(body.data[0]).toMatchObject({ id: mockScholarship.id, schoolName: 'State University' });
        expect(mockGetScholarshipsByPlayer).toHaveBeenCalledWith(PLAYER_ID);
    });

    it('returns 200 with empty array when no offers exist (Req 10.5)', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockGetScholarshipsByPlayer.mockResolvedValue([]);

        const res = await GET(makeRequest('GET', `http://localhost/api/player/${PLAYER_ID}/scholarships`), { params });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toEqual([]);
    });

    it('returns 401 without a valid session (Req 10.7)', async () => {
        mockValidateSession.mockResolvedValue(noSession);

        const res = await GET(makeRequest('GET', `http://localhost/api/player/${PLAYER_ID}/scholarships`), { params });
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body.success).toBe(false);
        expect(mockGetScholarshipsByPlayer).not.toHaveBeenCalled();
    });

    it('returns 403 when session belongs to a different player', async () => {
        mockValidateSession.mockResolvedValue(playerSession(OTHER_PLAYER_ID));

        const res = await GET(makeRequest('GET', `http://localhost/api/player/${PLAYER_ID}/scholarships`), { params });
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.success).toBe(false);
        expect(mockGetScholarshipsByPlayer).not.toHaveBeenCalled();
    });

    it('returns 403 when a coach session is used', async () => {
        mockValidateSession.mockResolvedValue(coachSession(PLAYER_ID));

        const res = await GET(makeRequest('GET', `http://localhost/api/player/${PLAYER_ID}/scholarships`), { params });

        expect(res.status).toBe(403);
        expect(mockGetScholarshipsByPlayer).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid playerId format', async () => {
        const res = await GET(
            makeRequest('GET', 'http://localhost/api/player/not-a-uuid/scholarships'),
            { params: Promise.resolve({ playerId: 'not-a-uuid' }) }
        );

        expect(res.status).toBe(400);
        expect(mockGetScholarshipsByPlayer).not.toHaveBeenCalled();
    });

    it('returns 500 on database error', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockGetScholarshipsByPlayer.mockRejectedValue(new Error('connection refused'));

        const res = await GET(makeRequest('GET', `http://localhost/api/player/${PLAYER_ID}/scholarships`), { params });
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.success).toBe(false);
    });
});

// ─── GET /api/player/[playerId]/scholarships/[coachId] ────────────────────────

describe('GET /api/player/[playerId]/scholarships/[coachId]', () => {
    const params = Promise.resolve({ playerId: PLAYER_ID, coachId: COACH_ID });

    it('returns 200 with the scholarship offer (Req 10.6)', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockGetScholarshipByCoachAndPlayer.mockResolvedValue(mockScholarship);

        const res = await getByCoach(makeRequest('GET', `http://localhost/api/player/${PLAYER_ID}/scholarships/${COACH_ID}`), { params });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toMatchObject({ id: mockScholarship.id });
        expect(mockGetScholarshipByCoachAndPlayer).toHaveBeenCalledWith(COACH_ID, PLAYER_ID);
    });

    it('returns 404 when scholarship not found', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockGetScholarshipByCoachAndPlayer.mockResolvedValue(null);

        const res = await getByCoach(makeRequest('GET', `http://localhost/api/player/${PLAYER_ID}/scholarships/${COACH_ID}`), { params });
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.success).toBe(false);
    });

    it('returns 401 without a valid session (Req 10.7)', async () => {
        mockValidateSession.mockResolvedValue(noSession);

        const res = await getByCoach(makeRequest('GET', `http://localhost/api/player/${PLAYER_ID}/scholarships/${COACH_ID}`), { params });

        expect(res.status).toBe(401);
        expect(mockGetScholarshipByCoachAndPlayer).not.toHaveBeenCalled();
    });

    it('returns 403 when session belongs to a different player', async () => {
        mockValidateSession.mockResolvedValue(playerSession(OTHER_PLAYER_ID));

        const res = await getByCoach(makeRequest('GET', `http://localhost/api/player/${PLAYER_ID}/scholarships/${COACH_ID}`), { params });

        expect(res.status).toBe(403);
        expect(mockGetScholarshipByCoachAndPlayer).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid coachId format', async () => {
        mockValidateSession.mockResolvedValue(playerSession());

        const res = await getByCoach(
            makeRequest('GET', `http://localhost/api/player/${PLAYER_ID}/scholarships/not-a-uuid`),
            { params: Promise.resolve({ playerId: PLAYER_ID, coachId: 'not-a-uuid' }) }
        );

        expect(res.status).toBe(400);
        expect(mockGetScholarshipByCoachAndPlayer).not.toHaveBeenCalled();
    });
});

// ─── PATCH /api/player/[playerId]/scholarships/[coachId] — accept ─────────────

describe('PATCH /api/player/[playerId]/scholarships/[coachId] — accept', () => {
    const params = Promise.resolve({ playerId: PLAYER_ID, coachId: COACH_ID });

    it('accepts a pending offer and returns 200 (Req 10.6)', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockGetScholarshipByCoachAndPlayer.mockResolvedValue(mockScholarship);
        mockUpdateScholarship.mockResolvedValue({ ...mockScholarship, status: 'accepted' });

        const res = await PATCH(makeRequest('PATCH', `http://localhost/api/player/${PLAYER_ID}/scholarships/${COACH_ID}`, { status: 'accepted' }), { params });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data.status).toBe('accepted');
        expect(mockUpdateScholarship).toHaveBeenCalledWith(
            mockScholarship.id,
            expect.objectContaining({ status: 'accepted' })
        );
    });
});

// ─── PATCH /api/player/[playerId]/scholarships/[coachId] — reject ─────────────

describe('PATCH /api/player/[playerId]/scholarships/[coachId] — reject', () => {
    const params = Promise.resolve({ playerId: PLAYER_ID, coachId: COACH_ID });

    it('rejects a pending offer and returns 200 (Req 10.6)', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockGetScholarshipByCoachAndPlayer.mockResolvedValue(mockScholarship);
        mockUpdateScholarship.mockResolvedValue({ ...mockScholarship, status: 'rejected' });

        const res = await PATCH(makeRequest('PATCH', `http://localhost/api/player/${PLAYER_ID}/scholarships/${COACH_ID}`, { status: 'rejected' }), { params });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data.status).toBe('rejected');
    });
});

// ─── PATCH /api/player/[playerId]/scholarships/[coachId] — counter ────────────

describe('PATCH /api/player/[playerId]/scholarships/[coachId] — counter', () => {
    const params = Promise.resolve({ playerId: PLAYER_ID, coachId: COACH_ID });
    const counterBody = {
        status: 'countered',
        counterAmount: 18000,
        counterGpa: 2.8,
        counterNotes: 'Can we increase the amount?',
    };

    it('counters a pending offer and returns 200 (Req 10.6)', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockGetScholarshipByCoachAndPlayer.mockResolvedValue(mockScholarship);
        mockUpdateScholarship.mockResolvedValue({
            ...mockScholarship,
            status: 'countered',
            counterAmount: 18000,
            counterGpa: 2.8,
            counterNotes: 'Can we increase the amount?',
        });

        const res = await PATCH(makeRequest('PATCH', `http://localhost/api/player/${PLAYER_ID}/scholarships/${COACH_ID}`, counterBody), { params });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data.status).toBe('countered');
        expect(mockUpdateScholarship).toHaveBeenCalledWith(
            mockScholarship.id,
            expect.objectContaining({
                status: 'countered',
                counterAmount: 18000,
                counterGpa: 2.8,
                counterNotes: 'Can we increase the amount?',
            })
        );
    });

    it('returns 400 when counter amount is negative', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockGetScholarshipByCoachAndPlayer.mockResolvedValue(mockScholarship);

        const res = await PATCH(makeRequest('PATCH', `http://localhost/api/player/${PLAYER_ID}/scholarships/${COACH_ID}`, { status: 'countered', counterAmount: -500 }), { params });

        expect(res.status).toBe(400);
        expect(mockUpdateScholarship).not.toHaveBeenCalled();
    });

    it('returns 400 when counter GPA is out of range', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockGetScholarshipByCoachAndPlayer.mockResolvedValue(mockScholarship);

        const res = await PATCH(makeRequest('PATCH', `http://localhost/api/player/${PLAYER_ID}/scholarships/${COACH_ID}`, { status: 'countered', counterGpa: 5.0 }), { params });

        expect(res.status).toBe(400);
        expect(mockUpdateScholarship).not.toHaveBeenCalled();
    });
});

// ─── PATCH — invalid transitions ─────────────────────────────────────────────

describe('PATCH /api/player/[playerId]/scholarships/[coachId] — invalid transitions', () => {
    const params = Promise.resolve({ playerId: PLAYER_ID, coachId: COACH_ID });

    it('returns 400 when trying to accept an already-accepted offer', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockGetScholarshipByCoachAndPlayer.mockResolvedValue({ ...mockScholarship, status: 'accepted' });

        const res = await PATCH(makeRequest('PATCH', `http://localhost/api/player/${PLAYER_ID}/scholarships/${COACH_ID}`, { status: 'accepted' }), { params });
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.success).toBe(false);
        expect(body.error).toMatch(/Cannot transition/);
        expect(mockUpdateScholarship).not.toHaveBeenCalled();
    });

    it('returns 400 when trying to counter a rejected offer', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockGetScholarshipByCoachAndPlayer.mockResolvedValue({ ...mockScholarship, status: 'rejected' });

        const res = await PATCH(makeRequest('PATCH', `http://localhost/api/player/${PLAYER_ID}/scholarships/${COACH_ID}`, { status: 'countered' }), { params });
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.success).toBe(false);
        expect(mockUpdateScholarship).not.toHaveBeenCalled();
    });

    it('returns 400 when trying to counter a countered offer', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockGetScholarshipByCoachAndPlayer.mockResolvedValue({ ...mockScholarship, status: 'countered' });

        const res = await PATCH(makeRequest('PATCH', `http://localhost/api/player/${PLAYER_ID}/scholarships/${COACH_ID}`, { status: 'countered' }), { params });

        expect(res.status).toBe(400);
        expect(mockUpdateScholarship).not.toHaveBeenCalled();
    });

    it('returns 400 when status is missing from body', async () => {
        mockValidateSession.mockResolvedValue(playerSession());

        const res = await PATCH(makeRequest('PATCH', `http://localhost/api/player/${PLAYER_ID}/scholarships/${COACH_ID}`, {}), { params });

        expect(res.status).toBe(400);
        expect(mockUpdateScholarship).not.toHaveBeenCalled();
    });

    it('returns 400 when status is an invalid value', async () => {
        mockValidateSession.mockResolvedValue(playerSession());

        const res = await PATCH(makeRequest('PATCH', `http://localhost/api/player/${PLAYER_ID}/scholarships/${COACH_ID}`, { status: 'pending' }), { params });

        expect(res.status).toBe(400);
        expect(mockUpdateScholarship).not.toHaveBeenCalled();
    });
});

// ─── PATCH — auth failures ────────────────────────────────────────────────────

describe('PATCH /api/player/[playerId]/scholarships/[coachId] — auth', () => {
    const params = Promise.resolve({ playerId: PLAYER_ID, coachId: COACH_ID });

    it('returns 401 without a valid session (Req 10.7)', async () => {
        mockValidateSession.mockResolvedValue(noSession);

        const res = await PATCH(makeRequest('PATCH', `http://localhost/api/player/${PLAYER_ID}/scholarships/${COACH_ID}`, { status: 'accepted' }), { params });

        expect(res.status).toBe(401);
        expect(mockUpdateScholarship).not.toHaveBeenCalled();
    });

    it('returns 403 when session belongs to a different player', async () => {
        mockValidateSession.mockResolvedValue(playerSession(OTHER_PLAYER_ID));

        const res = await PATCH(makeRequest('PATCH', `http://localhost/api/player/${PLAYER_ID}/scholarships/${COACH_ID}`, { status: 'accepted' }), { params });

        expect(res.status).toBe(403);
        expect(mockUpdateScholarship).not.toHaveBeenCalled();
    });

    it('returns 404 when scholarship not found', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockGetScholarshipByCoachAndPlayer.mockResolvedValue(null);

        const res = await PATCH(makeRequest('PATCH', `http://localhost/api/player/${PLAYER_ID}/scholarships/${COACH_ID}`, { status: 'accepted' }), { params });
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.success).toBe(false);
        expect(mockUpdateScholarship).not.toHaveBeenCalled();
    });

    it('returns 500 on database error during update', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockGetScholarshipByCoachAndPlayer.mockResolvedValue(mockScholarship);
        mockUpdateScholarship.mockRejectedValue(new Error('connection refused'));

        const res = await PATCH(makeRequest('PATCH', `http://localhost/api/player/${PLAYER_ID}/scholarships/${COACH_ID}`, { status: 'accepted' }), { params });
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.success).toBe(false);
    });
});
