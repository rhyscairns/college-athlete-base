-- Seed data for local development and testing
-- This file contains 20 dummy player records with realistic data
--
-- Data includes:
-- - 4 Basketball players (Point Guard, Shooting Guard, Center, Power Forward)
-- - 4 Football players (Quarterback, Wide Receiver, Linebacker, Running Back)
-- - 4 Soccer players (Forward, Midfielder, Defender, Goalkeeper)
-- - 3 Baseball players (Pitcher, Catcher, Shortstop)
-- - 3 Volleyball players (Outside Hitter, Setter, Middle Blocker)
-- - 2 Swimming & Diving players (Freestyle, Butterfly)
--
-- Features:
-- - Referral chains between players and from coaches
-- - Mix of players with/without videos and referrals
-- - Realistic test scores, GPAs, and physical measurements
-- - All passwords are hashed version of "Password123!" for testing
--
-- WARNING: TRUNCATE will delete ALL existing player data
-- Comment out the TRUNCATE line below to preserve existing data
TRUNCATE TABLE players CASCADE;

-- Insert 20 dummy players with realistic test data using actual sport constants
INSERT INTO players (
    first_name, 
    last_name, 
    date_of_birth,
    email, 
    password_hash,
    promo_code,
    referral_promo_code,
    sex, 
    sport, 
    position, 
    gpa,
    height_feet,
    height_inches,
    weight_lbs,
    country, 
    state, 
    scholarship_amount, 
    test_scores,
    profile_image_url,
    highlight_video_url,
    video_thumbnail_url
) VALUES
-- Basketball Players
('Michael', 'Johnson', '2008-03-15', 'michael.johnson@example.com', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'P-JOHN-BASKETBALL-123456', NULL, 'male', 'Basketball', 'Point Guard', 3.8, 6, 2, 185, 'USA', 'California', 25000.00, 'SAT: 1450, ACT: 32', 'https://images.unsplash.com/photo-1546525848-3ce03ca516f6?w=400', 'https://www.youtube.com/watch?v=3V0bw0aYxcg', 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'),
('Sarah', 'Williams', '2009-07-22', 'sarah.williams@example.com', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'P-WILL-BASKETBALL-234567', 'C-SMIT-STANFORD-1001', 'female', 'Basketball', 'Shooting Guard', 3.9, 5, 8, 145, 'USA', 'Texas', 30000.00, 'SAT: 1520, ACT: 34', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400', 'https://www.youtube.com/watch?v=3V0bw0aYxcg', 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'),
('James', 'Davis', '2008-11-08', 'james.davis@example.com', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'P-DAVI-BASKETBALL-345678', 'P-JOHN-BASKETBALL-123456', 'male', 'Basketball', 'Center', 3.2, 6, 10, 245, 'USA', 'New York', 20000.00, 'SAT: 1200, ACT: 26', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', NULL, 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'),
('Emily', 'Brown', '2009-05-14', 'emily.brown@example.com', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'P-BROW-BASKETBALL-456789', 'P-WILL-BASKETBALL-234567', 'female', 'Basketball', 'Power Forward', 3.6, 6, 0, 165, 'USA', 'Florida', 22000.00, 'SAT: 1350, ACT: 29', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 'https://www.youtube.com/watch?v=3V0bw0aYxcg', 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'),

-- Football Players
('David', 'Martinez', '2008-01-20', 'david.martinez@example.com', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'P-MART-FOOTBALL-567890', 'C-WILL-ALABAMA-1003', 'male', 'Football', 'Quarterback', 3.7, 6, 3, 210, 'USA', 'Ohio', 35000.00, 'SAT: 1400, ACT: 31', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'https://www.youtube.com/watch?v=3V0bw0aYxcg', 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'),
('Christopher', 'Garcia', '2009-09-12', 'chris.garcia@example.com', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'P-GARC-FOOTBALL-678901', 'P-MART-FOOTBALL-567890', 'male', 'Football', 'Wide Receiver', 3.4, 6, 1, 195, 'USA', 'Georgia', 28000.00, 'SAT: 1280, ACT: 28', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 'https://www.youtube.com/watch?v=3V0bw0aYxcg', 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'),
('Daniel', 'Rodriguez', '2008-04-05', 'daniel.rodriguez@example.com', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'P-RODR-FOOTBALL-789012', NULL, 'male', 'Football', 'Outside Linebacker', 3.1, 6, 2, 230, 'USA', 'Alabama', 18000.00, 'SAT: 1150, ACT: 25', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', NULL, NULL),
('Matthew', 'Wilson', '2009-12-30', 'matthew.wilson@example.com', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'P-WILS-FOOTBALL-890123', 'C-MART-MICHIGAN-1005', 'male', 'Football', 'Running Back', 3.3, 5, 10, 205, 'USA', 'Michigan', 24000.00, 'SAT: 1250, ACT: 27', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'https://www.youtube.com/watch?v=3V0bw0aYxcg', 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'),

-- Soccer Players
('Sophia', 'Anderson', '2009-06-18', 'sophia.anderson@example.com', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'P-ANDE-SOCCER-901234', 'C-BROW-UCLA-1004', 'female', 'Soccer', 'Forward', 3.9, 5, 6, 135, 'USA', 'Washington', 32000.00, 'SAT: 1480, ACT: 33', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', 'https://www.youtube.com/watch?v=3V0bw0aYxcg', 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'),
('Olivia', 'Thomas', '2010-02-25', 'olivia.thomas@example.com', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'P-THOM-SOCCER-012345', 'P-ANDE-SOCCER-901234', 'female', 'Soccer', 'Midfielder', 3.7, 5, 5, 130, 'USA', 'Colorado', 26000.00, 'SAT: 1380, ACT: 30', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', 'https://www.youtube.com/watch?v=3V0bw0aYxcg', 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'),
('Isabella', 'Jackson', '2008-08-10', 'isabella.jackson@example.com', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'P-JACK-SOCCER-123456', NULL, 'female', 'Soccer', 'Defender', 3.5, 5, 7, 140, 'USA', 'Oregon', 24000.00, 'SAT: 1320, ACT: 29', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'https://www.youtube.com/watch?v=3V0bw0aYxcg', 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'),
('Ava', 'White', '2009-11-03', 'ava.white@example.com', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'P-WHIT-SOCCER-234567', 'P-THOM-SOCCER-012345', 'female', 'Soccer', 'Goalkeeper', 3.4, 5, 9, 150, 'USA', 'North Carolina', 21000.00, 'SAT: 1270, ACT: 28', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'https://www.youtube.com/watch?v=3V0bw0aYxcg', 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'),

-- Baseball Players
('Ethan', 'Harris', '2008-05-28', 'ethan.harris@example.com', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'P-HARR-BASEBALL-345678', NULL, 'male', 'Baseball', 'Pitcher', 3.6, 6, 1, 190, 'USA', 'Arizona', 27000.00, 'SAT: 1360, ACT: 30', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', 'https://www.youtube.com/watch?v=3V0bw0aYxcg', 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'),
('Alexander', 'Martin', '2009-03-17', 'alex.martin@example.com', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'P-MART-BASEBALL-456789', 'P-HARR-BASEBALL-345678', 'male', 'Baseball', 'Catcher', 3.3, 6, 0, 200, 'USA', 'Louisiana', 23000.00, 'SAT: 1240, ACT: 27', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', NULL, NULL),
('William', 'Lee', '2008-12-09', 'william.lee@example.com', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'P-LEE-BASEBALL-567890', 'P-MART-BASEBALL-456789', 'male', 'Baseball', 'Shortstop', 3.7, 5, 11, 180, 'USA', 'South Carolina', 29000.00, 'SAT: 1410, ACT: 31', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', 'https://www.youtube.com/watch?v=3V0bw0aYxcg', 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'),

-- Volleyball Players
('Mia', 'Walker', '2009-04-21', 'mia.walker@example.com', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'P-WALK-VOLLEYBALL-678901', 'C-RODR-WISCONSIN-1008', 'female', 'Volleyball', 'Outside Hitter', 3.8, 6, 1, 160, 'USA', 'Wisconsin', 28000.00, 'SAT: 1420, ACT: 31', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', 'https://www.youtube.com/watch?v=3V0bw0aYxcg', 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'),
('Charlotte', 'Hall', '2010-01-14', 'charlotte.hall@example.com', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'P-HALL-VOLLEYBALL-789012', 'P-WALK-VOLLEYBALL-678901', 'female', 'Volleyball', 'Setter', 3.9, 5, 10, 155, 'USA', 'Nebraska', 31000.00, 'SAT: 1490, ACT: 33', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', 'https://www.youtube.com/watch?v=3V0bw0aYxcg', 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'),
('Amelia', 'Allen', '2008-07-06', 'amelia.allen@example.com', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'P-ALLE-VOLLEYBALL-890123', NULL, 'female', 'Volleyball', 'Middle Blocker', 3.5, 6, 3, 170, 'USA', 'Minnesota', 25000.00, 'SAT: 1330, ACT: 29', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'https://www.youtube.com/watch?v=3V0bw0aYxcg', 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'),

-- Swimming Players
('Benjamin', 'Young', '2009-10-19', 'benjamin.young@example.com', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'P-YOUN-SWIMMING-901234', 'C-WILS-FLORIDA-1009', 'male', 'Swimming & Diving', 'Freestyle', 3.6, 6, 0, 175, 'USA', 'Florida', 26000.00, 'SAT: 1370, ACT: 30', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', 'https://www.youtube.com/watch?v=3V0bw0aYxcg', 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg'),
('Harper', 'King', '2008-09-23', 'harper.king@example.com', '$2b$10$Xru.sQ72CAxX7LGN1pH28eNFu4bApvwO4xKgZ/dF3QsINeLS/qImm', 'P-KING-SWIMMING-012345', 'P-YOUN-SWIMMING-901234', 'female', 'Swimming & Diving', 'Butterfly', 3.8, 5, 8, 145, 'USA', 'California', 30000.00, 'SAT: 1440, ACT: 32', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', 'https://www.youtube.com/watch?v=3V0bw0aYxcg', 'https://img.youtube.com/vi/3V0bw0aYxcg/maxresdefault.jpg');
