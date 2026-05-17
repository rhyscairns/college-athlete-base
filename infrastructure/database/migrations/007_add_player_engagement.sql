-- Migration: 007_add_player_engagement
-- Description: Adds profile view counter and favorited-by-coaches array to players

ALTER TABLE players
    ADD COLUMN IF NOT EXISTS profile_views INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS favorited_by_coaches TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN players.profile_views IS 'Number of times a coach has viewed this player profile';
COMMENT ON COLUMN players.favorited_by_coaches IS 'Array of coach IDs who have favorited this player';
