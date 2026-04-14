-- Rollback Migration: Remove athlete search columns from players table
-- Description: Removes height_inches, weight_lbs, desired_division, and affordable_amount columns
-- Date: 2026-03-31

-- Drop indexes
DROP INDEX IF EXISTS idx_players_affordable_amount;
DROP INDEX IF EXISTS idx_players_weight_lbs;
DROP INDEX IF EXISTS idx_players_height_inches;
DROP INDEX IF EXISTS idx_players_gpa;
DROP INDEX IF EXISTS idx_players_desired_division;
DROP INDEX IF EXISTS idx_players_sport_position;

-- Drop constraints
ALTER TABLE players DROP CONSTRAINT IF EXISTS check_affordable_amount;
ALTER TABLE players DROP CONSTRAINT IF EXISTS check_weight_lbs;
ALTER TABLE players DROP CONSTRAINT IF EXISTS check_height_inches;

-- Drop columns
ALTER TABLE players DROP COLUMN IF EXISTS affordable_amount;
ALTER TABLE players DROP COLUMN IF EXISTS desired_division;
ALTER TABLE players DROP COLUMN IF EXISTS weight_lbs;
ALTER TABLE players DROP COLUMN IF EXISTS height_inches;
