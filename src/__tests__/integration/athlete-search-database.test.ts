/**
 * @jest-environment node
 * 
 * Integration tests for athlete search database queries
 */

import { searchAthletes } from '@/lib/db/queries/athletes';
import { query } from '@/authentication/db/client';
import { generatePlayerRegistration } from '@/__tests__/utils/test-data-generators';
import { hashPassword } from '@/authentication/utils/password';

describe('Athlete Search Database Integration', () => {
    let testPlayerIds: string[] = [];

    beforeAll(async () => {
        // Create test players with various attributes
        const players = [
            generatePlayerRegistration({
                firstName: 'Test',
                lastName: 'Basketball1',
                sport: 'Basketball',
                position: 'Guard',
                gpa: 3.8,
                country: 'USA',
                state: 'CA',
            }),
            generatePlayerRegistration({
                firstName: 'Test',
                lastName: 'Basketball2',
                sport: 'Basketball',
                position: 'Forward',
                gpa: 3.2,
                country: 'USA',
                state: 'NY',
            }),
            generatePlayerRegistration({
                firstName: 'Test',
                lastName: 'Football1',
                sport: 'Football',
                position: 'Quarterback',
                gpa: 3.5,
                country: 'USA',
                state: 'TX',
            }),
        ];

        for (const player of players) {
            const hashedPassword = await hashPassword(player.password);
            const result = await query<{ id: string }>(
                `INSERT INTO players (
                    first_name, last_name, date_of_birth, email, password_hash,
                    sex, sport, position, gpa, country, state
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id`,
                [
                    player.firstName,
                    player.lastName,
                    player.dateOfBirth,
                    player.email,
                    hashedPassword,
                    player.gender,
                    player.sport,
                    player.position,
                    player.gpa,
                    player.country,
                    player.state,
                ]
            );
            testPlayerIds.push(result[0].id);
        }
    });

    afterAll(async () => {
        // Clean up test players
        if (testPlayerIds.length > 0) {
            await query(
                `DELETE FROM players WHERE id = ANY($1)`,
                [testPlayerIds]
            );
        }
    });

    describe('search by sport', () => {
        it('should find players by sport', async () => {
            const result = await searchAthletes({ sport: 'Basketball' });

            expect(result.athletes.length).toBeGreaterThanOrEqual(2);
            expect(result.athletes.every(a => a.sport === 'Basketball')).toBe(true);
        });

        it('should return empty array for non-existent sport', async () => {
            const result = await searchAthletes({ sport: 'Cricket' });

            expect(result.athletes).toHaveLength(0);
            expect(result.totalCount).toBe(0);
        });
    });

    describe('search by position', () => {
        it('should find players by position', async () => {
            const result = await searchAthletes({ position: 'Guard' });

            expect(result.athletes.length).toBeGreaterThanOrEqual(1);
            expect(result.athletes.every(a => a.position === 'Guard')).toBe(true);
        });
    });

    describe('search by GPA range', () => {
        it('should find players with GPA above minimum', async () => {
            const result = await searchAthletes({ gpaMin: 3.5 });

            expect(result.athletes.length).toBeGreaterThanOrEqual(2);
            expect(result.athletes.every(a => a.gpa >= 3.5)).toBe(true);
        });

        it('should find players with GPA below maximum', async () => {
            const result = await searchAthletes({ gpaMax: 3.5 });

            expect(result.athletes.length).toBeGreaterThanOrEqual(1);
            expect(result.athletes.every(a => a.gpa <= 3.5)).toBe(true);
        });

        it('should find players within GPA range', async () => {
            const result = await searchAthletes({ gpaMin: 3.0, gpaMax: 3.6 });

            expect(result.athletes.length).toBeGreaterThanOrEqual(2);
            expect(result.athletes.every(a => a.gpa >= 3.0 && a.gpa <= 3.6)).toBe(true);
        });
    });

    describe('combined filters', () => {
        it('should apply multiple filters together', async () => {
            const result = await searchAthletes({
                sport: 'Basketball',
                gpaMin: 3.5,
            });

            expect(result.athletes.length).toBeGreaterThanOrEqual(1);
            expect(result.athletes.every(a => a.sport === 'Basketball' && a.gpa >= 3.5)).toBe(true);
        });

        it('should return empty when no players match all criteria', async () => {
            const result = await searchAthletes({
                sport: 'Basketball',
                position: 'Quarterback', // Basketball doesn't have quarterbacks
            });

            expect(result.athletes).toHaveLength(0);
        });
    });

    describe('pagination', () => {
        it('should paginate results', async () => {
            const page1 = await searchAthletes({}, { page: 1, pageSize: 2 });
            const page2 = await searchAthletes({}, { page: 2, pageSize: 2 });

            expect(page1.athletes).toHaveLength(2);
            expect(page2.athletes.length).toBeGreaterThanOrEqual(0);

            // Ensure different results on different pages
            if (page2.athletes.length > 0) {
                expect(page1.athletes[0].id).not.toBe(page2.athletes[0].id);
            }
        });

        it('should return correct total count', async () => {
            const result = await searchAthletes({ sport: 'Basketball' }, { page: 1, pageSize: 1 });

            expect(result.totalCount).toBeGreaterThanOrEqual(2);
            expect(result.athletes).toHaveLength(1);
        });

        it('should reject invalid pagination parameters', async () => {
            await expect(searchAthletes({}, { page: 0, pageSize: 10 })).rejects.toThrow('Invalid pagination parameters');
            await expect(searchAthletes({}, { page: 1, pageSize: 0 })).rejects.toThrow('Invalid pagination parameters');
            await expect(searchAthletes({}, { page: 1, pageSize: 101 })).rejects.toThrow('Invalid pagination parameters');
        });
    });

    describe('result ordering', () => {
        it('should order results by GPA descending', async () => {
            const result = await searchAthletes({ sport: 'Basketball' });

            for (let i = 0; i < result.athletes.length - 1; i++) {
                expect(result.athletes[i].gpa).toBeGreaterThanOrEqual(result.athletes[i + 1].gpa);
            }
        });
    });

    describe('no filters', () => {
        it('should return all players when no filters provided', async () => {
            const result = await searchAthletes({});

            expect(result.athletes.length).toBeGreaterThanOrEqual(3);
            expect(result.totalCount).toBeGreaterThanOrEqual(3);
        });
    });
});
