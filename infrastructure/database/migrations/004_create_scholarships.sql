-- Migration: 004_create_scholarships
-- Description: Creates the scholarships table for the formal scholarship offer workflow between coaches and players

-- ============================================================================
-- ENUM TYPE
-- ============================================================================

CREATE TYPE scholarship_status AS ENUM ('pending', 'accepted', 'rejected', 'countered');

COMMENT ON TYPE scholarship_status IS 'Possible states of a scholarship offer in the coach-player workflow';

-- ============================================================================
-- SCHOLARSHIPS TABLE
-- ============================================================================

CREATE TABLE scholarships (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys
    coach_id  UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,

    -- Offer status
    status scholarship_status NOT NULL DEFAULT 'pending',

    -- Offer terms (set by coach)
    school_name        VARCHAR(255)   NOT NULL,
    sport              VARCHAR(100)   NOT NULL,
    scholarship_amount DECIMAL(10,2)  NOT NULL CHECK (scholarship_amount >= 0),
    required_gpa       DECIMAL(3,2)   NOT NULL CHECK (required_gpa >= 0.0 AND required_gpa <= 4.0),
    division           VARCHAR(50),
    start_year         INTEGER        CHECK (start_year >= 2024 AND start_year <= 2040),
    duration_years     INTEGER        CHECK (duration_years >= 1 AND duration_years <= 6),
    notes              TEXT,

    -- Counter offer fields (populated by player)
    counter_amount DECIMAL(10,2),
    counter_gpa    DECIMAL(3,2),
    counter_notes  TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- One active offer per coach-player pair
    CONSTRAINT uq_coach_player UNIQUE (coach_id, player_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_scholarships_coach_id  ON scholarships(coach_id);
CREATE INDEX idx_scholarships_player_id ON scholarships(player_id);
CREATE INDEX idx_scholarships_status    ON scholarships(status);

-- ============================================================================
-- TRIGGER
-- ============================================================================

-- Reuse the update_updated_at_column() function defined in migration 001
CREATE TRIGGER update_scholarships_updated_at
    BEFORE UPDATE ON scholarships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE scholarships IS 'Stores scholarship offers sent by coaches to players; one active offer per coach-player pair';

COMMENT ON COLUMN scholarships.id IS 'Unique identifier for the scholarship offer';
COMMENT ON COLUMN scholarships.coach_id IS 'Reference to the coach who created the offer';
COMMENT ON COLUMN scholarships.player_id IS 'Reference to the player who received the offer';
COMMENT ON COLUMN scholarships.status IS 'Current state of the offer: pending, accepted, rejected, or countered';
COMMENT ON COLUMN scholarships.school_name IS 'Name of the school making the offer';
COMMENT ON COLUMN scholarships.sport IS 'Sport for which the scholarship is offered';
COMMENT ON COLUMN scholarships.scholarship_amount IS 'Annual scholarship amount in dollars (must be >= 0)';
COMMENT ON COLUMN scholarships.required_gpa IS 'Minimum GPA required to maintain the scholarship (0.0 to 4.0)';
COMMENT ON COLUMN scholarships.division IS 'Athletic division (e.g., Division I, Division II, Division III)';
COMMENT ON COLUMN scholarships.start_year IS 'Academic year the scholarship begins (2024–2040)';
COMMENT ON COLUMN scholarships.duration_years IS 'Number of years the scholarship covers (1–6)';
COMMENT ON COLUMN scholarships.notes IS 'Additional notes from the coach';
COMMENT ON COLUMN scholarships.counter_amount IS 'Scholarship amount proposed by the player in a counter offer';
COMMENT ON COLUMN scholarships.counter_gpa IS 'GPA requirement proposed by the player in a counter offer';
COMMENT ON COLUMN scholarships.counter_notes IS 'Notes from the player when submitting a counter offer';
COMMENT ON COLUMN scholarships.created_at IS 'Timestamp when the offer was first created';
COMMENT ON COLUMN scholarships.updated_at IS 'Timestamp when the offer was last updated';

COMMENT ON TRIGGER update_scholarships_updated_at ON scholarships IS 'Automatically updates updated_at timestamp when scholarship record is modified';
