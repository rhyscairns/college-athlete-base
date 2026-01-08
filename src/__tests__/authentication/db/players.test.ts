/**
 * Unit tests for player database operations
 * Uses mocked database client
 * @jest-environment node
 */

// Mock the database client module
jest.mock('@/authentication/db/client');

import { checkEmailExists, createPlayer, getPlayerByEmail } from '@/authentication/db/players';
import { PlayerRecord } from '@/authentication/types';
import { query } from '@/authentication/db/client';

const mockQuery = query as jest.MockedFunction<typeof query>;

describe('Player Database Operations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('checkEmailExists', () => {
        test('should return true when email exists', async () => {
            mockQuery.mockResolvedValueOnce([{ exists: true }]);
            const result = await checkEmailExists('test@example.com');
            expect(result).toBe(true);
        });

        test('should return false when email does not exist', async () => {
            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            const result = await checkEmailExists('nonexistent@example.com');
            expect(result).toBe(false);
        });

        test('should normalize email before checking', async () => {
            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            await checkEmailExists('  TEST@EXAMPLE.COM  ');
            expect(mockQuery).toHaveBeenCalledWith(
                expect.any(String),
                ['test@example.com']
            );
        });

        test('should throw error when database query fails', async () => {
            mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));
            await expect(checkEmailExists('test@example.com')).rejects.toThrow(
                'Failed to check email availability'
            );
        });
    });
});
