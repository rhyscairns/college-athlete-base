/**
 * @jest-environment node
 * 
 * Comprehensive tests for player profile API route
 * Tests cover:
 * - Valid player ID scenarios
 * - Error scenarios (404, 400, 500)
 * - Data transformation verification
 * - Caching behavior
 * - Logging behavior
 */
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/player/[playerId]/profile/route';
import { getPlayerProfileById } from '@/profile/player/lib/db/queries';
import { logger } from '@/lib/logger';

// Mock dependencies
jest.mock('@/profile/player/lib/db/queries');
jest.mock('@/lib/logger');

const mockGetPlayerProfileById = getPlayerProfileById as jest.MockedFunction<typeof getPlayerProfileById>;

describe('GET /api/player/[playerId]/profile', () => {
    const validPlayerId = '123e4567-e89b-12d3-a456-426614174000';

    const createRequest = (playerId: string) => {
        return new NextRequest(`http://localhost:3000/api/player/${playerId}/profile`, {
            method: 'GET',
        });
    };

    const mockProfileData = {
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
        stats: {
            'Receiving Yards': '1200',
            'Touchdowns': '15',
            'Receptions': '80',
            'Yards Per Catch': '15.0',
            'Longest Reception': '75',
        },
        recruitmentStatus: 'open' as const,
        commitmentStatus: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return player profile data for valid player ID', async () => {
        mockGetPlayerProfileById.mockResolvedValue(mockProfileData);

        const request = createRequest(validPlayerId);
        const response = await GET(request, { params: { playerId: validPlayerId } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toEqual(mockProfileData);
        expect(mockGetPlayerProfileById).toHaveBeenCalledWith(validPlayerId);
    });

    it('should return 404 when player is not found', async () => {
        mockGetPlayerProfileById.mockResolvedValue(null);

        const request = createRequest(validPlayerId);
        const response = await GET(request, { params: { playerId: validPlayerId } });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Player not found');
        expect(data.data).toBeNull();
    });

    it('should return 400 for invalid UUID format', async () => {
        const invalidPlayerId = 'invalid-uuid';

        const request = createRequest(invalidPlayerId);
        const response = await GET(request, { params: { playerId: invalidPlayerId } });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Invalid player ID format');
        expect(data.data).toBeNull();
        expect(mockGetPlayerProfileById).not.toHaveBeenCalled();
    });

    it('should return 500 when database query fails', async () => {
        mockGetPlayerProfileById.mockRejectedValue(new Error('Database connection failed'));

        const request = createRequest(validPlayerId);
        const response = await GET(request, { params: { playerId: validPlayerId } });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Failed to fetch player profile');
        expect(data.data).toBeNull();
    });

    it('should include caching headers in successful response', async () => {
        mockGetPlayerProfileById.mockResolvedValue(mockProfileData);

        const request = createRequest(validPlayerId);
        const response = await GET(request, { params: { playerId: validPlayerId } });

        expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=300, stale-while-revalidate=60');
        expect(response.headers.get('ETag')).toContain(validPlayerId);
    });

    it('should handle unexpected errors gracefully', async () => {
        mockGetPlayerProfileById.mockImplementation(() => {
            throw new Error('Unexpected error');
        });

        const request = createRequest(validPlayerId);
        const response = await GET(request, { params: { playerId: validPlayerId } });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Failed to fetch player profile');
        expect(data.data).toBeNull();
    });

    it('should log API request and response', async () => {
        mockGetPlayerProfileById.mockResolvedValue(mockProfileData);

        const request = createRequest(validPlayerId);
        await GET(request, { params: { playerId: validPlayerId } });

        expect(logger.apiRequest).toHaveBeenCalledWith(
            'GET',
            `/api/player/${validPlayerId}/profile`,
            expect.objectContaining({ playerId: validPlayerId })
        );
        expect(logger.apiResponse).toHaveBeenCalled();
    });

    describe('Data Transformation Verification', () => {
        it('should correctly transform database data to API response format', async () => {
            const dbData = {
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
                profileImage: 'https://example.com/image.jpg',
                performanceMetrics: [
                    { label: 'Speed', value: '4.5s', unit: '40-yard dash' }
                ],
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
                    coursework: ['AP Calculus', 'AP English'],
                },
                videos: [
                    {
                        id: 'video-1',
                        title: 'Highlight Reel',
                        url: 'https://youtube.com/watch?v=123',
                        thumbnail: 'https://example.com/thumb.jpg',
                        duration: '3:45',
                        isFeatured: true,
                        date: '2024-01-15',
                    }
                ],
                coachTestimonials: [
                    {
                        id: 'testimonial-1',
                        quote: 'Excellent player',
                        coachName: 'Coach Smith',
                        coachTitle: 'Head Coach',
                        coachOrganization: 'Test High School',
                    }
                ],
                achievements: [
                    {
                        id: 'achievement-1',
                        icon: '🏆',
                        title: 'MVP',
                        description: 'Team MVP 2024',
                        color: 'gold',
                    }
                ],
                contact: {
                    email: 'john.doe@example.com',
                    phone: '555-1234',
                    parentGuardianName: 'Jane Doe',
                    parentGuardianPhone: '555-5678',
                    parentGuardianEmail: 'jane.doe@example.com',
                    socialMedia: {
                        twitter: '@johndoe',
                        instagram: '@johndoe',
                        youtube: 'johndoe',
                        tiktok: '@johndoe',
                    },
                    preferredContactMethod: 'email',
                    headCoach: {
                        name: 'Coach Smith',
                        email: 'coach@school.com',
                        phone: '555-9999',
                    },
                },
                stats: {
                    'Receiving Yards': '1200',
                    'Touchdowns': '15',
                    'Receptions': '80',
                    'Yards Per Catch': '15.0',
                    'Longest Reception': '75',
                },
                recruitmentStatus: 'open' as const,
                commitmentStatus: null,
            };

            mockGetPlayerProfileById.mockResolvedValue(dbData);

            const request = createRequest(validPlayerId);
            const response = await GET(request, { params: { playerId: validPlayerId } });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toEqual(dbData);

            // Verify all nested structures are preserved
            expect(data.data.academic).toEqual(dbData.academic);
            expect(data.data.videos).toEqual(dbData.videos);
            expect(data.data.coachTestimonials).toEqual(dbData.coachTestimonials);
            expect(data.data.achievements).toEqual(dbData.achievements);
            expect(data.data.contact).toEqual(dbData.contact);
            expect(data.data.stats).toEqual(dbData.stats);
        });

        it('should handle partial data with empty arrays and optional fields', async () => {
            const partialData = {
                id: validPlayerId,
                firstName: 'Jane',
                lastName: 'Smith',
                initials: 'JS',
                classYear: '',
                position: 'Point Guard',
                school: '',
                location: 'Texas, USA',
                height: '',
                weight: '',
                age: 0,
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

            mockGetPlayerProfileById.mockResolvedValue(partialData);

            const request = createRequest(validPlayerId);
            const response = await GET(request, { params: { playerId: validPlayerId } });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toEqual(partialData);
            expect(data.data.videos).toEqual([]);
            expect(data.data.achievements).toEqual([]);
            expect(data.data.coachTestimonials).toEqual([]);
        });
    });

    describe('Caching Behavior', () => {
        it('should include Cache-Control header with correct values', async () => {
            mockGetPlayerProfileById.mockResolvedValue(mockProfileData);

            const request = createRequest(validPlayerId);
            const response = await GET(request, { params: { playerId: validPlayerId } });

            const cacheControl = response.headers.get('Cache-Control');
            expect(cacheControl).toBe('public, s-maxage=300, stale-while-revalidate=60');
        });

        it('should include ETag header with player ID and timestamp', async () => {
            const dataWithTimestamp = {
                ...mockProfileData,
                updated_at: new Date('2024-01-15T10:30:00Z'),
            };
            mockGetPlayerProfileById.mockResolvedValue(dataWithTimestamp);

            const request = createRequest(validPlayerId);
            const response = await GET(request, { params: { playerId: validPlayerId } });

            const etag = response.headers.get('ETag');
            expect(etag).toBeTruthy();
            expect(etag).toContain(validPlayerId);
        });

        it('should not include caching headers on error responses', async () => {
            mockGetPlayerProfileById.mockResolvedValue(null);

            const request = createRequest(validPlayerId);
            const response = await GET(request, { params: { playerId: validPlayerId } });

            expect(response.status).toBe(404);
            expect(response.headers.get('Cache-Control')).toBeNull();
            expect(response.headers.get('ETag')).toBeNull();
        });

        it('should not include caching headers on validation errors', async () => {
            const invalidPlayerId = 'invalid-uuid';
            const request = createRequest(invalidPlayerId);
            const response = await GET(request, { params: { playerId: invalidPlayerId } });

            expect(response.status).toBe(400);
            expect(response.headers.get('Cache-Control')).toBeNull();
            expect(response.headers.get('ETag')).toBeNull();
        });

        it('should not include caching headers on database errors', async () => {
            mockGetPlayerProfileById.mockRejectedValue(new Error('Database error'));

            const request = createRequest(validPlayerId);
            const response = await GET(request, { params: { playerId: validPlayerId } });

            expect(response.status).toBe(500);
            expect(response.headers.get('Cache-Control')).toBeNull();
            expect(response.headers.get('ETag')).toBeNull();
        });
    });

    describe('Error Scenarios', () => {
        it('should return 400 for empty player ID', async () => {
            const request = createRequest('');
            const response = await GET(request, { params: { playerId: '' } });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Invalid player ID format');
            expect(mockGetPlayerProfileById).not.toHaveBeenCalled();
        });

        it('should return 400 for malformed UUID', async () => {
            const malformedIds = [
                '123',
                'not-a-uuid',
                '123e4567-e89b-12d3-a456',
                '123e4567-e89b-12d3-a456-426614174000-extra',
                'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
            ];

            for (const malformedId of malformedIds) {
                const request = createRequest(malformedId);
                const response = await GET(request, { params: { playerId: malformedId } });
                const data = await response.json();

                expect(response.status).toBe(400);
                expect(data.success).toBe(false);
                expect(data.error).toBe('Invalid player ID format');
            }

            expect(mockGetPlayerProfileById).not.toHaveBeenCalled();
        });

        it('should return 500 for database connection errors', async () => {
            mockGetPlayerProfileById.mockRejectedValue(new Error('Connection timeout'));

            const request = createRequest(validPlayerId);
            const response = await GET(request, { params: { playerId: validPlayerId } });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Failed to fetch player profile');
            expect(data.data).toBeNull();
        });

        it('should return 500 for database query errors', async () => {
            mockGetPlayerProfileById.mockRejectedValue(new Error('Query execution failed'));

            const request = createRequest(validPlayerId);
            const response = await GET(request, { params: { playerId: validPlayerId } });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Failed to fetch player profile');
        });

        it('should log database errors appropriately', async () => {
            const dbError = new Error('Database connection failed');
            mockGetPlayerProfileById.mockRejectedValue(dbError);

            const request = createRequest(validPlayerId);
            await GET(request, { params: { playerId: validPlayerId } });

            expect(logger.dbError).toHaveBeenCalledWith(
                'getPlayerProfileById',
                dbError,
                expect.objectContaining({ playerId: validPlayerId })
            );
        });

        it('should log validation errors appropriately', async () => {
            const invalidPlayerId = 'invalid-uuid';
            const request = createRequest(invalidPlayerId);
            await GET(request, { params: { playerId: invalidPlayerId } });

            expect(logger.validationError).toHaveBeenCalledWith(
                'Invalid player ID format',
                expect.arrayContaining([
                    expect.objectContaining({
                        field: 'playerId',
                        message: 'Player ID must be a valid UUID'
                    })
                ]),
                expect.objectContaining({ playerId: invalidPlayerId })
            );
        });
    });

    describe('Response Structure', () => {
        it('should return consistent response structure for success', async () => {
            mockGetPlayerProfileById.mockResolvedValue(mockProfileData);

            const request = createRequest(validPlayerId);
            const response = await GET(request, { params: { playerId: validPlayerId } });
            const data = await response.json();

            expect(data).toHaveProperty('success');
            expect(data).toHaveProperty('data');
            expect(data).not.toHaveProperty('error');
            expect(data.success).toBe(true);
            expect(data.data).toBeTruthy();
        });

        it('should return consistent response structure for errors', async () => {
            mockGetPlayerProfileById.mockResolvedValue(null);

            const request = createRequest(validPlayerId);
            const response = await GET(request, { params: { playerId: validPlayerId } });
            const data = await response.json();

            expect(data).toHaveProperty('success');
            expect(data).toHaveProperty('error');
            expect(data).toHaveProperty('data');
            expect(data.success).toBe(false);
            expect(data.error).toBeTruthy();
            expect(data.data).toBeNull();
        });
    });

    describe('Performance and Logging', () => {
        it('should log execution time for successful requests', async () => {
            mockGetPlayerProfileById.mockResolvedValue(mockProfileData);

            const request = createRequest(validPlayerId);
            await GET(request, { params: { playerId: validPlayerId } });

            expect(logger.info).toHaveBeenCalledWith(
                'Player profile fetched successfully',
                expect.objectContaining({
                    playerId: validPlayerId,
                    executionTime: expect.stringMatching(/\d+ms/)
                })
            );
        });

        it('should log execution time for failed requests', async () => {
            mockGetPlayerProfileById.mockRejectedValue(new Error('Database error'));

            const request = createRequest(validPlayerId);
            await GET(request, { params: { playerId: validPlayerId } });

            expect(logger.apiResponse).toHaveBeenCalledWith(
                'GET',
                `/api/player/${validPlayerId}/profile`,
                500,
                expect.any(Number),
                expect.any(Object)
            );
        });

        it('should include request ID in all log entries', async () => {
            mockGetPlayerProfileById.mockResolvedValue(mockProfileData);

            const request = createRequest(validPlayerId);
            await GET(request, { params: { playerId: validPlayerId } });

            expect(logger.apiRequest).toHaveBeenCalledWith(
                'GET',
                `/api/player/${validPlayerId}/profile`,
                expect.objectContaining({
                    requestId: expect.any(String),
                    playerId: validPlayerId
                })
            );
        });
    });
});
