/**
 * @jest-environment node
 *
 * Integration tests for GET /api/player/[playerId]/earnings
 *
 * Requirements covered: 6.1, 6.2, 6.3, 6.4, 6.6
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/player/[playerId]/earnings/route';
import { query } from '@/authentication/db/client';
import { validateSession } from '@/authentication/middleware/session';
import {
    getTier1Players,
    getTier1Coaches,
    getTier2Summary,
    getTier3Summary,
    getMonthlySeries,
} from '@/earnings/db/earnings';

jest.mock('@/authentication/db/client');
jest.mock('@/authentication/middleware/session');
jest.mock('@/earnings/db/earnings');
jest.mock('@/lib/logger');

const mockQuery = query as jest.MockedFunction<typeof query>;
const mockValidateSession = validateSession as jest.MockedFunction<typeof validateSession>;
const mockGetTier1Players = getTier1Players as jest.MockedFunction<typeof getTier1Players>;
const mockGetTier1Coaches = getTier1Coaches as jest.MockedFunction<typeof getTier1Coaches>;
const mockGetTier2Summary = getTier2Summary as jest.MockedFunction<typeof getTier2Summary>;
const mockGetTier3Summary = getTier3Summary as jest.MockedFunction<typeof getTier3Summary>;
const mockGetMonthlySeries = getMonthlySeries as jest.MockedFunction<typeof getMonthlySeries>;

const PLAYER_ID = 'aabbccdd-e89b-12d3-a456-426614174000';
const OTHER_PLAYER_ID = 'bbccddee-e89b-12d3-a456-426614174001';
const COACH_ID = '123e4567-e89b-12d3-a456-426614174000';
const PROMO_CODE = 'PLAYER123';

function makeRequest(playerId: string): NextRequest {
    return new NextRequest(`http://localhost/api/player/${playerId}/earnings`, {
        method: 'GET',
        headers: { Cookie: 'session=mock-token' },
    });
}

function makeParams(playerId: string) {
    return { params: Promise.resolve({ playerId }) };
}

function playerSession(id = PLAYER_ID) {
    return { isValid: true as const, playerId: id, type: 'player' as const, email: 'player@test.com' };
}

function coachSession(id = COACH_ID) {
    return { isValid: true as const, playerId: id, type: 'coach' as const, email: 'coach@test.com' };
}

const noSession = { isValid: false as const, error: 'No session token found' };

const mockTier1Players = [
    {
        playerId: OTHER_PLAYER_ID,
        firstName: 'Alice',
        lastName: 'Jones',
        subscriptionStatus: 'active' as const,
        subscriptionPlan: 'promo_599' as const,
        monthlyContribution: 1.0,
        joinedAt: '2025-02-01T00:00:00Z',
    },
];

const mockTier1Coaches = [
    {
        coachId: COACH_ID,
        firstName: 'Tom',
        lastName: 'Brown',
        joinedAt: '2025-01-20T00:00:00Z',
        directPlayerReferrals: 2,
        directCoachReferrals: 0,
    },
];

const mockTier2 = { playerCount: 3, activePlayerCount: 2, monthlyEarnings: 1.0 };
const mockTier3 = { playerCount: 1, activePlayerCount: 1, monthlyEarnings: 0.25 };
const mockMonthlySeries = [
    { month: '2025-02', tier1Players: 1, tier2Players: 1, tier3Players: 0, earnings: 1.5 },
];

function setupHappyPath() {
    mockValidateSession.mockResolvedValue(playerSession());
    mockQuery.mockResolvedValue([{ promo_code: PROMO_CODE }]);
    mockGetTier1Players.mockResolvedValue(mockTier1Players);
    mockGetTier1Coaches.mockResolvedValue(mockTier1Coaches);
    mockGetTier2Summary.mockResolvedValue(mockTier2);
    mockGetTier3Summary.mockResolvedValue(mockTier3);
    mockGetMonthlySeries.mockResolvedValue(mockMonthlySeries);
}

beforeEach(() => jest.clearAllMocks());

// ─── Happy path ───────────────────────────────────────────────────────────────

describe('GET /api/player/[playerId]/earnings — success', () => {
    it('returns 200 with full EarningsData shape (Req 6.1, 6.2, 6.3, 6.4)', async () => {
        setupHappyPath();

        const res = await GET(makeRequest(PLAYER_ID), makeParams(PLAYER_ID));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toMatchObject({
            tier1Players: expect.any(Array),
            tier1Coaches: expect.any(Array),
            tier2: expect.objectContaining({ playerCount: 3, monthlyEarnings: 1.0 }),
            tier3: expect.objectContaining({ playerCount: 1, monthlyEarnings: 0.25 }),
            totalMonthlyEarnings: expect.any(Number),
            monthlySeries: expect.any(Array),
        });
    });

    it('returns tier-1 players with correct fields (Req 6.1)', async () => {
        setupHappyPath();

        const res = await GET(makeRequest(PLAYER_ID), makeParams(PLAYER_ID));
        const body = await res.json();

        expect(body.data.tier1Players).toHaveLength(1);
        expect(body.data.tier1Players[0]).toMatchObject({
            playerId: OTHER_PLAYER_ID,
            firstName: 'Alice',
            subscriptionStatus: 'active',
            monthlyContribution: 1.0,
        });
    });

    it('returns tier-1 coaches with referral counts (Req 6.2)', async () => {
        setupHappyPath();

        const res = await GET(makeRequest(PLAYER_ID), makeParams(PLAYER_ID));
        const body = await res.json();

        expect(body.data.tier1Coaches).toHaveLength(1);
        expect(body.data.tier1Coaches[0]).toMatchObject({
            coachId: COACH_ID,
            directPlayerReferrals: 2,
            directCoachReferrals: 0,
        });
    });

    it('calculates totalMonthlyEarnings correctly (Req 6.3)', async () => {
        setupHappyPath();

        const res = await GET(makeRequest(PLAYER_ID), makeParams(PLAYER_ID));
        const body = await res.json();

        // tier1 active player: $1.00 + tier2: $1.00 + tier3: $0.25 = $2.25
        expect(body.data.totalMonthlyEarnings).toBeCloseTo(2.25);
    });

    it('returns monthly series for chart rendering (Req 6.4)', async () => {
        setupHappyPath();

        const res = await GET(makeRequest(PLAYER_ID), makeParams(PLAYER_ID));
        const body = await res.json();

        expect(body.data.monthlySeries).toHaveLength(1);
        expect(body.data.monthlySeries[0]).toMatchObject({ month: '2025-02', earnings: 1.5 });
    });

    it('calls DB helpers with the player promo code', async () => {
        setupHappyPath();

        await GET(makeRequest(PLAYER_ID), makeParams(PLAYER_ID));

        expect(mockGetTier1Players).toHaveBeenCalledWith(PROMO_CODE);
        expect(mockGetTier1Coaches).toHaveBeenCalledWith(PROMO_CODE);
        expect(mockGetTier2Summary).toHaveBeenCalledWith(PROMO_CODE);
        expect(mockGetTier3Summary).toHaveBeenCalledWith(PROMO_CODE);
        expect(mockGetMonthlySeries).toHaveBeenCalledWith(PROMO_CODE);
    });

    it('returns empty earnings when player has no promo code', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockQuery.mockResolvedValue([{ promo_code: null }]);

        const res = await GET(makeRequest(PLAYER_ID), makeParams(PLAYER_ID));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.data.tier1Players).toEqual([]);
        expect(body.data.totalMonthlyEarnings).toBe(0);
        expect(mockGetTier1Players).not.toHaveBeenCalled();
    });

    it('returns $0 contribution for inactive players (Req 6.5)', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockQuery.mockResolvedValue([{ promo_code: PROMO_CODE }]);
        mockGetTier1Players.mockResolvedValue([
            { ...mockTier1Players[0], subscriptionStatus: 'inactive', monthlyContribution: 0 },
        ]);
        mockGetTier1Coaches.mockResolvedValue([]);
        mockGetTier2Summary.mockResolvedValue({ playerCount: 0, activePlayerCount: 0, monthlyEarnings: 0 });
        mockGetTier3Summary.mockResolvedValue({ playerCount: 0, activePlayerCount: 0, monthlyEarnings: 0 });
        mockGetMonthlySeries.mockResolvedValue([]);

        const res = await GET(makeRequest(PLAYER_ID), makeParams(PLAYER_ID));
        const body = await res.json();

        expect(body.data.tier1Players[0].monthlyContribution).toBe(0);
        expect(body.data.totalMonthlyEarnings).toBe(0);
    });
});

// ─── Authentication & authorization (Req 6.6) ────────────────────────────────

describe('GET /api/player/[playerId]/earnings — auth', () => {
    it('returns 401 without a valid session (Req 6.6)', async () => {
        mockValidateSession.mockResolvedValue(noSession);

        const res = await GET(makeRequest(PLAYER_ID), makeParams(PLAYER_ID));
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body.success).toBe(false);
        expect(mockQuery).not.toHaveBeenCalled();
    });

    it('returns 403 when session belongs to a different player (Req 6.6)', async () => {
        mockValidateSession.mockResolvedValue(playerSession(OTHER_PLAYER_ID));

        const res = await GET(makeRequest(PLAYER_ID), makeParams(PLAYER_ID));
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.success).toBe(false);
        expect(mockQuery).not.toHaveBeenCalled();
    });

    it('returns 403 when a coach session is used (Req 6.6)', async () => {
        mockValidateSession.mockResolvedValue(coachSession(PLAYER_ID));

        const res = await GET(makeRequest(PLAYER_ID), makeParams(PLAYER_ID));
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.success).toBe(false);
        expect(mockQuery).not.toHaveBeenCalled();
    });
});

// ─── Validation ───────────────────────────────────────────────────────────────

describe('GET /api/player/[playerId]/earnings — validation', () => {
    it('returns 400 for an invalid playerId', async () => {
        const res = await GET(makeRequest('not-a-uuid'), makeParams('not-a-uuid'));
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.success).toBe(false);
        expect(mockValidateSession).not.toHaveBeenCalled();
    });

    it('returns 400 for an empty playerId', async () => {
        const res = await GET(makeRequest(''), makeParams(''));

        expect(res.status).toBe(400);
    });
});

// ─── Not found ────────────────────────────────────────────────────────────────

describe('GET /api/player/[playerId]/earnings — not found', () => {
    it('returns 404 when player does not exist', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockQuery.mockResolvedValue([]);

        const res = await GET(makeRequest(PLAYER_ID), makeParams(PLAYER_ID));
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.success).toBe(false);
        expect(body.error).toBe('Player not found');
    });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe('GET /api/player/[playerId]/earnings — error handling', () => {
    it('returns 500 when promo code query throws', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockQuery.mockRejectedValue(new Error('connection refused'));

        const res = await GET(makeRequest(PLAYER_ID), makeParams(PLAYER_ID));
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.success).toBe(false);
        expect(body.error).toBe('Failed to fetch earnings');
    });

    it('returns 500 when a DB helper throws', async () => {
        mockValidateSession.mockResolvedValue(playerSession());
        mockQuery.mockResolvedValue([{ promo_code: PROMO_CODE }]);
        mockGetTier1Players.mockRejectedValue(new Error('DB error'));
        mockGetTier1Coaches.mockResolvedValue([]);
        mockGetTier2Summary.mockResolvedValue(mockTier2);
        mockGetTier3Summary.mockResolvedValue(mockTier3);
        mockGetMonthlySeries.mockResolvedValue([]);

        const res = await GET(makeRequest(PLAYER_ID), makeParams(PLAYER_ID));
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.success).toBe(false);
    });
});
