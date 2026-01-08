-- Migration: Create players table
-- Description: Creates the players table with all required fields, constraints, and indexes
-- Requirements: 3.1, 3.2, 3.3, 3.4

-- Create players table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    sex VARCHAR(20) NOT NULL,
    sport VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    gpa DECIMAL(3,2) NOT NULL,
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    region VARCHAR(100),
    scholarship_amount DECIMAL(10,2),
    test_scores TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- CHECK constraint for GPA (Requirement 3.3)
    CONSTRAINT check_gpa_range CHECK (gpa >= 0.0 AND gpa <= 4.0),
    
    -- CHECK constraint for location fields (Requirement 3.4)
    -- If country is USA, state must be provided; otherwise region must be provided
    CONSTRAINT check_location CHECK (
        (country = 'USA' AND state IS NOT NULL) OR
        (country != 'USA' AND region IS NOT NULL)
    )
);

-- Create index on email for case-insensitive lookups (Requirement 3.2, 3.6)
CREATE INDEX IF NOT EXISTS idx_players_email ON players(LOWER(email));

-- Create index on sport for filtering (Requirement 3.1)
CREATE INDEX IF NOT EXISTS idx_players_sport ON players(sport);

-- Create index on created_at for sorting and time-based queries (Requirement 3.3)
CREATE INDEX IF NOT EXISTS idx_players_created_at ON players(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE players IS 'Stores player registration information';
COMMENT ON COLUMN players.id IS 'Unique player identifier (UUID)';
COMMENT ON COLUMN players.email IS 'Player email address (unique, case-insensitive)';
COMMENT ON COLUMN players.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN players.gpa IS 'Grade Point Average (0.0 to 4.0)';
COMMENT ON COLUMN players.state IS 'US state (required if country is USA)';
COMMENT ON COLUMN players.region IS 'Region/province (required if country is not USA)';
COMMENT ON CONSTRAINT check_gpa_range ON players IS 'Ensures GPA is between 0.0 and 4.0';
COMMENT ON CONSTRAINT check_location ON players IS 'Ensures state is provided for USA, region for other countries';
