/**
 * @jest-environment node
 */
import { POST, OPTIONS } from '@/app/api/auth/register/coach/route';
import { NextRequest } from 'next/server';
import * as coachesDb from '@/authentication/db/coaches';
import * as passwordUtils from '@/authentication/utils/password';

// Mock the database operations
jest.mock('@/authentication/db/coaches');
jest.mock('@/authentication/utils/password');

describe('/api/auth/register/coach', () => {
    const mockCheckCoachEmailExists = coachesDb.checkCoachEmailExists as jest.MockedFunction<typeof coachesDb.checkCoachEmailExists>;
    const mockCreateCoach = coachesDb.createCoach as jest.MockedFunction<typeof coachesDb.createCoach>;
    const mockHashPassword = passwordUtils.hashPassword as jest.MockedFunction<typeof passwordUtils.hashPassword>;

    beforeEach(() => {
        jest.clearAllMocks();
        // Set default environment variable for CORS
        process.env.ALLOWED_ORIGINS = 'http://localhost:3000,https://dev.example.com';
    });

    afterEach(() => {
        delete process.env.ALLOWED_ORIGINS;
    });

    const createRequest = (body: unknown, origin?: string) => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (origin) {
            headers['origin'] = origin;
        }

        return new NextRequest('http://localhost:3000/api/auth/register/coach', {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
    };

    const validCoachData = {
        firstName: 'John',
        lastName: 'Coach',
        email: 'john.coach@example.com',
        password: 'Password123!',
        coachingCategory: 'mens',
        sports: ['basketball', 'football'],
        university: 'UCLA',
    };

    describe('POST - Successful Registration', () => {
        it('registers a coach successfully with all required fields', async () => {
            mockCheckCoachEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password_123');
            mockCreateCoach.mockResolvedValue('coach-uuid-123');

            const request = createRequest(validCoachData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toEqual({
                success: true,
                message: 'Coach registered successfully',
                coachId: 'coach-uuid-123',
            });

            expect(mockCheckCoachEmailExists).toHaveBeenCalledWith('john.coach@example.com');
            expect(mockHashPassword).toHaveBeenCalledWith('Password123!');
            expect(mockCreateCoach).toHaveBeenCalledWith({
                firstName: 'John',
                lastName: 'Coach',
                email: 'john.coach@example.com',
                passwordHash: 'hashed_password_123',
                coachingCategory: 'mens',
                sports: ['basketball', 'football'],
                university: 'UCLA',
            });
        });

        it('registers a coach with multiple sports', async () => {
            mockCheckCoachEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password_456');
            mockCreateCoach.mockResolvedValue('coach-uuid-456');

            const coachWithMultipleSports = {
                ...validCoachData,
                sports: ['soccer', 'volleyball', 'tennis'],
            };

            const request = createRequest(coachWithMultipleSports);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(mockCreateCoach).toHaveBeenCalledWith(
                expect.objectContaining({
                    sports: ['soccer', 'volleyball', 'tennis'],
                })
            );
        });

        it('registers a womens coach successfully', async () => {
            mockCheckCoachEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password_789');
            mockCreateCoach.mockResolvedValue('coach-uuid-789');

            const womensCoach = {
                ...validCoachData,
                coachingCategory: 'womens',
            };

            const request = createRequest(womensCoach);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(mockCreateCoach).toHaveBeenCalledWith(
                expect.objectContaining({
                    coachingCategory: 'womens',
                })
            );
        });
    });

    describe('POST - Validation Errors', () => {
        it('returns 400 when firstName is missing', async () => {
            const invalidData = { ...validCoachData, firstName: '' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({ field: 'firstName' })
            );
        });

        it('returns 400 when lastName is too short', async () => {
            const invalidData = { ...validCoachData, lastName: 'A' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({ field: 'lastName' })
            );
        });

        it('returns 400 when email is invalid', async () => {
            const invalidData = { ...validCoachData, email: 'invalid-email' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({ field: 'email' })
            );
        });

        it('returns 400 when password is weak', async () => {
            const invalidData = { ...validCoachData, password: 'weak' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({ field: 'password' })
            );
        });

        it('returns 400 when coachingCategory is missing', async () => {
            const invalidData = { ...validCoachData, coachingCategory: '' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({ field: 'coachingCategory' })
            );
        });

        it('returns 400 when sports array is empty', async () => {
            const invalidData = { ...validCoachData, sports: [] };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({ field: 'sports' })
            );
        });

        it('returns 400 when sports is not an array', async () => {
            const invalidData = { ...validCoachData, sports: 'basketball' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({ field: 'sports' })
            );
        });

        it('returns 400 when university is missing', async () => {
            const invalidData = { ...validCoachData, university: '' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual(
                expect.objectContaining({ field: 'university' })
            );
        });

        it('returns 400 with multiple validation errors', async () => {
            const invalidData = {
                firstName: 'A',
                lastName: '',
                email: 'invalid',
                password: 'weak',
                coachingCategory: '',
                sports: [],
                university: '',
            };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors.length).toBeGreaterThan(1);
        });
    });

    describe('POST - Email Already Exists', () => {
        it('returns 409 when email is already registered', async () => {
            mockCheckCoachEmailExists.mockResolvedValue(true);

            const request = createRequest(validCoachData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(409);
            expect(data).toEqual({
                success: false,
                message: 'Email already registered',
            });

            expect(mockCheckCoachEmailExists).toHaveBeenCalledWith('john.coach@example.com');
            expect(mockHashPassword).not.toHaveBeenCalled();
            expect(mockCreateCoach).not.toHaveBeenCalled();
        });
    });

    describe('POST - Database Connection Errors', () => {
        it('returns 500 when checkCoachEmailExists fails', async () => {
            mockCheckCoachEmailExists.mockRejectedValue(new Error('Database connection failed'));

            const request = createRequest(validCoachData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                success: false,
                message: 'An error occurred during registration',
            });
        });

        it('returns 500 when createCoach fails', async () => {
            mockCheckCoachEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password_123');
            mockCreateCoach.mockRejectedValue(new Error('Database insertion failed'));

            const request = createRequest(validCoachData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                success: false,
                message: 'An error occurred during registration',
            });
        });

        it('returns 500 when password hashing fails', async () => {
            mockCheckCoachEmailExists.mockResolvedValue(false);
            mockHashPassword.mockRejectedValue(new Error('Hashing failed'));

            const request = createRequest(validCoachData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                success: false,
                message: 'An error occurred during registration',
            });
        });
    });

    describe('POST - CORS Headers', () => {
        it('includes CORS headers for allowed origin', async () => {
            mockCheckCoachEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password_123');
            mockCreateCoach.mockResolvedValue('coach-uuid-123');

            const request = createRequest(validCoachData, 'http://localhost:3000');
            const response = await POST(request);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
        });

        it('includes CORS headers for error responses', async () => {
            mockCheckCoachEmailExists.mockResolvedValue(true);

            const request = createRequest(validCoachData, 'http://localhost:3000');
            const response = await POST(request);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
        });
    });

    describe('OPTIONS - CORS Preflight', () => {
        it('handles OPTIONS request correctly', async () => {
            const request = new NextRequest('http://localhost:3000/api/auth/register/coach', {
                method: 'OPTIONS',
                headers: {
                    'origin': 'http://localhost:3000',
                },
            });

            const response = await OPTIONS(request);

            expect(response.status).toBe(204);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type');
        });
    });
});
