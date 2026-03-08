-- Migration: Add media columns to players table
-- Description: Adds profile_image and video_thumbnail columns for player media
-- Date: 2026-03-06

-- Add profile_image column
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Add video_thumbnail column
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS video_thumbnail TEXT;

-- Add comments for documentation
COMMENT ON COLUMN players.profile_image IS 'URL to player profile image';
COMMENT ON COLUMN players.video_thumbnail IS 'URL to player highlight video thumbnail';
