-- Migration: Add profile image and team website columns to coaches table
-- Description: Adds profile_image_url and team_website_url columns for coach profile feature
-- Author: System
-- Date: 2026-02-15

-- Add profile image URL column
ALTER TABLE coaches 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Add team website URL column
ALTER TABLE coaches 
ADD COLUMN IF NOT EXISTS team_website_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN coaches.profile_image_url IS 'URL to coach profile image';
COMMENT ON COLUMN coaches.team_website_url IS 'URL to university team website';
