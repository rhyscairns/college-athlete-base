-- Rollback Migration: Drop players table
-- Description: Removes the players table and all associated objects
-- This is the rollback for 001_create_players_table.sql

-- Drop trigger
DROP TRIGGER IF EXISTS update_players_updated_at ON players;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes (will be dropped automatically with table, but explicit for clarity)
DROP INDEX IF EXISTS idx_players_created_at;
DROP INDEX IF EXISTS idx_players_sport;
DROP INDEX IF EXISTS idx_players_email;

-- Drop table
DROP TABLE IF EXISTS players;
