-- Rollback: 008_add_tertiary_referral

-- Remove indexes from players
DROP INDEX IF EXISTS idx_players_secondary_referral_promo_code;
DROP INDEX IF EXISTS idx_players_tertiary_referral_promo_code;

-- Remove columns from players
ALTER TABLE players
    DROP COLUMN IF EXISTS secondary_referral_promo_code,
    DROP COLUMN IF EXISTS tertiary_referral_promo_code,
    DROP COLUMN IF EXISTS subscription_status,
    DROP COLUMN IF EXISTS subscription_plan,
    DROP COLUMN IF EXISTS subscription_started_at;

-- Remove indexes from coaches
DROP INDEX IF EXISTS idx_coaches_secondary_referral_promo_code;
DROP INDEX IF EXISTS idx_coaches_tertiary_referral_promo_code;

-- Remove columns from coaches
ALTER TABLE coaches
    DROP COLUMN IF EXISTS secondary_referral_promo_code,
    DROP COLUMN IF EXISTS tertiary_referral_promo_code;
