-- Rollback Migration: Remove extended profile columns from coaches table
-- Description: Removes university details, office information, and achievements columns
-- Author: System
-- Date: 2026-04-03

-- Drop indexes
DROP INDEX IF EXISTS idx_coaches_promo_code;

-- Remove added columns
ALTER TABLE coaches 
DROP COLUMN IF EXISTS university_logo_url,
DROP COLUMN IF EXISTS conference,
DROP COLUMN IF EXISTS division,
DROP COLUMN IF EXISTS team_name,
DROP COLUMN IF EXISTS office_location,
DROP COLUMN IF EXISTS office_hours,
DROP COLUMN IF EXISTS achievements,
DROP COLUMN IF EXISTS promo_code;
