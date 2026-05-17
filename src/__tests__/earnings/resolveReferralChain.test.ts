/**
 * Unit tests for resolveReferralChain utility.
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

import { resolveReferralChain } from '@/earnings/utils/resolveReferralChain';
import { query } from '@/authentication/db/client';

jest.mock('@/authentication/db/client');

const mockQuery = query as jest.MockedFunction<typeof query>;

/**
 * The resolver calls lookupPromoOwner which fires two parallel queries
 * (players + coaches) per hop. Helper to set up mock responses for one hop.
 *
 * @param playerRow  Row returned from the players table (or empty array)
 * @param coachRow   Row returned from the coaches table (or empty array)
 */
function mockHop(
    playerRow: { promo_code: string; referral_promo_code: string | null } | null,
    coachRow: { promo_code: string; referral_promo_code: string | null } | null
) {
    mockQuery.mockResolvedValueOnce(playerRow ? [playerRow] : []); // players query
    mockQuery.mockResolvedValueOnce(coachRow ? [coachRow] : []);   // coaches query
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe('resolveReferralChain', () => {
    describe('no promo code (Requirement 2.6)', () => {
        it('returns null when tier1PromoCode is null', async () => {
            const result = await resolveReferralChain(null);
            expect(result).toBeNull();
            expect(mockQuery).not.toHaveBeenCalled();
        });

        it('returns null when tier1PromoCode is undefined', async () => {
            const result = await resolveReferralChain(undefined);
            expect(result).toBeNull();
            expect(mockQuery).not.toHaveBeenCalled();
        });

        it('returns null when tier1PromoCode is an empty string', async () => {
            const result = await resolveReferralChain('');
            expect(result).toBeNull();
            expect(mockQuery).not.toHaveBeenCalled();
        });
    });

    describe('valid tier-1 only (Requirement 2.1, 2.5)', () => {
        it('returns tier1 code and null tiers 2 & 3 when tier-1 owner has no referrer', async () => {
            // Tier-1 hop: owner found in players table, no referral_promo_code
            mockHop({ promo_code: 'COACH_A', referral_promo_code: null }, null);

            const result = await resolveReferralChain('COACH_A');

            expect(result).toEqual({
                tier1PromoCode: 'COACH_A',
                tier2PromoCode: null,
                tier3PromoCode: null,
            });
            // Only one hop (2 parallel queries)
            expect(mockQuery).toHaveBeenCalledTimes(2);
        });

        it('finds owner in coaches table when not in players table', async () => {
            mockHop(null, { promo_code: 'COACH_B', referral_promo_code: null });

            const result = await resolveReferralChain('COACH_B');

            expect(result).toEqual({
                tier1PromoCode: 'COACH_B',
                tier2PromoCode: null,
                tier3PromoCode: null,
            });
        });

        it('returns tier1 code with null tiers 2 & 3 when promo code owner is not found', async () => {
            // Owner not found in either table — tier2 and tier3 should be null
            mockHop(null, null);

            const result = await resolveReferralChain('UNKNOWN_CODE');

            expect(result).toEqual({
                tier1PromoCode: 'UNKNOWN_CODE',
                tier2PromoCode: null,
                tier3PromoCode: null,
            });
        });
    });

    describe('valid tier-1 + tier-2 (Requirement 2.1, 2.2, 2.5)', () => {
        it('resolves two hops when tier-1 owner has a referrer', async () => {
            // Hop 1: tier-1 owner has a referral_promo_code pointing to tier-2
            mockHop({ promo_code: 'PLAYER_A', referral_promo_code: 'COACH_A' }, null);
            // Hop 2: tier-2 owner has no referrer
            mockHop({ promo_code: 'COACH_A', referral_promo_code: null }, null);

            const result = await resolveReferralChain('PLAYER_A');

            expect(result).toEqual({
                tier1PromoCode: 'PLAYER_A',
                tier2PromoCode: 'COACH_A',
                tier3PromoCode: null,
            });
            // Two hops = 4 parallel queries
            expect(mockQuery).toHaveBeenCalledTimes(4);
        });

        it('resolves tier-2 owner found in coaches table', async () => {
            mockHop({ promo_code: 'PLAYER_A', referral_promo_code: 'COACH_X' }, null);
            mockHop(null, { promo_code: 'COACH_X', referral_promo_code: null });

            const result = await resolveReferralChain('PLAYER_A');

            expect(result).toEqual({
                tier1PromoCode: 'PLAYER_A',
                tier2PromoCode: 'COACH_X',
                tier3PromoCode: null,
            });
        });
    });

    describe('full three-tier chain (Requirement 2.1, 2.2, 2.3)', () => {
        it('resolves all three tiers correctly', async () => {
            // Hop 1: tier-1 owner refers back to tier-2
            mockHop({ promo_code: 'PLAYER_A', referral_promo_code: 'PLAYER_B' }, null);
            // Hop 2: tier-2 owner refers back to tier-3
            mockHop({ promo_code: 'PLAYER_B', referral_promo_code: 'COACH_C' }, null);

            const result = await resolveReferralChain('PLAYER_A');

            expect(result).toEqual({
                tier1PromoCode: 'PLAYER_A',
                tier2PromoCode: 'PLAYER_B',
                tier3PromoCode: 'COACH_C',
            });
            // Two hops = 4 parallel queries
            expect(mockQuery).toHaveBeenCalledTimes(4);
        });

        it('resolves chain with mixed player and coach owners', async () => {
            mockHop(null, { promo_code: 'COACH_A', referral_promo_code: 'PLAYER_B' });
            mockHop({ promo_code: 'PLAYER_B', referral_promo_code: 'COACH_C' }, null);

            const result = await resolveReferralChain('COACH_A');

            expect(result).toEqual({
                tier1PromoCode: 'COACH_A',
                tier2PromoCode: 'PLAYER_B',
                tier3PromoCode: 'COACH_C',
            });
        });

        it('stops at tier-3 even if tier-3 owner has a referrer (no 4th hop)', async () => {
            mockHop({ promo_code: 'A', referral_promo_code: 'B' }, null);
            // Tier-2 owner has a referral_promo_code — we store it as tier3 but do NOT follow it
            mockHop({ promo_code: 'B', referral_promo_code: 'C' }, null);

            const result = await resolveReferralChain('A');

            expect(result).toEqual({
                tier1PromoCode: 'A',
                tier2PromoCode: 'B',
                tier3PromoCode: 'C',
            });
            // Exactly 2 hops, no 3rd hop
            expect(mockQuery).toHaveBeenCalledTimes(4);
        });
    });

    describe('lookup failure — non-blocking (Requirement 2.5)', () => {
        it('returns tier1 code with null tiers when tier-1 lookup throws', async () => {
            mockQuery.mockRejectedValueOnce(new Error('DB connection lost')); // players query
            mockQuery.mockRejectedValueOnce(new Error('DB connection lost')); // coaches query

            const result = await resolveReferralChain('SOME_CODE');

            // Should not throw; tier2 and tier3 are null
            expect(result).toEqual({
                tier1PromoCode: 'SOME_CODE',
                tier2PromoCode: null,
                tier3PromoCode: null,
            });
        });

        it('returns partial chain when tier-2 lookup throws', async () => {
            // Tier-1 hop succeeds
            mockHop({ promo_code: 'PLAYER_A', referral_promo_code: 'COACH_B' }, null);
            // Tier-2 hop fails
            mockQuery.mockRejectedValueOnce(new Error('Timeout'));
            mockQuery.mockRejectedValueOnce(new Error('Timeout'));

            const result = await resolveReferralChain('PLAYER_A');

            expect(result).toEqual({
                tier1PromoCode: 'PLAYER_A',
                tier2PromoCode: 'COACH_B',
                tier3PromoCode: null,
            });
        });
    });
});
