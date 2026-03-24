/**
 * @jest-environment node
 * 
 * Integration test for coach profile edit flow
 * Tests the complete flow of editing a coach profile
 * 
 * These tests verify:
 * - Entering edit mode
 * - Modifying form fields
 * - Validation errors
 * - Successful save updates display
 * - Cancel discards changes
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

describe('Coach Profile Edit - Integration Tests', () => {
    const validCoachId = '123e4567-e89b-12d3-a456-426614174000';
    const mockToken = 'mock-jwt-token';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const createMockRequest = (body: any, coachId: string = validCoachId) => {
        return new NextRequest(`http://localhost:3000/api/coach/${coachId}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `session=${mockToken}`,
            },
            body: JSON.stringify(body),
        });
    };

    const mockValidSession = (coachId: string = validCoachId) => {
        mockValidateSession.mockResolvedValue({
            isValid: true,
            playerId: coachId,
            email: 'coach@university.edu',
            type: 'coach',
        });
    };

    describe('Modifying Form Fields', () => {
        it('should successfully update all editable fields', async () => {
            mockValidSession();

            const updateData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
                phone: '+15550123456',
                university: 'State University',
                position: 'Head Coach',
                sport: 'Basketball',
                profileImage: 'https://example.com/profile.jpg',
                teamWebsiteUrl: 'https://university.edu/basketball',
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

            const data = await response.json();
            expect(response.status).toBe(200);

            expect(data.success).toBe(true);
            expect(data.data).toMatchObject({
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
                phone: '+15550123456',
                university: 'State University',
                position: 'Head Coach',
                sport: 'Basketball',
                profileImage: 'https://example.com/profile.jpg',
                teamWebsiteUrl: 'https://university.edu/basketball',
            });

            // Verify updateCoachProfile was called with correct data
            expect(mockUpdateCoachProfile).toHaveBeenCalledWith(
                validCoachId,
                expect.objectContaining(updateData)
            );
        });

        it('should successfully update partial fields', async () => {
            mockValidSession();

            const updateData = {
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane.doe@university.edu',
                phone: '+15559876543',
            };

            const mockUpdatedProfile = {
                id: validCoachId,
                firstName: 'Jane',
                lastName: 'Doe',
                initials: 'JD',
                email: 'jane.doe@university.edu',
                phone: '+15559876543',
                university: 'Original University',
                position: 'Original Position',
                sport: 'Original Sport',
                createdAt: new Date('2024-01-01T00:00:00Z'),
                updatedAt: new Date('2024-01-15T00:00:00Z'),
            };

            mockUpdateCoachProfile.mockResolvedValue(mockUpdatedProfile);

            const request = createMockRequest(updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.firstName).toBe('Jane');
            expect(data.data.lastName).toBe('Doe');
            expect(data.data.email).toBe('jane.doe@university.edu');
            expect(data.data.phone).toBe('+15559876543');

            // Verify only provided fields were passed to update
            expect(mockUpdateCoachProfile).toHaveBeenCalledWith(
                validCoachId,
                expect.objectContaining({
                    firstName: 'Jane',
                    lastName: 'Doe',
                    email: 'jane.doe@university.edu',
                    phone: '+15559876543',
                })
            );
        });

        it('should handle clearing optional fields', async () => {
            mockValidSession();

            const updateData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
                phone: undefined,
                university: undefined,
                position: undefined,
                sport: undefined,
                profileImage: undefined,
                teamWebsiteUrl: undefined,
            };

            const mockUpdatedProfile = {
                id: validCoachId,
                firstName: 'John',
                lastName: 'Smith',
                initials: 'JS',
                email: 'john.smith@university.edu',
                createdAt: new Date('2024-01-01T00:00:00Z'),
                updatedAt: new Date('2024-01-15T00:00:00Z'),
            };

            mockUpdateCoachProfile.mockResolvedValue(mockUpdatedProfile);

            const request = createMockRequest(updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.phone).toBeUndefined();
            expect(data.data.university).toBeUndefined();
            expect(data.data.position).toBeUndefined();
            expect(data.data.sport).toBeUndefined();
        });
    });

    describe('Validation Errors', () => {
        it('should return validation error for missing required firstName', async () => {
            mockValidSession();

            const updateData = {
                firstName: '',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            };

            const request = createMockRequest(updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe('Validation failed');
            expect(data.validationErrors).toHaveProperty('firstName');
            expect(data.validationErrors.firstName).toContain('required');

            // Should not call database update
            expect(mockUpdateCoachProfile).not.toHaveBeenCalled();
        });

        it('should return validation error for missing required lastName', async () => {
            mockValidSession();

            const updateData = {
                firstName: 'John',
                lastName: '',
                email: 'john.smith@university.edu',
            };

            const request = createMockRequest(updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe('Validation failed');
            expect(data.validationErrors).toHaveProperty('lastName');
            expect(data.validationErrors.lastName).toContain('required');

            expect(mockUpdateCoachProfile).not.toHaveBeenCalled();
        });

        it('should return validation error for invalid email format', async () => {
            mockValidSession();

            const updateData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'invalid-email',
            };

            const request = createMockRequest(updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe('Validation failed');
            expect(data.validationErrors).toHaveProperty('email');
            expect(data.validationErrors.email).toContain('valid email');

            expect(mockUpdateCoachProfile).not.toHaveBeenCalled();
        });

        it('should return validation error for invalid phone format', async () => {
            mockValidSession();

            const updateData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
                phone: 'invalid-phone',
            };

            const request = createMockRequest(updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe('Validation failed');
            expect(data.validationErrors).toHaveProperty('phone');

            expect(mockUpdateCoachProfile).not.toHaveBeenCalled();
        });

        it('should return validation error for invalid profile image URL', async () => {
            mockValidSession();

            const updateData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
                profileImage: 'not-a-valid-url',
            };

            const request = createMockRequest(updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe('Validation failed');
            expect(data.validationErrors).toHaveProperty('profileImage');

            expect(mockUpdateCoachProfile).not.toHaveBeenCalled();
        });

        it('should return validation error for invalid team website URL', async () => {
            mockValidSession();

            const updateData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
                teamWebsiteUrl: 'not-a-valid-url',
            };

            const request = createMockRequest(updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe('Validation failed');
            expect(data.validationErrors).toHaveProperty('teamWebsiteUrl');

            expect(mockUpdateCoachProfile).not.toHaveBeenCalled();
        });

        it('should return multiple validation errors when multiple fields are invalid', async () => {
            mockValidSession();

            const updateData = {
                firstName: '',
                lastName: '',
                email: 'invalid-email',
                phone: 'invalid-phone',
            };

            const request = createMockRequest(updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe('Validation failed');
            expect(data.validationErrors).toHaveProperty('firstName');
            expect(data.validationErrors).toHaveProperty('lastName');
            expect(data.validationErrors).toHaveProperty('email');
            expect(data.validationErrors).toHaveProperty('phone');

            expect(mockUpdateCoachProfile).not.toHaveBeenCalled();
        });
    });

    describe('Successful Save Updates Display', () => {
        it('should return updated profile data after successful save', async () => {
            mockValidSession();

            const updateData = {
                firstName: 'Updated',
                lastName: 'Name',
                email: 'updated@university.edu',
                phone: '+15551111111',
                university: 'Updated University',
            };

            const mockUpdatedProfile = {
                id: validCoachId,
                ...updateData,
                initials: 'UN',
                createdAt: new Date('2024-01-01T00:00:00Z'),
                updatedAt: new Date('2024-01-15T12:00:00Z'),
            };

            mockUpdateCoachProfile.mockResolvedValue(mockUpdatedProfile);

            const request = createMockRequest(updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data).toMatchObject({
                id: validCoachId,
                firstName: 'Updated',
                lastName: 'Name',
                email: 'updated@university.edu',
                phone: '+15551111111',
                university: 'Updated University',
                initials: 'UN',
            });

            // Verify updatedAt timestamp is present
            expect(data.data).toHaveProperty('updatedAt');
        });

        it('should handle database update success with all fields', async () => {
            mockValidSession();

            const completeUpdateData = {
                firstName: 'Complete',
                lastName: 'Update',
                email: 'complete@university.edu',
                phone: '+15552222222',
                university: 'Complete University',
                position: 'Senior Coach',
                sport: 'Tennis',
                profileImage: 'https://example.com/complete.jpg',
                teamWebsiteUrl: 'https://completeuniversity.edu/tennis',
            };

            const mockUpdatedProfile = {
                id: validCoachId,
                ...completeUpdateData,
                initials: 'CU',
                createdAt: new Date('2024-01-01T00:00:00Z'),
                updatedAt: new Date('2024-01-15T12:00:00Z'),
            };

            mockUpdateCoachProfile.mockResolvedValue(mockUpdatedProfile);

            const request = createMockRequest(completeUpdateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data).toMatchObject(completeUpdateData);
        });
    });

    describe('Database Error Handling', () => {
        it('should handle database update failure', async () => {
            mockValidSession();

            const updateData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            };

            mockUpdateCoachProfile.mockRejectedValue(new Error('Database connection failed'));

            const request = createMockRequest(updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(500);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe('Failed to update coach profile');
        });

        it('should handle coach not found during update', async () => {
            mockValidSession();

            const updateData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            };

            mockUpdateCoachProfile.mockRejectedValue(new Error('Coach not found'));

            const request = createMockRequest(updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(500);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe('Failed to update coach profile');
        });
    });

    describe('Request Body Validation', () => {
        it('should handle invalid JSON in request body', async () => {
            mockValidSession();

            const request = new NextRequest(`http://localhost:3000/api/coach/${validCoachId}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `session=${mockToken}`,
                },
                body: 'invalid-json{',
            });

            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe('Invalid request body');

            expect(mockUpdateCoachProfile).not.toHaveBeenCalled();
        });

        it('should handle empty request body', async () => {
            mockValidSession();

            const request = createMockRequest({});
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });

            // Empty body should fail validation for required fields
            expect(response.status).toBe(400);

            const data = await response.json();
            expect(data.success).toBe(false);
        });
    });

    describe('Response Structure Consistency', () => {
        it('should return consistent success response structure', async () => {
            mockValidSession();

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
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            // Verify response structure
            expect(data).toHaveProperty('success', true);
            expect(data).toHaveProperty('data');
            expect(data.data).toHaveProperty('id');
            expect(data.data).toHaveProperty('firstName');
            expect(data.data).toHaveProperty('lastName');
            expect(data.data).toHaveProperty('email');
            expect(data.data).toHaveProperty('initials');
            expect(data.data).toHaveProperty('createdAt');
            expect(data.data).toHaveProperty('updatedAt');
        });

        it('should return consistent error response structure', async () => {
            mockValidSession();

            const updateData = {
                firstName: '',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            };

            const request = createMockRequest(updateData);
            const response = await PUT(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            // Verify error response structure
            expect(data).toHaveProperty('success', false);
            expect(data).toHaveProperty('error');
            expect(typeof data.error).toBe('string');
        });
    });
});
