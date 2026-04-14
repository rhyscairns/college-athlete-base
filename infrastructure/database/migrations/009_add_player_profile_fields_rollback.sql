-- Rollback Migration: Remove additional profile fields from players table
-- Description: Removes academic_standing, recruitment_status, age, and profile_image_url columns
-- Date: 2026-04-03

-- Drop indexes
DROP INDEX IF EXISTS idx_players_recruitment_status;
DROP INDEX IF EXISTS idx_players_academic_standing;

-- Drop constraints
ALTER TABLE players 
DROP CONSTRAINT IF EXISTS check_age;

-- Remove added columns
ALTER TABLE players 
DROP COLUMN IF EXISTS academic_standing,
DROP COLUMN IF EXISTS recruitment_status,
DROP COLUMN IF EXISTS age;

-- Note: We don't drop profile_image_url as it might be used by other features
