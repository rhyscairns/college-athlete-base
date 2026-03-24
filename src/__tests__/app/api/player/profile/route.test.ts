/**
 * @jest-environment node
 * 
 * Tests for player profile API routes
 */

import { NextRequest } from 'next/server';
import type { RequestInit } from 'next/dist/server/web/spec-extension/request';
import { GET, PUT } from '@/app/api/player/[playerId]/profile/route';
import { getPlayerProfileById, updatePlayerProfile } from '@/profile/player/lib/db/queries';
import { logger } from '@/lib/logger';

// Mock dependencies
jest.mock('@/profile/player/lib/db/queries');
jest.mock('@/lib/logger');

const mockGetPlayerProfileById = getPlayerProfileById as jest.MockedFunction<typeof getPlayerProfileById>;
const mockUpdatePlayerProfile = updatePlayerProfile as jest.MockedFunction<typeof updatePlayerProfile>;

// Helper to create mock request
const createMockRequest = (url: string, options: RequestInit = {}) => {
    return new NextRequest(url, options);
};

describe('Player Profile API Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/player/[playerId]/profile', () => {
        const validPlayerId = '123e4567-e89b-12d3-a456-426614174000';
        const mockProfile = {
            id: validPlayerId,
            firstName: 'John',
            lastName: 'Doe',
            sport: 'Soccer',
            position: 'Forward',
            email: 'john@example.com',
            initials: 'JD',
            classYear: '2025',
            school: 'Test High',
            location: 'Test City',
            height: '6\'0"',
            weight: '180 lbs',
            academic: {
                gpa: 3.5,
                gpaScale: '4.0 Scale',
                coursework: [],
            },
            stats: {},
            videos: [],
            achievements: [],
            coachTestimonials: [],
            contact: {
                email: 'john@example.com',
                phone: '',
                socialMedia: {},
                headCoach: { name: '', email: '', phone: '' },
            },
        };

        it('should return player profile successfully', async () => {
            mockGetPlayerProfileById.mockResolvedValue(mockProfile as any);

            const request = createMockRequest(`http://localhost:3000/api/player/${validPlayerId}/profile`);
            const params = Promise.resolve({ playerId: validPlayerId });

            const response = await GET(request, { params });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toEqual(mockProfile);
            expect(mockGetPlayerProfileById).toHaveBeenCalledWith(validPlayerId);
        });

        it('should return 400 for invalid UUID', async () => {
            const request = createMockRequest('http://localhost:3000/api/player/invalid-id/profile');
            const params = Promise.resolve({ playerId: 'invalid-id' });

            const response = await GET(request, { params });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Invalid player ID format');
            expect(mockGetPlayerProfileById).not.toHaveBeenCalled();
        });

        it('should return 404 when player not found', async () => {
            mockGetPlayerProfileById.mockResolvedValue(null);

            const request = createMockRequest(`http://localhost:3000/api/player/${validPlayerId}/profile`);
            const params = Promise.resolve({ playerId: validPlayerId });

            const response = await GET(request, { params });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Player not found');
        });

        it('should return 500 on database error', async () => {
            mockGetPlayerProfileById.mockRejectedValue(new Error('Database error'));

            const request = createMockRequest(`http://localhost:3000/api/player/${validPlayerId}/profile`);
            const params = Promise.resolve({ playerId: validPlayerId });

            const response = await GET(request, { params });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Failed to fetch player profile');
        });

        it('should include cache headers in successful response', async () => {
            mockGetPlayerProfileById.mockResolvedValue(mockProfile as any);

            const request = createMockRequest(`http://localhost:3000/api/player/${validPlayerId}/profile`);
            const params = Promise.resolve({ playerId: validPlayerId });

            const response = await GET(request, { params });

            expect(response.headers.get('Cache-Control')).toContain('public');
            expect(response.headers.get('ETag')).toBeTruthy();
        });

        it('should handle unexpected errors', async () => {
            mockGetPlayerProfileById.mockImplementation(() => {
                throw 'String error';
            });

            const request = createMockRequest(`http://localhost:3000/api/player/${validPlayerId}/profile`);
            const params = Promise.resolve({ playerId: validPlayerId });

            const response = await GET(request, { params });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Failed to fetch player profile');
        });
    });

    describe('PUT /api/player/[playerId]/profile', () => {
        const validPlayerId = '123e4567-e89b-12d3-a456-426614174000';

        it('should update player profile with sport and position', async () => {
            mockUpdatePlayerProfile.mockResolvedValue(true);

            const updateData = {
                sport: 'Soccer',
                position: 'Forward',
                firstName: 'John',
                lastName: 'Doe',
            };

            const request = createMockRequest(
                `http://localhost:3000/api/player/${validPlayerId}/profile`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData),
                }
            );
            const params = Promise.resolve({ playerId: validPlayerId });

            const response = await PUT(request, { params });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.message).toBe('Profile updated successfully');
            expect(mockUpdatePlayerProfile).toHaveBeenCalledWith(validPlayerId, updateData);
        });

        it('should handle undefined sport and position', async () => {
            mockUpdatePlayerProfile.mockResolvedValue(true);

            const updateData = {
                sport: undefined,
                position: undefined,
                firstName: 'John',
            };

            const request = createMockRequest(
                `http://localhost:3000/api/player/${validPlayerId}/profile`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData),
                }
            );
            const params = Promise.resolve({ playerId: validPlayerId });

            const response = await PUT(request, { params });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it('should validate sport against sports constants', async () => {
            const updateData = {
                sport: 'InvalidSport',
                position: 'Forward',
            };

            const request = createMockRequest(
                `http://localhost:3000/api/player/${validPlayerId}/profile`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData),
                }
            );
            const params = Promise.resolve({ playerId: validPlayerId });

            const response = await PUT(request, { params });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Invalid sport');
            expect(data.validationErrors?.sport).toBe('Please select a sport from the list');
            expect(mockUpdatePlayerProfile).not.toHaveBeenCalled();
        });

        it('should validate position against sport positions', async () => {
            const updateData = {
                sport: 'Soccer',
                position: 'InvalidPosition',
            };

            const request = createMockRequest(
                `http://localhost:3000/api/player/${validPlayerId}/profile`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData),
                }
            );
            const params = Promise.resolve({ playerId: validPlayerId });

            const response = await PUT(request, { params });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Invalid position/event');
            expect(data.validationErrors?.position).toBe('Please select a valid position/event from the list');
        });

        it('should accept valid sport and position combination', async () => {
            mockUpdatePlayerProfile.mockResolvedValue(true);

            const updateData = {
                sport: 'Soccer',
                position: 'Forward',
            };

            const request = createMockRequest(
                `http://localhost:3000/api/player/${validPlayerId}/profile`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData),
                }
            );
            const params = Promise.resolve({ playerId: validPlayerId });

            const response = await PUT(request, { params });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it('should accept valid event-based sport', async () => {
            mockUpdatePlayerProfile.mockResolvedValue(true);

            const updateData = {
                sport: 'Swimming & Diving',
                position: '100m Freestyle',
            };

            const request = createMockRequest(
                `http://localhost:3000/api/player/${validPlayerId}/profile`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData),
                }
            );
            const params = Promise.resolve({ playerId: validPlayerId });

            const response = await PUT(request, { params });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it('should return 400 for invalid UUID', async () => {
            const request = createMockRequest(
                'http://localhost:3000/api/player/invalid-id/profile',
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sport: 'Soccer' }),
                }
            );
            const params = Promise.resolve({ playerId: 'invalid-id' });

            const response = await PUT(request, { params });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Invalid player ID format');
        });

        it('should return 400 for invalid JSON body', async () => {
            const request = createMockRequest(
                `http://localhost:3000/api/player/${validPlayerId}/profile`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: 'invalid json',
                }
            );
            const params = Promise.resolve({ playerId: validPlayerId });

            const response = await PUT(request, { params });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Invalid request body');
        });

        it('should handle database errors', async () => {
            mockUpdatePlayerProfile.mockRejectedValue(new Error('Database error'));

            const request = createMockRequest(
                `http://localhost:3000/api/player/${validPlayerId}/profile`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sport: 'Soccer' }),
                }
            );
            const params = Promise.resolve({ playerId: validPlayerId });

            const response = await PUT(request, { params });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Failed to update player profile');
        });

        it('should allow empty string for sport and position', async () => {
            mockUpdatePlayerProfile.mockResolvedValue(true);

            const updateData = {
                sport: '',
                position: '',
            };

            const request = createMockRequest(
                `http://localhost:3000/api/player/${validPlayerId}/profile`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData),
                }
            );
            const params = Promise.resolve({ playerId: validPlayerId });

            const response = await PUT(request, { params });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it('should allow null for sport and position', async () => {
            mockUpdatePlayerProfile.mockResolvedValue(true);

            const updateData = {
                sport: null,
                position: null,
            };

            const request = createMockRequest(
                `http://localhost:3000/api/player/${validPlayerId}/profile`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData),
                }
            );
            const params = Promise.resolve({ playerId: validPlayerId });

            const response = await PUT(request, { params });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it('should handle unexpected errors', async () => {
            mockUpdatePlayerProfile.mockImplementation(() => {
                throw 'String error';
            });

            const request = createMockRequest(
                `http://localhost:3000/api/player/${validPlayerId}/profile`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sport: 'Soccer' }),
                }
            );
            const params = Promise.resolve({ playerId: validPlayerId });

            const response = await PUT(request, { params });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Failed to update player profile');
        });

        it('should validate position only when sport is provided', async () => {
            mockUpdatePlayerProfile.mockResolvedValue(true);

            const updateData = {
                position: 'Forward',
                firstName: 'John',
            };

            const request = createMockRequest(
                `http://localhost:3000/api/player/${validPlayerId}/profile`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData),
                }
            );
            const params = Promise.resolve({ playerId: validPlayerId });

            const response = await PUT(request, { params });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });
    });
});
