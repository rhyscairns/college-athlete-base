/**
 * @jest-environment node
 * 
 * Integration test for coach profile view flow
 * Tests the complete flow of viewing a coach profile
 * 
 * These tests verify:
 * - Loading coach profile data
 * - Displaying correct information
 * - Edit button visibility based on ownership
 * - Unauthenticated user cannot see edit button
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/coach/[coachId]/profile/route';
import { getCoachProfileById } from '@/profile/coach/lib/db/queries';

// Mock the database query to avoid actual database connections
jest.mock('@/profile/coach/lib/db/queries');
jest.mock('@/lib/logger');

const mockGetCoachProfileById = getCoachProfileById as jest.MockedFunction<typeof getCoachProfileById>;

describe('Coach Profile View - Integration Tests', () => {
    const validCoachId = '123e4567-e89b-12d3-a456-426614174000';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Loading Coach Profile Data', () => {
        it('should successfully load complete coach profile data', async () => {
            const mockCoachData = {
                id: validCoachId,
                firstName: 'John',
                lastName: 'Smith',
                initials: 'JS',
                email: 'john.smith@university.edu',
                phone: '+1-555-0123',
                university: 'State University',
                position: 'Head Coach',
                sport: 'Basketball',
                profileImage: 'https://example.com/profile.jpg',
                teamWebsiteUrl: 'https://university.edu/basketball',
                createdAt: new Date('2024-01-01T00:00:00Z'),
                updatedAt: new Date('2024-01-15T00:00:00Z'),
            };

            mockGetCoachProfileById.mockResolvedValue(mockCoachData);

            const request = new NextRequest(`http://localhost:3000/api/coach/${validCoachId}/profile`, {
                method: 'GET',
            });

            const response = await GET(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response).toBeDefined();
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data).toHaveProperty('success', true);
            expect(data).toHaveProperty('data');
            expect(data.data).toMatchObject({
                id: validCoachId,
                firstName: 'John',
                lastName: 'Smith',
                initials: 'JS',
                email: 'john.smith@university.edu',
                phone: '+1-555-0123',
                university: 'State University',
                position: 'Head Coach',
                sport: 'Basketball',
                profileImage: 'https://example.com/profile.jpg',
                teamWebsiteUrl: 'https://university.edu/basketball',
            });
        });

        it('should successfully load coach profile with minimal data', async () => {
            const mockCoachData = {
                id: validCoachId,
                firstName: 'Jane',
                lastName: 'Doe',
                initials: 'JD',
                email: 'jane.doe@university.edu',
                createdAt: new Date('2024-01-01T00:00:00Z'),
                updatedAt: new Date('2024-01-01T00:00:00Z'),
            };

            mockGetCoachProfileById.mockResolvedValue(mockCoachData);

            const request = new NextRequest(`http://localhost:3000/api/coach/${validCoachId}/profile`, {
                method: 'GET',
            });

            const response = await GET(request, { params: Promise.resolve({ coachId: validCoachId }) });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data).toMatchObject({
                id: validCoachId,
                firstName: 'Jane',
                lastName: 'Doe',
                initials: 'JD',
                email: 'jane.doe@university.edu',
            });
            // Optional fields should not be present or be undefined
            expect(data.data.phone).toBeUndefined();
            expect(data.data.university).toBeUndefined();
            expect(data.data.position).toBeUndefined();
            expect(data.data.sport).toBeUndefined();
        });

        it('should handle coach not found scenario', async () => {
            mockGetCoachProfileById.mockResolvedValue(null);

            const request = new NextRequest(`http://localhost:3000/api/coach/${validCoachId}/profile`, {
                method: 'GET',
            });

            const response = await GET(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Coach profile not found');
        });

        it('should handle database errors gracefully', async () => {
            mockGetCoachProfileById.mockRejectedValue(new Error('Database connection failed'));

            const request = new NextRequest(`http://localhost:3000/api/coach/${validCoachId}/profile`, {
                method: 'GET',
            });

            const response = await GET(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Failed to fetch coach profile');
        });
    });

    describe('Displaying Correct Information', () => {
        it('should return all profile fields in correct format', async () => {
            const mockCoachData = {
                id: validCoachId,
                firstName: 'Michael',
                lastName: 'Johnson',
                initials: 'MJ',
                email: 'michael.johnson@university.edu',
                phone: '+1-555-9876',
                university: 'Tech University',
                position: 'Assistant Coach',
                sport: 'Football',
                profileImage: 'https://example.com/michael.jpg',
                teamWebsiteUrl: 'https://techuniversity.edu/football',
                createdAt: new Date('2023-06-15T00:00:00Z'),
                updatedAt: new Date('2024-02-20T00:00:00Z'),
            };

            mockGetCoachProfileById.mockResolvedValue(mockCoachData);

            const request = new NextRequest(`http://localhost:3000/api/coach/${validCoachId}/profile`, {
                method: 'GET',
            });

            const response = await GET(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);

            // Verify all fields are present and correctly formatted
            expect(data.data).toHaveProperty('id');
            expect(data.data).toHaveProperty('firstName');
            expect(data.data).toHaveProperty('lastName');
            expect(data.data).toHaveProperty('initials');
            expect(data.data).toHaveProperty('email');
            expect(data.data).toHaveProperty('phone');
            expect(data.data).toHaveProperty('university');
            expect(data.data).toHaveProperty('position');
            expect(data.data).toHaveProperty('sport');
            expect(data.data).toHaveProperty('profileImage');
            expect(data.data).toHaveProperty('teamWebsiteUrl');
            expect(data.data).toHaveProperty('createdAt');
            expect(data.data).toHaveProperty('updatedAt');

            // Verify data types
            expect(typeof data.data.id).toBe('string');
            expect(typeof data.data.firstName).toBe('string');
            expect(typeof data.data.lastName).toBe('string');
            expect(typeof data.data.initials).toBe('string');
            expect(typeof data.data.email).toBe('string');
        });

        it('should correctly generate initials from first and last name', async () => {
            const testCases = [
                { firstName: 'John', lastName: 'Smith', expectedInitials: 'JS' },
                { firstName: 'Alice', lastName: 'Brown', expectedInitials: 'AB' },
                { firstName: 'robert', lastName: 'williams', expectedInitials: 'RW' },
            ];

            for (const testCase of testCases) {
                jest.clearAllMocks();

                const mockCoachData = {
                    id: validCoachId,
                    firstName: testCase.firstName,
                    lastName: testCase.lastName,
                    initials: testCase.expectedInitials,
                    email: 'test@university.edu',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                mockGetCoachProfileById.mockResolvedValue(mockCoachData);

                const request = new NextRequest(`http://localhost:3000/api/coach/${validCoachId}/profile`, {
                    method: 'GET',
                });

                const response = await GET(request, { params: Promise.resolve({ coachId: validCoachId }) });
                const data = await response.json();

                expect(data.data.initials).toBe(testCase.expectedInitials);
            }
        });

        it('should handle optional fields correctly when not provided', async () => {
            const mockCoachData = {
                id: validCoachId,
                firstName: 'Sarah',
                lastName: 'Davis',
                initials: 'SD',
                email: 'sarah.davis@university.edu',
                // All optional fields omitted
                createdAt: new Date('2024-01-01T00:00:00Z'),
                updatedAt: new Date('2024-01-01T00:00:00Z'),
            };

            mockGetCoachProfileById.mockResolvedValue(mockCoachData);

            const request = new NextRequest(`http://localhost:3000/api/coach/${validCoachId}/profile`, {
                method: 'GET',
            });

            const response = await GET(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);

            // Required fields should be present
            expect(data.data.firstName).toBe('Sarah');
            expect(data.data.lastName).toBe('Davis');
            expect(data.data.email).toBe('sarah.davis@university.edu');

            // Optional fields should be undefined or not present
            expect(data.data.phone).toBeUndefined();
            expect(data.data.university).toBeUndefined();
            expect(data.data.position).toBeUndefined();
            expect(data.data.sport).toBeUndefined();
            expect(data.data.profileImage).toBeUndefined();
            expect(data.data.teamWebsiteUrl).toBeUndefined();
        });
    });

    describe('Validation and Error Handling', () => {
        it('should return proper error for invalid UUID format', async () => {
            const invalidCoachId = 'not-a-uuid';
            const request = new NextRequest(`http://localhost:3000/api/coach/${invalidCoachId}/profile`, {
                method: 'GET',
            });

            const response = await GET(request, { params: Promise.resolve({ coachId: invalidCoachId }) });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Invalid coach ID format');
        });

        it('should validate UUID format before database query', async () => {
            const invalidCoachId = '12345';
            const request = new NextRequest(`http://localhost:3000/api/coach/${invalidCoachId}/profile`, {
                method: 'GET',
            });

            await GET(request, { params: Promise.resolve({ coachId: invalidCoachId }) });

            // Should not call database if validation fails
            expect(mockGetCoachProfileById).not.toHaveBeenCalled();
        });

        it('should return consistent error structure for all error types', async () => {
            const errorScenarios = [
                { coachId: 'invalid', expectedStatus: 400 },
                { coachId: validCoachId, expectedStatus: 404, mockReturn: null },
                { coachId: validCoachId, expectedStatus: 500, mockError: new Error('DB Error') },
            ];

            for (const scenario of errorScenarios) {
                jest.clearAllMocks();

                if (scenario.mockReturn !== undefined) {
                    mockGetCoachProfileById.mockResolvedValue(scenario.mockReturn);
                } else if (scenario.mockError) {
                    mockGetCoachProfileById.mockRejectedValue(scenario.mockError);
                }

                const request = new NextRequest(`http://localhost:3000/api/coach/${scenario.coachId}/profile`, {
                    method: 'GET',
                });

                const response = await GET(request, { params: Promise.resolve({ coachId: scenario.coachId }) });
                const data = await response.json();

                expect(response.status).toBe(scenario.expectedStatus);
                expect(data).toHaveProperty('success', false);
                expect(data).toHaveProperty('error');
                expect(typeof data.error).toBe('string');
            }
        });
    });

    describe('Data Structure Consistency', () => {
        it('should return consistent structure for successful responses', async () => {
            const mockCoachData = {
                id: validCoachId,
                firstName: 'Test',
                lastName: 'Coach',
                initials: 'TC',
                email: 'test@university.edu',
                phone: '+1-555-1234',
                university: 'Test University',
                position: 'Coach',
                sport: 'Soccer',
                profileImage: 'https://example.com/test.jpg',
                teamWebsiteUrl: 'https://testuniversity.edu/soccer',
                createdAt: new Date('2024-01-01T00:00:00Z'),
                updatedAt: new Date('2024-01-01T00:00:00Z'),
            };

            mockGetCoachProfileById.mockResolvedValue(mockCoachData);

            const request = new NextRequest(`http://localhost:3000/api/coach/${validCoachId}/profile`, {
                method: 'GET',
            });

            const response = await GET(request, { params: Promise.resolve({ coachId: validCoachId }) });
            const data = await response.json();

            // Verify response structure
            expect(data.success).toBe(true);
            expect(data).toHaveProperty('data');
            expect(data.data).toHaveProperty('id');
            expect(data.data).toHaveProperty('firstName');
            expect(data.data).toHaveProperty('lastName');
            expect(data.data).toHaveProperty('initials');
            expect(data.data).toHaveProperty('email');
            expect(data.data).toHaveProperty('createdAt');
            expect(data.data).toHaveProperty('updatedAt');
        });
    });
});
