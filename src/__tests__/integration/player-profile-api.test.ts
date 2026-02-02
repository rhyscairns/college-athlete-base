/**
 * @jest-environment node
 * 
 * Integration test for player profile API
 * Tests the full flow from API route to database query
 * 
 * These tests verify:
 * - Complete request/response cycle
 * - Error handling with real API route
 * - Response structure consistency
 * - Header behavior
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/player/[playerId]/profile/route';
import { getPlayerProfileById } from '@/profile/player/lib/db/queries';

// Mock the database query to avoid actual database connections
jest.mock('@/profile/player/lib/db/queries');
jest.mock('@/lib/logger');

const mockGetPlayerProfileById = getPlayerProfileById as jest.MockedFunction<typeof getPlayerProfileById>;

describe('Player Profile API Integration', () => {
    const validPlayerId = '123e4567-e89b-12d3-a456-426614174000';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Complete Request/Response Cycle', () => {
        it('should handle successful request with valid data', async () => {
            const mockData = {
                id: validPlayerId,
                firstName: 'John',
                lastName: 'Doe',
                initials: 'JD',
                classYear: '2025',
                position: 'Wide Receiver',
                school: 'Test High School',
                location: 'California, USA',
                height: '6\'2"',
                weight: '185 lbs',
                age: 18,
                profileImage: '',
                performanceMetrics: [],
                academic: {
                    ncaaEligibilityCenter: 'Certified',
                    ncaaQualifier: true,
                    gpa: 3.8,
                    gpaScale: '4.0 Scale',
                    satScore: 1200,
                    satMath: 600,
                    satReading: 600,
                    classRank: '10/250',
                    classRankDetail: 'Top 4%',
                    coursework: [],
                },
                videos: [],
                coachTestimonials: [],
                achievements: [],
                contact: {
                    email: 'john.doe@example.com',
                    phone: '',
                    parentGuardianName: '',
                    parentGuardianPhone: '',
                    parentGuardianEmail: '',
                    socialMedia: {
                        twitter: '',
                        instagram: '',
                        youtube: '',
                        tiktok: '',
                    },
                    preferredContactMethod: '',
                    headCoach: {
                        name: '',
                        email: '',
                        phone: '',
                    },
                },
                stats: {},
                recruitmentStatus: 'open' as const,
                commitmentStatus: null,
            };

            mockGetPlayerProfileById.mockResolvedValue(mockData);

            const request = new NextRequest(`http://localhost:3000/api/player/${validPlayerId}/profile`, {
                method: 'GET',
            });

            const response = await GET(request, { params: { playerId: validPlayerId } });

            expect(response).toBeDefined();
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data).toHaveProperty('success', true);
            expect(data).toHaveProperty('data');
            expect(data.data).toHaveProperty('id', validPlayerId);
            expect(data.data).toHaveProperty('firstName', 'John');
            expect(data.data).toHaveProperty('lastName', 'Doe');
        });

        it('should handle 404 when player not found', async () => {
            mockGetPlayerProfileById.mockResolvedValue(null);

            const request = new NextRequest(`http://localhost:3000/api/player/${validPlayerId}/profile`, {
                method: 'GET',
            });

            const response = await GET(request, { params: { playerId: validPlayerId } });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Player not found');
            expect(data.data).toBeNull();
        });

        it('should handle database errors gracefully', async () => {
            mockGetPlayerProfileById.mockRejectedValue(new Error('Database connection failed'));

            const request = new NextRequest(`http://localhost:3000/api/player/${validPlayerId}/profile`, {
                method: 'GET',
            });

            const response = await GET(request, { params: { playerId: validPlayerId } });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Failed to fetch player profile');
            expect(data.data).toBeNull();
        });
    });

    describe('Validation and Error Handling', () => {
        it('should return proper error structure for invalid UUID', async () => {
            const invalidPlayerId = 'not-a-uuid';
            const request = new NextRequest(`http://localhost:3000/api/player/${invalidPlayerId}/profile`, {
                method: 'GET',
            });

            const response = await GET(request, { params: { playerId: invalidPlayerId } });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Invalid player ID format');
            expect(data.data).toBeNull();
        });

        it('should validate UUID format before database query', async () => {
            const invalidPlayerId = '12345';
            const request = new NextRequest(`http://localhost:3000/api/player/${invalidPlayerId}/profile`, {
                method: 'GET',
            });

            await GET(request, { params: { playerId: invalidPlayerId } });

            // Should not call database if validation fails
            expect(mockGetPlayerProfileById).not.toHaveBeenCalled();
        });
    });

    describe('Response Headers and Caching', () => {
        it('should include proper caching headers for successful responses', async () => {
            const mockData = {
                id: validPlayerId,
                firstName: 'Jane',
                lastName: 'Smith',
                initials: 'JS',
                classYear: '2025',
                position: 'Point Guard',
                school: 'Test School',
                location: 'Texas, USA',
                height: '5\'10"',
                weight: '150 lbs',
                age: 17,
                profileImage: '',
                performanceMetrics: [],
                academic: {
                    ncaaEligibilityCenter: '',
                    ncaaQualifier: false,
                    gpa: 3.5,
                    gpaScale: '4.0 Scale',
                    satScore: 0,
                    satMath: 0,
                    satReading: 0,
                    classRank: '',
                    classRankDetail: '',
                    coursework: [],
                },
                videos: [],
                coachTestimonials: [],
                achievements: [],
                contact: {
                    email: 'jane.smith@example.com',
                    phone: '',
                    parentGuardianName: '',
                    parentGuardianPhone: '',
                    parentGuardianEmail: '',
                    socialMedia: {
                        twitter: '',
                        instagram: '',
                        youtube: '',
                        tiktok: '',
                    },
                    preferredContactMethod: '',
                    headCoach: {
                        name: '',
                        email: '',
                        phone: '',
                    },
                },
                stats: {},
                recruitmentStatus: 'open' as const,
                commitmentStatus: null,
            };

            mockGetPlayerProfileById.mockResolvedValue(mockData);

            const request = new NextRequest(`http://localhost:3000/api/player/${validPlayerId}/profile`, {
                method: 'GET',
            });

            const response = await GET(request, { params: { playerId: validPlayerId } });

            // Check that response has headers
            expect(response.headers).toBeDefined();

            // Should have caching headers for successful response
            expect(response.status).toBe(200);
            expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=300, stale-while-revalidate=60');
            expect(response.headers.get('ETag')).toBeTruthy();
            expect(response.headers.get('ETag')).toContain(validPlayerId);
        });

        it('should not include caching headers for error responses', async () => {
            mockGetPlayerProfileById.mockResolvedValue(null);

            const request = new NextRequest(`http://localhost:3000/api/player/${validPlayerId}/profile`, {
                method: 'GET',
            });

            const response = await GET(request, { params: { playerId: validPlayerId } });

            expect(response.status).toBe(404);
            expect(response.headers.get('Cache-Control')).toBeNull();
            expect(response.headers.get('ETag')).toBeNull();
        });
    });

    describe('Data Structure Consistency', () => {
        it('should return consistent structure for all successful responses', async () => {
            const mockData = {
                id: validPlayerId,
                firstName: 'Test',
                lastName: 'Player',
                initials: 'TP',
                classYear: '',
                position: 'Forward',
                school: '',
                location: 'USA',
                height: '',
                weight: '',
                age: 0,
                profileImage: '',
                performanceMetrics: [],
                academic: {
                    ncaaEligibilityCenter: '',
                    ncaaQualifier: false,
                    gpa: 3.0,
                    gpaScale: '4.0 Scale',
                    satScore: 0,
                    satMath: 0,
                    satReading: 0,
                    classRank: '',
                    classRankDetail: '',
                    coursework: [],
                },
                videos: [],
                coachTestimonials: [],
                achievements: [],
                contact: {
                    email: 'test@example.com',
                    phone: '',
                    parentGuardianName: '',
                    parentGuardianPhone: '',
                    parentGuardianEmail: '',
                    socialMedia: {
                        twitter: '',
                        instagram: '',
                        youtube: '',
                        tiktok: '',
                    },
                    preferredContactMethod: '',
                    headCoach: {
                        name: '',
                        email: '',
                        phone: '',
                    },
                },
                stats: {},
                recruitmentStatus: 'open' as const,
                commitmentStatus: null,
            };

            mockGetPlayerProfileById.mockResolvedValue(mockData);

            const request = new NextRequest(`http://localhost:3000/api/player/${validPlayerId}/profile`, {
                method: 'GET',
            });

            const response = await GET(request, { params: { playerId: validPlayerId } });
            const data = await response.json();

            // Verify all required top-level fields
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('id');
            expect(data.data).toHaveProperty('firstName');
            expect(data.data).toHaveProperty('lastName');
            expect(data.data).toHaveProperty('initials');
            expect(data.data).toHaveProperty('position');
            expect(data.data).toHaveProperty('location');
            expect(data.data).toHaveProperty('academic');
            expect(data.data).toHaveProperty('videos');
            expect(data.data).toHaveProperty('achievements');
            expect(data.data).toHaveProperty('coachTestimonials');
            expect(data.data).toHaveProperty('contact');
            expect(data.data).toHaveProperty('stats');

            // Verify nested structures
            expect(data.data.academic).toHaveProperty('gpa');
            expect(data.data.contact).toHaveProperty('email');
            expect(Array.isArray(data.data.videos)).toBe(true);
            expect(Array.isArray(data.data.achievements)).toBe(true);
            expect(Array.isArray(data.data.coachTestimonials)).toBe(true);
        });

        it('should return consistent structure for all error responses', async () => {
            const errorScenarios = [
                { playerId: 'invalid', expectedStatus: 400 },
                { playerId: validPlayerId, expectedStatus: 404, mockReturn: null },
                { playerId: validPlayerId, expectedStatus: 500, mockError: new Error('DB Error') },
            ];

            for (const scenario of errorScenarios) {
                jest.clearAllMocks();

                if (scenario.mockReturn !== undefined) {
                    mockGetPlayerProfileById.mockResolvedValue(scenario.mockReturn);
                } else if (scenario.mockError) {
                    mockGetPlayerProfileById.mockRejectedValue(scenario.mockError);
                }

                const request = new NextRequest(`http://localhost:3000/api/player/${scenario.playerId}/profile`, {
                    method: 'GET',
                });

                const response = await GET(request, { params: { playerId: scenario.playerId } });
                const data = await response.json();

                expect(response.status).toBe(scenario.expectedStatus);
                expect(data).toHaveProperty('success', false);
                expect(data).toHaveProperty('error');
                expect(data).toHaveProperty('data', null);
                expect(typeof data.error).toBe('string');
            }
        });
    });
});
