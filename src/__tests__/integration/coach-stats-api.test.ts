/**
 * @jest-environment node
 *
 * Integration tests for GET /api/coach/[coachId]/stats
 *
 * Requirements covered: 7.1, 7.2, 7.3, 7.4
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/coach/[coachId]/stats/route';
import { query } from '@/authentication/db/client';

jest.mock('@/authentication/db/client');
jest.mock('@/lib/logger');

const mockQuery = query as jest.MockedFunction<typeof query>;

const COACH_ID = '123e4567-e89b-12d3-a456-426614174000';

function makeRequest(coachId: string): NextRequest {
    return new NextRequest(`http://localhost/api/coach/${coachId}/stats`, { method: 'GET' });
}

function makeParams(coachId: string) {
    return { params: Promise.resolve({ coachId }) };
}

/** Set up mockQuery to return values in the order the route calls them */
function mockQueryResponses({
    prospectsCount = '5',
    newPlayersToday = '3',
    promoCode = 'PROMO1',
    referrals = [{ type: 'player', count: '2' }, { type: 'coach', count: '1' }],
    scholarshipsOffered = '8',
    scholarshipsAccepted = '3',
}: {
    prospectsCount?: string;
    newPlayersToday?: string;
    promoCode?: string | null;
    referrals?: { type: string; count: string }[];
    scholarshipsOffered?: string;
    scholarshipsAccepted?: string;
} = {}) {
    mockQuery
        .mockResolvedValueOnce([{ count: prospectsCount }])          // prospects
        .mockResolvedValueOnce([{ count: newPlayersToday }])          // new players today
        .mockResolvedValueOnce([{ promo_code: promoCode }])           // promo code
        .mockResolvedValueOnce(referrals)                             // referrals
        .mockResolvedValueOnce([{ offered: scholarshipsOffered, accepted: scholarshipsAccepted }]); // scholarships
}

beforeEach(() => jest.clearAllMocks());

// ─── Basic response shape ─────────────────────────────────────────────────────

describe('GET /api/coach/[coachId]/stats', () => {
    it('returns 200 with all expected fields (Req 7.1, 7.2)', async () => {
        mockQueryResponses();

        const res = await GET(makeRequest(COACH_ID), makeParams(COACH_ID));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toMatchObject({
            prospectsCount: 5,
            newPlayersToday: 3,
            scholarshipsOffered: 8,
            scholarshipsAccepted: 3,
            playersReferred: 2,
            coachesReferred: 1,
            promoCode: 'PROMO1',
        });
    });

    it('returns scholarshipsOffered as total scholarship count (Req 7.1)', async () => {
        mockQueryResponses({ scholarshipsOffered: '12', scholarshipsAccepted: '4' });

        const res = await GET(makeRequest(COACH_ID), makeParams(COACH_ID));
        const body = await res.json();

        expect(body.data.scholarshipsOffered).toBe(12);
    });

    it('returns scholarshipsAccepted as count of accepted scholarships (Req 7.2)', async () => {
        mockQueryResponses({ scholarshipsOffered: '12', scholarshipsAccepted: '4' });

        const res = await GET(makeRequest(COACH_ID), makeParams(COACH_ID));
        const body = await res.json();

        expect(body.data.scholarshipsAccepted).toBe(4);
    });

    it('returns 0 for both scholarship counts when no scholarships exist (Req 7.1, 7.2)', async () => {
        mockQueryResponses({ scholarshipsOffered: '0', scholarshipsAccepted: '0' });

        const res = await GET(makeRequest(COACH_ID), makeParams(COACH_ID));
        const body = await res.json();

        expect(body.data.scholarshipsOffered).toBe(0);
        expect(body.data.scholarshipsAccepted).toBe(0);
    });

    it('queries scholarships table with the correct coachId (Req 7.3, 7.4)', async () => {
        mockQueryResponses();

        await GET(makeRequest(COACH_ID), makeParams(COACH_ID));

        // The 5th query call is the scholarships count query
        const scholarshipCall = mockQuery.mock.calls[4];
        expect(scholarshipCall[0]).toMatch(/FROM scholarships/i);
        expect(scholarshipCall[0]).toMatch(/WHERE coach_id/i);
        expect(scholarshipCall[1]).toContain(COACH_ID);
    });

    it('queries for accepted status filter (Req 7.2)', async () => {
        mockQueryResponses();

        await GET(makeRequest(COACH_ID), makeParams(COACH_ID));

        const scholarshipCall = mockQuery.mock.calls[4];
        expect(scholarshipCall[0]).toMatch(/accepted/i);
    });

    it('does not include scholarshipsAgreed in the response', async () => {
        mockQueryResponses();

        const res = await GET(makeRequest(COACH_ID), makeParams(COACH_ID));
        const body = await res.json();

        expect(body.data).not.toHaveProperty('scholarshipsAgreed');
    });
});

// ─── Validation ───────────────────────────────────────────────────────────────

describe('GET /api/coach/[coachId]/stats — validation', () => {
    it('returns 400 for an invalid coachId', async () => {
        const res = await GET(makeRequest('not-a-uuid'), makeParams('not-a-uuid'));
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.success).toBe(false);
        expect(mockQuery).not.toHaveBeenCalled();
    });

    it('returns 400 for an empty coachId', async () => {
        const res = await GET(makeRequest(''), makeParams(''));
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.success).toBe(false);
    });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe('GET /api/coach/[coachId]/stats — error handling', () => {
    it('returns 500 when a database query throws', async () => {
        mockQuery.mockRejectedValue(new Error('connection refused'));

        const res = await GET(makeRequest(COACH_ID), makeParams(COACH_ID));
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.success).toBe(false);
        expect(body.error).toBe('Failed to fetch stats');
    });

    it('returns 0 for scholarships when the scholarships table returns null values', async () => {
        mockQuery
            .mockResolvedValueOnce([{ count: '5' }])
            .mockResolvedValueOnce([{ count: '3' }])
            .mockResolvedValueOnce([{ promo_code: null }])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([{ offered: null, accepted: null }]);

        const res = await GET(makeRequest(COACH_ID), makeParams(COACH_ID));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.data.scholarshipsOffered).toBe(0);
        expect(body.data.scholarshipsAccepted).toBe(0);
    });
});
