-- Migration: 002_create_coach_prospects
-- Description: Creates the coach_prospects table for storing coach-player favoriting relationships

-- ============================================================================
-- COACH_PROSPECTS TABLE
-- ============================================================================

CREATE TABLE coach_prospects (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys
    coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT unique_coach_player UNIQUE (coach_id, player_id)
);

-- Create index for efficient lookup by coach
CREATE INDEX idx_coach_prospects_coach_id ON coach_prospects(coach_id);

-- Add table comment
COMMENT ON TABLE coach_prospects IS 'Stores coach-player favoriting relationships for the prospects/recruiting feature';

-- Add column comments
COMMENT ON COLUMN coach_prospects.id IS 'Unique identifier for the prospect entry';
COMMENT ON COLUMN coach_prospects.coach_id IS 'Reference to the coach who favorited the player';
COMMENT ON COLUMN coach_prospects.player_id IS 'Reference to the favorited player';
COMMENT ON COLUMN coach_prospects.created_at IS 'Timestamp when the player was favorited';
