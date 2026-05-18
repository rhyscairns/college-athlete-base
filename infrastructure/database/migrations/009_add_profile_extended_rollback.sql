-- Rollback Migration 009: Remove profile_extended column from players table

ALTER TABLE players
    DROP COLUMN IF EXISTS profile_extended;
