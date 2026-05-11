-- Rollback Migration for 004_create_scholarships.sql
-- Description: Drops the scholarships table, its indexes, trigger, and the scholarship_status enum

-- ============================================================================
-- DROP TABLE
-- ============================================================================

-- Drop scholarships table and all dependent objects
-- Note: indexes idx_scholarships_coach_id, idx_scholarships_player_id, idx_scholarships_status
--       and trigger update_scholarships_updated_at are automatically dropped with the table
DROP TABLE IF EXISTS scholarships CASCADE;

-- ============================================================================
-- DROP ENUM TYPE
-- ============================================================================

DROP TYPE IF EXISTS scholarship_status;
