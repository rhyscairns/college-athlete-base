-- Rollback Migration 010: Remove Stripe subscription fields from players table

DROP INDEX IF EXISTS idx_players_stripe_customer_id;

ALTER TABLE players
    DROP COLUMN IF EXISTS is_cab_member,
    DROP COLUMN IF EXISTS stripe_customer_id,
    DROP COLUMN IF EXISTS stripe_subscription_id,
    DROP COLUMN IF EXISTS subscription_period_end;

-- Revert subscription_status default back to 'inactive'
ALTER TABLE players
    ALTER COLUMN subscription_status SET DEFAULT 'inactive';

UPDATE players
    SET subscription_status = 'inactive'
    WHERE subscription_status = 'none';
