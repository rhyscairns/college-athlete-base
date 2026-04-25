-- Migration: 003_create_messages
-- Description: Creates the messages table for real-time coach-player messaging

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================

CREATE TABLE messages (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys
    coach_id  UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,

    -- Sender information
    sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('coach', 'player')),
    sender_id   UUID NOT NULL,

    -- Message content
    content TEXT NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at    TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- Index for efficient conversation lookup by coach-player pair
CREATE INDEX idx_messages_coach_player ON messages (coach_id, player_id);

-- Index for ordering messages by recency
CREATE INDEX idx_messages_created_at ON messages (created_at DESC);

-- Add table comment
COMMENT ON TABLE messages IS 'Stores messages exchanged between coaches and players; supports soft-delete and read tracking';

-- Add column comments
COMMENT ON COLUMN messages.id IS 'Unique identifier for the message';
COMMENT ON COLUMN messages.coach_id IS 'Reference to the coach in the conversation';
COMMENT ON COLUMN messages.player_id IS 'Reference to the player in the conversation';
COMMENT ON COLUMN messages.sender_type IS 'Indicates whether the sender is a coach or player';
COMMENT ON COLUMN messages.sender_id IS 'UUID of the user who sent the message';
COMMENT ON COLUMN messages.content IS 'Text content of the message';
COMMENT ON COLUMN messages.created_at IS 'Timestamp when the message was sent';
COMMENT ON COLUMN messages.read_at IS 'Timestamp when the recipient read the message; NULL means unread';
COMMENT ON COLUMN messages.deleted_at IS 'Timestamp when the message was soft-deleted; NULL means not deleted';
