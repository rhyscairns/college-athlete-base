-- Rollback Migration: Remove promo_code columns
-- Description: Removes promo_code field from players and coaches tables
-- Date: 2024-01-15

-- Drop indexes
DROP INDEX IF EXISTS idx_players_promo_code;
DROP INDEX IF EXISTS idx_coaches_promo_code;

-- Remove promo_code from players table
ALTER TABLE players 
DROP COLUMN IF EXISTS promo_code;

-- Remove promo_code from coaches table
ALTER TABLE coaches 
DROP COLUMN IF EXISTS promo_code;

