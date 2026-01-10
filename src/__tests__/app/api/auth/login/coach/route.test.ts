/**
 * @jest-environment node
 */
import { POST, OPTIONS } from '@/app/api/auth/login/coach/route';
import { NextRequest } from 'next/server';
import * as coachesDb from '@/authentication/db/coaches';
import * as passwordUtils from '@/authentication/utils/password';
import * as jwtUtils from '@/authentication/utils/jwt';
import { CoachDatabaseRecord } from '@/authentication/db/coaches';

// Mock the dependencies
jest.mock('@/authentication/db/coaches');
jest.mock('@/authentication/utils/password');
jest.mock('@/authentication/utils/jwt');

describe('/api/auth/login/coach', () => {
    const mockGetCoachByEmail = coachesDb.getCoachByEmail as jest.MockedFunction<typeof coachesDb.getCoachByEmail>;
    const mockVerifyPassword = passwordUtils.verifyPassword as jest.MockedFunction<typeof passwordUtils.verifyPassword>;
    const mockGenerateToken = jwtUtils.generateToken as jest.MockedFunction<typeof jwtUtils.generateToken>;

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

        return new NextRequest('http://localhost:3000/api/auth/login/coach', {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
    };

    const validLoginData = {
        email: 'coach@university.edu',
        password: 'Password123!',
    };

    const mockCoachRecord: CoachDatabaseRecord = {
        id: 'coach-uuid-123',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'coach@university.edu',
        passwordHash: '$2b$10$hashedpassword',
        coachingCategory: 'mens',
        sports: ['basketball', 'football'],
        university: 'State University',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    };

    describe('POST - Successful Login', () => {
        it('logs in a coach successfully with valid credentials', async () => {
            mockGetCoachByEmail.mockResolvedValue(mockCoachRecord);
            mockVerifyPassword.mockResolvedValue(true);
            mockGenerateToken.mockResolvedValue('jwt-token-123');

            const request = createRequest(validLoginData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({
                success: true,
                message: 'Login successful',
                coachId: 'coach-uuid-123',
            });

            expect(mockGetCoachByEmail).toHaveBeenCalledWith('coach@university.edu');
            expect(mockVerifyPassword).toHaveBeenCalledWith('Password123!', '$2b$10$hashedpassword');
            expect(mockGenerateToken).toHaveBeenCalledWith('coach-uuid-123', 'coach@university.edu', 'coach');
        });

        it('sets HTTP-only session cookie on successful login', async () => {
            mockGetCoachByEmail.mockResolvedValue(mockCoachRecord);
            mockVerifyPassword.mockResolvedValue(true);
            mockGenerateToken.mockResolvedValue('jwt-token-123');

            const request = createRequest(validLoginData);
            const response = await POST(request);

            const setCookieHeader = response.headers.get('set-cookie');
            expect(setCookieHeader).toBeTruthy();
            expect(setCookieHeader).toContain('session=jwt-token-123');
            expect(setCookieHeader).toContain('HttpOnly');
            expect(setCookieHeader?.toLowerCase()).toContain('samesite=strict');
            expect(setCookieHeader).toContain('Path=/');
            expect(setCookieHeader).toContain('Max-Age=604800'); // 7 days
        });

        it('sets secure cookie flag in production', async () => {
            const originalNodeEnv = process.env.NODE_ENV;

            // Override NODE_ENV for this test
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: 'production',
                writable: true,
                configurable: true,
            });

            mockGetCoachByEmail.mockResolvedValue(mockCoachRecord);
            mockVerifyPassword.mockResolvedValue(true);
            mockGenerateToken.mockResolvedValue('jwt-token-123');

            const request = createRequest(validLoginData);
            const response = await POST(request);

            const setCookieHeader = response.headers.get('set-cookie');
            expect(setCookieHeader).toContain('Secure');

            // Restore original NODE_ENV
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: originalNodeEnv,
                writable: true,
                configurable: true,
            });
        });

        it('handles email case-insensitively', async () => {
            mockGetCoachByEmail.mockResolvedValue(mockCoachRecord);
            mockVerifyPassword.mockResolvedValue(true);
            mockGenerateToken.mockResolvedValue('jwt-token-123');

            const loginDataUppercase = {
                email: 'COACH@UNIVERSITY.EDU',
                password: 'Password123!',
            };

            const request = createRequest(loginDataUppercase);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(mockGetCoachByEmail).toHaveBeenCalledWith('COACH@UNIVERSITY.EDU');
        });
    });

    describe('POST - Validation Errors', () => {
        it('returns 400 for missing email', async () => {
            const invalidData = { password: 'Password123!' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'email',
                message: 'Email is required',
            });

            expect(mockGetCoachByEmail).not.toHaveBeenCalled();
            expect(mockVerifyPassword).not.toHaveBeenCalled();
            expect(mockGenerateToken).not.toHaveBeenCalled();
        });

        it('returns 400 for invalid email format', async () => {
            const invalidData = { email: 'invalid-email', password: 'Password123!' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'email',
                message: 'Invalid email format',
            });
        });

        it('returns 400 for missing password', async () => {
            const invalidData = { email: 'coach@university.edu' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'password',
                message: 'Password is required',
            });
        });

        it('returns 400 for password too short', async () => {
            const invalidData = { email: 'coach@university.edu', password: 'short' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'password',
                message: 'Password must be at least 8 characters',
            });
        });

        it('returns 400 for invalid JSON in request body', async () => {
            const request = new NextRequest('http://localhost:3000/api/auth/login/coach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: 'invalid json',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.message).toBe('Invalid JSON in request body');
        });
    });

    describe('POST - Authentication Errors', () => {
        it('returns 401 for non-existent email', async () => {
            mockGetCoachByEmail.mockResolvedValue(null);

            const request = createRequest(validLoginData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({
                success: false,
                message: 'Invalid email or password. Please try again.',
            });

            expect(mockGetCoachByEmail).toHaveBeenCalledWith('coach@university.edu');
            expect(mockVerifyPassword).not.toHaveBeenCalled();
            expect(mockGenerateToken).not.toHaveBeenCalled();
        });

        it('returns 401 for incorrect password', async () => {
            mockGetCoachByEmail.mockResolvedValue(mockCoachRecord);
            mockVerifyPassword.mockResolvedValue(false);

            const request = createRequest(validLoginData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({
                success: false,
                message: 'Invalid email or password. Please try again.',
            });

            expect(mockGetCoachByEmail).toHaveBeenCalledWith('coach@university.edu');
            expect(mockVerifyPassword).toHaveBeenCalledWith('Password123!', '$2b$10$hashedpassword');
            expect(mockGenerateToken).not.toHaveBeenCalled();
        });

        it('uses same error message for non-existent email and wrong password', async () => {
            // Test non-existent email
            mockGetCoachByEmail.mockResolvedValue(null);
            const request1 = createRequest(validLoginData);
            const response1 = await POST(request1);
            const data1 = await response1.json();

            // Test wrong password
            mockGetCoachByEmail.mockResolvedValue(mockCoachRecord);
            mockVerifyPassword.mockResolvedValue(false);
            const request2 = createRequest(validLoginData);
            const response2 = await POST(request2);
            const data2 = await response2.json();

            // Both should return the same error message to prevent email enumeration
            expect(data1.message).toBe(data2.message);
            expect(data1.message).toBe('Invalid email or password. Please try again.');
        });
    });

    describe('POST - Database Errors', () => {
        it('returns 500 when getCoachByEmail fails', async () => {
            mockGetCoachByEmail.mockRejectedValue(new Error('Database connection failed'));

            const request = createRequest(validLoginData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                success: false,
                message: 'An error occurred during login',
            });

            expect(mockGetCoachByEmail).toHaveBeenCalled();
            expect(mockVerifyPassword).not.toHaveBeenCalled();
            expect(mockGenerateToken).not.toHaveBeenCalled();
        });

        it('returns 500 when password verification fails', async () => {
            mockGetCoachByEmail.mockResolvedValue(mockCoachRecord);
            mockVerifyPassword.mockRejectedValue(new Error('Verification error'));

            const request = createRequest(validLoginData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                success: false,
                message: 'An error occurred during login',
            });

            expect(mockGetCoachByEmail).toHaveBeenCalled();
            expect(mockVerifyPassword).toHaveBeenCalled();
            expect(mockGenerateToken).not.toHaveBeenCalled();
        });

        it('returns 500 when token generation fails', async () => {
            mockGetCoachByEmail.mockResolvedValue(mockCoachRecord);
            mockVerifyPassword.mockResolvedValue(true);
            mockGenerateToken.mockRejectedValue(new Error('Token generation failed'));

            const request = createRequest(validLoginData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                success: false,
                message: 'An error occurred during login',
            });

            expect(mockGetCoachByEmail).toHaveBeenCalled();
            expect(mockVerifyPassword).toHaveBeenCalled();
            expect(mockGenerateToken).toHaveBeenCalled();
        });
    });

    describe('POST - CORS Headers', () => {
        it('includes CORS headers in successful response', async () => {
            mockGetCoachByEmail.mockResolvedValue(mockCoachRecord);
            mockVerifyPassword.mockResolvedValue(true);
            mockGenerateToken.mockResolvedValue('jwt-token-123');

            const request = createRequest(validLoginData, 'http://localhost:3000');
            const response = await POST(request);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
            expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
        });

        it('includes CORS headers in error response', async () => {
            const invalidData = { email: '', password: '' };
            const request = createRequest(invalidData, 'http://localhost:3000');
            const response = await POST(request);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
            expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
        });
    });

    describe('OPTIONS - CORS Preflight', () => {
        it('handles OPTIONS request for CORS preflight', async () => {
            const request = new NextRequest('http://localhost:3000/api/auth/login/coach', {
                method: 'OPTIONS',
                headers: {
                    'origin': 'http://localhost:3000',
                },
            });

            const response = await OPTIONS(request);

            expect(response.status).toBe(200);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
            expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
        });

        it('returns empty body for OPTIONS request', async () => {
            const request = new NextRequest('http://localhost:3000/api/auth/login/coach', {
                method: 'OPTIONS',
                headers: {
                    'origin': 'http://localhost:3000',
                },
            });

            const response = await OPTIONS(request);
            const text = await response.text();

            expect(text).toBe('');
        });
    });

    describe('POST - Security Considerations', () => {
        it('does not expose coach information in error responses', async () => {
            mockGetCoachByEmail.mockResolvedValue(mockCoachRecord);
            mockVerifyPassword.mockResolvedValue(false);

            const request = createRequest(validLoginData);
            const response = await POST(request);
            const data = await response.json();

            // Should not include coach ID or any other coach information
            expect(data.coachId).toBeUndefined();
            expect(data.email).toBeUndefined();
            expect(data.firstName).toBeUndefined();
        });

        it('does not set cookie on failed authentication', async () => {
            mockGetCoachByEmail.mockResolvedValue(mockCoachRecord);
            mockVerifyPassword.mockResolvedValue(false);

            const request = createRequest(validLoginData);
            const response = await POST(request);

            const setCookieHeader = response.headers.get('set-cookie');
            expect(setCookieHeader).toBeNull();
        });

        it('does not expose database errors to client', async () => {
            mockGetCoachByEmail.mockRejectedValue(new Error('SELECT * FROM coaches failed'));

            const request = createRequest(validLoginData);
            const response = await POST(request);
            const data = await response.json();

            expect(data.message).toBe('An error occurred during login');
            expect(data.message).not.toContain('SELECT');
            expect(data.message).not.toContain('coaches');
        });
    });
});
