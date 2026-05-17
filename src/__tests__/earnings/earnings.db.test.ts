/**
 * Unit tests for earnings DB query helpers.
 * The DB client is mocked — no real DB connection required.
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5
 */

import {
    getTier1Players,
    getTier1Coaches,
    getTier2Summary,
    getTier3Summary,
    getMonthlySeries,
} from '@/earnings/db/earnings';
import { query } from '@/authentication/db/client';
import { REFERRAL_RATES } from '@/earnings/types';

jest.mock('@/authentication/db/client');
jest.mock('@/lib/logger');

const mockQuery = query as jest.MockedFunction<typeof query>;

const PROMO = 'COACH_ABC';

beforeEach(() => {
    jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// getTier1Players
// ---------------------------------------------------------------------------

describe('getTier1Players', () => {
    it('returns an empty array when no players are referred (Req 6.1)', async () => {
        mockQuery.mockResolvedValueOnce([]);
        const result = await getTier1Players(PROMO);
        expect(result).toEqual([]);
    });

    it('maps an active player row correctly (Req 6.1, 7.1)', async () => {
        mockQuery.mockResolvedValueOnce([
            {
                player_id: 'p1',
                first_name: 'Alice',
                last_name: 'Smith',
                subscription_status: 'active',
                subscription_plan: 'standard',
                created_at: '2025-01-15T00:00:00Z',
            },
        ]);

        const result = await getTier1Players(PROMO);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            playerId: 'p1',
            firstName: 'Alice',
            lastName: 'Smith',
            subscriptionStatus: 'active',
            subscriptionPlan: 'standard',
            monthlyContribution: REFERRAL_RATES.tier1, // $1.00
            joinedAt: '2025-01-15T00:00:00Z',
        });
    });

    it('sets monthlyContribution to 0 for inactive players (Req 6.5, 7.4)', async () => {
        mockQuery.mockResolvedValueOnce([
            {
                player_id: 'p2',
                first_name: 'Bob',
                last_name: 'Jones',
                subscription_status: 'inactive',
                subscription_plan: 'standard',
                created_at: '2025-02-01T00:00:00Z',
            },
        ]);

        const result = await getTier1Players(PROMO);

        expect(result[0].subscriptionStatus).toBe('inactive');
        expect(result[0].monthlyContribution).toBe(0);
    });

    it('maps promo_599 and promo_699 subscription plans correctly', async () => {
        mockQuery.mockResolvedValueOnce([
            {
                player_id: 'p3',
                first_name: 'Carol',
                last_name: 'White',
                subscription_status: 'active',
                subscription_plan: 'promo_599',
                created_at: '2025-03-01T00:00:00Z',
            },
            {
                player_id: 'p4',
                first_name: 'Dan',
                last_name: 'Brown',
                subscription_status: 'active',
                subscription_plan: 'promo_699',
                created_at: '2025-03-05T00:00:00Z',
            },
        ]);

        const result = await getTier1Players(PROMO);

        expect(result[0].subscriptionPlan).toBe('promo_599');
        expect(result[1].subscriptionPlan).toBe('promo_699');
    });

    it('falls back to "standard" for unknown subscription plan values', async () => {
        mockQuery.mockResolvedValueOnce([
            {
                player_id: 'p5',
                first_name: 'Eve',
                last_name: 'Black',
                subscription_status: 'active',
                subscription_plan: 'unknown_plan',
                created_at: '2025-04-01T00:00:00Z',
            },
        ]);

        const result = await getTier1Players(PROMO);
        expect(result[0].subscriptionPlan).toBe('standard');
    });

    it('returns both active and inactive players in the same result', async () => {
        mockQuery.mockResolvedValueOnce([
            {
                player_id: 'p6',
                first_name: 'Frank',
                last_name: 'Green',
                subscription_status: 'active',
                subscription_plan: 'standard',
                created_at: '2025-01-01T00:00:00Z',
            },
            {
                player_id: 'p7',
                first_name: 'Grace',
                last_name: 'Hall',
                subscription_status: 'inactive',
                subscription_plan: 'standard',
                created_at: '2025-02-01T00:00:00Z',
            },
        ]);

        const result = await getTier1Players(PROMO);

        expect(result).toHaveLength(2);
        expect(result[0].monthlyContribution).toBe(REFERRAL_RATES.tier1);
        expect(result[1].monthlyContribution).toBe(0);
    });

    it('re-throws DB errors', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB failure'));
        await expect(getTier1Players(PROMO)).rejects.toThrow('DB failure');
    });
});

// ---------------------------------------------------------------------------
// getTier1Coaches
// ---------------------------------------------------------------------------

describe('getTier1Coaches', () => {
    it('returns an empty array when no coaches are referred (Req 6.2)', async () => {
        mockQuery.mockResolvedValueOnce([]);
        const result = await getTier1Coaches(PROMO);
        expect(result).toEqual([]);
    });

    it('maps a coach row correctly including referral counts (Req 6.2, 7.5)', async () => {
        mockQuery.mockResolvedValueOnce([
            {
                coach_id: 'c1',
                first_name: 'Henry',
                last_name: 'Ford',
                created_at: '2025-01-10T00:00:00Z',
                direct_player_referrals: '5',
                direct_coach_referrals: '2',
            },
        ]);

        const result = await getTier1Coaches(PROMO);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            coachId: 'c1',
            firstName: 'Henry',
            lastName: 'Ford',
            joinedAt: '2025-01-10T00:00:00Z',
            directPlayerReferrals: 5,
            directCoachReferrals: 2,
        });
    });

    it('parses referral counts as integers (not strings)', async () => {
        mockQuery.mockResolvedValueOnce([
            {
                coach_id: 'c2',
                first_name: 'Ivy',
                last_name: 'Lee',
                created_at: '2025-02-01T00:00:00Z',
                direct_player_referrals: '0',
                direct_coach_referrals: '0',
            },
        ]);

        const result = await getTier1Coaches(PROMO);
        expect(typeof result[0].directPlayerReferrals).toBe('number');
        expect(typeof result[0].directCoachReferrals).toBe('number');
        expect(result[0].directPlayerReferrals).toBe(0);
    });

    it('re-throws DB errors', async () => {
        mockQuery.mockRejectedValueOnce(new Error('Connection timeout'));
        await expect(getTier1Coaches(PROMO)).rejects.toThrow('Connection timeout');
    });
});

// ---------------------------------------------------------------------------
// getTier2Summary
// ---------------------------------------------------------------------------

describe('getTier2Summary', () => {
    it('returns zero counts and earnings when no tier-2 players exist (Req 6.3)', async () => {
        mockQuery.mockResolvedValueOnce([
            { player_count: '0', active_player_count: '0' },
        ]);

        const result = await getTier2Summary(PROMO);

        expect(result).toEqual({
            playerCount: 0,
            activePlayerCount: 0,
            monthlyEarnings: 0,
        });
    });

    it('calculates monthlyEarnings as activePlayerCount × tier2 rate (Req 7.2)', async () => {
        mockQuery.mockResolvedValueOnce([
            { player_count: '10', active_player_count: '6' },
        ]);

        const result = await getTier2Summary(PROMO);

        expect(result.playerCount).toBe(10);
        expect(result.activePlayerCount).toBe(6);
        expect(result.monthlyEarnings).toBeCloseTo(6 * REFERRAL_RATES.tier2); // $3.00
    });

    it('excludes inactive players from earnings (Req 7.4)', async () => {
        mockQuery.mockResolvedValueOnce([
            { player_count: '4', active_player_count: '1' },
        ]);

        const result = await getTier2Summary(PROMO);

        // Only 1 active player contributes
        expect(result.monthlyEarnings).toBeCloseTo(REFERRAL_RATES.tier2);
    });

    it('handles empty query result gracefully', async () => {
        mockQuery.mockResolvedValueOnce([]);

        const result = await getTier2Summary(PROMO);

        expect(result).toEqual({
            playerCount: 0,
            activePlayerCount: 0,
            monthlyEarnings: 0,
        });
    });

    it('re-throws DB errors', async () => {
        mockQuery.mockRejectedValueOnce(new Error('Query error'));
        await expect(getTier2Summary(PROMO)).rejects.toThrow('Query error');
    });
});

// ---------------------------------------------------------------------------
// getTier3Summary
// ---------------------------------------------------------------------------

describe('getTier3Summary', () => {
    it('returns zero counts and earnings when no tier-3 players exist (Req 6.3)', async () => {
        mockQuery.mockResolvedValueOnce([
            { player_count: '0', active_player_count: '0' },
        ]);

        const result = await getTier3Summary(PROMO);

        expect(result).toEqual({
            playerCount: 0,
            activePlayerCount: 0,
            monthlyEarnings: 0,
        });
    });

    it('calculates monthlyEarnings as activePlayerCount × tier3 rate (Req 7.3)', async () => {
        mockQuery.mockResolvedValueOnce([
            { player_count: '8', active_player_count: '4' },
        ]);

        const result = await getTier3Summary(PROMO);

        expect(result.playerCount).toBe(8);
        expect(result.activePlayerCount).toBe(4);
        expect(result.monthlyEarnings).toBeCloseTo(4 * REFERRAL_RATES.tier3); // $1.00
    });

    it('handles empty query result gracefully', async () => {
        mockQuery.mockResolvedValueOnce([]);

        const result = await getTier3Summary(PROMO);

        expect(result).toEqual({
            playerCount: 0,
            activePlayerCount: 0,
            monthlyEarnings: 0,
        });
    });

    it('re-throws DB errors', async () => {
        mockQuery.mockRejectedValueOnce(new Error('Timeout'));
        await expect(getTier3Summary(PROMO)).rejects.toThrow('Timeout');
    });
});

// ---------------------------------------------------------------------------
// getMonthlySeries
// ---------------------------------------------------------------------------

describe('getMonthlySeries', () => {
    it('returns an empty array when no referrals exist (Req 6.4)', async () => {
        mockQuery.mockResolvedValueOnce([]);
        const result = await getMonthlySeries(PROMO);
        expect(result).toEqual([]);
    });

    it('maps a monthly row correctly (Req 6.4, 7.1, 7.2, 7.3)', async () => {
        mockQuery.mockResolvedValueOnce([
            {
                month: '2025-01',
                tier1_players: '3',
                tier2_players: '2',
                tier3_players: '1',
                tier1_earnings: '3.00',
                tier2_earnings: '1.00',
                tier3_earnings: '0.25',
            },
        ]);

        const result = await getMonthlySeries(PROMO);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            month: '2025-01',
            tier1Players: 3,
            tier2Players: 2,
            tier3Players: 1,
            earnings: expect.closeTo(4.25, 5),
        });
    });

    it('sums earnings across all three tiers per month', async () => {
        mockQuery.mockResolvedValueOnce([
            {
                month: '2025-03',
                tier1_players: '5',
                tier2_players: '3',
                tier3_players: '2',
                tier1_earnings: '5.00',
                tier2_earnings: '1.50',
                tier3_earnings: '0.50',
            },
        ]);

        const result = await getMonthlySeries(PROMO);
        expect(result[0].earnings).toBeCloseTo(7.0);
    });

    it('returns multiple months in ascending order', async () => {
        mockQuery.mockResolvedValueOnce([
            {
                month: '2025-01',
                tier1_players: '1',
                tier2_players: '0',
                tier3_players: '0',
                tier1_earnings: '1.00',
                tier2_earnings: '0.00',
                tier3_earnings: '0.00',
            },
            {
                month: '2025-02',
                tier1_players: '2',
                tier2_players: '1',
                tier3_players: '0',
                tier1_earnings: '2.00',
                tier2_earnings: '0.50',
                tier3_earnings: '0.00',
            },
        ]);

        const result = await getMonthlySeries(PROMO);

        expect(result).toHaveLength(2);
        expect(result[0].month).toBe('2025-01');
        expect(result[1].month).toBe('2025-02');
        expect(result[1].earnings).toBeCloseTo(2.5);
    });

    it('handles months with zero earnings (all inactive players)', async () => {
        mockQuery.mockResolvedValueOnce([
            {
                month: '2025-04',
                tier1_players: '2',
                tier2_players: '1',
                tier3_players: '0',
                tier1_earnings: '0.00',
                tier2_earnings: '0.00',
                tier3_earnings: '0.00',
            },
        ]);

        const result = await getMonthlySeries(PROMO);
        expect(result[0].earnings).toBe(0);
        expect(result[0].tier1Players).toBe(2);
    });

    it('re-throws DB errors', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB unavailable'));
        await expect(getMonthlySeries(PROMO)).rejects.toThrow('DB unavailable');
    });
});
