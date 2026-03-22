-- Update existing players with video URLs and titles
-- This script updates the video columns for existing test players

-- Basketball Players
UPDATE players SET 
    video_url = 'https://www.youtube.com/watch?v=3V0bw0aYxcg',
    video_title = 'Basketball Highlight Reel - Season 2025'
WHERE email = 'michael.johnson@example.com';

UPDATE players SET 
    video_url = NULL,
    video_title = NULL
WHERE email = 'sarah.williams@example.com';

UPDATE players SET 
    video_url = 'https://www.youtube.com/watch?v=3V0bw0aYxcg',
    video_title = 'Point Guard Skills Showcase'
WHERE email = 'james.davis@example.com';

UPDATE players SET 
    video_url = 'https://www.youtube.com/watch?v=3V0bw0aYxcg',
    video_title = 'Shooting Guard Highlights'
WHERE email = 'emily.brown@example.com';

-- Football Players
UPDATE players SET 
    video_url = 'https://www.youtube.com/watch?v=3V0bw0aYxcg',
    video_title = 'Quarterback Game Highlights'
WHERE email = 'david.martinez@example.com';

UPDATE players SET 
    video_url = 'https://www.youtube.com/watch?v=3V0bw0aYxcg',
    video_title = 'Wide Receiver Season Highlights'
WHERE email = 'chris.garcia@example.com';

UPDATE players SET 
    video_url = NULL,
    video_title = NULL
WHERE email = 'daniel.rodriguez@example.com';

UPDATE players SET 
    video_url = NULL,
    video_title = NULL
WHERE email = 'matthew.wilson@example.com';

-- Soccer Players
UPDATE players SET 
    video_url = 'https://www.youtube.com/watch?v=3V0bw0aYxcg',
    video_title = 'Forward Skills and Goals'
WHERE email = 'sophia.anderson@example.com';

UPDATE players SET 
    video_url = 'https://www.youtube.com/watch?v=3V0bw0aYxcg',
    video_title = 'Midfielder Playmaking Highlights'
WHERE email = 'olivia.thomas@example.com';

UPDATE players SET 
    video_url = NULL,
    video_title = NULL
WHERE email = 'isabella.taylor@example.com';

UPDATE players SET 
    video_url = 'https://www.youtube.com/watch?v=3V0bw0aYxcg',
    video_title = 'Defender Tactical Highlights'
WHERE email = 'emma.moore@example.com';

-- Baseball Players
UPDATE players SET 
    video_url = 'https://www.youtube.com/watch?v=3V0bw0aYxcg',
    video_title = 'Pitcher Strikeout Compilation'
WHERE email = 'william.jackson@example.com';

UPDATE players SET 
    video_url = 'https://www.youtube.com/watch?v=3V0bw0aYxcg',
    video_title = 'Catcher Defensive Highlights'
WHERE email = 'alex.white@example.com';

UPDATE players SET 
    video_url = NULL,
    video_title = NULL
WHERE email = 'ben.harris@example.com';

-- Volleyball Players
UPDATE players SET 
    video_url = 'https://www.youtube.com/watch?v=3V0bw0aYxcg',
    video_title = 'Outside Hitter Attack Highlights'
WHERE email = 'ava.martin@example.com';

UPDATE players SET 
    video_url = 'https://www.youtube.com/watch?v=3V0bw0aYxcg',
    video_title = 'Setter Playmaking Skills'
WHERE email = 'mia.thompson@example.com';

UPDATE players SET 
    video_url = NULL,
    video_title = NULL
WHERE email = 'charlotte.lee@example.com';

-- International Players
UPDATE players SET 
    video_url = 'https://www.youtube.com/watch?v=3V0bw0aYxcg',
    video_title = 'International Soccer Highlights'
WHERE email = 'lucas.silva@example.com';

UPDATE players SET 
    video_url = 'https://www.youtube.com/watch?v=3V0bw0aYxcg',
    video_title = 'French League Performance'
WHERE email = 'sophie.dubois@example.com';

-- Display updated count
SELECT COUNT(*) as players_with_videos FROM players WHERE video_url IS NOT NULL;
