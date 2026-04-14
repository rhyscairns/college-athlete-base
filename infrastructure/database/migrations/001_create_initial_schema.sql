-- Consolidated Initial Schema Migration
-- Description: Creates the complete database schema with players and coaches tables
-- This migration consolidates all previous migrations into a single baseline

-- ============================================================================
-- PLAYERS TABLE
-- ============================================================================

-- Create players table with all fields
CREATE TABLE players (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Personal information (required)
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    sex VARCHAR(20) NOT NULL,
    
    -- Athletic information (required)
    sport VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    gpa DECIMAL(3,2) NOT NULL,
    
    -- Athletic preferences (optional)
    desired_division VARCHAR(50),
    affordable_amount DECIMAL(10,2),
    
    -- Location information (required)
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    region VARCHAR(100),
    
    -- Profile fields (optional)
    height_feet INTEGER,
    height_inches INTEGER,
    weight_lbs INTEGER,
    grad_year INTEGER,
    high_school VARCHAR(255),
    club_team VARCHAR(255),
    hometown VARCHAR(255),
    bio TEXT,
    
    -- Academic fields (optional)
    scholarship_amount DECIMAL(10,2),
    test_scores VARCHAR(255),
    
    -- Media fields (optional)
    profile_image_url TEXT,
    cover_image_url TEXT,
    highlight_video_url TEXT,
    
    -- Additional video fields (optional)
    video_title VARCHAR(255),
    video_description TEXT,
    video_thumbnail_url TEXT,
    
    -- Promo code fields
    promo_code VARCHAR(50) UNIQUE,
    promo_code_applied_at TIMESTAMP WITH TIME ZONE,
    
    -- Referral fields (using promo codes)
    referral_promo_code VARCHAR(50),
    external_referral_promo_code VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_gpa_range CHECK (gpa >= 0.0 AND gpa <= 4.0),
    CONSTRAINT check_affordable_amount CHECK (
        affordable_amount IS NULL OR affordable_amount >= 0
    ),
    CONSTRAINT check_location CHECK (
        (country = 'USA' AND state IS NOT NULL) OR
        (country != 'USA' AND region IS NOT NULL)
    ),
    CONSTRAINT check_minimum_age CHECK (
        date_of_birth <= CURRENT_DATE - INTERVAL '13 years'
    ),
    CONSTRAINT check_height_feet CHECK (
        height_feet IS NULL OR (height_feet >= 4 AND height_feet <= 8)
    ),
    CONSTRAINT check_height_inches CHECK (
        height_inches IS NULL OR (height_inches >= 0 AND height_inches <= 11)
    ),
    CONSTRAINT check_weight CHECK (
        weight_lbs IS NULL OR (weight_lbs >= 50 AND weight_lbs <= 500)
    ),
    CONSTRAINT check_grad_year CHECK (
        grad_year IS NULL OR (grad_year >= 2020 AND grad_year <= 2040)
    )
);

-- Create indexes for players table
CREATE INDEX idx_players_email ON players(email);
CREATE INDEX idx_players_sport ON players(sport);
CREATE INDEX idx_players_created_at ON players(created_at);
CREATE INDEX idx_players_date_of_birth ON players(date_of_birth);

-- Add table comment
COMMENT ON TABLE players IS 'Stores player/athlete profiles with personal, athletic, and media information';

-- Add column comments for players table
COMMENT ON COLUMN players.id IS 'Unique identifier for the player';
COMMENT ON COLUMN players.first_name IS 'Player first name';
COMMENT ON COLUMN players.last_name IS 'Player last name';
COMMENT ON COLUMN players.date_of_birth IS 'Player date of birth (must be at least 13 years old)';
COMMENT ON COLUMN players.email IS 'Player email address (unique, used for login)';
COMMENT ON COLUMN players.password_hash IS 'Hashed password for authentication';
COMMENT ON COLUMN players.sex IS 'Player biological sex';
COMMENT ON COLUMN players.sport IS 'Primary sport played';
COMMENT ON COLUMN players.position IS 'Position played in the sport';
COMMENT ON COLUMN players.gpa IS 'Grade point average (0.0 to 4.0)';
COMMENT ON COLUMN players.desired_division IS 'Desired athletic division (e.g., Division I, Division II, Division III)';
COMMENT ON COLUMN players.affordable_amount IS 'Maximum affordable scholarship amount in dollars';
COMMENT ON COLUMN players.country IS 'Country of residence';
COMMENT ON COLUMN players.state IS 'State (required for USA)';
COMMENT ON COLUMN players.region IS 'Region (required for non-USA)';
COMMENT ON COLUMN players.height_feet IS 'Height in feet (4-8)';
COMMENT ON COLUMN players.height_inches IS 'Height in inches (0-11)';
COMMENT ON COLUMN players.weight_lbs IS 'Weight in pounds (50-500)';
COMMENT ON COLUMN players.grad_year IS 'Expected graduation year (2020-2040)';
COMMENT ON COLUMN players.high_school IS 'High school name';
COMMENT ON COLUMN players.club_team IS 'Club team name';
COMMENT ON COLUMN players.hometown IS 'Hometown';
COMMENT ON COLUMN players.bio IS 'Player biography';
COMMENT ON COLUMN players.scholarship_amount IS 'Scholarship amount in dollars';
COMMENT ON COLUMN players.test_scores IS 'Standardized test scores';
COMMENT ON COLUMN players.profile_image_url IS 'URL to profile image';
COMMENT ON COLUMN players.cover_image_url IS 'URL to cover/banner image';
COMMENT ON COLUMN players.highlight_video_url IS 'URL to highlight video';
COMMENT ON COLUMN players.video_title IS 'Title for highlight video';
COMMENT ON COLUMN players.video_description IS 'Description for highlight video';
COMMENT ON COLUMN players.video_thumbnail_url IS 'URL to video thumbnail image';
COMMENT ON COLUMN players.promo_code IS 'Unique promo code for this player';
COMMENT ON COLUMN players.promo_code_applied_at IS 'Timestamp when promo code was applied';
COMMENT ON COLUMN players.referral_promo_code IS 'Promo code of the person who directly referred this player';
COMMENT ON COLUMN players.external_referral_promo_code IS 'Promo code of the person who referred the referrer';
COMMENT ON COLUMN players.created_at IS 'Timestamp when player record was created';
COMMENT ON COLUMN players.updated_at IS 'Timestamp when player record was last updated';


-- ============================================================================
-- COACHES TABLE
-- ============================================================================

-- Create coaches table with all fields
CREATE TABLE coaches (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Personal information (required)
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Professional information (required)
    sport VARCHAR(50) NOT NULL,
    coaching_level VARCHAR(50) NOT NULL,
    
    -- Professional information (optional)
    years_experience INTEGER,
    position_title VARCHAR(100),
    
    -- Contact information (optional)
    phone VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    city VARCHAR(100),
    
    -- Organization information (optional)
    current_organization VARCHAR(255),
    
    -- University/Team information (optional)
    university_logo_url TEXT,
    conference VARCHAR(100),
    division VARCHAR(100),
    team_name VARCHAR(255),
    team_website_url TEXT,
    
    -- Office information (optional)
    office_location VARCHAR(255),
    office_hours VARCHAR(255),
    
    -- Profile content (optional)
    bio TEXT,
    certifications TEXT[],
    specializations TEXT[],
    achievements JSONB DEFAULT '[]'::jsonb,
    
    -- Media fields (optional)
    profile_image_url TEXT,
    
    -- Promo code
    promo_code VARCHAR(50) UNIQUE,
    
    -- Referral fields (using promo codes)
    referral_promo_code VARCHAR(50),
    external_referral_promo_code VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_years_experience CHECK (
        years_experience IS NULL OR years_experience >= 0
    )
);

-- Create indexes for coaches table
CREATE INDEX idx_coaches_email ON coaches(email);
CREATE INDEX idx_coaches_sport ON coaches(sport);
CREATE INDEX idx_coaches_coaching_level ON coaches(coaching_level);
CREATE INDEX idx_coaches_created_at ON coaches(created_at);
CREATE INDEX idx_coaches_promo_code ON coaches(promo_code);

-- Add table comment
COMMENT ON TABLE coaches IS 'Stores coach profiles with professional, organizational, and contact information';

-- Add column comments for coaches table
COMMENT ON COLUMN coaches.id IS 'Unique identifier for the coach';
COMMENT ON COLUMN coaches.first_name IS 'Coach first name';
COMMENT ON COLUMN coaches.last_name IS 'Coach last name';
COMMENT ON COLUMN coaches.email IS 'Coach email address (unique, used for login)';
COMMENT ON COLUMN coaches.password_hash IS 'Hashed password for authentication';
COMMENT ON COLUMN coaches.sport IS 'Primary sport coached';
COMMENT ON COLUMN coaches.coaching_level IS 'Level of coaching (e.g., high school, college, professional)';
COMMENT ON COLUMN coaches.years_experience IS 'Years of coaching experience (must be non-negative)';
COMMENT ON COLUMN coaches.position_title IS 'Official position title';
COMMENT ON COLUMN coaches.phone IS 'Contact phone number';
COMMENT ON COLUMN coaches.country IS 'Country of residence';
COMMENT ON COLUMN coaches.state IS 'State of residence';
COMMENT ON COLUMN coaches.city IS 'City of residence';
COMMENT ON COLUMN coaches.current_organization IS 'Current organization/institution';
COMMENT ON COLUMN coaches.university_logo_url IS 'URL to university/organization logo';
COMMENT ON COLUMN coaches.conference IS 'Athletic conference';
COMMENT ON COLUMN coaches.division IS 'Athletic division';
COMMENT ON COLUMN coaches.team_name IS 'Team name';
COMMENT ON COLUMN coaches.team_website_url IS 'URL to team website';
COMMENT ON COLUMN coaches.office_location IS 'Office location';
COMMENT ON COLUMN coaches.office_hours IS 'Office hours';
COMMENT ON COLUMN coaches.bio IS 'Coach biography';
COMMENT ON COLUMN coaches.certifications IS 'Array of certifications';
COMMENT ON COLUMN coaches.specializations IS 'Array of coaching specializations';
COMMENT ON COLUMN coaches.achievements IS 'JSON array of achievements';
COMMENT ON COLUMN coaches.profile_image_url IS 'URL to profile image';
COMMENT ON COLUMN coaches.promo_code IS 'Unique promo code for this coach';
COMMENT ON COLUMN coaches.referral_promo_code IS 'Promo code of the person who directly referred this coach';
COMMENT ON COLUMN coaches.external_referral_promo_code IS 'Promo code of the person who referred the referrer';
COMMENT ON COLUMN coaches.created_at IS 'Timestamp when coach record was created';
COMMENT ON COLUMN coaches.updated_at IS 'Timestamp when coach record was last updated';


-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates the updated_at column to the current timestamp';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Create trigger for players table
CREATE TRIGGER update_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_players_updated_at ON players IS 'Automatically updates updated_at timestamp when player record is modified';

-- Create trigger for coaches table
CREATE TRIGGER update_coaches_updated_at
    BEFORE UPDATE ON coaches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_coaches_updated_at ON coaches IS 'Automatically updates updated_at timestamp when coach record is modified';
