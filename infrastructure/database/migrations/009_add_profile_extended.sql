-- Migration 009: Add profile_extended JSONB column to players table
-- Stores profile data that doesn't have dedicated columns:
-- contact info, stats, achievements, coach testimonials, and extended academic fields

ALTER TABLE players
    ADD COLUMN IF NOT EXISTS profile_extended JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN players.profile_extended IS 'Extended profile data stored as JSON: contact, stats, achievements, coachTestimonials, and academic fields without dedicated columns';
