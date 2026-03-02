/**
 * @jest-environment node
 * 
 * Comprehensive tests for coach profile API route
 * Tests cover:
 * - Authentication and authorization
 * - Valid update scenarios
 * - Validation errors
 * - Error scenarios (401, 403, 400, 500)
 * - Logging behavior
 */
import { NextRequest } from 'next/server';
import { GET, PUT } from '@/app/api/coach/[coachId]/profile/route';
import { validateSession } from '@/authentication/middleware/session';
import { getCoachProfileById, updateCoachProfile } from '@/profile/coach/lib/db/queries';
import { logger } from '@/lib/logger';

// Mock dependencies
jest.mock('@/authentication/middleware/session');
jest.mock('@/profile/coach/lib/db/queries');
jest.mock('@/lib/logger');

const mockValidateSession = validateSession as jest.MockedFunction<typeof validateSession>;
const mockGetCoachProfileById = getCoachProfileById as jest.MockedFunction<typeof getCoachProfileById>;
const mockUpdateCoachProfile = updateCoachProfile as jest.MockedFunction<typeof updateCoachProfile>;

describe('PUT /api/coach/[coachId]/profile', () => {
    const validCoachId = '123e4567-e89b-12d3-a456-426614174000';
    const otherCoachId = '987e6543-e21b-12d3-a456-426614174999';

    const createRequest = (coachId: string, body: any) => {
        return new NextRequest(`http://localhost:3000/api/coach/${coachId}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
    };

    const mockUpdatedProfile = {
        id: validCoachId,
        firstName: 'John',
        lastName: 'Smith',
        initials: 'JS',
        email: 'john.smith@university.edu',
        phone: '+1 555 123 4567',
        university: 'State University',
        position: 'Head Coach',
        sport: 'Basketball',
        profileImage: 'https://example.com/profile.jpg',
        teamWebsiteUrl: 'https://university.edu/basketball',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Authentication', () => {
        it('should return 401 when no session token is provided', async () => {
            mockValidateSession.mockResolvedValue({
                isValid: false,
                error: 'No session token found',
            });

            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
            });
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Authentication required');
            expect(mockUpdateCoachProfile).not.toHaveBeenCalled();
        });

        it('should return 401 when session token is invalid', async () => {
            mockValidateSession.mockResolvedValue({
                isValid: false,
                error: 'Invalid or expired token',
            });

            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
            });
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Authentication required');
        });

        it('should return 401 when session token is expired', async () => {
            mockValidateSession.mockResolvedValue({
                isValid: false,
                error: 'Token expired',
            });

            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
            });
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Authentication required');
        });
    });

    describe('Authorization', () => {
        it('should return 403 when user attempts to edit another coach profile', async () => {
            mockValidateSession.mockResolvedValue({
                isValid: true,
                playerId: otherCoachId,
                email: 'other@university.edu',
                type: 'coach',
            });

            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
            });
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(403);
            expect(data.success).toBe(false);
            expect(data.error).toBe('You can only edit your own profile');
            expect(mockUpdateCoachProfile).not.toHaveBeenCalled();
        });

        it('should return 403 when player attempts to edit coach profile', async () => {
            mockValidateSession.mockResolvedValue({
                isValid: true,
                playerId: validCoachId,
                email: 'player@example.com',
                type: 'player',
            });

            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
            });
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(403);
            expect(data.success).toBe(false);
            expect(data.error).toBe('You can only edit your own profile');
            expect(mockUpdateCoachProfile).not.toHaveBeenCalled();
        });

        it('should allow coach to edit their own profile', async () => {
            mockValidateSession.mockResolvedValue({
                isValid: true,
                playerId: validCoachId,
                email: 'john.smith@university.edu',
                type: 'coach',
            });

            mockUpdateCoachProfile.mockResolvedValue(mockUpdatedProfile);

            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            });
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(mockUpdateCoachProfile).toHaveBeenCalled();
        });
    });

    describe('Validation', () => {
        beforeEach(() => {
            mockValidateSession.mockResolvedValue({
                isValid: true,
                playerId: validCoachId,
                email: 'john.smith@university.edu',
                type: 'coach',
            });
        });

        it('should return 400 for invalid coach ID format', async () => {
            const invalidCoachId = 'invalid-uuid';
            const request = createRequest(invalidCoachId, {
                firstName: 'John',
                lastName: 'Smith',
            });
            const response = await PUT(request, { params: Promise.resolve({ coachId: invalidCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Invalid coach ID format');
            expect(mockUpdateCoachProfile).not.toHaveBeenCalled();
        });

        it('should return 400 for empty coach ID', async () => {
            const request = createRequest('', {
                firstName: 'John',
                lastName: 'Smith',
            });
            const response = await PUT(request, { params: Promise.resolve({ coachId: '' }) });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Invalid coach ID format');
        });

        it('should return 400 for invalid JSON body', async () => {
            const request = new NextRequest(`http://localhost:3000/api/coach/${validCoachId}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: 'invalid json',
            });

            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Invalid request body');
        });

        it('should return 400 for missing required fields', async () => {
            const request = createRequest(validCoachId, {
                firstName: '',
                lastName: '',
                email: '',
            });
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Validation failed');
            expect(data.validationErrors).toBeDefined();
            expect(data.validationErrors.firstName).toBeDefined();
            expect(data.validationErrors.lastName).toBeDefined();
            expect(data.validationErrors.email).toBeDefined();
        });

        it('should return 400 for invalid email format', async () => {
            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
                email: 'invalid-email',
            });
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Validation failed');
            expect(data.validationErrors.email).toBeDefined();
        });

        it('should return 400 for invalid phone format', async () => {
            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
                phone: '123',
            });
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Validation failed');
            expect(data.validationErrors.phone).toBeDefined();
        });

        it('should return 400 for invalid profile image URL', async () => {
            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
                profileImage: 'not-a-url',
            });
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Validation failed');
            expect(data.validationErrors.profileImage).toBeDefined();
        });

        it('should return 400 for invalid team website URL', async () => {
            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
                teamWebsiteUrl: 'not-a-url',
            });
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Validation failed');
            expect(data.validationErrors.teamWebsiteUrl).toBeDefined();
        });

        it('should accept valid optional fields', async () => {
            mockUpdateCoachProfile.mockResolvedValue(mockUpdatedProfile);

            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
                phone: '+1 555 123 4567',
                university: 'State University',
                position: 'Head Coach',
                sport: 'Basketball',
                profileImage: 'https://example.com/profile.jpg',
                teamWebsiteUrl: 'https://university.edu/basketball',
            });
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it('should accept empty optional fields', async () => {
            mockUpdateCoachProfile.mockResolvedValue(mockUpdatedProfile);

            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
                phone: '',
                university: '',
                position: '',
                sport: '',
                profileImage: '',
                teamWebsiteUrl: '',
            });
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });
    });

    describe('Successful Updates', () => {
        beforeEach(() => {
            mockValidateSession.mockResolvedValue({
                isValid: true,
                playerId: validCoachId,
                email: 'john.smith@university.edu',
                type: 'coach',
            });
        });

        it('should successfully update all fields', async () => {
            mockUpdateCoachProfile.mockResolvedValue(mockUpdatedProfile);

            const updateData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
                phone: '+1 555 123 4567',
                university: 'State University',
                position: 'Head Coach',
                sport: 'Basketball',
                profileImage: 'https://example.com/profile.jpg',
                teamWebsiteUrl: 'https://university.edu/basketball',
            };

            const request = createRequest(validCoachId, updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            // Dates are serialized as strings in JSON
            expect(data.data).toMatchObject({
                id: mockUpdatedProfile.id,
                firstName: mockUpdatedProfile.firstName,
                lastName: mockUpdatedProfile.lastName,
                initials: mockUpdatedProfile.initials,
                email: mockUpdatedProfile.email,
                phone: mockUpdatedProfile.phone,
                university: mockUpdatedProfile.university,
                position: mockUpdatedProfile.position,
                sport: mockUpdatedProfile.sport,
                profileImage: mockUpdatedProfile.profileImage,
                teamWebsiteUrl: mockUpdatedProfile.teamWebsiteUrl,
            });
            expect(mockUpdateCoachProfile).toHaveBeenCalledWith(
                validCoachId,
                expect.objectContaining(updateData)
            );
        });

        it('should successfully update partial fields', async () => {
            mockUpdateCoachProfile.mockResolvedValue(mockUpdatedProfile);

            const updateData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
                phone: '+1 555 123 4567',
            };

            const request = createRequest(validCoachId, updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            // Dates are serialized as strings in JSON
            expect(data.data).toMatchObject({
                id: mockUpdatedProfile.id,
                firstName: mockUpdatedProfile.firstName,
                lastName: mockUpdatedProfile.lastName,
                email: mockUpdatedProfile.email,
            });
        });

        it('should successfully update only required fields', async () => {
            mockUpdateCoachProfile.mockResolvedValue(mockUpdatedProfile);

            const updateData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            };

            const request = createRequest(validCoachId, updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            // Dates are serialized as strings in JSON
            expect(data.data).toMatchObject({
                id: mockUpdatedProfile.id,
                firstName: mockUpdatedProfile.firstName,
                lastName: mockUpdatedProfile.lastName,
                email: mockUpdatedProfile.email,
            });
        });

        it('should return updated profile data with correct structure', async () => {
            mockUpdateCoachProfile.mockResolvedValue(mockUpdatedProfile);

            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            });
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(data.data).toHaveProperty('id');
            expect(data.data).toHaveProperty('firstName');
            expect(data.data).toHaveProperty('lastName');
            expect(data.data).toHaveProperty('initials');
            expect(data.data).toHaveProperty('email');
            expect(data.data).toHaveProperty('createdAt');
            expect(data.data).toHaveProperty('updatedAt');

            // Dates are serialized as strings in JSON
            expect(typeof data.data.createdAt).toBe('string');
            expect(typeof data.data.updatedAt).toBe('string');
        });
    });

    describe('Database Errors', () => {
        beforeEach(() => {
            mockValidateSession.mockResolvedValue({
                isValid: true,
                playerId: validCoachId,
                email: 'john.smith@university.edu',
                type: 'coach',
            });
        });

        it('should return 500 when database update fails', async () => {
            mockUpdateCoachProfile.mockRejectedValue(new Error('Database connection failed'));

            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            });
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Failed to update coach profile');
        });

        it('should return 500 when coach not found in database', async () => {
            mockUpdateCoachProfile.mockRejectedValue(new Error('Coach not found'));

            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            });
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Failed to update coach profile');
        });

        it('should log database errors appropriately', async () => {
            const dbError = new Error('Database connection failed');
            mockUpdateCoachProfile.mockRejectedValue(dbError);

            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            });
            await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(logger.dbError).toHaveBeenCalledWith(
                'updateCoachProfile',
                dbError,
                expect.objectContaining({ coachId: validCoachId })
            );
        });
    });

    describe('Logging', () => {
        beforeEach(() => {
            mockValidateSession.mockResolvedValue({
                isValid: true,
                playerId: validCoachId,
                email: 'john.smith@university.edu',
                type: 'coach',
            });
        });

        it('should log API request', async () => {
            mockUpdateCoachProfile.mockResolvedValue(mockUpdatedProfile);

            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            });
            await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(logger.apiRequest).toHaveBeenCalledWith(
                'PUT',
                `/api/coach/${validCoachId}/profile`,
                expect.objectContaining({ coachId: validCoachId })
            );
        });

        it('should log API response', async () => {
            mockUpdateCoachProfile.mockResolvedValue(mockUpdatedProfile);

            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            });
            await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(logger.apiResponse).toHaveBeenCalledWith(
                'PUT',
                `/api/coach/${validCoachId}/profile`,
                200,
                expect.any(Number),
                expect.objectContaining({ coachId: validCoachId })
            );
        });

        it('should log validation errors', async () => {
            const request = createRequest(validCoachId, {
                firstName: '',
                lastName: '',
                email: 'invalid-email',
            });
            await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(logger.validationError).toHaveBeenCalledWith(
                'Coach profile validation failed',
                expect.any(Array),
                expect.objectContaining({ coachId: validCoachId })
            );
        });

        it('should log successful updates', async () => {
            mockUpdateCoachProfile.mockResolvedValue(mockUpdatedProfile);

            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            });
            await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(logger.info).toHaveBeenCalledWith(
                'Coach profile updated successfully',
                expect.objectContaining({
                    coachId: validCoachId,
                    executionTime: expect.stringMatching(/\d+ms/)
                })
            );
        });

        it('should include request ID in all log entries', async () => {
            mockUpdateCoachProfile.mockResolvedValue(mockUpdatedProfile);

            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            });
            await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(logger.apiRequest).toHaveBeenCalledWith(
                'PUT',
                `/api/coach/${validCoachId}/profile`,
                expect.objectContaining({
                    requestId: expect.any(String),
                    coachId: validCoachId
                })
            );
        });
    });

    describe('Response Structure', () => {
        beforeEach(() => {
            mockValidateSession.mockResolvedValue({
                isValid: true,
                playerId: validCoachId,
                email: 'john.smith@university.edu',
                type: 'coach',
            });
        });

        it('should return consistent response structure for success', async () => {
            mockUpdateCoachProfile.mockResolvedValue(mockUpdatedProfile);

            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            });
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(data).toHaveProperty('success');
            expect(data).toHaveProperty('data');
            expect(data).not.toHaveProperty('error');
            expect(data.success).toBe(true);
            expect(data.data).toBeTruthy();
        });

        it('should return consistent response structure for errors', async () => {
            mockUpdateCoachProfile.mockRejectedValue(new Error('Database error'));

            const request = createRequest(validCoachId, {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            });
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(data).toHaveProperty('success');
            expect(data).toHaveProperty('error');
            expect(data).not.toHaveProperty('data');
            expect(data.success).toBe(false);
            expect(data.error).toBeTruthy();
        });

        it('should return validation errors in correct format', async () => {
            const request = createRequest(validCoachId, {
                firstName: '',
                lastName: '',
                email: 'invalid-email',
            });
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(data).toHaveProperty('success');
            expect(data).toHaveProperty('error');
            expect(data).toHaveProperty('validationErrors');
            expect(data.success).toBe(false);
            expect(typeof data.validationErrors).toBe('object');
        });
    });
});


describe('GET /api/coach/[coachId]/profile', () => {
    const validCoachId = '123e4567-e89b-12d3-a456-426614174000';

    const createGetRequest = (coachId: string) => {
        return new NextRequest(`http://localhost:3000/api/coach/${coachId}/profile`, {
            method: 'GET',
        });
    };

    const mockCoachProfile = {
        id: validCoachId,
        firstName: 'John',
        lastName: 'Smith',
        initials: 'JS',
        email: 'john.smith@university.edu',
        phone: '+1 555 123 4567',
        university: 'State University',
        position: 'Head Coach',
        sport: 'Basketball',
        profileImage: 'https://example.com/profile.jpg',
        teamWebsiteUrl: 'https://university.edu/basketball',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Successful Retrieval', () => {
        it('should successfully retrieve coach profile', async () => {
            mockGetCoachProfileById.mockResolvedValue(mockCoachProfile);

            const request = createGetRequest(validCoachId);
            const response = await GET(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toMatchObject({
                id: mockCoachProfile.id,
                firstName: mockCoachProfile.firstName,
                lastName: mockCoachProfile.lastName,
                initials: mockCoachProfile.initials,
                email: mockCoachProfile.email,
                phone: mockCoachProfile.phone,
                university: mockCoachProfile.university,
                position: mockCoachProfile.position,
                sport: mockCoachProfile.sport,
                profileImage: mockCoachProfile.profileImage,
                teamWebsiteUrl: mockCoachProfile.teamWebsiteUrl,
            });
            expect(mockGetCoachProfileById).toHaveBeenCalledWith(validCoachId);
        });

        it('should return profile data with correct structure', async () => {
            mockGetCoachProfileById.mockResolvedValue(mockCoachProfile);

            const request = createGetRequest(validCoachId);
            const response = await GET(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(data.data).toHaveProperty('id');
            expect(data.data).toHaveProperty('firstName');
            expect(data.data).toHaveProperty('lastName');
            expect(data.data).toHaveProperty('initials');
            expect(data.data).toHaveProperty('email');
            expect(data.data).toHaveProperty('createdAt');
            expect(data.data).toHaveProperty('updatedAt');
        });
    });

    describe('Validation', () => {
        it('should return 400 for invalid coach ID format', async () => {
            const invalidCoachId = 'invalid-uuid';
            const request = createGetRequest(invalidCoachId);
            const response = await GET(request, { params: Promise.resolve({ coachId: invalidCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Invalid coach ID format');
            expect(mockGetCoachProfileById).not.toHaveBeenCalled();
        });

        it('should return 400 for empty coach ID', async () => {
            const request = createGetRequest('');
            const response = await GET(request, { params: Promise.resolve({ coachId: '' }) });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Invalid coach ID format');
        });
    });

    describe('Not Found', () => {
        it('should return 404 when coach profile does not exist', async () => {
            mockGetCoachProfileById.mockResolvedValue(null);

            const request = createGetRequest(validCoachId);
            const response = await GET(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Coach profile not found');
        });
    });

    describe('Database Errors', () => {
        it('should return 500 when database query fails', async () => {
            mockGetCoachProfileById.mockRejectedValue(new Error('Database connection failed'));

            const request = createGetRequest(validCoachId);
            const response = await GET(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Failed to fetch coach profile');
        });

        it('should log database errors appropriately', async () => {
            const dbError = new Error('Database connection failed');
            mockGetCoachProfileById.mockRejectedValue(dbError);

            const request = createGetRequest(validCoachId);
            await GET(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(logger.dbError).toHaveBeenCalledWith(
                'getCoachProfileById',
                dbError,
                expect.objectContaining({ coachId: validCoachId })
            );
        });
    });

    describe('Logging', () => {
        it('should log API request', async () => {
            mockGetCoachProfileById.mockResolvedValue(mockCoachProfile);

            const request = createGetRequest(validCoachId);
            await GET(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(logger.apiRequest).toHaveBeenCalledWith(
                'GET',
                `/api/coach/${validCoachId}/profile`,
                expect.objectContaining({ coachId: validCoachId })
            );
        });

        it('should log API response', async () => {
            mockGetCoachProfileById.mockResolvedValue(mockCoachProfile);

            const request = createGetRequest(validCoachId);
            await GET(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(logger.apiResponse).toHaveBeenCalledWith(
                'GET',
                `/api/coach/${validCoachId}/profile`,
                200,
                expect.any(Number),
                expect.objectContaining({ coachId: validCoachId })
            );
        });

        it('should log successful retrieval', async () => {
            mockGetCoachProfileById.mockResolvedValue(mockCoachProfile);

            const request = createGetRequest(validCoachId);
            await GET(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(logger.info).toHaveBeenCalledWith(
                'Coach profile retrieved successfully',
                expect.objectContaining({
                    coachId: validCoachId,
                    executionTime: expect.stringMatching(/\d+ms/)
                })
            );
        });

        it('should include request ID in all log entries', async () => {
            mockGetCoachProfileById.mockResolvedValue(mockCoachProfile);

            const request = createGetRequest(validCoachId);
            await GET(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(logger.apiRequest).toHaveBeenCalledWith(
                'GET',
                `/api/coach/${validCoachId}/profile`,
                expect.objectContaining({
                    requestId: expect.any(String),
                    coachId: validCoachId
                })
            );
        });
    });

    describe('Response Structure', () => {
        it('should return consistent response structure for success', async () => {
            mockGetCoachProfileById.mockResolvedValue(mockCoachProfile);

            const request = createGetRequest(validCoachId);
            const response = await GET(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(data).toHaveProperty('success');
            expect(data).toHaveProperty('data');
            expect(data).not.toHaveProperty('error');
            expect(data.success).toBe(true);
            expect(data.data).toBeTruthy();
        });

        it('should return consistent response structure for errors', async () => {
            mockGetCoachProfileById.mockRejectedValue(new Error('Database error'));

            const request = createGetRequest(validCoachId);
            const response = await GET(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(data).toHaveProperty('success');
            expect(data).toHaveProperty('error');
            expect(data).not.toHaveProperty('data');
            expect(data.success).toBe(false);
            expect(data.error).toBeTruthy();
        });
    });
});
