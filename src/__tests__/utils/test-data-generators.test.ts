/**
 * Tests for test data generator utilities
 */

import {
    generateDateOfBirth,
    generatePromoCode,
    generatePlayerRegistration,
    generatePlayerProfile,
    generateCoachRegistration,
    generateCoachProfile,
    generateMultiplePlayers,
    generateMultipleCoaches,
    generatePlayerWithAge,
    generatePlayerForSport,
    generatePlayerWithReferral,
    generateCoachWithReferral
} from './test-data-generators';

describe('Test Data Generators', () => {
    describe('generateDateOfBirth', () => {
        it('should generate date of birth for default age of 17', () => {
            const dob = generateDateOfBirth();
            const date = new Date(dob);
            const today = new Date();
            const age = today.getFullYear() - date.getFullYear();

            expect(age).toBe(17);
            expect(dob).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        it('should generate date of birth for specified age', () => {
            const dob = generateDateOfBirth(25);
            const date = new Date(dob);
            const today = new Date();
            const age = today.getFullYear() - date.getFullYear();

            expect(age).toBe(25);
        });

        it('should generate valid ISO 8601 date format', () => {
            const dob = generateDateOfBirth(20);
            expect(dob).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(new Date(dob).toString()).not.toBe('Invalid Date');
        });
    });

    describe('generatePromoCode', () => {
        it('should generate promo code with default prefix', () => {
            const code = generatePromoCode();
            expect(code).toMatch(/^PROMO_\d+_[A-Z0-9]{6}$/);
        });

        it('should generate promo code with custom prefix', () => {
            const code = generatePromoCode('CUSTOM');
            expect(code).toMatch(/^CUSTOM_\d+_[A-Z0-9]{6}$/);
        });

        it('should generate unique promo codes', () => {
            const code1 = generatePromoCode();
            const code2 = generatePromoCode();
            expect(code1).not.toBe(code2);
        });
    });

    describe('generatePlayerRegistration', () => {
        it('should generate complete player registration data', () => {
            const player = generatePlayerRegistration();

            expect(player).toHaveProperty('firstName');
            expect(player).toHaveProperty('lastName');
            expect(player).toHaveProperty('dateOfBirth');
            expect(player).toHaveProperty('email');
            expect(player).toHaveProperty('password');
            expect(player).toHaveProperty('sex');
            expect(player).toHaveProperty('sport');
            expect(player).toHaveProperty('position');
            expect(player).toHaveProperty('gpa');
            expect(player).toHaveProperty('country');
            expect(player).toHaveProperty('state');
        });

        it('should generate valid email format', () => {
            const player = generatePlayerRegistration();
            expect(player.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        });

        it('should generate unique emails for multiple calls', () => {
            const player1 = generatePlayerRegistration();
            const player2 = generatePlayerRegistration();
            expect(player1.email).not.toBe(player2.email);
        });

        it('should accept overrides', () => {
            const player = generatePlayerRegistration({
                firstName: 'Custom',
                sport: 'soccer',
                gpa: 4.0
            });

            expect(player.firstName).toBe('Custom');
            expect(player.sport).toBe('soccer');
            expect(player.gpa).toBe(4.0);
        });

        it('should generate valid GPA between 0 and 4', () => {
            const player = generatePlayerRegistration();
            expect(player.gpa).toBeGreaterThanOrEqual(0);
            expect(player.gpa).toBeLessThanOrEqual(4.0);
        });
    });

    describe('generatePlayerProfile', () => {
        it('should generate complete player profile with optional fields', () => {
            const profile = generatePlayerProfile();

            // Required fields
            expect(profile).toHaveProperty('firstName');
            expect(profile).toHaveProperty('email');

            // Optional fields
            expect(profile).toHaveProperty('heightFeet');
            expect(profile).toHaveProperty('heightInches');
            expect(profile).toHaveProperty('weightLbs');
            expect(profile).toHaveProperty('gradYear');
            expect(profile).toHaveProperty('highSchool');
            expect(profile).toHaveProperty('bio');
        });

        it('should accept overrides', () => {
            const profile = generatePlayerProfile({
                heightFeet: 7,
                weightLbs: 250,
                bio: 'Custom bio'
            });

            expect(profile.heightFeet).toBe(7);
            expect(profile.weightLbs).toBe(250);
            expect(profile.bio).toBe('Custom bio');
        });
    });

    describe('generateCoachRegistration', () => {
        it('should generate complete coach registration data', () => {
            const coach = generateCoachRegistration();

            expect(coach).toHaveProperty('firstName');
            expect(coach).toHaveProperty('lastName');
            expect(coach).toHaveProperty('email');
            expect(coach).toHaveProperty('password');
            expect(coach).toHaveProperty('coachingCategory');
            expect(coach).toHaveProperty('sports');
            expect(coach).toHaveProperty('university');
        });

        it('should generate valid email format', () => {
            const coach = generateCoachRegistration();
            expect(coach.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        });

        it('should generate unique emails', () => {
            const coach1 = generateCoachRegistration();
            const coach2 = generateCoachRegistration();
            expect(coach1.email).not.toBe(coach2.email);
        });

        it('should accept overrides', () => {
            const coach = generateCoachRegistration({
                firstName: 'CustomCoach',
                coachingCategory: 'professional',
                sports: ['football', 'basketball']
            });

            expect(coach.firstName).toBe('CustomCoach');
            expect(coach.coachingCategory).toBe('professional');
            expect(coach.sports).toEqual(['football', 'basketball']);
        });
    });

    describe('generateCoachProfile', () => {
        it('should generate complete coach profile with optional fields', () => {
            const profile = generateCoachProfile();

            expect(profile).toHaveProperty('firstName');
            expect(profile).toHaveProperty('email');
            expect(profile).toHaveProperty('yearsExperience');
            expect(profile).toHaveProperty('positionTitle');
            expect(profile).toHaveProperty('bio');
            expect(profile).toHaveProperty('promoCode');
        });
    });

    describe('generateMultiplePlayers', () => {
        it('should generate specified number of players', () => {
            const players = generateMultiplePlayers(5);
            expect(players).toHaveLength(5);
        });

        it('should generate unique emails for all players', () => {
            const players = generateMultiplePlayers(10);
            const emails = players.map(p => p.email);
            const uniqueEmails = new Set(emails);
            expect(uniqueEmails.size).toBe(10);
        });

        it('should apply base overrides to all players', () => {
            const players = generateMultiplePlayers(3, { sport: 'tennis' });
            players.forEach(player => {
                expect(player.sport).toBe('tennis');
            });
        });

        it('should generate sequential names', () => {
            const players = generateMultiplePlayers(3);
            expect(players[0].firstName).toBe('Player1');
            expect(players[1].firstName).toBe('Player2');
            expect(players[2].firstName).toBe('Player3');
        });
    });

    describe('generateMultipleCoaches', () => {
        it('should generate specified number of coaches', () => {
            const coaches = generateMultipleCoaches(5);
            expect(coaches).toHaveLength(5);
        });

        it('should generate unique emails for all coaches', () => {
            const coaches = generateMultipleCoaches(10);
            const emails = coaches.map(c => c.email);
            const uniqueEmails = new Set(emails);
            expect(uniqueEmails.size).toBe(10);
        });

        it('should apply base overrides to all coaches', () => {
            const coaches = generateMultipleCoaches(3, { coachingCategory: 'high-school' });
            coaches.forEach(coach => {
                expect(coach.coachingCategory).toBe('high-school');
            });
        });
    });

    describe('generatePlayerWithAge', () => {
        it('should generate player with specified age', () => {
            const player = generatePlayerWithAge(21);
            const date = new Date(player.dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - date.getFullYear();

            expect(age).toBe(21);
        });

        it('should accept additional overrides', () => {
            const player = generatePlayerWithAge(18, { sport: 'volleyball' });
            expect(player.sport).toBe('volleyball');
        });
    });

    describe('generatePlayerForSport', () => {
        it('should generate player for specified sport and position', () => {
            const player = generatePlayerForSport('football', 'Quarterback');
            expect(player.sport).toBe('football');
            expect(player.position).toBe('Quarterback');
        });

        it('should accept additional overrides', () => {
            const player = generatePlayerForSport('basketball', 'Center', { gpa: 3.9 });
            expect(player.sport).toBe('basketball');
            expect(player.position).toBe('Center');
            expect(player.gpa).toBe(3.9);
        });
    });

    describe('generatePlayerWithReferral', () => {
        it('should generate player with referral promo code', () => {
            const referralCode = 'COACH_123_ABC';
            const player = generatePlayerWithReferral(referralCode);

            expect(player.referralPromoCode).toBe(referralCode);
            expect(player.promoCode).toMatch(/^PLAYER_\d+_[A-Z0-9]{6}$/);
        });

        it('should accept additional overrides', () => {
            const player = generatePlayerWithReferral('REF_CODE', { firstName: 'Referred' });
            expect(player.referralPromoCode).toBe('REF_CODE');
            expect(player.firstName).toBe('Referred');
        });
    });

    describe('generateCoachWithReferral', () => {
        it('should generate coach with referral promo code', () => {
            const referralCode = 'PLAYER_456_XYZ';
            const coach = generateCoachWithReferral(referralCode);

            expect(coach.referralPromoCode).toBe(referralCode);
            expect(coach.promoCode).toMatch(/^COACH_\d+_[A-Z0-9]{6}$/);
        });

        it('should accept additional overrides', () => {
            const coach = generateCoachWithReferral('REF_CODE', { firstName: 'Referred' });
            expect(coach.referralPromoCode).toBe('REF_CODE');
            expect(coach.firstName).toBe('Referred');
        });
    });
});
