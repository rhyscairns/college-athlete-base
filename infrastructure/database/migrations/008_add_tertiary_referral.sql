-- Migration: 008_add_tertiary_referral
-- Description: Adds tertiary referral tracking columns to players and coaches tables,
--              and adds subscription fields to the players table for earnings calculations.

-- ============================================================================
-- PLAYERS TABLE
-- ============================================================================

ALTER TABLE players
    ADD COLUMN IF NOT EXISTS secondary_referral_promo_code VARCHAR(50),
    ADD COLUMN IF NOT EXISTS tertiary_referral_promo_code VARCHAR(50),
    ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) NOT NULL DEFAULT 'inactive',
    ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(20) NOT NULL DEFAULT 'standard',
    ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ;

COMMENT ON COLUMN players.secondary_referral_promo_code IS 'Promo code of the tier-2 referrer (the person who referred the direct referrer)';
COMMENT ON COLUMN players.tertiary_referral_promo_code IS 'Promo code of the tier-3 referrer (two hops up the referral chain)';
COMMENT ON COLUMN players.subscription_status IS 'Current subscription status: active or inactive';
COMMENT ON COLUMN players.subscription_plan IS 'Subscription plan tier: standard ($9.99), promo_699 ($6.99), or promo_599 ($5.99)';
COMMENT ON COLUMN players.subscription_started_at IS 'Timestamp when the subscription became active';

-- Indexes for referral lookups on players
CREATE INDEX IF NOT EXISTS idx_players_secondary_referral_promo_code ON players(secondary_referral_promo_code);
CREATE INDEX IF NOT EXISTS idx_players_tertiary_referral_promo_code ON players(tertiary_referral_promo_code);

-- ============================================================================
-- COACHES TABLE
-- ============================================================================

ALTER TABLE coaches
    ADD COLUMN IF NOT EXISTS secondary_referral_promo_code VARCHAR(50),
    ADD COLUMN IF NOT EXISTS tertiary_referral_promo_code VARCHAR(50);

COMMENT ON COLUMN coaches.secondary_referral_promo_code IS 'Promo code of the tier-2 referrer (the person who referred the direct referrer)';
COMMENT ON COLUMN coaches.tertiary_referral_promo_code IS 'Promo code of the tier-3 referrer (two hops up the referral chain)';

-- Indexes for referral lookups on coaches
CREATE INDEX IF NOT EXISTS idx_coaches_secondary_referral_promo_code ON coaches(secondary_referral_promo_code);
CREATE INDEX IF NOT EXISTS idx_coaches_tertiary_referral_promo_code ON coaches(tertiary_referral_promo_code);
