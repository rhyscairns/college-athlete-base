-- Rollback Migration: Remove media columns from players table
-- Description: Removes profile_image and video_thumbnail columns
-- Date: 2026-03-06

-- Remove video_thumbnail column
ALTER TABLE players 
DROP COLUMN IF EXISTS video_thumbnail;

-- Remove profile_image column
ALTER TABLE players 
DROP COLUMN IF EXISTS profile_image;
