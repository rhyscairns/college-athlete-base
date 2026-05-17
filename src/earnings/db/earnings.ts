/**
 * Earnings DB query helpers.
 *
 * All functions accept a `promoCode` (the promo code belonging to the user
 * whose earnings we are calculating) and return typed results.
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { query } from '@/authentication/db/client';
import { logger } from '@/lib/logger';
import { REFERRAL_RATES } from '@/earnings/types';
import type { ReferredPlayer, ReferredCoach, TierSummary, MonthlyDataPoint } from '@/earnings/types';

// ---------------------------------------------------------------------------
// Internal DB row types
// ---------------------------------------------------------------------------

interface PlayerRow {
    player_id: string;
    first_name: string;
    last_name: string;
    subscription_status: string;
    subscription_plan: string;
    created_at: string;
}

interface CoachRow {
    coach_id: string;
    first_name: string;
    last_name: string;
    created_at: string;
    direct_player_referrals: string; // COUNT returns string in pg
    direct_coach_referrals: string;
}

interface TierAggRow {
    player_count: string;
    active_player_count: string;
}

interface MonthlySeriesRow {
    month: string;
    tier1_players: string;
    tier2_players: string;
    tier3_players: string;
    tier1_earnings: string;
    tier2_earnings: string;
    tier3_earnings: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Map a subscription plan string to the typed union.
 * Falls back to 'standard' for unknown values.
 */
function toSubscriptionPlan(
    plan: string
): 'standard' | 'promo_599' | 'promo_699' {
    if (plan === 'promo_599' || plan === 'promo_699') return plan;
    return 'standard';
}

/**
 * Calculate the monthly contribution for a player.
 * Inactive players always contribute $0 (Requirement 7.4).
 * Coaches are free — no earnings from coach sign-ups (Requirement 7.5).
 */
function playerContribution(status: string): number {
    return status === 'active' ? REFERRAL_RATES.tier1 : 0;
}

// ---------------------------------------------------------------------------
// Public query functions
// ---------------------------------------------------------------------------

/**
 * Returns all tier-1 directly referred players for the given promo code owner.
 * Inactive players are included but have monthlyContribution = 0.
 * Requirements: 6.1, 7.1, 7.4
 */
export async function getTier1Players(promoCode: string): Promise<ReferredPlayer[]> {
    try {
        const rows = await query<PlayerRow>(
            `SELECT
                p.id            AS player_id,
                p.first_name,
                p.last_name,
                p.subscription_status,
                p.subscription_plan,
                p.created_at
             FROM players p
             WHERE p.referral_promo_code = $1
             ORDER BY p.created_at DESC`,
            [promoCode]
        );

        return rows.map((row) => ({
            playerId: row.player_id,
            firstName: row.first_name,
            lastName: row.last_name,
            subscriptionStatus: row.subscription_status === 'active' ? 'active' : 'inactive',
            subscriptionPlan: toSubscriptionPlan(row.subscription_plan),
            monthlyContribution: playerContribution(row.subscription_status),
            joinedAt: row.created_at,
        }));
    } catch (error) {
        logger.error(
            'getTier1Players: query failed',
            { promoCode },
            error instanceof Error ? error : new Error('Unknown error')
        );
        throw error;
    }
}

/**
 * Returns all tier-1 directly referred coaches for the given promo code owner.
 * Includes how many players and coaches each referred coach has themselves referred.
 * No earnings are generated from coach referrals (Requirement 7.5).
 * Requirements: 6.2
 */
export async function getTier1Coaches(promoCode: string): Promise<ReferredCoach[]> {
    try {
        const rows = await query<CoachRow>(
            `SELECT
                c.id            AS coach_id,
                c.first_name,
                c.last_name,
                c.created_at,
                (SELECT COUNT(*) FROM players p2 WHERE p2.referral_promo_code = c.promo_code)  AS direct_player_referrals,
                (SELECT COUNT(*) FROM coaches c2 WHERE c2.referral_promo_code = c.promo_code)  AS direct_coach_referrals
             FROM coaches c
             WHERE c.referral_promo_code = $1
             ORDER BY c.created_at DESC`,
            [promoCode]
        );

        return rows.map((row) => ({
            coachId: row.coach_id,
            firstName: row.first_name,
            lastName: row.last_name,
            joinedAt: row.created_at,
            directPlayerReferrals: parseInt(row.direct_player_referrals, 10),
            directCoachReferrals: parseInt(row.direct_coach_referrals, 10),
        }));
    } catch (error) {
        logger.error(
            'getTier1Coaches: query failed',
            { promoCode },
            error instanceof Error ? error : new Error('Unknown error')
        );
        throw error;
    }
}

/**
 * Returns aggregate tier-2 stats: total player count, active player count,
 * and total monthly earnings.
 * Requirements: 6.3, 7.2, 7.4
 */
export async function getTier2Summary(promoCode: string): Promise<TierSummary> {
    try {
        const rows = await query<TierAggRow>(
            `SELECT
                COUNT(*)                                                    AS player_count,
                COUNT(*) FILTER (WHERE p.subscription_status = 'active')   AS active_player_count
             FROM players p
             WHERE p.secondary_referral_promo_code = $1`,
            [promoCode]
        );

        const row = rows[0];
        const playerCount = parseInt(row?.player_count ?? '0', 10);
        const activePlayerCount = parseInt(row?.active_player_count ?? '0', 10);

        return {
            playerCount,
            activePlayerCount,
            monthlyEarnings: activePlayerCount * REFERRAL_RATES.tier2,
        };
    } catch (error) {
        logger.error(
            'getTier2Summary: query failed',
            { promoCode },
            error instanceof Error ? error : new Error('Unknown error')
        );
        throw error;
    }
}

/**
 * Returns aggregate tier-3 stats: total player count, active player count,
 * and total monthly earnings.
 * Requirements: 6.3, 7.3, 7.4
 */
export async function getTier3Summary(promoCode: string): Promise<TierSummary> {
    try {
        const rows = await query<TierAggRow>(
            `SELECT
                COUNT(*)                                                    AS player_count,
                COUNT(*) FILTER (WHERE p.subscription_status = 'active')   AS active_player_count
             FROM players p
             WHERE p.tertiary_referral_promo_code = $1`,
            [promoCode]
        );

        const row = rows[0];
        const playerCount = parseInt(row?.player_count ?? '0', 10);
        const activePlayerCount = parseInt(row?.active_player_count ?? '0', 10);

        return {
            playerCount,
            activePlayerCount,
            monthlyEarnings: activePlayerCount * REFERRAL_RATES.tier3,
        };
    } catch (error) {
        logger.error(
            'getTier3Summary: query failed',
            { promoCode },
            error instanceof Error ? error : new Error('Unknown error')
        );
        throw error;
    }
}

/**
 * Returns a monthly time series of player sign-ups and earnings across all
 * three tiers, suitable for chart rendering.
 * Requirements: 6.4, 7.1, 7.2, 7.3
 */
export async function getMonthlySeries(promoCode: string): Promise<MonthlyDataPoint[]> {
    try {
        const rows = await query<MonthlySeriesRow>(
            `SELECT
                TO_CHAR(p.created_at, 'YYYY-MM')                                                AS month,
                COUNT(*) FILTER (WHERE p.referral_promo_code = $1)                              AS tier1_players,
                COUNT(*) FILTER (WHERE p.secondary_referral_promo_code = $1)                    AS tier2_players,
                COUNT(*) FILTER (WHERE p.tertiary_referral_promo_code = $1)                     AS tier3_players,
                (COUNT(*) FILTER (WHERE p.referral_promo_code = $1
                                    AND p.subscription_status = 'active') * $2::numeric)        AS tier1_earnings,
                (COUNT(*) FILTER (WHERE p.secondary_referral_promo_code = $1
                                    AND p.subscription_status = 'active') * $3::numeric)        AS tier2_earnings,
                (COUNT(*) FILTER (WHERE p.tertiary_referral_promo_code = $1
                                    AND p.subscription_status = 'active') * $4::numeric)        AS tier3_earnings
             FROM players p
             WHERE p.referral_promo_code = $1
                OR p.secondary_referral_promo_code = $1
                OR p.tertiary_referral_promo_code = $1
             GROUP BY TO_CHAR(p.created_at, 'YYYY-MM')
             ORDER BY month ASC`,
            [promoCode, REFERRAL_RATES.tier1, REFERRAL_RATES.tier2, REFERRAL_RATES.tier3]
        );

        return rows.map((row) => ({
            month: row.month,
            tier1Players: parseInt(row.tier1_players, 10),
            tier2Players: parseInt(row.tier2_players, 10),
            tier3Players: parseInt(row.tier3_players, 10),
            earnings:
                parseFloat(row.tier1_earnings) +
                parseFloat(row.tier2_earnings) +
                parseFloat(row.tier3_earnings),
        }));
    } catch (error) {
        logger.error(
            'getMonthlySeries: query failed',
            { promoCode },
            error instanceof Error ? error : new Error('Unknown error')
        );
        throw error;
    }
}
