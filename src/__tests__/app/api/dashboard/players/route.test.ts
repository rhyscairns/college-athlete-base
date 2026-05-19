/**
 * @jest-environment node
 * 
 * Tests for /api/dashboard/players endpoint
 * Verifies player data retrieval with video information
 */

import { GET } from '@/app/api/dashboard/players/route';
import { query } from '@/authentication/db/client';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/authentication/db/client');
jest.mock('@/lib/logger');

const mockQuery = query as jest.MockedFunction<typeof query>;

describe('GET /api/dashboard/players', () => {
    const createRequest = (url: string) => {
        return new NextRequest(url, {
            method: 'GET',
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Video data inclusion', () => {
        it('should include videoUrl and videoTitle when player has video data', async () => {
            // Mock count query
            mockQuery.mockResolvedValueOnce([{ count: '1' }]);

            // Mock players query with video data
            mockQuery.mockResolvedValueOnce([
                {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    first_name: 'John',
                    last_name: 'Doe',
                    sport: 'Football',
                    position: 'Wide Receiver',
                    profile_image_url: 'https://example.com/image.jpg',
                    video_thumbnail_url: 'https://example.com/thumb.jpg',
                    highlight_video_url: 'https://youtube.com/watch?v=abc123',
                    video_title: 'Season Highlights 2024',
                },
            ]);

            const request = createRequest('http://localhost:3000/api/dashboard/players');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.players).toHaveLength(1);
            expect(data.data.players[0]).toMatchObject({
                id: '123e4567-e89b-12d3-a456-426614174000',
                firstName: 'John',
                lastName: 'Doe',
                sport: 'Football',
                position: 'Wide Receiver',
                videoUrl: 'https://youtube.com/watch?v=abc123',
                videoTitle: 'Season Highlights 2024',
            });
        });

        it('should handle players without video data gracefully', async () => {
            // Mock count query
            mockQuery.mockResolvedValueOnce([{ count: '1' }]);

            // Mock players query without video data
            mockQuery.mockResolvedValueOnce([
                {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    first_name: 'Jane',
                    last_name: 'Smith',
                    sport: 'Basketball',
                    position: 'Point Guard',
                    profile_image_url: 'https://example.com/image.jpg',
                    video_thumbnail_url: null,
                    highlight_video_url: null,
                    video_title: null,
                },
            ]);

            const request = createRequest('http://localhost:3000/api/dashboard/players');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.players).toHaveLength(1);
            expect(data.data.players[0]).toMatchObject({
                id: '123e4567-e89b-12d3-a456-426614174000',
                firstName: 'Jane',
                lastName: 'Smith',
                sport: 'Basketball',
                position: 'Point Guard',
            });
            // videoUrl and videoTitle should be undefined when null in database
            expect(data.data.players[0].videoUrl).toBeUndefined();
            expect(data.data.players[0].videoTitle).toBeUndefined();
        });

        it('should include video data for multiple players', async () => {
            // Mock count query
            mockQuery.mockResolvedValueOnce([{ count: '3' }]);

            // Mock players query with mixed video data
            mockQuery.mockResolvedValueOnce([
                {
                    id: '123e4567-e89b-12d3-a456-426614174001',
                    first_name: 'Player',
                    last_name: 'One',
                    sport: 'Football',
                    position: 'Quarterback',
                    profile_image_url: null,
                    video_thumbnail_url: 'https://example.com/thumb1.jpg',
                    highlight_video_url: 'https://youtube.com/watch?v=video1',
                    video_title: 'Highlights Reel',
                },
                {
                    id: '123e4567-e89b-12d3-a456-426614174002',
                    first_name: 'Player',
                    last_name: 'Two',
                    sport: 'Basketball',
                    position: 'Center',
                    profile_image_url: null,
                    video_thumbnail_url: null,
                    highlight_video_url: null,
                    video_title: null,
                },
                {
                    id: '123e4567-e89b-12d3-a456-426614174003',
                    first_name: 'Player',
                    last_name: 'Three',
                    sport: 'Soccer',
                    position: 'Forward',
                    profile_image_url: null,
                    video_thumbnail_url: 'https://example.com/thumb3.jpg',
                    highlight_video_url: 'https://youtube.com/watch?v=video3',
                    video_title: 'Best Goals',
                },
            ]);

            const request = createRequest('http://localhost:3000/api/dashboard/players');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.players).toHaveLength(3);

            // First player has video
            expect(data.data.players[0].videoUrl).toBe('https://youtube.com/watch?v=video1');
            expect(data.data.players[0].videoTitle).toBe('Highlights Reel');

            // Second player has no video
            expect(data.data.players[1].videoUrl).toBeUndefined();
            expect(data.data.players[1].videoTitle).toBeUndefined();

            // Third player has video
            expect(data.data.players[2].videoUrl).toBe('https://youtube.com/watch?v=video3');
            expect(data.data.players[2].videoTitle).toBe('Best Goals');
        });
    });

    describe('SQL query structure', () => {
        it('should query highlight_video_url and video_title columns from database', async () => {
            // Mock count query
            mockQuery.mockResolvedValueOnce([{ count: '0' }]);

            // Mock players query
            mockQuery.mockResolvedValueOnce([]);

            const request = createRequest('http://localhost:3000/api/dashboard/players');
            await GET(request);

            // Verify the SQL query includes video columns
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('highlight_video_url'),
                expect.any(Array)
            );
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('video_title'),
                expect.any(Array)
            );
        });
    });

    describe('CAB member filter', () => {
        it('should always filter by is_cab_member = TRUE in the count query', async () => {
            mockQuery.mockResolvedValueOnce([{ count: '0' }]);
            mockQuery.mockResolvedValueOnce([]);

            const request = createRequest('http://localhost:3000/api/dashboard/players');
            await GET(request);

            const countCall = mockQuery.mock.calls[0];
            expect(countCall[0]).toContain('is_cab_member = TRUE');
        });

        it('should always filter by is_cab_member = TRUE in the players query', async () => {
            mockQuery.mockResolvedValueOnce([{ count: '0' }]);
            mockQuery.mockResolvedValueOnce([]);

            const request = createRequest('http://localhost:3000/api/dashboard/players');
            await GET(request);

            const playerCall = mockQuery.mock.calls[1];
            expect(playerCall[0]).toContain('is_cab_member = TRUE');
        });

        it('should exclude non-member players from results', async () => {
            // Only 1 result returned (the member), even though 2 exist in DB
            mockQuery.mockResolvedValueOnce([{ count: '1' }]);
            mockQuery.mockResolvedValueOnce([
                {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    first_name: 'Member',
                    last_name: 'Player',
                    sport: 'Football',
                    position: 'Wide Receiver',
                    profile_image_url: null,
                    video_thumbnail_url: null,
                    highlight_video_url: null,
                    video_title: null,
                    has_accepted_offer: false,
                },
            ]);

            const request = createRequest('http://localhost:3000/api/dashboard/players');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.data.players).toHaveLength(1);
            expect(data.data.players[0].firstName).toBe('Member');
        });
    });

    describe('Status filter', () => {
        it('should add NOT EXISTS condition when status=available', async () => {
            mockQuery.mockResolvedValueOnce([{ count: '0' }]);
            mockQuery.mockResolvedValueOnce([]);

            const request = createRequest('http://localhost:3000/api/dashboard/players?status=available');
            await GET(request);

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('NOT EXISTS'),
                expect.any(Array)
            );
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("s.status = 'accepted'"),
                expect.any(Array)
            );
        });

        it('should add EXISTS condition when status=committed', async () => {
            mockQuery.mockResolvedValueOnce([{ count: '0' }]);
            mockQuery.mockResolvedValueOnce([]);

            const request = createRequest('http://localhost:3000/api/dashboard/players?status=committed');
            await GET(request);

            // The players query should contain EXISTS (not NOT EXISTS)
            const playerQueryCall = mockQuery.mock.calls[1];
            expect(playerQueryCall[0]).toMatch(/(?<!NOT )EXISTS/);
            expect(playerQueryCall[0]).toContain("s.status = 'accepted'");
        });

        it('should not add any status condition when status is omitted', async () => {
            mockQuery.mockResolvedValueOnce([{ count: '0' }]);
            mockQuery.mockResolvedValueOnce([]);

            const request = createRequest('http://localhost:3000/api/dashboard/players');
            await GET(request);

            // Neither count nor players query should filter by scholarships in WHERE
            const countCall = mockQuery.mock.calls[0];
            expect(countCall[0]).not.toContain('NOT EXISTS');
            // The players query has EXISTS in the SELECT for has_accepted_offer, but not in WHERE
            const playerCall = mockQuery.mock.calls[1];
            expect(playerCall[0]).not.toContain('NOT EXISTS');
        });

        it('should ignore unrecognised status values', async () => {
            mockQuery.mockResolvedValueOnce([{ count: '0' }]);
            mockQuery.mockResolvedValueOnce([]);

            const request = createRequest('http://localhost:3000/api/dashboard/players?status=unknown');
            await GET(request);

            const countCall = mockQuery.mock.calls[0];
            expect(countCall[0]).not.toContain('NOT EXISTS');
            // WHERE clause should only contain the CAB member filter, no scholarship conditions
            expect(countCall[0]).toContain('is_cab_member = TRUE');
            expect(countCall[0]).not.toContain('scholarships');
        });
    });
});
