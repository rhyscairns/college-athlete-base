/**
 * Unit tests for coach database operations
 * Uses mocked database client
 * @jest-environment node
 */

// Mock the database client module
jest.mock('@/authentication/db/client');

import { checkCoachEmailExists, createCoach, getCoachByEmail, getCoachById } from '@/authentication/db/coaches';
import { query } from '@/authentication/db/client';

const mockQuery = query as jest.MockedFunction<typeof query>;

describe('Coach Database Operations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('checkCoachEmailExists', () => {
        it('should return true when email exists', async () => {
            mockQuery.mockResolvedValueOnce([{ exists: true }]);
            const result = await checkCoachEmailExists('coach@example.com');
            expect(result).toBe(true);
        });

        it('should return false when email does not exist', async () => {
            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            const result = await checkCoachEmailExists('nonexistent@example.com');
            expect(result).toBe(false);
        });

        it('should normalize email before checking', async () => {
            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            await checkCoachEmailExists('  COACH@EXAMPLE.COM  ');
            expect(mockQuery).toHaveBeenCalledWith(
                expect.any(String),
                ['coach@example.com']
            );
        });

        it('should throw error when database query fails', async () => {
            mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));
            await expect(checkCoachEmailExists('coach@example.com')).rejects.toThrow(
                'Failed to check email availability'
            );
        });
    });

    describe('createCoach', () => {
        const validCoachData = {
            firstName: 'John',
            lastName: 'Coach',
            email: 'john.coach@example.com',
            passwordHash: 'hashed_password_123',
            coachingCategory: 'mens',
            sports: ['basketball', 'football'],
            university: 'UCLA'
        };

        it('should create coach with correct data mapping', async () => {
            const mockId = 'coach-uuid-123';
            mockQuery.mockResolvedValueOnce([{ id: mockId }]);

            const coachId = await createCoach(validCoachData);

            expect(coachId).toBe(mockId);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO coaches'),
                [
                    'John',
                    'Coach',
                    'john.coach@example.com',
                    'hashed_password_123',
                    'basketball',  // Primary sport
                    'mens',        // coaching_level
                    'UCLA',        // current_organization
                    ['basketball', 'football'],  // specializations
                    'USA'          // country
                ]
            );
        });

        it('should normalize email before creating', async () => {
            const mockId = 'coach-uuid-456';
            mockQuery.mockResolvedValueOnce([{ id: mockId }]);

            await createCoach({
                ...validCoachData,
                email: '  JOHN.COACH@EXAMPLE.COM  '
            });

            expect(mockQuery).toHaveBeenCalledWith(
                expect.any(String),
                expect.arrayContaining(['john.coach@example.com'])
            );
        });

        it('should throw error when email already exists', async () => {
            mockQuery.mockRejectedValueOnce(new Error('duplicate key value violates unique constraint'));

            await expect(createCoach(validCoachData)).rejects.toThrow('Email already registered');
        });

        it('should throw error when database insertion fails', async () => {
            mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

            await expect(createCoach(validCoachData)).rejects.toThrow('Failed to create coach record');
        });

        it('should throw error when no ID is returned', async () => {
            mockQuery.mockResolvedValueOnce([]);

            await expect(createCoach(validCoachData)).rejects.toThrow('Failed to create coach record');
        });

        it('should handle multiple sports correctly', async () => {
            const mockId = 'coach-uuid-789';
            mockQuery.mockResolvedValueOnce([{ id: mockId }]);

            await createCoach({
                ...validCoachData,
                sports: ['soccer', 'volleyball', 'tennis']
            });

            expect(mockQuery).toHaveBeenCalledWith(
                expect.any(String),
                expect.arrayContaining([
                    'soccer',  // Primary sport
                    ['soccer', 'volleyball', 'tennis']  // All sports in specializations
                ])
            );
        });
    });

    describe('getCoachByEmail', () => {
        const mockCoachRow = {
            id: 'coach-uuid-123',
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@example.com',
            password_hash: 'hashed_password',
            sport: 'basketball',
            coaching_level: 'womens',
            years_experience: 10,
            phone: '555-1234',
            country: 'USA',
            state: 'CA',
            city: 'Los Angeles',
            current_organization: 'UCLA',
            position_title: 'Head Coach',
            certifications: ['USA Basketball', 'CPR'],
            specializations: ['basketball', 'volleyball'],
            bio: 'Experienced coach',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
        };

        it('should return coach record when email exists', async () => {
            mockQuery.mockResolvedValueOnce([mockCoachRow]);

            const coach = await getCoachByEmail('jane.smith@example.com');

            expect(coach).not.toBeNull();
            expect(coach?.id).toBe('coach-uuid-123');
            expect(coach?.firstName).toBe('Jane');
            expect(coach?.lastName).toBe('Smith');
            expect(coach?.email).toBe('jane.smith@example.com');
            expect(coach?.coachingCategory).toBe('womens');
            expect(coach?.sports).toEqual(['basketball', 'volleyball']);
            expect(coach?.university).toBe('UCLA');
        });

        it('should return null when email does not exist', async () => {
            mockQuery.mockResolvedValueOnce([]);

            const coach = await getCoachByEmail('nonexistent@example.com');

            expect(coach).toBeNull();
        });

        it('should normalize email before querying', async () => {
            mockQuery.mockResolvedValueOnce([mockCoachRow]);

            await getCoachByEmail('  JANE.SMITH@EXAMPLE.COM  ');

            expect(mockQuery).toHaveBeenCalledWith(
                expect.any(String),
                ['jane.smith@example.com']
            );
        });

        it('should throw error when database query fails', async () => {
            mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

            await expect(getCoachByEmail('jane.smith@example.com')).rejects.toThrow(
                'Failed to fetch coach record'
            );
        });

        it('should correctly map database columns to camelCase', async () => {
            mockQuery.mockResolvedValueOnce([mockCoachRow]);

            const coach = await getCoachByEmail('jane.smith@example.com');

            expect(coach).toMatchObject({
                firstName: 'Jane',
                lastName: 'Smith',
                coachingCategory: 'womens',
                sports: ['basketball', 'volleyball'],
                university: 'UCLA'
            });
        });
    });

    describe('getCoachById', () => {
        const mockCoachRow = {
            id: 'coach-uuid-456',
            first_name: 'Michael',
            last_name: 'Johnson',
            email: 'michael.johnson@example.com',
            password_hash: 'hashed_password_456',
            sport: 'football',
            coaching_level: 'mens',
            years_experience: 15,
            phone: '555-5678',
            country: 'USA',
            state: 'TX',
            city: 'Austin',
            current_organization: 'University of Texas',
            position_title: 'Offensive Coordinator',
            certifications: ['AFCA', 'CPR'],
            specializations: ['football', 'strength training'],
            bio: 'Veteran coach',
            created_at: '2024-01-15T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z'
        };

        it('should return coach record when ID exists', async () => {
            mockQuery.mockResolvedValueOnce([mockCoachRow]);

            const coach = await getCoachById('coach-uuid-456');

            expect(coach).not.toBeNull();
            expect(coach?.id).toBe('coach-uuid-456');
            expect(coach?.firstName).toBe('Michael');
            expect(coach?.lastName).toBe('Johnson');
            expect(coach?.email).toBe('michael.johnson@example.com');
            expect(coach?.coachingCategory).toBe('mens');
            expect(coach?.sports).toEqual(['football', 'strength training']);
            expect(coach?.university).toBe('University of Texas');
        });

        it('should return null when ID does not exist', async () => {
            mockQuery.mockResolvedValueOnce([]);

            const coach = await getCoachById('nonexistent-id');

            expect(coach).toBeNull();
        });

        it('should query database with correct ID parameter', async () => {
            mockQuery.mockResolvedValueOnce([mockCoachRow]);

            await getCoachById('coach-uuid-456');

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('WHERE id = $1'),
                ['coach-uuid-456']
            );
        });

        it('should throw error when database query fails', async () => {
            mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

            await expect(getCoachById('coach-uuid-456')).rejects.toThrow(
                'Failed to fetch coach record'
            );
        });

        it('should correctly map database columns to camelCase', async () => {
            mockQuery.mockResolvedValueOnce([mockCoachRow]);

            const coach = await getCoachById('coach-uuid-456');

            expect(coach).toMatchObject({
                firstName: 'Michael',
                lastName: 'Johnson',
                coachingCategory: 'mens',
                sports: ['football', 'strength training'],
                university: 'University of Texas'
            });
        });

        it('should handle coach with null specializations by using sport as fallback', async () => {
            const coachWithNullSpecializations = {
                ...mockCoachRow,
                specializations: null,
            };

            mockQuery.mockResolvedValueOnce([coachWithNullSpecializations]);

            const coach = await getCoachById('coach-uuid-456');

            expect(coach?.sports).toEqual(['football']); // Should fallback to sport field
        });

        it('should handle coach with empty specializations array', async () => {
            const coachWithEmptySpecializations = {
                ...mockCoachRow,
                specializations: [],
            };

            mockQuery.mockResolvedValueOnce([coachWithEmptySpecializations]);

            const coach = await getCoachById('coach-uuid-456');

            // Empty array is truthy in JavaScript, so it returns the empty array
            expect(coach?.sports).toEqual([]);
        });
    });
});
