/**
 * Monthly subscription prices by plan tier.
 * Requirements: 3.1, 3.2
 */
export const SUBSCRIPTION_PRICES = {
    standard: 9.99,
    promo_699: 6.99,
    promo_599: 5.99,
} as const;

/**
 * Monthly referral earnings rates by tier.
 * Requirements: 7.1, 7.2, 7.3
 */
export const REFERRAL_RATES = {
    tier1: 1.00,
    tier2: 0.50,
    tier3: 0.25,
} as const;
