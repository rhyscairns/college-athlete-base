/**
 * Integration tests for player profile database queries
 * These tests verify the query structure and transformation logic
 * Note: These are skipped by default and should be run manually with a test database
 */

import { getPlayerProfileById } from '../index';

describe.skip('getPlayerProfileById - Integration Tests', () => {
    // These tests require a running database with test data
    // Run manually with: npm test -- integration.test.ts

    it('should fetch real player data from database', async () => {
        // This test requires a test player ID from your database
        const testPlayerId = 'your-test-player-id-here';

        const result = await getPlayerProfileById(testPlayerId);

        expect(result).not.toBeNull();
        expect(result?.id).toBe(testPlayerId);
        expect(result?.firstName).toBeTruthy();
        expect(result?.lastName).toBeTruthy();
        expect(result?.initials).toMatch(/^[A-Z]{2}$/);
        expect(result?.academic.gpa).toBeGreaterThanOrEqual(0);
        expect(result?.academic.gpa).toBeLessThanOrEqual(4);
    });

    it('should return null for non-existent player', async () => {
        const nonExistentId = '00000000-0000-0000-0000-000000000000';

        const result = await getPlayerProfileById(nonExistentId);

        expect(result).toBeNull();
    });

    it('should return valid MockPlayerData structure', async () => {
        const testPlayerId = 'your-test-player-id-here';

        const result = await getPlayerProfileById(testPlayerId);

        if (result) {
            // Verify all required fields exist
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('firstName');
            expect(result).toHaveProperty('lastName');
            expect(result).toHaveProperty('initials');
            expect(result).toHaveProperty('position');
            expect(result).toHaveProperty('location');
            expect(result).toHaveProperty('academic');
            expect(result).toHaveProperty('videos');
            expect(result).toHaveProperty('achievements');
            expect(result).toHaveProperty('coachTestimonials');
            expect(result).toHaveProperty('contact');
            expect(result).toHaveProperty('stats');

            // Verify academic structure
            expect(result.academic).toHaveProperty('gpa');
            expect(result.academic).toHaveProperty('gpaScale');
            expect(result.academic).toHaveProperty('coursework');

            // Verify contact structure
            expect(result.contact).toHaveProperty('email');
            expect(result.contact).toHaveProperty('socialMedia');
            expect(result.contact).toHaveProperty('headCoach');

            // Verify arrays are initialized
            expect(Array.isArray(result.videos)).toBe(true);
            expect(Array.isArray(result.achievements)).toBe(true);
            expect(Array.isArray(result.coachTestimonials)).toBe(true);
            expect(Array.isArray(result.academic.coursework)).toBe(true);
            expect(Array.isArray(result.performanceMetrics)).toBe(true);
        }
    });
});
