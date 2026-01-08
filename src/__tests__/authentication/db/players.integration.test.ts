/**
 * Integration tests for player database operations
 * Tests with actual database connection
 * @jest-environment node
 */

import { checkEmailExists, createPlayer, getPlayerByEmail } from '@/authentication/db/players';
import { PlayerRecord } from '@/authentication/types';
import { query, closePool } from '@/authentication/db/client';

// Skip these tests if no database is configured
const skipIfNoDb = process.env.DATABASE_HOST ? describe : describe.skip;

skipIfNoDb('Player Database Operations - Integration', () => {
    // Clean up test data after all tests
    afterAll(async () => {
        try {
            // Clean up any test data
            await query('DELETE FROM players WHERE email LIKE $1', ['%@test-integration.com']);
            await closePool();
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    });

    describe('checkEmailExists', () => {
        const testEmail = 'exists-test@test-integration.com';

        beforeAll(async () => {
            // Insert a test player
            await query(
                `INSERT INTO players (first_name, last_name, email, password_hash, sex, sport, position, gpa, country, state)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                 ON CONFLICT (email) DO NOTHING`,
                ['Test', 'User', testEmail, 'hashedpassword', 'male', 'basketball', 'Guard', 3.5, 'USA', 'California']
            );
        });

        it('should return true for existing email', async () => {
            const result = await checkEmailExists(testEmail);
            expect(result).toBe(true);
        });

        it('should return false for non-existing email', async () => {
            const result = await checkEmailExists('nonexistent@test-integration.com');
            expect(result).toBe(false);
        });

        it('should be case-insensitive', async () => {
            const result = await checkEmailExists(testEmail.toUpperCase());
            expect(result).toBe(true);
        });
    });

    describe('createPlayer', () => {
        it('should create a new player and return UUID', async () => {
            const playerData: PlayerRecord = {
                firstName: 'Integration',
                lastName: 'Test',
                email: `create-${Date.now()}@test-integration.com`,
                passwordHash: 'hashedpassword123',
                sex: 'female',
                sport: 'soccer',
                position: 'Forward',
                gpa: 3.8,
                country: 'USA',
                state: 'Texas',
            };

            const playerId = await createPlayer(playerData);

            expect(playerId).toBeDefined();
            expect(typeof playerId).toBe('string');
            expect(playerId.length).toBeGreaterThan(0);

            // Verify the player was created
            const exists = await checkEmailExists(playerData.email);
            expect(exists).toBe(true);
        });

        it('should create player with optional fields', async () => {
            const playerData: PlayerRecord = {
                firstName: 'Optional',
                lastName: 'Fields',
                email: `optional-${Date.now()}@test-integration.com`,
                passwordHash: 'hashedpassword123',
                sex: 'male',
                sport: 'football',
                position: 'Quarterback',
                gpa: 3.2,
                country: 'Canada',
                region: 'Ontario',
                scholarshipAmount: 50000,
                testScores: 'SAT: 1400',
            };

            const playerId = await createPlayer(playerData);
            expect(playerId).toBeDefined();

            // Verify optional fields were saved
            const player = await getPlayerByEmail(playerData.email);
            expect(player?.scholarshipAmount).toBe(50000);
            expect(player?.testScores).toBe('SAT: 1400');
        });

        it('should throw error for duplicate email', async () => {
            const playerData: PlayerRecord = {
                firstName: 'Duplicate',
                lastName: 'Test',
                email: `duplicate-${Date.now()}@test-integration.com`,
                passwordHash: 'hashedpassword123',
                sex: 'male',
                sport: 'basketball',
                position: 'Guard',
                gpa: 3.5,
                country: 'USA',
                state: 'California',
            };

            // Create first player
            await createPlayer(playerData);

            // Try to create duplicate
            await expect(createPlayer(playerData)).rejects.toThrow();
        });
    });

    describe('getPlayerByEmail', () => {
        const testEmail = `get-player-${Date.now()}@test-integration.com`;
        let createdPlayerId: string;

        beforeAll(async () => {
            const playerData: PlayerRecord = {
                firstName: 'Get',
                lastName: 'Player',
                email: testEmail,
                passwordHash: 'hashedpassword123',
                sex: 'female',
                sport: 'volleyball',
                position: 'Setter',
                gpa: 3.9,
                country: 'USA',
                state: 'Florida',
                scholarshipAmount: 30000,
                testScores: 'ACT: 30',
            };
            createdPlayerId = await createPlayer(playerData);
        });

        it('should retrieve player by email', async () => {
            const player = await getPlayerByEmail(testEmail);

            expect(player).toBeDefined();
            expect(player?.id).toBe(createdPlayerId);
            expect(player?.firstName).toBe('Get');
            expect(player?.lastName).toBe('Player');
            expect(player?.email).toBe(testEmail);
            expect(player?.sex).toBe('female');
            expect(player?.sport).toBe('volleyball');
            expect(player?.position).toBe('Setter');
            expect(player?.gpa).toBe(3.9);
            expect(player?.country).toBe('USA');
            expect(player?.state).toBe('Florida');
            expect(player?.scholarshipAmount).toBe(30000);
            expect(player?.testScores).toBe('ACT: 30');
            expect(player?.createdAt).toBeInstanceOf(Date);
            expect(player?.updatedAt).toBeInstanceOf(Date);
        });

        it('should be case-insensitive', async () => {
            const player = await getPlayerByEmail(testEmail.toUpperCase());
            expect(player).toBeDefined();
            expect(player?.id).toBe(createdPlayerId);
        });

        it('should return null for non-existing email', async () => {
            const player = await getPlayerByEmail('nonexistent@test-integration.com');
            expect(player).toBeNull();
        });

        it('should handle players without optional fields', async () => {
            const minimalEmail = `minimal-${Date.now()}@test-integration.com`;
            const minimalData: PlayerRecord = {
                firstName: 'Minimal',
                lastName: 'Player',
                email: minimalEmail,
                passwordHash: 'hashedpassword123',
                sex: 'male',
                sport: 'tennis',
                position: 'Singles',
                gpa: 3.0,
                country: 'USA',
                state: 'New York',
            };

            await createPlayer(minimalData);
            const player = await getPlayerByEmail(minimalEmail);

            expect(player).toBeDefined();
            expect(player?.scholarshipAmount).toBeUndefined();
            expect(player?.testScores).toBeNull();
        });
    });
});
