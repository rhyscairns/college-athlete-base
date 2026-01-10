-- Migration: Create coaches table
-- Description: Table to store coach registration and profile information
-- Author: System
-- Date: 2026-01-10

-- Create coaches table
CREATE TABLE IF NOT EXISTS coaches (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Personal information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Professional information
    sport VARCHAR(50) NOT NULL,
    coaching_level VARCHAR(50) NOT NULL, -- e.g., 'high_school', 'college', 'professional'
    years_experience INTEGER,
    
    -- Contact information
    phone VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    city VARCHAR(100),
    
    -- Organization information
    current_organization VARCHAR(255),
    position_title VARCHAR(100),
    
    -- Additional information
    certifications TEXT[], -- Array of certification names
    specializations TEXT[], -- Array of specialization areas
    bio TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX idx_coaches_email ON coaches(LOWER(email));
CREATE INDEX idx_coaches_sport ON coaches(sport);
CREATE INDEX idx_coaches_coaching_level ON coaches(coaching_level);
CREATE INDEX idx_coaches_created_at ON coaches(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_coaches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_coaches_updated_at
    BEFORE UPDATE ON coaches
    FOR EACH ROW
    EXECUTE FUNCTION update_coaches_updated_at();

-- Add comments for documentation
COMMENT ON TABLE coaches IS 'Stores coach registration and profile information';
COMMENT ON COLUMN coaches.id IS 'Unique identifier for the coach';
COMMENT ON COLUMN coaches.email IS 'Coach email address (unique, case-insensitive)';
COMMENT ON COLUMN coaches.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN coaches.sport IS 'Primary sport coached';
COMMENT ON COLUMN coaches.coaching_level IS 'Level of coaching (high_school, college, professional)';
COMMENT ON COLUMN coaches.years_experience IS 'Years of coaching experience';
COMMENT ON COLUMN coaches.certifications IS 'Array of coaching certifications';
COMMENT ON COLUMN coaches.specializations IS 'Array of coaching specialization areas';
