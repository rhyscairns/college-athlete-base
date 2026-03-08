-- Update existing players with video thumbnails and profile images
-- This script updates the media columns for existing test players

-- Basketball Players
UPDATE players SET 
    profile_image = 'https://img.youtube.com/vi/3V0bw0aYxcg/hqdefault.jpg',
    video_thumbnail = 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'
WHERE email = 'michael.johnson@example.com';

UPDATE players SET 
    profile_image = 'https://img.youtube.com/vi/3V0bw0aYxcg/hqdefault.jpg',
    video_thumbnail = NULL
WHERE email = 'sarah.williams@example.com';

UPDATE players SET 
    profile_image = NULL,
    video_thumbnail = 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'
WHERE email = 'james.davis@example.com';

UPDATE players SET 
    profile_image = 'https://img.youtube.com/vi/3V0bw0aYxcg/hqdefault.jpg',
    video_thumbnail = 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'
WHERE email = 'emily.brown@example.com';

-- Football Players
UPDATE players SET 
    profile_image = NULL,
    video_thumbnail = 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'
WHERE email = 'david.martinez@example.com';

UPDATE players SET 
    profile_image = 'https://img.youtube.com/vi/3V0bw0aYxcg/hqdefault.jpg',
    video_thumbnail = 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'
WHERE email = 'chris.garcia@example.com';

UPDATE players SET 
    profile_image = NULL,
    video_thumbnail = NULL
WHERE email = 'daniel.rodriguez@example.com';

UPDATE players SET 
    profile_image = 'https://img.youtube.com/vi/3V0bw0aYxcg/hqdefault.jpg',
    video_thumbnail = NULL
WHERE email = 'matthew.wilson@example.com';

-- Soccer Players
UPDATE players SET 
    profile_image = 'https://img.youtube.com/vi/3V0bw0aYxcg/hqdefault.jpg',
    video_thumbnail = 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'
WHERE email = 'sophia.anderson@example.com';

UPDATE players SET 
    profile_image = NULL,
    video_thumbnail = 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'
WHERE email = 'olivia.thomas@example.com';

UPDATE players SET 
    profile_image = 'https://img.youtube.com/vi/3V0bw0aYxcg/hqdefault.jpg',
    video_thumbnail = NULL
WHERE email = 'isabella.taylor@example.com';

UPDATE players SET 
    profile_image = 'https://img.youtube.com/vi/3V0bw0aYxcg/hqdefault.jpg',
    video_thumbnail = 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'
WHERE email = 'emma.moore@example.com';

-- Baseball Players
UPDATE players SET 
    profile_image = NULL,
    video_thumbnail = 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'
WHERE email = 'william.jackson@example.com';

UPDATE players SET 
    profile_image = 'https://img.youtube.com/vi/3V0bw0aYxcg/hqdefault.jpg',
    video_thumbnail = 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'
WHERE email = 'alex.white@example.com';

UPDATE players SET 
    profile_image = NULL,
    video_thumbnail = NULL
WHERE email = 'ben.harris@example.com';

-- Volleyball Players
UPDATE players SET 
    profile_image = 'https://img.youtube.com/vi/3V0bw0aYxcg/hqdefault.jpg',
    video_thumbnail = 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'
WHERE email = 'ava.martin@example.com';

UPDATE players SET 
    profile_image = NULL,
    video_thumbnail = 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'
WHERE email = 'mia.thompson@example.com';

UPDATE players SET 
    profile_image = 'https://img.youtube.com/vi/3V0bw0aYxcg/hqdefault.jpg',
    video_thumbnail = NULL
WHERE email = 'charlotte.lee@example.com';

-- International Players
UPDATE players SET 
    profile_image = NULL,
    video_thumbnail = 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'
WHERE email = 'lucas.silva@example.com';

UPDATE players SET 
    profile_image = 'https://img.youtube.com/vi/3V0bw0aYxcg/hqdefault.jpg',
    video_thumbnail = 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'
WHERE email = 'sophie.dubois@example.com';

-- Display updated count
SELECT COUNT(*) as updated_players FROM players WHERE profile_image IS NOT NULL OR video_thumbnail IS NOT NULL;
