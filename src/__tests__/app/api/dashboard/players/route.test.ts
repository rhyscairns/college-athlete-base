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
                    profile_image: 'https://example.com/image.jpg',
                    video_thumbnail: 'https://example.com/thumb.jpg',
                    video_url: 'https://youtube.com/watch?v=abc123',
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
                    profile_image: 'https://example.com/image.jpg',
                    video_thumbnail: null,
                    video_url: null,
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
                    profile_image: null,
                    video_thumbnail: 'https://example.com/thumb1.jpg',
                    video_url: 'https://youtube.com/watch?v=video1',
                    video_title: 'Highlights Reel',
                },
                {
                    id: '123e4567-e89b-12d3-a456-426614174002',
                    first_name: 'Player',
                    last_name: 'Two',
                    sport: 'Basketball',
                    position: 'Center',
                    profile_image: null,
                    video_thumbnail: null,
                    video_url: null,
                    video_title: null,
                },
                {
                    id: '123e4567-e89b-12d3-a456-426614174003',
                    first_name: 'Player',
                    last_name: 'Three',
                    sport: 'Soccer',
                    position: 'Forward',
                    profile_image: null,
                    video_thumbnail: 'https://example.com/thumb3.jpg',
                    video_url: 'https://youtube.com/watch?v=video3',
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
        it('should query video_url and video_title columns from database', async () => {
            // Mock count query
            mockQuery.mockResolvedValueOnce([{ count: '0' }]);

            // Mock players query
            mockQuery.mockResolvedValueOnce([]);

            const request = createRequest('http://localhost:3000/api/dashboard/players');
            await GET(request);

            // Verify the SQL query includes video columns
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('video_url'),
                expect.any(Array)
            );
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('video_title'),
                expect.any(Array)
            );
        });
    });
});
