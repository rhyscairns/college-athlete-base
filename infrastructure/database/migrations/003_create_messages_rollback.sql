-- Rollback Migration for 003_create_messages.sql
-- Description: Drops the messages table and its associated indexes

-- ============================================================================
-- DROP TABLES (with CASCADE to drop dependent objects)
-- ============================================================================

-- Drop messages table and all dependent objects
-- Note: indexes idx_messages_coach_player and idx_messages_created_at are
--       automatically dropped with the table
DROP TABLE IF EXISTS messages CASCADE;
