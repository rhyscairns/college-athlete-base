export { SUBSCRIPTION_PRICES, REFERRAL_RATES } from './constants';

/**
 * A player directly referred by the current user (tier 1).
 */
export interface ReferredPlayer {
    playerId: string;
    firstName: string;
    lastName: string;
    subscriptionStatus: 'active' | 'inactive';
    subscriptionPlan: 'standard' | 'promo_599' | 'promo_699';
    /** $0 when subscription is inactive. Requirements: 7.1, 7.4 */
    monthlyContribution: number;
    joinedAt: string;
}

/**
 * A coach directly referred by the current user (tier 1).
 * Coaches are free — no earnings are generated from coach sign-ups.
 * Requirements: 7.5
 */
export interface ReferredCoach {
    coachId: string;
    firstName: string;
    lastName: string;
    joinedAt: string;
    directPlayerReferrals: number;
    directCoachReferrals: number;
}

/**
 * Aggregate stats for a single referral tier (tier 2 or tier 3).
 */
export interface TierSummary {
    playerCount: number;
    activePlayerCount: number;
    monthlyEarnings: number;
}

/**
 * A single month data point used for chart rendering.
 * Requirements: 4.3, 4.4
 */
export interface MonthlyDataPoint {
    /** ISO year-month string, e.g. "2025-01" */
    month: string;
    tier1Players: number;
    tier2Players: number;
    tier3Players: number;
    earnings: number;
}

/**
 * Full earnings payload returned by the earnings API.
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
export interface EarningsData {
    tier1Players: ReferredPlayer[];
    tier1Coaches: ReferredCoach[];
    tier2: TierSummary;
    tier3: TierSummary;
    totalMonthlyEarnings: number;
    monthlySeries: MonthlyDataPoint[];
}
