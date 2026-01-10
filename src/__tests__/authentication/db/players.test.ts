/**
 * Unit tests for player database operations
 * Uses mocked database client
 * @jest-environment node
 */

// Mock the database client module
jest.mock('@/authentication/db/client');

import { checkEmailExists, createPlayer, getPlayerByEmail, getPlayerById } from '@/authentication/db/players';
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

    describe('getPlayerById', () => {
        const mockPlayerRow = {
            id: 'test-player-id',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            password_hash: 'hashed-password',
            sex: 'Male',
            sport: 'Basketball',
            position: 'Point Guard',
            gpa: '3.8',
            country: 'USA',
            state: 'California',
            region: 'West',
            scholarship_amount: '50000',
            test_scores: 'SAT: 1400',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        };

        test('should return player record when found', async () => {
            mockQuery.mockResolvedValueOnce([mockPlayerRow]);
            const result = await getPlayerById('test-player-id');

            expect(result).toEqual({
                id: 'test-player-id',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                passwordHash: 'hashed-password',
                sex: 'Male',
                sport: 'Basketball',
                position: 'Point Guard',
                gpa: 3.8,
                country: 'USA',
                state: 'California',
                region: 'West',
                scholarshipAmount: 50000,
                testScores: 'SAT: 1400',
                createdAt: new Date('2024-01-01T00:00:00Z'),
                updatedAt: new Date('2024-01-01T00:00:00Z'),
            });
        });

        test('should return null when player not found', async () => {
            mockQuery.mockResolvedValueOnce([]);
            const result = await getPlayerById('nonexistent-id');
            expect(result).toBeNull();
        });

        test('should handle player with minimal data (no optional fields)', async () => {
            const minimalPlayerRow = {
                id: 'test-player-id',
                first_name: 'Jane',
                last_name: 'Smith',
                email: 'jane.smith@example.com',
                password_hash: 'hashed-password',
                sex: 'Female',
                sport: 'Soccer',
                position: 'Forward',
                gpa: '3.5',
                country: 'Canada',
                state: null,
                region: null,
                scholarship_amount: null,
                test_scores: null,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };

            mockQuery.mockResolvedValueOnce([minimalPlayerRow]);
            const result = await getPlayerById('test-player-id');

            expect(result).toEqual({
                id: 'test-player-id',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                passwordHash: 'hashed-password',
                sex: 'Female',
                sport: 'Soccer',
                position: 'Forward',
                gpa: 3.5,
                country: 'Canada',
                state: null,
                region: null,
                scholarshipAmount: undefined,
                testScores: null,
                createdAt: new Date('2024-01-01T00:00:00Z'),
                updatedAt: new Date('2024-01-01T00:00:00Z'),
            });
        });

        test('should throw error when database query fails', async () => {
            mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));
            await expect(getPlayerById('test-player-id')).rejects.toThrow(
                'Failed to fetch player record'
            );
        });

        test('should query with correct player ID', async () => {
            mockQuery.mockResolvedValueOnce([mockPlayerRow]);
            await getPlayerById('test-player-id');

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('WHERE id = $1'),
                ['test-player-id']
            );
        });
    });
});
