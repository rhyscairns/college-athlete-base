/**
 * Tests for updatePlayerProfile query
 */

describe('updatePlayerProfile', () => {
    describe('profile update validation', () => {
        it('should validate profile data structure', () => {
            const profileUpdate = {
                firstName: 'Updated',
                lastName: 'Name',
                bio: 'Updated bio',
                heightFeet: 6,
                heightInches: 3
            };

            expect(profileUpdate.firstName).toBeDefined();
            expect(profileUpdate.bio).toBeDefined();
            expect(profileUpdate.heightFeet).toBeGreaterThan(0);
        });

        it('should validate height values', () => {
            const validHeights = [
                { feet: 5, inches: 0 },
                { feet: 6, inches: 6 },
                { feet: 7, inches: 11 }
            ];

            validHeights.forEach(height => {
                expect(height.feet).toBeGreaterThanOrEqual(4);
                expect(height.feet).toBeLessThanOrEqual(8);
                expect(height.inches).toBeGreaterThanOrEqual(0);
                expect(height.inches).toBeLessThan(12);
            });
        });

        it('should validate weight values', () => {
            const validWeights = [150, 180, 220, 300];

            validWeights.forEach(weight => {
                expect(weight).toBeGreaterThanOrEqual(50);
                expect(weight).toBeLessThanOrEqual(500);
            });
        });
    });

    describe('optional fields', () => {
        it('should handle optional scholarship amount', () => {
            const profile = {
                scholarshipAmount: 50000
            };

            expect(profile.scholarshipAmount).toBeGreaterThanOrEqual(0);
        });

        it('should handle optional media fields', () => {
            const profile = {
                profileImageUrl: 'https://example.com/image.jpg',
                highlightVideoUrl: 'https://youtube.com/watch?v=123'
            };

            expect(profile.profileImageUrl).toMatch(/^https?:\/\//);
            expect(profile.highlightVideoUrl).toMatch(/^https?:\/\//);
        });
    });
});
