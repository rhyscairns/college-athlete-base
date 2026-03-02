-- Rollback Migration: Remove profile image and team website columns from coaches table
-- Description: Removes profile_image_url and team_website_url columns
-- Author: System
-- Date: 2026-02-15

-- Remove team website URL column
ALTER TABLE coaches 
DROP COLUMN IF EXISTS team_website_url;

-- Remove profile image URL column
ALTER TABLE coaches 
DROP COLUMN IF EXISTS profile_image_url;
