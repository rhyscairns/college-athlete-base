-- Rollback Migration for 002_create_coach_prospects.sql
-- Description: Drops the coach_prospects table and its associated index

-- ============================================================================
-- DROP TABLES (with CASCADE to drop dependent objects)
-- ============================================================================

-- Drop coach_prospects table and all dependent objects
-- Note: The index idx_coach_prospects_coach_id is automatically dropped with the table
DROP TABLE IF EXISTS coach_prospects CASCADE;
