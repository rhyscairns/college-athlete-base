/**
 * @jest-environment node
 * 
 * Integration test for coach profile authentication and authorization
 * Tests the complete authentication and authorization flow for coach profile
 * 
 * These tests verify:
 * - Unauthenticated user cannot edit profile
 * - Authenticated user can edit own profile
 * - Authenticated user cannot edit other coach's profile
 * - API returns 403 for unauthorized edit attempts
 */

import { NextRequest } from 'next/server';
import { PUT } from '@/app/api/coach/[coachId]/profile/route';
import { updateCoachProfile } from '@/profile/coach/lib/db/queries';
import { validateSession } from '@/authentication/middleware/session';

// Mock dependencies
jest.mock('@/profile/coach/lib/db/queries');
jest.mock('@/authentication/middleware/session');
jest.mock('@/lib/logger');

const mockUpdateCoachProfile = updateCoachProfile as jest.MockedFunction<typeof updateCoachProfile>;
const mockValidateSession = validateSession as jest.MockedFunction<typeof validateSession>;

describe('Coach Profile Authentication and Authorization - Integration Tests', () => {
    const validCoachId = '123e4567-e89b-12d3-a456-426614174000';
    const otherCoachId = '987e6543-e21b-12d3-a456-426614174999';
    const mockToken = 'mock-jwt-token';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const createMockRequest = (body: any, coachId: string = validCoachId, includeAuth: boolean = true) => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            headers['Cookie'] = `session=${mockToken}`;
        }

        return new NextRequest(`http://localhost:3000/api/coach/${coachId}/profile`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
        });
    };

    describe('Unauthenticated User Access', () => {
        it('should return 401 when no authentication token is provided', async () => {
            mockValidateSession.mockResolvedValue({
                isValid: false,
                error: 'No session token found',
            });

            const updateData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            };

            const request = createMockRequest(updateData, validCoachId, false);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(401);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe('Authentication required');

            // Should not attempt to update database
            expect(mockUpdateCoachProfile).not.toHaveBeenCalled();
        });

        it('should return 401 when authentication token is invalid', async () => {
            mockValidateSession.mockResolvedValue({
                isValid: false,
                error: 'Invalid token',
            });

            const updateData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            };

            const request = createMockRequest(updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(401);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe('Authentication required');

            expect(mockUpdateCoachProfile).not.toHaveBeenCalled();
        });

        it('should return 401 when authentication token is expired', async () => {
            mockValidateSession.mockResolvedValue({
                isValid: false,
                error: 'Token expired',
            });

            const updateData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            };

            const request = createMockRequest(updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(401);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe('Authentication required');

            expect(mockUpdateCoachProfile).not.toHaveBeenCalled();
        });
    });

    describe('Authenticated User Can Edit Own Profile', () => {
        it('should allow authenticated coach to edit their own profile', async () => {
            mockValidateSession.mockResolvedValue({
                isValid: true,
                playerId: validCoachId,
                email: 'coach@university.edu',
                type: 'coach',
            });

            const updateData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
                phone: '+15550123456',
            };

            const mockUpdatedProfile = {
                id: validCoachId,
                ...updateData,
                initials: 'JS',
                createdAt: new Date('2024-01-01T00:00:00Z'),
                updatedAt: new Date('2024-01-15T00:00:00Z'),
            };

            mockUpdateCoachProfile.mockResolvedValue(mockUpdatedProfile);

            const request = createMockRequest(updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data).toMatchObject({
                id: validCoachId,
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            });

            // Verify database update was called
            expect(mockUpdateCoachProfile).toHaveBeenCalledWith(
                validCoachId,
                expect.objectContaining(updateData)
            );
        });

        it('should verify session before allowing profile edit', async () => {
            mockValidateSession.mockResolvedValue({
                isValid: true,
                playerId: validCoachId,
                email: 'coach@university.edu',
                type: 'coach',
            });

            const updateData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            };

            const mockUpdatedProfile = {
                id: validCoachId,
                ...updateData,
                initials: 'JS',
                createdAt: new Date('2024-01-01T00:00:00Z'),
                updatedAt: new Date('2024-01-15T00:00:00Z'),
            };

            mockUpdateCoachProfile.mockResolvedValue(mockUpdatedProfile);

            const request = createMockRequest(updateData);
            await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            // Verify validateSession was called
            expect(mockValidateSession).toHaveBeenCalledWith(request);
        });
    });

    describe('Authenticated User Cannot Edit Other Coach Profile', () => {
        it('should return 403 when coach attempts to edit another coach profile', async () => {
            // User is authenticated as validCoachId but trying to edit otherCoachId
            mockValidateSession.mockResolvedValue({
                isValid: true,
                playerId: validCoachId,
                email: 'coach@university.edu',
                type: 'coach',
            });

            const updateData = {
                firstName: 'Other',
                lastName: 'Coach',
                email: 'other.coach@university.edu',
            };

            const request = createMockRequest(updateData, otherCoachId);
            const response = await PUT(request, { params: Promise.resolve({ coachId: otherCoachId }) });

            expect(response.status).toBe(403);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe('You can only edit your own profile');

            // Should not attempt to update database
            expect(mockUpdateCoachProfile).not.toHaveBeenCalled();
        });

        it('should return 403 when player attempts to edit coach profile', async () => {
            // User is authenticated as a player, not a coach
            mockValidateSession.mockResolvedValue({
                isValid: true,
                playerId: validCoachId,
                email: 'player@university.edu',
                type: 'player',
            });

            const updateData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            };

            const request = createMockRequest(updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(403);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe('You can only edit your own profile');

            expect(mockUpdateCoachProfile).not.toHaveBeenCalled();
        });

        it('should verify both coachId and user type match', async () => {
            // Correct coachId but wrong user type
            mockValidateSession.mockResolvedValue({
                isValid: true,
                playerId: validCoachId,
                email: 'user@university.edu',
                type: 'player',
            });

            const updateData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            };

            const request = createMockRequest(updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(403);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe('You can only edit your own profile');

            expect(mockUpdateCoachProfile).not.toHaveBeenCalled();
        });
    });

    describe('Authorization Error Responses', () => {
        it('should return consistent 403 error structure', async () => {
            mockValidateSession.mockResolvedValue({
                isValid: true,
                playerId: validCoachId,
                email: 'coach@university.edu',
                type: 'coach',
            });

            const updateData = {
                firstName: 'Other',
                lastName: 'Coach',
                email: 'other.coach@university.edu',
            };

            const request = createMockRequest(updateData, otherCoachId);
            const response = await PUT(request, { params: Promise.resolve({ coachId: otherCoachId }) });
            const data = await response.json();

            // Verify error response structure
            expect(data).toHaveProperty('success', false);
            expect(data).toHaveProperty('error');
            expect(typeof data.error).toBe('string');
            expect(data.error).toBe('You can only edit your own profile');
        });

        it('should not expose sensitive information in authorization errors', async () => {
            mockValidateSession.mockResolvedValue({
                isValid: true,
                playerId: validCoachId,
                email: 'coach@university.edu',
                type: 'coach',
            });

            const updateData = {
                firstName: 'Other',
                lastName: 'Coach',
                email: 'other.coach@university.edu',
            };

            const request = createMockRequest(updateData, otherCoachId);
            const response = await PUT(request, { params: Promise.resolve({ coachId: otherCoachId }) });
            const data = await response.json();

            // Should not include coach IDs or other sensitive data
            expect(data.coachId).toBeUndefined();
            expect(data.userId).toBeUndefined();
            expect(data.email).toBeUndefined();
        });
    });

    describe('Authentication Priority Over Validation', () => {
        it('should check authentication before validation', async () => {
            mockValidateSession.mockResolvedValue({
                isValid: false,
                error: 'No session token found',
            });

            // Invalid data that would fail validation
            const updateData = {
                firstName: '',
                lastName: '',
                email: 'invalid-email',
            };

            const request = createMockRequest(updateData, validCoachId, false);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            // Should return 401 (auth error) not 400 (validation error)
            expect(response.status).toBe(401);

            const data = await response.json();
            expect(data.error).toBe('Authentication required');

            expect(mockUpdateCoachProfile).not.toHaveBeenCalled();
        });

        it('should check authorization before validation', async () => {
            mockValidateSession.mockResolvedValue({
                isValid: true,
                playerId: validCoachId,
                email: 'coach@university.edu',
                type: 'coach',
            });

            // Invalid data that would fail validation
            const updateData = {
                firstName: '',
                lastName: '',
                email: 'invalid-email',
            };

            const request = createMockRequest(updateData, otherCoachId);
            const response = await PUT(request, { params: Promise.resolve({ coachId: otherCoachId }) });

            // Should return 403 (authorization error) not 400 (validation error)
            expect(response.status).toBe(403);

            const data = await response.json();
            expect(data.error).toBe('You can only edit your own profile');

            expect(mockUpdateCoachProfile).not.toHaveBeenCalled();
        });
    });

    describe('Session Validation Edge Cases', () => {
        it('should handle malformed session token', async () => {
            mockValidateSession.mockResolvedValue({
                isValid: false,
                error: 'Malformed token',
            });

            const updateData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            };

            const request = createMockRequest(updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(401);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe('Authentication required');
        });

        it('should handle session validation errors gracefully', async () => {
            mockValidateSession.mockRejectedValue(new Error('Session validation failed'));

            const updateData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            };

            const request = createMockRequest(updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            // Should handle error gracefully
            expect(response.status).toBeGreaterThanOrEqual(400);

            const data = await response.json();
            expect(data.success).toBe(false);
        });
    });
});
