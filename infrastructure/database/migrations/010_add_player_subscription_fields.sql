-- Migration 010: Add Stripe subscription fields to players table
-- Adds is_cab_member flag, Stripe customer/subscription IDs, and subscription period end.
-- Note: subscription_status column already exists from migration 008 (with 'inactive' default).
-- This migration aligns it with the Stripe-based status values and adds the remaining columns.

-- Update subscription_status default from 'inactive' to 'none' to align with Stripe status values
ALTER TABLE players
    ALTER COLUMN subscription_status SET DEFAULT 'none';

-- Update any existing 'inactive' values to 'none'
UPDATE players
    SET subscription_status = 'none'
    WHERE subscription_status = 'inactive';

-- Add new subscription columns
ALTER TABLE players
    ADD COLUMN IF NOT EXISTS is_cab_member          BOOLEAN      NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS stripe_customer_id     VARCHAR(255),
    ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;

-- Index for fast webhook lookups by Stripe customer ID
CREATE INDEX IF NOT EXISTS idx_players_stripe_customer_id ON players(stripe_customer_id);

COMMENT ON COLUMN players.is_cab_member IS 'Whether the player has an active CAB subscription and is visible to coaches';
COMMENT ON COLUMN players.stripe_customer_id IS 'Stripe Customer ID linked to this player';
COMMENT ON COLUMN players.stripe_subscription_id IS 'Stripe Subscription ID for the active subscription';
COMMENT ON COLUMN players.subscription_status IS 'Stripe subscription status: none, trialing, active, past_due, cancelled, paused';
COMMENT ON COLUMN players.subscription_period_end IS 'Timestamp when the current subscription period ends';
