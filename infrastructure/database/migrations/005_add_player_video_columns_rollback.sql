-- Rollback Migration: Remove video URL and title columns from players table
-- Description: Removes video_url and video_title columns
-- Date: 2026-03-22

-- Remove video_title column
ALTER TABLE players 
DROP COLUMN IF EXISTS video_title;

-- Remove video_url column
ALTER TABLE players 
DROP COLUMN IF EXISTS video_url;
