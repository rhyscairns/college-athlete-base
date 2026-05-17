-- Migration: Add event column and make position nullable on players table
-- Description: Supports sports that use events (e.g. Cross Country, Swimming) instead of positions.
--              Position and event are both optional at registration; at least one should be populated
--              once the player completes their profile.

-- Make position nullable (was NOT NULL)
ALTER TABLE players
    ALTER COLUMN position DROP NOT NULL;

-- Add event column (nullable)
ALTER TABLE players
    ADD COLUMN IF NOT EXISTS event VARCHAR(100);

-- Add index for event lookups
CREATE INDEX IF NOT EXISTS idx_players_event ON players(event);

-- Update column comments
COMMENT ON COLUMN players.position IS 'Position played in the sport (optional for event-based sports)';
COMMENT ON COLUMN players.event IS 'Event specialisation for event-based sports (e.g. 100m, 5K)';
