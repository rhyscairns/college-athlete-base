-- Rollback: Remove event column and restore position NOT NULL constraint
-- WARNING: Restoring NOT NULL on position will fail if any rows have a NULL position.
--          Ensure all rows have a position value before running this rollback.

DROP INDEX IF EXISTS idx_players_event;

ALTER TABLE players
    DROP COLUMN IF EXISTS event;

ALTER TABLE players
    ALTER COLUMN position SET NOT NULL;
