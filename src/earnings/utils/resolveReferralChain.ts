/**
 * Referral chain resolver utility.
 *
 * Given a tier-1 promo code (the code the new registrant entered), resolves
 * up to two additional hops so that all three referral tiers can be stored
 * at registration time.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

import { query } from '@/authentication/db/client';
import { logger } from '@/lib/logger';

export interface ReferralChainResult {
    /** The promo code entered by the new registrant (tier-1 referrer's code). */
    tier1PromoCode: string;
    /** The promo code of whoever referred the tier-1 owner (tier-2 referrer's code). Null if none. */
    tier2PromoCode: string | null;
    /** The promo code of whoever referred the tier-2 owner (tier-3 referrer's code). Null if none. */
    tier3PromoCode: string | null;
}

interface PromoOwnerRow {
    promo_code: string;
    referral_promo_code: string | null;
}

/**
 * Look up the owner of a promo code in both the players and coaches tables.
 * Returns their own promo_code and their referral_promo_code (the code they
 * used when they signed up), or null if not found.
 *
 * Non-throwing: any DB error is logged and null is returned so that
 * registration is never blocked by a chain-resolution failure.
 */
async function lookupPromoOwner(promoCode: string): Promise<PromoOwnerRow | null> {
    try {
        const [playerRows, coachRows] = await Promise.all([
            query<PromoOwnerRow>(
                `SELECT promo_code, referral_promo_code
                 FROM players
                 WHERE promo_code = $1
                 LIMIT 1`,
                [promoCode]
            ),
            query<PromoOwnerRow>(
                `SELECT promo_code, referral_promo_code
                 FROM coaches
                 WHERE promo_code = $1
                 LIMIT 1`,
                [promoCode]
            ),
        ]);

        return playerRows[0] ?? coachRows[0] ?? null;
    } catch (error) {
        logger.error(
            'resolveReferralChain: failed to look up promo owner',
            { promoCode },
            error instanceof Error ? error : new Error('Unknown error')
        );
        return null;
    }
}

/**
 * Resolve the full three-tier referral chain for a given tier-1 promo code.
 *
 * - tier1PromoCode  = the code the new user entered (stored as referral_promo_code)
 * - tier2PromoCode  = the referral_promo_code of the tier-1 owner
 * - tier3PromoCode  = the referral_promo_code of the tier-2 owner
 *
 * If `tier1PromoCode` is falsy, returns null (no referral).
 * Any lookup failure is non-blocking — missing tiers are returned as null.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */
export async function resolveReferralChain(
    tier1PromoCode: string | null | undefined
): Promise<ReferralChainResult | null> {
    if (!tier1PromoCode) {
        return null; // Requirement 2.6: no promo code → all referral columns NULL
    }

    // Tier-1 owner lookup (at most 2 additional DB round-trips)
    const tier1Owner = await lookupPromoOwner(tier1PromoCode);
    const tier2PromoCode = tier1Owner?.referral_promo_code ?? null;

    let tier3PromoCode: string | null = null;
    if (tier2PromoCode) {
        const tier2Owner = await lookupPromoOwner(tier2PromoCode);
        tier3PromoCode = tier2Owner?.referral_promo_code ?? null;
    }

    return {
        tier1PromoCode,
        tier2PromoCode,
        tier3PromoCode,
    };
}
