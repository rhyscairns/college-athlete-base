-- Seed data for coaches
-- This file contains dummy coach data for testing

-- Clear existing data (optional - comment out if you want to preserve data)
-- TRUNCATE TABLE coaches CASCADE;

-- Insert 10 dummy coaches with realistic test data including all profile fields
INSERT INTO coaches (
    first_name,
    last_name,
    email,
    password_hash,
    promo_code,
    referral_promo_code,
    sport,
    coaching_level,
    years_experience,
    current_organization,
    position_title,
    phone,
    country,
    state,
    university_logo_url,
    conference,
    division,
    team_name,
    office_location,
    office_hours,
    achievements
) VALUES
('John', 'Smith', 'john.smith@stanford.edu', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'C-SMIT-STANFORD-1001', NULL, 'Basketball', 'college', 15, 'Stanford University', 'Head Coach', '+1-650-555-0101', 'USA', 'California', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Stanford_Cardinal_logo.svg/200px-Stanford_Cardinal_logo.svg.png', 'Pac-12', 'NCAA Division I', 'Stanford Cardinal', 'Maples Pavilion, Room 105', 'Mon-Fri: 9:00 AM - 5:00 PM', '[{"title": "Pac-12 Conference Champion 2023"}, {"title": "NCAA Tournament Sweet Sixteen 2023"}, {"title": "Coach of the Year Award 2022"}]'::jsonb),

('Sarah', 'Johnson', 'sarah.johnson@duke.edu', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'C-JOHN-DUKE-1002', 'C-SMIT-STANFORD-1001', 'Basketball', 'college', 8, 'Duke University', 'Assistant Coach', '+1-919-555-0102', 'USA', 'North Carolina', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Duke_Blue_Devils_logo.svg/200px-Duke_Blue_Devils_logo.svg.png', 'ACC', 'NCAA Division I', 'Duke Blue Devils', 'Cameron Indoor Stadium, Room 201', 'Mon-Fri: 10:00 AM - 4:00 PM', '[{"title": "ACC Conference Champion 2023"}, {"title": "NCAA Tournament Elite Eight 2023"}, {"title": "Rising Coach Award 2022"}]'::jsonb),

('Michael', 'Williams', 'michael.williams@alabama.edu', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'C-WILL-ALABAMA-1003', NULL, 'Football', 'college', 20, 'University of Alabama', 'Head Coach', '+1-205-555-0103', 'USA', 'Alabama', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Alabama_Crimson_Tide_logo.svg/200px-Alabama_Crimson_Tide_logo.svg.png', 'SEC', 'NCAA Division I', 'Alabama Crimson Tide', 'Bryant-Denny Stadium, Suite 300', 'Mon-Fri: 8:00 AM - 6:00 PM', '[{"title": "SEC Championship 2023"}, {"title": "College Football Playoff Semifinalist 2023"}, {"title": "National Coach of the Year 2022"}]'::jsonb),

('Emily', 'Brown', 'emily.brown@ucla.edu', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'C-BROW-UCLA-1004', 'C-ANDE-OREGON-1010', 'Soccer', 'college', 12, 'UCLA', 'Head Coach', '+1-310-555-0104', 'USA', 'California', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/UCLA_Bruins_script.svg/200px-UCLA_Bruins_script.svg.png', 'Pac-12', 'NCAA Division I', 'UCLA Bruins', 'Drake Stadium, Office 150', 'Tue-Thu: 1:00 PM - 5:00 PM', '[{"title": "Pac-12 Regular Season Champion 2023"}, {"title": "NCAA Tournament Quarterfinalist 2023"}, {"title": "Regional Coach of the Year 2022"}]'::jsonb),

('David', 'Martinez', 'david.martinez@michigan.edu', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'C-MART-MICHIGAN-1005', 'C-WILL-ALABAMA-1003', 'Football', 'college', 10, 'University of Michigan', 'Offensive Coordinator', '+1-734-555-0105', 'USA', 'Michigan', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Michigan_Wolverines_logo.svg/200px-Michigan_Wolverines_logo.svg.png', 'Big Ten', 'NCAA Division I', 'Michigan Wolverines', 'Schembechler Hall, Room 220', 'Mon-Fri: 9:00 AM - 5:00 PM', '[{"title": "Big Ten Championship 2023"}, {"title": "College Football Playoff Appearance 2023"}, {"title": "Top Offensive Coordinator Award 2022"}]'::jsonb),

('Jennifer', 'Davis', 'jennifer.davis@unc.edu', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'C-DAVI-UNC-1006', 'C-BROW-UCLA-1004', 'Soccer', 'college', 6, 'University of North Carolina', 'Assistant Coach', '+1-919-555-0106', 'USA', 'North Carolina', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/North_Carolina_Tar_Heels_logo.svg/200px-North_Carolina_Tar_Heels_logo.svg.png', 'ACC', 'NCAA Division I', 'North Carolina Tar Heels', 'Fetzer Field, Office 101', 'Mon-Wed-Fri: 2:00 PM - 6:00 PM', '[{"title": "ACC Tournament Runner-up 2023"}, {"title": "NCAA Tournament Round of 16 2023"}, {"title": "Assistant Coach Excellence Award 2022"}]'::jsonb),

('Robert', 'Garcia', 'robert.garcia@texas.edu', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'C-GARC-TEXAS-1007', NULL, 'Baseball', 'college', 18, 'University of Texas', 'Head Coach', '+1-512-555-0107', 'USA', 'Texas', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Texas_Longhorns_logo.svg/200px-Texas_Longhorns_logo.svg.png', 'Big 12', 'NCAA Division I', 'Texas Longhorns', 'UFCU Disch-Falk Field, Office 200', 'Mon-Fri: 10:00 AM - 4:00 PM', '[{"title": "Big 12 Regular Season Champion 2023"}, {"title": "College World Series Participant 2023"}, {"title": "National Coach of the Year Finalist 2022"}]'::jsonb),

('Lisa', 'Rodriguez', 'lisa.rodriguez@wisconsin.edu', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'C-RODR-WISCONSIN-1008', 'C-JOHN-DUKE-1002', 'Volleyball', 'college', 14, 'University of Wisconsin', 'Head Coach', '+1-608-555-0108', 'USA', 'Wisconsin', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Wisconsin_Badgers_logo.svg/200px-Wisconsin_Badgers_logo.svg.png', 'Big Ten', 'NCAA Division I', 'Wisconsin Badgers', 'UW Field House, Room 305', 'Tue-Thu: 11:00 AM - 3:00 PM', '[{"title": "Big Ten Conference Champion 2023"}, {"title": "NCAA Tournament Final Four 2023"}, {"title": "Coach of the Year Award 2022"}]'::jsonb),

('James', 'Wilson', 'james.wilson@florida.edu', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'C-WILS-FLORIDA-1009', NULL, 'Swimming & Diving', 'college', 11, 'University of Florida', 'Head Coach', '+1-352-555-0109', 'USA', 'Florida', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Florida_Gators_logo.svg/200px-Florida_Gators_logo.svg.png', 'SEC', 'NCAA Division I', 'Florida Gators', 'O''Connell Center, Pool Office', 'Mon-Fri: 7:00 AM - 3:00 PM', '[{"title": "SEC Swimming Championship 2023"}, {"title": "NCAA Championship Runner-up 2023"}, {"title": "Swimming Coach of the Year 2022"}]'::jsonb),

('Maria', 'Anderson', 'maria.anderson@oregon.edu', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'C-ANDE-OREGON-1010', NULL, 'Track & Field', 'college', 16, 'University of Oregon', 'Head Coach', '+1-541-555-0110', 'USA', 'Oregon', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Oregon_Ducks_logo.svg/200px-Oregon_Ducks_logo.svg.png', 'Pac-12', 'NCAA Division I', 'Oregon Ducks', 'Hayward Field, Office 400', 'Mon-Fri: 8:00 AM - 4:00 PM', '[{"title": "Pac-12 Track & Field Champion 2023"}, {"title": "NCAA Outdoor Championship Winner 2023"}, {"title": "National Coach of the Year 2022"}]'::jsonb);

-- Note: All passwords are hashed version of "Password123!" for testing purposes
-- In production, each user would have their own unique password hash
-- Promo codes follow format: C-{LASTNAME_PART}-{UNIVERSITY_PART}-{4_DIGITS}
-- Referral chains created:
--   Maria Anderson (C-ANDE-OREGON-1010) -> Emily Brown (C-BROW-UCLA-1004) -> Jennifer Davis (C-DAVI-UNC-1006)
--   John Smith (C-SMIT-STANFORD-1001) -> Sarah Johnson (C-JOHN-DUKE-1002) -> Lisa Rodriguez (C-RODR-WISCONSIN-1008)
--   Michael Williams (C-WILL-ALABAMA-1003) -> David Martinez (C-MART-MICHIGAN-1005)
