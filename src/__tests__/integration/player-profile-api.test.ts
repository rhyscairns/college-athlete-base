/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, PUT } from '@/app/api/player/[playerId]/profile/route';
import * as profileQueries from '@/profile/player/lib/db/queries';
import {
    generatePlayerProfile,
    generateDateOfBirth,
} from '@/__tests__/utils/test-data-generators';

// Mock the profile queries module
jest.mock('@/profile/player/lib/db/queries');

// Mock the logger to avoid console output during tests
jest.mock('@/lib/logger', () => ({
    logger: {
        apiRequest: jest.fn(),
        apiResponse: jest.fn(),
        validationError: jest.fn(),
        dbOperation: jest.fn(),
        dbError: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

// Don't mock the sports constants - we need the real validation
jest.unmock('@/constants/sports');

describe('Player Profile API - Integration Tests', () => {
    const mockGetPlayerProfileById = profileQueries.getPlayerProfileById as jest.MockedFunction<typeof profileQueries.getPlayerProfileById>;
    const mockUpdatePlayerProfile = profileQueries.updatePlayerProfile as jest.MockedFunction<typeof profileQueries.updatePlayerProfile>;
    const validPlayerId = '123e4567-e89b-12d3-a456-426614174000';
    const invalidPlayerId = 'invalid-uuid';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const createGetRequest = (playerId: string) => {
        return new NextRequest(`http://localhost:3000/api/player/${playerId}/profile`, {
            method: 'GET',
        });
    };

    const createPutRequest = (playerId: string, body: any) => {
        return new NextRequest(`http://localhost:3000/api/player/${playerId}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
    };

    const createMockProfile = (overrides?: any) => {
        const profileData = generatePlayerProfile(overrides);
        return {
            id: validPlayerId,
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            initials: 'TP',
            classYear: '',
            position: profileData.position,
            school: '',
            location: `${profileData.state}, ${profileData.country}`,
            height: '',
            weight: '',
            age: overrides?.age || 17,
            dateOfBirth: profileData.dateOfBirth,
            profileImage: overrides?.profileImage || '',
            performanceMetrics: [],
            academic: {
                ncaaEligibilityCenter: '',
                ncaaQualifier: false,
                gpa: profileData.gpa,
                gpaScale: '4.0 Scale',
                satScore: overrides?.satScore || 0,
                satMath: overrides?.satMath || 0,
                satReading: overrides?.satReading || 0,
                actScore: overrides?.actScore,
                classRank: '',
                classRankDetail: '',
                coursework: [],
            },
            videos: [],
            coachTestimonials: [],
            achievements: [],
            contact: {
                email: profileData.email,
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
            recruitmentStatus: overrides?.recruitmentStatus || 'open',
            commitmentStatus: null,
        };
    };

    describe('GET /api/player/[playerId]/profile', () => {
        describe('Successful Profile Retrieval', () => {
            it('should return player profile with all fields including dateOfBirth', async () => {
                const mockProfile = createMockProfile({ dateOfBirth: generateDateOfBirth(17) });
                mockGetPlayerProfileById.mockResolvedValueOnce(mockProfile as any);

                const request = createGetRequest(validPlayerId);
                const response = await GET(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
                expect(data.data).toBeDefined();
                expect(data.data.id).toBe(validPlayerId);
                expect(data.data.dateOfBirth).toBe(mockProfile.dateOfBirth);
                expect(data.data.age).toBe(17);

                expect(mockGetPlayerProfileById).toHaveBeenCalledTimes(1);
                expect(mockGetPlayerProfileById).toHaveBeenCalledWith(validPlayerId);
            });

            it('should return profile with test scores when available', async () => {
                const mockProfile = createMockProfile({
                    satScore: 1400,
                    satMath: 700,
                    satReading: 700,
                    actScore: 32,
                });
                mockGetPlayerProfileById.mockResolvedValueOnce(mockProfile as any);

                const request = createGetRequest(validPlayerId);
                const response = await GET(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
                expect(data.data.academic.satScore).toBe(1400);
                expect(data.data.academic.satMath).toBe(700);
                expect(data.data.academic.satReading).toBe(700);
                expect(data.data.academic.actScore).toBe(32);
            });

            it('should include caching headers in response', async () => {
                const mockProfile = createMockProfile();
                mockGetPlayerProfileById.mockResolvedValueOnce(mockProfile as any);

                const request = createGetRequest(validPlayerId);
                const response = await GET(request, { params: Promise.resolve({ playerId: validPlayerId }) });

                expect(response.status).toBe(200);
                expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=300, stale-while-revalidate=60');
                expect(response.headers.get('ETag')).toMatch(/^"/);
            });
        });

        describe('Error Handling', () => {
            it('should return 400 for invalid player ID format', async () => {
                const request = createGetRequest(invalidPlayerId);
                const response = await GET(request, { params: Promise.resolve({ playerId: invalidPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(400);
                expect(data.success).toBe(false);
                expect(data.error).toBe('Invalid player ID format');
                expect(data.data).toBeNull();

                expect(mockGetPlayerProfileById).not.toHaveBeenCalled();
            });

            it('should return 404 when player not found', async () => {
                mockGetPlayerProfileById.mockResolvedValueOnce(null);

                const request = createGetRequest(validPlayerId);
                const response = await GET(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(404);
                expect(data.success).toBe(false);
                expect(data.error).toBe('Player not found');
                expect(data.data).toBeNull();

                expect(mockGetPlayerProfileById).toHaveBeenCalledTimes(1);
            });

            it('should return 500 when database query fails', async () => {
                mockGetPlayerProfileById.mockRejectedValueOnce(new Error('Database connection failed'));

                const request = createGetRequest(validPlayerId);
                const response = await GET(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(500);
                expect(data.success).toBe(false);
                expect(data.error).toBe('Failed to fetch player profile');
                expect(data.data).toBeNull();

                expect(mockGetPlayerProfileById).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('PUT /api/player/[playerId]/profile', () => {
        describe('Successful Profile Updates', () => {
            it('should successfully update player profile fields', async () => {
                const updates = {
                    firstName: 'Updated',
                    lastName: 'Player',
                    sport: 'Football',
                    position: 'Quarterback',
                };

                mockUpdatePlayerProfile.mockResolvedValueOnce(true);

                const request = createPutRequest(validPlayerId, updates);
                const response = await PUT(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
                expect(data.message).toBe('Profile updated successfully');

                expect(mockUpdatePlayerProfile).toHaveBeenCalledTimes(1);
                expect(mockUpdatePlayerProfile).toHaveBeenCalledWith(validPlayerId, updates);
            });

            it('should successfully update dateOfBirth', async () => {
                const newDateOfBirth = generateDateOfBirth(18);
                const updates = {
                    dateOfBirth: newDateOfBirth,
                };

                mockUpdatePlayerProfile.mockResolvedValueOnce(true);

                const request = createPutRequest(validPlayerId, updates);
                const response = await PUT(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(200);
                expect(data.success).toBe(true);

                expect(mockUpdatePlayerProfile).toHaveBeenCalledWith(validPlayerId, updates);
            });

            it('should successfully update age', async () => {
                const updates = {
                    age: 18,
                };

                mockUpdatePlayerProfile.mockResolvedValueOnce(true);

                const request = createPutRequest(validPlayerId, updates);
                const response = await PUT(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(200);
                expect(data.success).toBe(true);

                expect(mockUpdatePlayerProfile).toHaveBeenCalledWith(validPlayerId, updates);
            });

            it('should successfully update GPA', async () => {
                const updates = {
                    academic: {
                        gpa: 3.8,
                    },
                };

                mockUpdatePlayerProfile.mockResolvedValueOnce(true);

                const request = createPutRequest(validPlayerId, updates);
                const response = await PUT(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(200);
                expect(data.success).toBe(true);

                expect(mockUpdatePlayerProfile).toHaveBeenCalledWith(validPlayerId, updates);
            });

            it('should successfully update test scores', async () => {
                const updates = {
                    academic: {
                        satScore: 1500,
                        satMath: 750,
                        satReading: 750,
                        actScore: 34,
                    },
                };

                mockUpdatePlayerProfile.mockResolvedValueOnce(true);

                const request = createPutRequest(validPlayerId, updates);
                const response = await PUT(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(200);
                expect(data.success).toBe(true);

                expect(mockUpdatePlayerProfile).toHaveBeenCalledWith(validPlayerId, updates);
            });

            it('should successfully update profile image', async () => {
                const updates = {
                    profileImage: 'https://example.com/new-profile.jpg',
                };

                mockUpdatePlayerProfile.mockResolvedValueOnce(true);

                const request = createPutRequest(validPlayerId, updates);
                const response = await PUT(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(200);
                expect(data.success).toBe(true);

                expect(mockUpdatePlayerProfile).toHaveBeenCalledWith(validPlayerId, updates);
            });

            it('should successfully update recruitment status', async () => {
                const updates = {
                    recruitmentStatus: 'committed',
                };

                mockUpdatePlayerProfile.mockResolvedValueOnce(true);

                const request = createPutRequest(validPlayerId, updates);
                const response = await PUT(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(200);
                expect(data.success).toBe(true);

                expect(mockUpdatePlayerProfile).toHaveBeenCalledWith(validPlayerId, updates);
            });

            it('should handle empty update gracefully', async () => {
                const updates = {};

                mockUpdatePlayerProfile.mockResolvedValueOnce(true);

                const request = createPutRequest(validPlayerId, updates);
                const response = await PUT(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(200);
                expect(data.success).toBe(true);

                expect(mockUpdatePlayerProfile).toHaveBeenCalledWith(validPlayerId, updates);
            });
        });

        describe('Validation', () => {
            it('should return 400 for invalid player ID format', async () => {
                const updates = { firstName: 'Test' };

                const request = createPutRequest(invalidPlayerId, updates);
                const response = await PUT(request, { params: Promise.resolve({ playerId: invalidPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(400);
                expect(data.success).toBe(false);
                expect(data.error).toBe('Invalid player ID format');

                expect(mockUpdatePlayerProfile).not.toHaveBeenCalled();
            });

            it('should return 400 for invalid JSON body', async () => {
                const request = new NextRequest(`http://localhost:3000/api/player/${validPlayerId}/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: 'invalid-json{',
                });

                const response = await PUT(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(400);
                expect(data.success).toBe(false);
                expect(data.error).toBe('Invalid request body');

                expect(mockUpdatePlayerProfile).not.toHaveBeenCalled();
            });

            it('should return 400 for invalid sport', async () => {
                const updates = {
                    sport: 'invalid-sport-name',
                };

                const request = createPutRequest(validPlayerId, updates);
                const response = await PUT(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(400);
                expect(data.success).toBe(false);
                expect(data.error).toBe('Invalid sport');
                expect(data.validationErrors?.sport).toBe('Please select a sport from the list');

                expect(mockUpdatePlayerProfile).not.toHaveBeenCalled();
            });

            it('should return 400 for invalid position for given sport', async () => {
                const updates = {
                    sport: 'Basketball',
                    position: 'Quarterback', // Football position, not basketball
                };

                const request = createPutRequest(validPlayerId, updates);
                const response = await PUT(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(400);
                expect(data.success).toBe(false);
                expect(data.error).toBe('Invalid position/event');
                expect(data.validationErrors?.position).toBe('Please select a valid position/event from the list');

                expect(mockUpdatePlayerProfile).not.toHaveBeenCalled();
            });

            it('should return 400 for age below minimum (13)', async () => {
                const updates = {
                    age: 12,
                };

                const request = createPutRequest(validPlayerId, updates);
                const response = await PUT(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(400);
                expect(data.success).toBe(false);
                expect(data.error).toBe('Invalid age');
                expect(data.validationErrors?.age).toBe('Age must be between 13 and 25 years');

                expect(mockUpdatePlayerProfile).not.toHaveBeenCalled();
            });

            it('should return 400 for age above maximum (25)', async () => {
                const updates = {
                    age: 26,
                };

                const request = createPutRequest(validPlayerId, updates);
                const response = await PUT(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(400);
                expect(data.success).toBe(false);
                expect(data.error).toBe('Invalid age');
                expect(data.validationErrors?.age).toBe('Age must be between 13 and 25 years');

                expect(mockUpdatePlayerProfile).not.toHaveBeenCalled();
            });

            it('should accept valid age at minimum boundary (13)', async () => {
                const updates = {
                    age: 13,
                };

                mockUpdatePlayerProfile.mockResolvedValueOnce(true);

                const request = createPutRequest(validPlayerId, updates);
                const response = await PUT(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
            });

            it('should accept valid age at maximum boundary (25)', async () => {
                const updates = {
                    age: 25,
                };

                mockUpdatePlayerProfile.mockResolvedValueOnce(true);

                const request = createPutRequest(validPlayerId, updates);
                const response = await PUT(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
            });

            it('should accept valid sport and position combination', async () => {
                const updates = {
                    sport: 'Basketball',
                    position: 'Point Guard',
                };

                mockUpdatePlayerProfile.mockResolvedValueOnce(true);

                const request = createPutRequest(validPlayerId, updates);
                const response = await PUT(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
            });
        });

        describe('Error Handling', () => {
            it('should return 500 when database update fails', async () => {
                const updates = {
                    firstName: 'Updated',
                };

                // Clear any previous mocks and set up the rejection
                jest.clearAllMocks();
                mockUpdatePlayerProfile.mockRejectedValueOnce(new Error('Database update failed'));

                const request = createPutRequest(validPlayerId, updates);
                const response = await PUT(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(500);
                expect(data.success).toBe(false);
                expect(data.error).toBe('Failed to update player profile');

                expect(mockUpdatePlayerProfile).toHaveBeenCalledTimes(1);
            });

            it('should handle unexpected errors gracefully', async () => {
                const updates = {
                    firstName: 'Updated',
                };

                // Clear any previous mocks and set up the rejection
                jest.clearAllMocks();
                mockUpdatePlayerProfile.mockRejectedValueOnce(new Error('Unexpected error'));

                const request = createPutRequest(validPlayerId, updates);
                const response = await PUT(request, { params: Promise.resolve({ playerId: validPlayerId }) });
                const data = await response.json();

                expect(response.status).toBe(500);
                expect(data.success).toBe(false);
                expect(data.error).toBe('Failed to update player profile');
            });
        });
    });

    describe('Authentication Requirements', () => {
        // Note: The current implementation doesn't have authentication middleware
        // These tests document the expected behavior when authentication is added

        it('GET should work without authentication (public profile)', async () => {
            const mockProfile = createMockProfile();
            mockGetPlayerProfileById.mockResolvedValueOnce(mockProfile as any);

            const request = createGetRequest(validPlayerId);
            const response = await GET(request, { params: Promise.resolve({ playerId: validPlayerId }) });

            expect(response.status).toBe(200);
        });

        it('PUT should work without authentication (to be secured in future)', async () => {
            // This test documents current behavior
            // In production, PUT should require authentication
            const updates = {
                firstName: 'Updated',
            };

            // Clear any previous mocks
            jest.clearAllMocks();
            mockUpdatePlayerProfile.mockResolvedValueOnce(true);

            const request = createPutRequest(validPlayerId, updates);
            const response = await PUT(request, { params: Promise.resolve({ playerId: validPlayerId }) });

            expect(response.status).toBe(200);
        });
    });
});
