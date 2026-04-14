import { searchAthletes, SearchAthletesResult, PaginationParams } from '../athletes';
import { SearchCriteria } from '@/dashboard/coach/types';
import * as dbClient from '@/authentication/db/client';

// Mock the database client
jest.mock('@/authentication/db/client');
jest.mock('@/lib/logger');

const mockQuery = dbClient.query as jest.MockedFunction<typeof dbClient.query>;

describe('searchAthletes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Query Building', () => {
        it('should build query with all filters', async () => {
            const criteria: SearchCriteria = {
                sport: 'Basketball',
                position: 'Point Guard',
                desiredDivision: 'NCAA D1',
                gpaMin: 3.0,
                gpaMax: 4.0,
                affordableAmount: 10000,
                heightMin: "6'0\"",
                heightMax: "6'6\"",
                weightMin: 180,
                weightMax: 220,
            };

            const pagination: PaginationParams = { page: 1, pageSize: 20 };

            // Mock database responses
            mockQuery
                .mockResolvedValueOnce([]) // athletes query
                .mockResolvedValueOnce([{ total: '0' }]); // count query

            await searchAthletes(criteria, pagination);

            // Verify query was called twice (athletes + count)
            expect(mockQuery).toHaveBeenCalledTimes(2);

            // Check the athletes query
            const athletesCall = mockQuery.mock.calls[0];
            const athletesQueryText = athletesCall[0] as string;
            const athletesParams = athletesCall[1] as any[];

            // Verify WHERE conditions are present
            expect(athletesQueryText).toContain('WHERE');
            expect(athletesQueryText).toContain('p.sport = $1');
            expect(athletesQueryText).toContain('p.position = $2');
            expect(athletesQueryText).toContain('p.desired_division = $3');
            expect(athletesQueryText).toContain('p.gpa >= $4');
            expect(athletesQueryText).toContain('p.gpa <= $5');
            expect(athletesQueryText).toContain('p.affordable_amount >= $6');
            expect(athletesQueryText).toContain('p.height_inches >= $7');
            expect(athletesQueryText).toContain('p.height_inches <= $8');
            expect(athletesQueryText).toContain('p.weight_lbs >= $9');
            expect(athletesQueryText).toContain('p.weight_lbs <= $10');

            // Verify ORDER BY clause
            expect(athletesQueryText).toContain('ORDER BY p.gpa DESC, p.last_name ASC');

            // Verify LIMIT and OFFSET
            expect(athletesQueryText).toContain('LIMIT');
            expect(athletesQueryText).toContain('OFFSET');

            // Verify parameters
            expect(athletesParams).toEqual([
                'Basketball',
                'Point Guard',
                'NCAA D1',
                3.0,
                4.0,
                10000,
                72, // 6'0" in inches
                78, // 6'6" in inches
                180,
                220,
                20, // pageSize
                0, // offset
            ]);
        });

        it('should build query with only sport filter', async () => {
            const criteria: SearchCriteria = {
                sport: 'Soccer',
            };

            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ total: '0' }]);

            await searchAthletes(criteria);

            const athletesCall = mockQuery.mock.calls[0];
            const athletesQueryText = athletesCall[0] as string;
            const athletesParams = athletesCall[1] as any[];

            expect(athletesQueryText).toContain('WHERE p.sport = $1');
            expect(athletesParams[0]).toBe('Soccer');
        });

        it('should build query with no filters', async () => {
            const criteria: SearchCriteria = {};

            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ total: '0' }]);

            await searchAthletes(criteria);

            const athletesCall = mockQuery.mock.calls[0];
            const athletesQueryText = athletesCall[0] as string;

            // Should not have WHERE clause
            expect(athletesQueryText).not.toContain('WHERE');
            expect(athletesQueryText).toContain('ORDER BY p.gpa DESC, p.last_name ASC');
        });

        it('should handle height in inches format', async () => {
            const criteria: SearchCriteria = {
                heightMin: '70',
                heightMax: '76',
            };

            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ total: '0' }]);

            await searchAthletes(criteria);

            const athletesCall = mockQuery.mock.calls[0];
            const athletesParams = athletesCall[1] as any[];

            expect(athletesParams[0]).toBe(70);
            expect(athletesParams[1]).toBe(76);
        });

        it('should handle height in feet\'inches" format', async () => {
            const criteria: SearchCriteria = {
                heightMin: "5'10\"",
                heightMax: "6'2\"",
            };

            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ total: '0' }]);

            await searchAthletes(criteria);

            const athletesCall = mockQuery.mock.calls[0];
            const athletesParams = athletesCall[1] as any[];

            expect(athletesParams[0]).toBe(70); // 5'10"
            expect(athletesParams[1]).toBe(74); // 6'2"
        });
    });

    describe('Pagination', () => {
        it('should apply correct pagination for page 1', async () => {
            const criteria: SearchCriteria = { sport: 'Basketball' };
            const pagination: PaginationParams = { page: 1, pageSize: 20 };

            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ total: '0' }]);

            await searchAthletes(criteria, pagination);

            const athletesCall = mockQuery.mock.calls[0];
            const athletesParams = athletesCall[1] as any[];

            // Last two params should be LIMIT and OFFSET
            expect(athletesParams[athletesParams.length - 2]).toBe(20); // LIMIT
            expect(athletesParams[athletesParams.length - 1]).toBe(0); // OFFSET
        });

        it('should apply correct pagination for page 2', async () => {
            const criteria: SearchCriteria = { sport: 'Basketball' };
            const pagination: PaginationParams = { page: 2, pageSize: 20 };

            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ total: '0' }]);

            await searchAthletes(criteria, pagination);

            const athletesCall = mockQuery.mock.calls[0];
            const athletesParams = athletesCall[1] as any[];

            expect(athletesParams[athletesParams.length - 2]).toBe(20); // LIMIT
            expect(athletesParams[athletesParams.length - 1]).toBe(20); // OFFSET
        });

        it('should apply correct pagination for page 3 with custom page size', async () => {
            const criteria: SearchCriteria = { sport: 'Basketball' };
            const pagination: PaginationParams = { page: 3, pageSize: 10 };

            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ total: '0' }]);

            await searchAthletes(criteria, pagination);

            const athletesCall = mockQuery.mock.calls[0];
            const athletesParams = athletesCall[1] as any[];

            expect(athletesParams[athletesParams.length - 2]).toBe(10); // LIMIT
            expect(athletesParams[athletesParams.length - 1]).toBe(20); // OFFSET (page 3 = skip 20)
        });

        it('should throw error for invalid page number', async () => {
            const criteria: SearchCriteria = { sport: 'Basketball' };
            const pagination: PaginationParams = { page: 0, pageSize: 20 };

            await expect(searchAthletes(criteria, pagination)).rejects.toThrow('Invalid pagination parameters');
        });

        it('should throw error for invalid page size', async () => {
            const criteria: SearchCriteria = { sport: 'Basketball' };
            const pagination: PaginationParams = { page: 1, pageSize: 0 };

            await expect(searchAthletes(criteria, pagination)).rejects.toThrow('Invalid pagination parameters');
        });

        it('should throw error for page size exceeding maximum', async () => {
            const criteria: SearchCriteria = { sport: 'Basketball' };
            const pagination: PaginationParams = { page: 1, pageSize: 101 };

            await expect(searchAthletes(criteria, pagination)).rejects.toThrow('Invalid pagination parameters');
        });
    });

    describe('Result Mapping', () => {
        it('should map database results to PlayerProfile interface', async () => {
            const criteria: SearchCriteria = { sport: 'Basketball' };

            const mockAthletes = [
                {
                    id: 'player-1',
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john.doe@example.com',
                    sport: 'Basketball',
                    position: 'Point Guard',
                    desired_division: 'NCAA D1',
                    gpa: '3.8',
                    height_inches: 72,
                    weight_lbs: 185,
                    affordable_amount: '10000.00',
                    profile_image_url: '/images/player1.jpg',
                    video_url: 'https://youtube.com/watch?v=123',
                },
                {
                    id: 'player-2',
                    first_name: 'Jane',
                    last_name: 'Smith',
                    email: 'jane.smith@example.com',
                    sport: 'Basketball',
                    position: 'Shooting Guard',
                    desired_division: 'NCAA D2',
                    gpa: '3.5',
                    height_inches: 68,
                    weight_lbs: 160,
                    affordable_amount: null,
                    profile_image_url: null,
                    video_url: null,
                },
            ];

            mockQuery
                .mockResolvedValueOnce(mockAthletes)
                .mockResolvedValueOnce([{ total: '2' }]);

            const result = await searchAthletes(criteria);

            expect(result.athletes).toHaveLength(2);
            expect(result.totalCount).toBe(2);

            // Check first athlete mapping
            expect(result.athletes[0]).toEqual({
                id: 'player-1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                sport: 'Basketball',
                position: 'Point Guard',
                desiredDivision: 'NCAA D1',
                gpa: 3.8,
                heightInches: 72,
                weightLbs: 185,
                affordableAmount: 10000,
                profileImageUrl: '/images/player1.jpg',
                videoUrl: 'https://youtube.com/watch?v=123',
            });

            // Check second athlete mapping (with null values)
            expect(result.athletes[1]).toEqual({
                id: 'player-2',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                sport: 'Basketball',
                position: 'Shooting Guard',
                desiredDivision: 'NCAA D2',
                gpa: 3.5,
                heightInches: 68,
                weightLbs: 160,
                affordableAmount: undefined,
                profileImageUrl: null,
                videoUrl: null,
            });
        });

        it('should return empty array when no results', async () => {
            const criteria: SearchCriteria = { sport: 'Basketball' };

            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ total: '0' }]);

            const result = await searchAthletes(criteria);

            expect(result.athletes).toEqual([]);
            expect(result.totalCount).toBe(0);
        });
    });

    describe('Error Handling', () => {
        it('should throw error when database query fails', async () => {
            const criteria: SearchCriteria = { sport: 'Basketball' };

            mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

            await expect(searchAthletes(criteria)).rejects.toThrow('Failed to search athletes. Please try again later.');
        });

        it('should throw error for invalid height format', async () => {
            const criteria: SearchCriteria = {
                heightMin: 'invalid',
            };

            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ total: '0' }]);

            await expect(searchAthletes(criteria)).rejects.toThrow();
        });
    });

    describe('Default Pagination', () => {
        it('should use default pagination when not provided', async () => {
            const criteria: SearchCriteria = { sport: 'Basketball' };

            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ total: '0' }]);

            await searchAthletes(criteria);

            const athletesCall = mockQuery.mock.calls[0];
            const athletesParams = athletesCall[1] as any[];

            // Default should be page 1, pageSize 20
            expect(athletesParams[athletesParams.length - 2]).toBe(20); // LIMIT
            expect(athletesParams[athletesParams.length - 1]).toBe(0); // OFFSET
        });
    });
});
