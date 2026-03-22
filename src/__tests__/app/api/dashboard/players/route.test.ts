/**
 * @jest-environment node
 */
import { GET } from '@/app/api/dashboard/players/route';
import { query } from '@/authentication/db/client';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/authentication/db/client');
jest.mock('@/lib/logger');

const mockQuery = query as jest.MockedFunction<typeof query>;

/**
 * Helper function to create a NextRequest with query parameters
 */
function createRequest(queryParams: string = ''): NextRequest {
    const url = `http://localhost:3000/api/dashboard/players${queryParams ? '?' + queryParams : ''}`;
    return new NextRequest(url, {
        method: 'GET',
    });
}

describe('GET /api/dashboard/players', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Query Parameter Validation', () => {
        it('should use default values when no parameters provided', async () => {
            mockQuery
                .mockResolvedValueOnce([{ count: '0' }]) // count query
                .mockResolvedValueOnce([]); // players query

            const request = createRequest();
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.pagination.currentPage).toBe(1);
            expect(data.data.pagination.pageSize).toBe(12);
        });

        it('should accept valid page parameter', async () => {
            mockQuery
                .mockResolvedValueOnce([{ count: '24' }])
                .mockResolvedValueOnce([]);

            const request = createRequest('page=2');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.data.pagination.currentPage).toBe(2);
        });

        it('should accept valid pageSize parameter', async () => {
            mockQuery
                .mockResolvedValueOnce([{ count: '0' }])
                .mockResolvedValueOnce([]);

            const request = createRequest('pageSize=20');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.data.pagination.pageSize).toBe(20);
        });

        it('should reject invalid page parameter', async () => {
            const request = createRequest('page=-1');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'page',
                message: 'Page must be a positive integer',
            });
        });

        it('should reject pageSize exceeding maximum', async () => {
            const request = createRequest('pageSize=150');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'pageSize',
                message: 'Page size cannot exceed 100',
            });
        });

        it('should reject invalid excludeUserId format', async () => {
            const request = createRequest('excludeUserId=invalid-uuid');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'excludeUserId',
                message: 'Exclude user ID must be a valid UUID',
            });
        });
    });

    describe('Filtering', () => {
        it('should filter by sport', async () => {
            mockQuery
                .mockResolvedValueOnce([{ count: '5' }])
                .mockResolvedValueOnce([
                    {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        first_name: 'John',
                        last_name: 'Doe',
                        sport: 'Football',
                        position: 'Quarterback',
                    },
                ]);

            const request = createRequest('sport=Football');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('LOWER(sport) = LOWER($1)'),
                expect.arrayContaining(['Football'])
            );
        });

        it('should filter by position', async () => {
            mockQuery
                .mockResolvedValueOnce([{ count: '3' }])
                .mockResolvedValueOnce([]);

            const request = createRequest('position=Quarterback');
            const response = await GET(request);
            await response.json();

            expect(response.status).toBe(200);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('LOWER(position) = LOWER($1)'),
                expect.arrayContaining(['Quarterback'])
            );
        });

        it('should filter by both sport and position', async () => {
            mockQuery
                .mockResolvedValueOnce([{ count: '2' }])
                .mockResolvedValueOnce([]);

            const request = createRequest('sport=Football&position=Quarterback');
            const response = await GET(request);
            await response.json();

            expect(response.status).toBe(200);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('LOWER(sport) = LOWER($1) AND LOWER(position) = LOWER($2)'),
                expect.arrayContaining(['Football', 'Quarterback'])
            );
        });

        it('should exclude specific user ID', async () => {
            const excludeId = '123e4567-e89b-12d3-a456-426614174000';
            mockQuery
                .mockResolvedValueOnce([{ count: '10' }])
                .mockResolvedValueOnce([]);

            const request = createRequest(`excludeUserId=${excludeId}`);
            const response = await GET(request);
            await response.json();

            expect(response.status).toBe(200);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('id != $1'),
                expect.arrayContaining([excludeId])
            );
        });

        it('should not filter when sport is "All Sports"', async () => {
            mockQuery
                .mockResolvedValueOnce([{ count: '10' }])
                .mockResolvedValueOnce([]);

            const request = createRequest('sport=All Sports');
            const response = await GET(request);
            await response.json();

            expect(response.status).toBe(200);
            // Should not include sport filter in WHERE clause
            expect(mockQuery).toHaveBeenCalledWith(
                expect.not.stringContaining('LOWER(sport)'),
                expect.any(Array)
            );
        });

        it('should not filter when position is "All Positions"', async () => {
            mockQuery
                .mockResolvedValueOnce([{ count: '10' }])
                .mockResolvedValueOnce([]);

            const request = createRequest('position=All Positions');
            const response = await GET(request);
            await response.json();

            expect(response.status).toBe(200);
            // Should not include position filter in WHERE clause
            expect(mockQuery).toHaveBeenCalledWith(
                expect.not.stringContaining('LOWER(position)'),
                expect.any(Array)
            );
        });
    });

    describe('Pagination', () => {
        it('should calculate correct pagination metadata', async () => {
            mockQuery
                .mockResolvedValueOnce([{ count: '47' }]) // 47 total players
                .mockResolvedValueOnce([]);

            const request = createRequest('pageSize=12');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.data.pagination).toEqual({
                currentPage: 1,
                totalPages: 4, // ceil(47/12) = 4
                totalCount: 47,
                pageSize: 12,
            });
        });

        it('should calculate correct offset for page 2', async () => {
            mockQuery
                .mockResolvedValueOnce([{ count: '30' }])
                .mockResolvedValueOnce([]);

            const request = createRequest('page=2&pageSize=10');
            const response = await GET(request);

            expect(response.status).toBe(200);
            // Check that OFFSET is 10 (page 2, pageSize 10)
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('LIMIT'),
                expect.arrayContaining([10, 10]) // [pageSize, offset]
            );
        });

        it('should return empty array when page exceeds total pages', async () => {
            mockQuery
                .mockResolvedValueOnce([{ count: '5' }])
                .mockResolvedValueOnce([]);

            const request = createRequest('page=10&pageSize=12');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.data.players).toEqual([]);
            expect(data.data.pagination.totalPages).toBe(1);
        });
    });

    describe('Response Format', () => {
        it('should return players with correct structure', async () => {
            const mockPlayers = [
                {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    first_name: 'John',
                    last_name: 'Doe',
                    sport: 'Football',
                    position: 'Quarterback',
                },
                {
                    id: '223e4567-e89b-12d3-a456-426614174001',
                    first_name: 'Jane',
                    last_name: 'Smith',
                    sport: 'Basketball',
                    position: 'Point Guard',
                },
            ];

            mockQuery
                .mockResolvedValueOnce([{ count: '2' }])
                .mockResolvedValueOnce(mockPlayers);

            const request = createRequest();
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.players).toHaveLength(2);
            expect(data.data.players[0]).toEqual({
                id: '123e4567-e89b-12d3-a456-426614174000',
                firstName: 'John',
                lastName: 'Doe',
                sport: 'Football',
                position: 'Quarterback',
            });
        });

        it('should include cache headers', async () => {
            mockQuery
                .mockResolvedValueOnce([{ count: '0' }])
                .mockResolvedValueOnce([]);

            const request = createRequest();
            const response = await GET(request);

            expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=60, stale-while-revalidate=30');
        });
    });

    describe('Error Handling', () => {
        it('should handle database error on count query', async () => {
            mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

            const request = createRequest();
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Failed to fetch player count');
        });

        it('should handle database error on players query', async () => {
            mockQuery
                .mockResolvedValueOnce([{ count: '10' }])
                .mockRejectedValueOnce(new Error('Query failed'));

            const request = createRequest();
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Failed to fetch players');
        });
    });

    describe('SQL Injection Prevention', () => {
        it('should use parameterized queries for sport filter', async () => {
            mockQuery
                .mockResolvedValueOnce([{ count: '0' }])
                .mockResolvedValueOnce([]);

            const maliciousInput = "Football' OR '1'='1";
            const request = createRequest(`sport=${encodeURIComponent(maliciousInput)}`);
            await GET(request);

            // Verify that the malicious input is passed as a parameter, not concatenated
            expect(mockQuery).toHaveBeenCalledWith(
                expect.any(String),
                expect.arrayContaining([maliciousInput])
            );
        });
    });
});
