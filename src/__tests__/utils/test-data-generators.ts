/**
 * Test data generator utilities for creating consistent test data
 * across all test files
 */

import type { PlayerRegistrationData, CoachRegistrationData } from '@/authentication/types';

/**
 * Generate a date of birth for a given age
 * @param age - The age in years (default: 17)
 * @returns ISO 8601 date string (YYYY-MM-DD)
 */
export function generateDateOfBirth(age: number = 17): string {
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    const birthMonth = String(today.getMonth() + 1).padStart(2, '0');
    const birthDay = String(today.getDate()).padStart(2, '0');
    return `${birthYear}-${birthMonth}-${birthDay}`;
}

/**
 * Generate a unique promo code
 * @param prefix - Optional prefix for the promo code (default: 'PROMO')
 * @returns A unique promo code string
 */
export function generatePromoCode(prefix: string = 'PROMO'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
}

/**
 * Generate a complete player registration payload
 * @param overrides - Optional partial data to override defaults
 * @returns Complete PlayerRegistrationData object
 */
export function generatePlayerRegistration(
    overrides?: Partial<PlayerRegistrationData>
): PlayerRegistrationData {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);

    return {
        firstName: 'Test',
        lastName: 'Player',
        dateOfBirth: generateDateOfBirth(17),
        email: `test.player.${timestamp}.${random}@example.com`,
        password: 'SecurePass123!',
        gender: 'male',
        sex: 'male',
        sport: 'Basketball',
        position: 'Point Guard',
        gpa: 3.5,
        country: 'USA',
        state: 'CA',
        ...overrides
    };
}

/**
 * Generate a player profile with all fields including optional ones
 * @param overrides - Optional partial data to override defaults
 * @returns Complete player profile object with all fields
 */
export function generatePlayerProfile(overrides?: Partial<any>): any {
    const registration = generatePlayerRegistration();

    return {
        ...registration,
        heightFeet: 6,
        heightInches: 2,
        weightLbs: 180,
        gradYear: new Date().getFullYear() + 2,
        highSchool: 'Test High School',
        clubTeam: 'Test Club Team',
        hometown: 'Test City',
        bio: 'Test player bio for testing purposes',
        profileImageUrl: 'https://example.com/profile.jpg',
        coverImageUrl: 'https://example.com/cover.jpg',
        highlightVideoUrl: 'https://youtube.com/watch?v=test',
        videoTitle: 'Test Highlight Video',
        videoDescription: 'Test video description',
        videoThumbnailUrl: 'https://example.com/thumbnail.jpg',
        scholarshipAmount: 50000,
        testScores: 'SAT: 1400, ACT: 32',
        ...overrides
    };
}

/**
 * Generate a complete coach registration payload
 * @param overrides - Optional partial data to override defaults
 * @returns Complete CoachRegistrationData object
 */
export function generateCoachRegistration(
    overrides?: Partial<CoachRegistrationData>
): CoachRegistrationData {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);

    return {
        firstName: 'Test',
        lastName: 'Coach',
        email: `test.coach.${timestamp}.${random}@example.com`,
        password: 'SecurePass123!',
        coachingCategory: 'college',
        sports: ['basketball'],
        university: 'Test University',
        ...overrides
    };
}

/**
 * Generate a coach profile with all fields including optional ones
 * @param overrides - Optional partial data to override defaults
 * @returns Complete coach profile object with all fields
 */
export function generateCoachProfile(overrides?: Partial<any>): any {
    const registration = generateCoachRegistration();

    return {
        ...registration,
        sport: registration.sports[0],
        coachingLevel: registration.coachingCategory,
        yearsExperience: 10,
        positionTitle: 'Head Coach',
        phone: '+1-555-0123',
        country: 'USA',
        state: 'California',
        city: 'Los Angeles',
        currentOrganization: 'Test University',
        universityLogoUrl: 'https://example.com/logo.jpg',
        conference: 'Test Conference',
        division: 'Division I',
        teamName: 'Test Team',
        teamWebsiteUrl: 'https://example.com/team',
        officeLocation: 'Athletic Center, Room 101',
        officeHours: 'Mon-Fri 9AM-5PM',
        bio: 'Test coach bio for testing purposes',
        certifications: ['NAIA Certified', 'First Aid'],
        specializations: ['Offensive Strategy', 'Player Development'],
        achievements: [
            { year: 2023, title: 'Conference Champion' },
            { year: 2022, title: 'Coach of the Year' }
        ],
        profileImageUrl: 'https://example.com/coach-profile.jpg',
        promoCode: generatePromoCode('COACH'),
        ...overrides
    };
}

/**
 * Generate multiple player registrations
 * @param count - Number of players to generate
 * @param baseOverrides - Base overrides to apply to all players
 * @returns Array of PlayerRegistrationData objects
 */
export function generateMultiplePlayers(
    count: number,
    baseOverrides?: Partial<PlayerRegistrationData>
): PlayerRegistrationData[] {
    return Array.from({ length: count }, (_, index) =>
        generatePlayerRegistration({
            ...baseOverrides,
            firstName: `Player${index + 1}`,
            lastName: `Test${index + 1}`
        })
    );
}

/**
 * Generate multiple coach registrations
 * @param count - Number of coaches to generate
 * @param baseOverrides - Base overrides to apply to all coaches
 * @returns Array of CoachRegistrationData objects
 */
export function generateMultipleCoaches(
    count: number,
    baseOverrides?: Partial<CoachRegistrationData>
): CoachRegistrationData[] {
    return Array.from({ length: count }, (_, index) =>
        generateCoachRegistration({
            ...baseOverrides,
            firstName: `Coach${index + 1}`,
            lastName: `Test${index + 1}`
        })
    );
}

/**
 * Generate a player with a specific age
 * @param age - The age of the player
 * @param overrides - Optional partial data to override defaults
 * @returns PlayerRegistrationData with the specified age
 */
export function generatePlayerWithAge(
    age: number,
    overrides?: Partial<PlayerRegistrationData>
): PlayerRegistrationData {
    return generatePlayerRegistration({
        ...overrides,
        dateOfBirth: generateDateOfBirth(age)
    });
}

/**
 * Generate a player for a specific sport
 * @param sport - The sport name
 * @param position - The position name
 * @param overrides - Optional partial data to override defaults
 * @returns PlayerRegistrationData for the specified sport
 */
export function generatePlayerForSport(
    sport: string,
    position: string,
    overrides?: Partial<PlayerRegistrationData>
): PlayerRegistrationData {
    return generatePlayerRegistration({
        ...overrides,
        sport,
        position
    });
}

/**
 * Generate a player with referral information
 * @param referralPromoCode - The promo code of the referrer
 * @param overrides - Optional partial data to override defaults
 * @returns Player profile with referral information
 */
export function generatePlayerWithReferral(
    referralPromoCode: string,
    overrides?: Partial<any>
): any {
    return generatePlayerProfile({
        ...overrides,
        referralPromoCode,
        promoCode: generatePromoCode('PLAYER')
    });
}

/**
 * Generate a coach with referral information
 * @param referralPromoCode - The promo code of the referrer
 * @param overrides - Optional partial data to override defaults
 * @returns Coach profile with referral information
 */
export function generateCoachWithReferral(
    referralPromoCode: string,
    overrides?: Partial<any>
): any {
    return generateCoachProfile({
        ...overrides,
        referralPromoCode,
        promoCode: generatePromoCode('COACH')
    });
}
