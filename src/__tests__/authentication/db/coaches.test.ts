/**
 * Unit tests for coach database operations
 * Uses mocked database client
 * @jest-environment node
 */

// Mock the database client module
jest.mock('@/authentication/db/client');

import { checkCoachEmailExists, createCoach, getCoachByEmail } from '@/authentication/db/coaches';
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
            expect(coach?.coachingLevel).toBe('womens');
            expect(coach?.specializations).toEqual(['basketball', 'volleyball']);
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
                coachingLevel: 'womens',
                yearsExperience: 10,
                currentOrganization: 'UCLA',
                positionTitle: 'Head Coach'
            });
        });
    });
});
