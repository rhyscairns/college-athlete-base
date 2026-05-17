/**
 * @jest-environment node
 *
 * Integration tests for GET /api/coach/[coachId]/earnings
 *
 * Requirements covered: 6.1, 6.2, 6.3, 6.4, 6.6
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/coach/[coachId]/earnings/route';
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

const COACH_ID = '123e4567-e89b-12d3-a456-426614174000';
const OTHER_COACH_ID = '987e6543-e21b-12d3-a456-426614174999';
const PLAYER_ID = 'aabbccdd-e89b-12d3-a456-426614174000';
const PROMO_CODE = 'COACH123';

function makeRequest(coachId: string): NextRequest {
    return new NextRequest(`http://localhost/api/coach/${coachId}/earnings`, {
        method: 'GET',
        headers: { Cookie: 'session=mock-token' },
    });
}

function makeParams(coachId: string) {
    return { params: Promise.resolve({ coachId }) };
}

function coachSession(id = COACH_ID) {
    return { isValid: true as const, playerId: id, type: 'coach' as const, email: 'coach@test.com' };
}

function playerSession(id = PLAYER_ID) {
    return { isValid: true as const, playerId: id, type: 'player' as const, email: 'player@test.com' };
}

const noSession = { isValid: false as const, error: 'No session token found' };

const mockTier1Players = [
    {
        playerId: PLAYER_ID,
        firstName: 'Jane',
        lastName: 'Doe',
        subscriptionStatus: 'active' as const,
        subscriptionPlan: 'standard' as const,
        monthlyContribution: 1.0,
        joinedAt: '2025-01-15T00:00:00Z',
    },
];

const mockTier1Coaches = [
    {
        coachId: OTHER_COACH_ID,
        firstName: 'Bob',
        lastName: 'Smith',
        joinedAt: '2025-01-10T00:00:00Z',
        directPlayerReferrals: 3,
        directCoachReferrals: 1,
    },
];

const mockTier2 = { playerCount: 5, activePlayerCount: 3, monthlyEarnings: 1.5 };
const mockTier3 = { playerCount: 2, activePlayerCount: 1, monthlyEarnings: 0.25 };
const mockMonthlySeries = [
    { month: '2025-01', tier1Players: 1, tier2Players: 2, tier3Players: 0, earnings: 2.0 },
];

function setupHappyPath() {
    mockValidateSession.mockResolvedValue(coachSession());
    mockQuery.mockResolvedValue([{ promo_code: PROMO_CODE }]);
    mockGetTier1Players.mockResolvedValue(mockTier1Players);
    mockGetTier1Coaches.mockResolvedValue(mockTier1Coaches);
    mockGetTier2Summary.mockResolvedValue(mockTier2);
    mockGetTier3Summary.mockResolvedValue(mockTier3);
    mockGetMonthlySeries.mockResolvedValue(mockMonthlySeries);
}

beforeEach(() => jest.clearAllMocks());

// ─── Happy path ───────────────────────────────────────────────────────────────

describe('GET /api/coach/[coachId]/earnings — success', () => {
    it('returns 200 with full EarningsData shape (Req 6.1, 6.2, 6.3, 6.4)', async () => {
        setupHappyPath();

        const res = await GET(makeRequest(COACH_ID), makeParams(COACH_ID));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toMatchObject({
            tier1Players: expect.any(Array),
            tier1Coaches: expect.any(Array),
            tier2: expect.objectContaining({ playerCount: 5, monthlyEarnings: 1.5 }),
            tier3: expect.objectContaining({ playerCount: 2, monthlyEarnings: 0.25 }),
            totalMonthlyEarnings: expect.any(Number),
            monthlySeries: expect.any(Array),
        });
    });

    it('returns tier-1 players with correct fields (Req 6.1)', async () => {
        setupHappyPath();

        const res = await GET(makeRequest(COACH_ID), makeParams(COACH_ID));
        const body = await res.json();

        expect(body.data.tier1Players).toHaveLength(1);
        expect(body.data.tier1Players[0]).toMatchObject({
            playerId: PLAYER_ID,
            firstName: 'Jane',
            subscriptionStatus: 'active',
            monthlyContribution: 1.0,
        });
    });

    it('returns tier-1 coaches with referral counts (Req 6.2)', async () => {
        setupHappyPath();

        const res = await GET(makeRequest(COACH_ID), makeParams(COACH_ID));
        const body = await res.json();

        expect(body.data.tier1Coaches).toHaveLength(1);
        expect(body.data.tier1Coaches[0]).toMatchObject({
            coachId: OTHER_COACH_ID,
            directPlayerReferrals: 3,
            directCoachReferrals: 1,
        });
    });

    it('calculates totalMonthlyEarnings correctly (Req 6.3)', async () => {
        setupHappyPath();

        const res = await GET(makeRequest(COACH_ID), makeParams(COACH_ID));
        const body = await res.json();

        // tier1 active player: $1.00 + tier2: $1.50 + tier3: $0.25 = $2.75
        expect(body.data.totalMonthlyEarnings).toBeCloseTo(2.75);
    });

    it('returns monthly series for chart rendering (Req 6.4)', async () => {
        setupHappyPath();

        const res = await GET(makeRequest(COACH_ID), makeParams(COACH_ID));
        const body = await res.json();

        expect(body.data.monthlySeries).toHaveLength(1);
        expect(body.data.monthlySeries[0]).toMatchObject({ month: '2025-01', earnings: 2.0 });
    });

    it('calls DB helpers with the coach promo code', async () => {
        setupHappyPath();

        await GET(makeRequest(COACH_ID), makeParams(COACH_ID));

        expect(mockGetTier1Players).toHaveBeenCalledWith(PROMO_CODE);
        expect(mockGetTier1Coaches).toHaveBeenCalledWith(PROMO_CODE);
        expect(mockGetTier2Summary).toHaveBeenCalledWith(PROMO_CODE);
        expect(mockGetTier3Summary).toHaveBeenCalledWith(PROMO_CODE);
        expect(mockGetMonthlySeries).toHaveBeenCalledWith(PROMO_CODE);
    });

    it('returns empty earnings when coach has no promo code', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockQuery.mockResolvedValue([{ promo_code: null }]);

        const res = await GET(makeRequest(COACH_ID), makeParams(COACH_ID));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.data.tier1Players).toEqual([]);
        expect(body.data.totalMonthlyEarnings).toBe(0);
        expect(mockGetTier1Players).not.toHaveBeenCalled();
    });

    it('returns $0 contribution for inactive players (Req 6.5)', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockQuery.mockResolvedValue([{ promo_code: PROMO_CODE }]);
        mockGetTier1Players.mockResolvedValue([
            { ...mockTier1Players[0], subscriptionStatus: 'inactive', monthlyContribution: 0 },
        ]);
        mockGetTier1Coaches.mockResolvedValue([]);
        mockGetTier2Summary.mockResolvedValue({ playerCount: 0, activePlayerCount: 0, monthlyEarnings: 0 });
        mockGetTier3Summary.mockResolvedValue({ playerCount: 0, activePlayerCount: 0, monthlyEarnings: 0 });
        mockGetMonthlySeries.mockResolvedValue([]);

        const res = await GET(makeRequest(COACH_ID), makeParams(COACH_ID));
        const body = await res.json();

        expect(body.data.tier1Players[0].monthlyContribution).toBe(0);
        expect(body.data.totalMonthlyEarnings).toBe(0);
    });
});

// ─── Authentication & authorization (Req 6.6) ────────────────────────────────

describe('GET /api/coach/[coachId]/earnings — auth', () => {
    it('returns 401 without a valid session (Req 6.6)', async () => {
        mockValidateSession.mockResolvedValue(noSession);

        const res = await GET(makeRequest(COACH_ID), makeParams(COACH_ID));
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body.success).toBe(false);
        expect(mockQuery).not.toHaveBeenCalled();
    });

    it('returns 403 when session belongs to a different coach (Req 6.6)', async () => {
        mockValidateSession.mockResolvedValue(coachSession(OTHER_COACH_ID));

        const res = await GET(makeRequest(COACH_ID), makeParams(COACH_ID));
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.success).toBe(false);
        expect(mockQuery).not.toHaveBeenCalled();
    });

    it('returns 403 when a player session is used (Req 6.6)', async () => {
        mockValidateSession.mockResolvedValue(playerSession(COACH_ID));

        const res = await GET(makeRequest(COACH_ID), makeParams(COACH_ID));
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.success).toBe(false);
        expect(mockQuery).not.toHaveBeenCalled();
    });
});

// ─── Validation ───────────────────────────────────────────────────────────────

describe('GET /api/coach/[coachId]/earnings — validation', () => {
    it('returns 400 for an invalid coachId', async () => {
        const res = await GET(makeRequest('not-a-uuid'), makeParams('not-a-uuid'));
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.success).toBe(false);
        expect(mockValidateSession).not.toHaveBeenCalled();
    });

    it('returns 400 for an empty coachId', async () => {
        const res = await GET(makeRequest(''), makeParams(''));

        expect(res.status).toBe(400);
    });
});

// ─── Not found ────────────────────────────────────────────────────────────────

describe('GET /api/coach/[coachId]/earnings — not found', () => {
    it('returns 404 when coach does not exist', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockQuery.mockResolvedValue([]);

        const res = await GET(makeRequest(COACH_ID), makeParams(COACH_ID));
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.success).toBe(false);
        expect(body.error).toBe('Coach not found');
    });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe('GET /api/coach/[coachId]/earnings — error handling', () => {
    it('returns 500 when promo code query throws', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockQuery.mockRejectedValue(new Error('connection refused'));

        const res = await GET(makeRequest(COACH_ID), makeParams(COACH_ID));
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.success).toBe(false);
        expect(body.error).toBe('Failed to fetch earnings');
    });

    it('returns 500 when a DB helper throws', async () => {
        mockValidateSession.mockResolvedValue(coachSession());
        mockQuery.mockResolvedValue([{ promo_code: PROMO_CODE }]);
        mockGetTier1Players.mockRejectedValue(new Error('DB error'));
        mockGetTier1Coaches.mockResolvedValue([]);
        mockGetTier2Summary.mockResolvedValue(mockTier2);
        mockGetTier3Summary.mockResolvedValue(mockTier3);
        mockGetMonthlySeries.mockResolvedValue([]);

        const res = await GET(makeRequest(COACH_ID), makeParams(COACH_ID));
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.success).toBe(false);
    });
});
