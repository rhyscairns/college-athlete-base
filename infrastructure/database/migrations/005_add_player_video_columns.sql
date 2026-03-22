-- Migration: Add video URL and title columns to players table
-- Description: Adds video_url and video_title columns for player highlight videos
-- Date: 2026-03-22

-- Add video_url column
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add video_title column
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS video_title TEXT;

-- Add comments for documentation
COMMENT ON COLUMN players.video_url IS 'URL to player highlight video (YouTube URL)';
COMMENT ON COLUMN players.video_title IS 'Title of the player highlight video';
