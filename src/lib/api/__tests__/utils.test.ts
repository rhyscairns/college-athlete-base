import {
    isValidUUID,
    generateRequestId,
    getExecutionTime,
    formatExecutionTime,
} from '../utils';

describe('API Utils', () => {
    describe('isValidUUID', () => {
        it('should return true for valid UUIDs', () => {
            const validUUIDs = [
                '123e4567-e89b-12d3-a456-426614174000',
                'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                '550e8400-e29b-41d4-a716-446655440000',
                'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            ];

            validUUIDs.forEach((uuid) => {
                expect(isValidUUID(uuid)).toBe(true);
            });
        });

        it('should return false for invalid UUIDs', () => {
            const invalidUUIDs = [
                '',
                'not-a-uuid',
                '123',
                '123e4567-e89b-12d3-a456',
                '123e4567-e89b-12d3-a456-426614174000-extra',
                'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
                '123e4567e89b12d3a456426614174000', // Missing hyphens
            ];

            invalidUUIDs.forEach((uuid) => {
                expect(isValidUUID(uuid)).toBe(false);
            });
        });

        it('should be case insensitive', () => {
            const uuid = '123E4567-E89B-12D3-A456-426614174000';
            expect(isValidUUID(uuid)).toBe(true);
        });
    });

    describe('generateRequestId', () => {
        it('should generate a valid UUID', () => {
            const requestId = generateRequestId();
            expect(isValidUUID(requestId)).toBe(true);
        });

        it('should generate unique IDs', () => {
            const id1 = generateRequestId();
            const id2 = generateRequestId();
            expect(id1).not.toBe(id2);
        });

        it('should generate IDs in correct format', () => {
            const requestId = generateRequestId();
            expect(requestId).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            );
        });
    });

    describe('getExecutionTime', () => {
        it('should calculate execution time correctly', () => {
            const startTime = Date.now() - 100; // 100ms ago
            const executionTime = getExecutionTime(startTime);

            // Allow some tolerance for test execution time
            expect(executionTime).toBeGreaterThanOrEqual(100);
            expect(executionTime).toBeLessThan(150);
        });

        it('should return 0 or near 0 for immediate execution', () => {
            const startTime = Date.now();
            const executionTime = getExecutionTime(startTime);

            expect(executionTime).toBeGreaterThanOrEqual(0);
            expect(executionTime).toBeLessThan(10);
        });

        it('should handle longer execution times', () => {
            const startTime = Date.now() - 5000; // 5 seconds ago
            const executionTime = getExecutionTime(startTime);

            expect(executionTime).toBeGreaterThanOrEqual(5000);
            expect(executionTime).toBeLessThan(5100);
        });
    });

    describe('formatExecutionTime', () => {
        it('should format execution time with ms suffix', () => {
            const startTime = Date.now() - 100;
            const formatted = formatExecutionTime(startTime);

            expect(formatted).toMatch(/^\d+ms$/);
            expect(formatted.endsWith('ms')).toBe(true);
        });

        it('should format immediate execution', () => {
            const startTime = Date.now();
            const formatted = formatExecutionTime(startTime);

            expect(formatted).toMatch(/^\d+ms$/);
        });

        it('should format longer execution times', () => {
            const startTime = Date.now() - 1234;
            const formatted = formatExecutionTime(startTime);

            // Should be around 1234ms
            const value = parseInt(formatted.replace('ms', ''));
            expect(value).toBeGreaterThanOrEqual(1234);
            expect(value).toBeLessThan(1300);
        });
    });
});
