-- Seed data for local development
-- This file contains dummy player data for testing

-- Clear existing data (optional - comment out if you want to preserve data)
-- TRUNCATE TABLE players CASCADE;

-- Insert 20 dummy players with realistic test data
INSERT INTO players (
    first_name, 
    last_name, 
    email, 
    password_hash, 
    sex, 
    sport, 
    position, 
    gpa, 
    country, 
    state, 
    region, 
    scholarship_amount, 
    test_scores
) VALUES
-- Basketball Players
('Michael', 'Johnson', 'michael.johnson@example.com', 'oka', 'male', 'basketball', 'Point Guard', 3.8, 'USA', 'California', NULL, 25000.00, 'SAT: 1450, ACT: 32'),
('Sarah', 'Williams', 'sarah.williams@example.com', '$2b$10$rZ5L3KxGxGxGxGxGxGxGxOqK5L3KxGxGxGxGxGxGxGxGxGxGxGxGx', 'female', 'basketball', 'Shooting Guard', 3.9, 'USA', 'Texas', NULL, 30000.00, 'SAT: 1520, ACT: 34'),
('James', 'Davis', 'james.davis@example.com', '$2b$10$rZ5L3KxGxGxGxGxGxGxGxOqK5L3KxGxGxGxGxGxGxGxGxGxGxGxGx', 'male', 'basketball', 'Center', 3.2, 'USA', 'New York', NULL, 20000.00, 'SAT: 1200, ACT: 26'),
('Emily', 'Brown', 'emily.brown@example.com', '$2b$10$rZ5L3KxGxGxGxGxGxGxGxOqK5L3KxGxGxGxGxGxGxGxGxGxGxGxGx', 'female', 'basketball', 'Power Forward', 3.6, 'USA', 'Florida', NULL, 22000.00, 'SAT: 1350, ACT: 29'),

-- Football Players
('David', 'Martinez', 'david.martinez@example.com', '$2b$10$rZ5L3KxGxGxGxGxGxGxGxOqK5L3KxGxGxGxGxGxGxGxGxGxGxGxGx', 'male', 'football', 'Quarterback', 3.7, 'USA', 'Ohio', NULL, 35000.00, 'SAT: 1400, ACT: 31'),
('Christopher', 'Garcia', 'chris.garcia@example.com', '$2b$10$rZ5L3KxGxGxGxGxGxGxGxOqK5L3KxGxGxGxGxGxGxGxGxGxGxGxGx', 'male', 'football', 'Wide Receiver', 3.4, 'USA', 'Georgia', NULL, 28000.00, 'SAT: 1280, ACT: 28'),
('Daniel', 'Rodriguez', 'daniel.rodriguez@example.com', '$2b$10$rZ5L3KxGxGxGxGxGxGxGxOqK5L3KxGxGxGxGxGxGxGxGxGxGxGxGx', 'male', 'football', 'Linebacker', 3.1, 'USA', 'Alabama', NULL, 18000.00, 'SAT: 1150, ACT: 25'),
('Matthew', 'Wilson', 'matthew.wilson@example.com', '$2b$10$rZ5L3KxGxGxGxGxGxGxGxOqK5L3KxGxGxGxGxGxGxGxGxGxGxGxGx', 'male', 'football', 'Running Back', 3.3, 'USA', 'Michigan', NULL, 24000.00, 'SAT: 1250, ACT: 27'),

-- Soccer Players
('Sophia', 'Anderson', 'sophia.anderson@example.com', '$2b$10$rZ5L3KxGxGxGxGxGxGxGxOqK5L3KxGxGxGxGxGxGxGxGxGxGxGxGx', 'female', 'soccer', 'Forward', 3.9, 'USA', 'Washington', NULL, 32000.00, 'SAT: 1480, ACT: 33'),
('Olivia', 'Thomas', 'olivia.thomas@example.com', '$2b$10$rZ5L3KxGxGxGxGxGxGxGxOqK5L3KxGxGxGxGxGxGxGxGxGxGxGxGx', 'female', 'soccer', 'Midfielder', 3.7, 'USA', 'Colorado', NULL, 26000.00, 'SAT: 1380, ACT: 30'),
('Isabella', 'Taylor', 'isabella.taylor@example.com', '$2b$10$rZ5L3KxGxGxGxGxGxGxGxOqK5L3KxGxGxGxGxGxGxGxGxGxGxGxGx', 'female', 'soccer', 'Goalkeeper', 3.5, 'USA', 'Oregon', NULL, 21000.00, 'SAT: 1320, ACT: 28'),
('Emma', 'Moore', 'emma.moore@example.com', '$2b$10$rZ5L3KxGxGxGxGxGxGxGxOqK5L3KxGxGxGxGxGxGxGxGxGxGxGxGx', 'female', 'soccer', 'Defender', 3.8, 'USA', 'North Carolina', NULL, 29000.00, 'SAT: 1420, ACT: 31'),

-- Baseball Players
('William', 'Jackson', 'william.jackson@example.com', '$2b$10$rZ5L3KxGxGxGxGxGxGxGxOqK5L3KxGxGxGxGxGxGxGxGxGxGxGxGx', 'male', 'baseball', 'Pitcher', 3.6, 'USA', 'Arizona', NULL, 27000.00, 'SAT: 1360, ACT: 29'),
('Alexander', 'White', 'alex.white@example.com', '$2b$10$rZ5L3KxGxGxGxGxGxGxGxOqK5L3KxGxGxGxGxGxGxGxGxGxGxGxGx', 'male', 'baseball', 'Catcher', 3.4, 'USA', 'Louisiana', NULL, 23000.00, 'SAT: 1290, ACT: 27'),
('Benjamin', 'Harris', 'ben.harris@example.com', '$2b$10$rZ5L3KxGxGxGxGxGxGxGxOqK5L3KxGxGxGxGxGxGxGxGxGxGxGxGx', 'male', 'baseball', 'Shortstop', 3.2, 'USA', 'South Carolina', NULL, 19000.00, 'SAT: 1220, ACT: 26'),

-- Volleyball Players
('Ava', 'Martin', 'ava.martin@example.com', '$2b$10$rZ5L3KxGxGxGxGxGxGxGxOqK5L3KxGxGxGxGxGxGxGxGxGxGxGxGx', 'female', 'volleyball', 'Outside Hitter', 3.7, 'USA', 'Minnesota', NULL, 25000.00, 'SAT: 1390, ACT: 30'),
('Mia', 'Thompson', 'mia.thompson@example.com', '$2b$10$rZ5L3KxGxGxGxGxGxGxGxOqK5L3KxGxGxGxGxGxGxGxGxGxGxGxGx', 'female', 'volleyball', 'Setter', 3.9, 'USA', 'Wisconsin', NULL, 31000.00, 'SAT: 1500, ACT: 33'),
('Charlotte', 'Lee', 'charlotte.lee@example.com', '$2b$10$rZ5L3KxGxGxGxGxGxGxGxOqK5L3KxGxGxGxGxGxGxGxGxGxGxGxGx', 'female', 'volleyball', 'Middle Blocker', 3.5, 'USA', 'Illinois', NULL, 22000.00, 'SAT: 1330, ACT: 28'),

-- International Players
('Lucas', 'Silva', 'lucas.silva@example.com', '$2b$10$rZ5L3KxGxGxGxGxGxGxGxOqK5L3KxGxGxGxGxGxGxGxGxGxGxGxGx', 'male', 'soccer', 'Midfielder', 3.6, 'Brazil', NULL, 'South America', 15000.00, 'TOEFL: 95'),
('Sophie', 'Dubois', 'sophie.dubois@example.com', '$2b$10$rZ5L3KxGxGxGxGxGxGxGxOqK5L3KxGxGxGxGxGxGxGxGxGxGxGxGx', 'female', 'tennis', 'Singles', 3.8, 'France', NULL, 'Europe', 28000.00, 'TOEFL: 102, SAT: 1410');

-- Note: All passwords are hashed version of "Password123!" for testing purposes
-- In production, each user would have their own unique password hash
