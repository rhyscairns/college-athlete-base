-- Rollback: 007_add_player_engagement
ALTER TABLE players
    DROP COLUMN IF EXISTS profile_views,
    DROP COLUMN IF EXISTS favorited_by_coaches;
