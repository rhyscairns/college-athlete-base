-- Rollback Migration for 001_create_initial_schema.sql
-- Description: Drops all tables, indexes, triggers, and functions created by the initial schema migration
-- This rollback should be executed in reverse order of creation

-- ============================================================================
-- DROP TRIGGERS
-- ============================================================================

-- Drop trigger for coaches table
DROP TRIGGER IF EXISTS update_coaches_updated_at ON coaches;

-- Drop trigger for players table
DROP TRIGGER IF EXISTS update_players_updated_at ON players;


-- ============================================================================
-- DROP TRIGGER FUNCTIONS
-- ============================================================================

-- Drop the update_updated_at_column function
DROP FUNCTION IF EXISTS update_updated_at_column();


-- ============================================================================
-- DROP TABLES (with CASCADE to drop dependent objects)
-- ============================================================================

-- Drop coaches table and all dependent objects
DROP TABLE IF EXISTS coaches CASCADE;

-- Drop players table and all dependent objects
DROP TABLE IF EXISTS players CASCADE;


-- Note: Indexes are automatically dropped when their parent table is dropped
-- The CASCADE option ensures that any dependent objects (views, foreign keys, etc.) are also dropped
