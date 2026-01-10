/**
 * @jest-environment node
 */
import { POST, OPTIONS } from '@/app/api/auth/login/player/route';
import { NextRequest } from 'next/server';
import * as playersDb from '@/authentication/db/players';
import * as passwordUtils from '@/authentication/utils/password';
import * as jwtUtils from '@/authentication/utils/jwt';
import { PlayerDatabaseRecord } from '@/authentication/types';

// Mock the dependencies
jest.mock('@/authentication/db/players');
jest.mock('@/authentication/utils/password');
jest.mock('@/authentication/utils/jwt');

describe('/api/auth/login/player', () => {
    const mockGetPlayerByEmail = playersDb.getPlayerByEmail as jest.MockedFunction<typeof playersDb.getPlayerByEmail>;
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

        return new NextRequest('http://localhost:3000/api/auth/login/player', {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
    };

    const validLoginData = {
        email: 'john.doe@example.com',
        password: 'Password123!',
    };

    const mockPlayerRecord: PlayerDatabaseRecord = {
        id: 'player-uuid-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        passwordHash: '$2b$10$hashedpassword',
        sex: 'male',
        sport: 'basketball',
        position: 'Guard',
        gpa: 3.5,
        country: 'USA',
        state: 'California',
        region: undefined,
        scholarshipAmount: undefined,
        testScores: undefined,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    };

    describe('POST - Successful Login', () => {
        it('logs in a player successfully with valid credentials', async () => {
            mockGetPlayerByEmail.mockResolvedValue(mockPlayerRecord);
            mockVerifyPassword.mockResolvedValue(true);
            mockGenerateToken.mockResolvedValue('jwt-token-123');

            const request = createRequest(validLoginData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({
                success: true,
                message: 'Login successful',
                playerId: 'player-uuid-123',
            });

            expect(mockGetPlayerByEmail).toHaveBeenCalledWith('john.doe@example.com');
            expect(mockVerifyPassword).toHaveBeenCalledWith('Password123!', '$2b$10$hashedpassword');
            expect(mockGenerateToken).toHaveBeenCalledWith('player-uuid-123', 'john.doe@example.com', 'player');
        });

        it('sets HTTP-only session cookie on successful login', async () => {
            mockGetPlayerByEmail.mockResolvedValue(mockPlayerRecord);
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

            mockGetPlayerByEmail.mockResolvedValue(mockPlayerRecord);
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
            mockGetPlayerByEmail.mockResolvedValue(mockPlayerRecord);
            mockVerifyPassword.mockResolvedValue(true);
            mockGenerateToken.mockResolvedValue('jwt-token-123');

            const loginDataUppercase = {
                email: 'JOHN.DOE@EXAMPLE.COM',
                password: 'Password123!',
            };

            const request = createRequest(loginDataUppercase);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(mockGetPlayerByEmail).toHaveBeenCalledWith('JOHN.DOE@EXAMPLE.COM');
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

            expect(mockGetPlayerByEmail).not.toHaveBeenCalled();
            expect(mockVerifyPassword).not.toHaveBeenCalled();
            expect(mockGenerateToken).not.toHaveBeenCalled();
        });

        it('returns 400 for empty email', async () => {
            const invalidData = { email: '', password: 'Password123!' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'email',
                message: 'Email is required',
            });
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
            const invalidData = { email: 'john.doe@example.com' };
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

        it('returns 400 for empty password', async () => {
            const invalidData = { email: 'john.doe@example.com', password: '' };
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
            const invalidData = { email: 'john.doe@example.com', password: 'short' };
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

        it('returns 400 for multiple validation errors', async () => {
            const invalidData = { email: 'invalid', password: 'short' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors.length).toBe(2);
        });

        it('returns 400 for invalid JSON in request body', async () => {
            const request = new NextRequest('http://localhost:3000/api/auth/login/player', {
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
            mockGetPlayerByEmail.mockResolvedValue(null);

            const request = createRequest(validLoginData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({
                success: false,
                message: 'Invalid email or password. Please try again.',
            });

            expect(mockGetPlayerByEmail).toHaveBeenCalledWith('john.doe@example.com');
            expect(mockVerifyPassword).not.toHaveBeenCalled();
            expect(mockGenerateToken).not.toHaveBeenCalled();
        });

        it('returns 401 for incorrect password', async () => {
            mockGetPlayerByEmail.mockResolvedValue(mockPlayerRecord);
            mockVerifyPassword.mockResolvedValue(false);

            const request = createRequest(validLoginData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({
                success: false,
                message: 'Invalid email or password. Please try again.',
            });

            expect(mockGetPlayerByEmail).toHaveBeenCalledWith('john.doe@example.com');
            expect(mockVerifyPassword).toHaveBeenCalledWith('Password123!', '$2b$10$hashedpassword');
            expect(mockGenerateToken).not.toHaveBeenCalled();
        });

        it('uses same error message for non-existent email and wrong password', async () => {
            // Test non-existent email
            mockGetPlayerByEmail.mockResolvedValue(null);
            const request1 = createRequest(validLoginData);
            const response1 = await POST(request1);
            const data1 = await response1.json();

            // Test wrong password
            mockGetPlayerByEmail.mockResolvedValue(mockPlayerRecord);
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
        it('returns 500 when getPlayerByEmail fails', async () => {
            mockGetPlayerByEmail.mockRejectedValue(new Error('Database connection failed'));

            const request = createRequest(validLoginData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                success: false,
                message: 'An error occurred during login',
            });

            expect(mockGetPlayerByEmail).toHaveBeenCalled();
            expect(mockVerifyPassword).not.toHaveBeenCalled();
            expect(mockGenerateToken).not.toHaveBeenCalled();
        });

        it('returns 500 when password verification fails', async () => {
            mockGetPlayerByEmail.mockResolvedValue(mockPlayerRecord);
            mockVerifyPassword.mockRejectedValue(new Error('Verification error'));

            const request = createRequest(validLoginData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                success: false,
                message: 'An error occurred during login',
            });

            expect(mockGetPlayerByEmail).toHaveBeenCalled();
            expect(mockVerifyPassword).toHaveBeenCalled();
            expect(mockGenerateToken).not.toHaveBeenCalled();
        });

        it('returns 500 when token generation fails', async () => {
            mockGetPlayerByEmail.mockResolvedValue(mockPlayerRecord);
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

            expect(mockGetPlayerByEmail).toHaveBeenCalled();
            expect(mockVerifyPassword).toHaveBeenCalled();
            expect(mockGenerateToken).toHaveBeenCalled();
        });

        it('handles unexpected errors gracefully', async () => {
            mockGetPlayerByEmail.mockImplementation(() => {
                throw new Error('Unexpected error');
            });

            const request = createRequest(validLoginData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                success: false,
                message: 'An error occurred during login',
            });
        });
    });

    describe('POST - CORS Headers', () => {
        it('includes CORS headers in successful response', async () => {
            mockGetPlayerByEmail.mockResolvedValue(mockPlayerRecord);
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

        it('returns allowed origin when origin matches', async () => {
            mockGetPlayerByEmail.mockResolvedValue(mockPlayerRecord);
            mockVerifyPassword.mockResolvedValue(true);
            mockGenerateToken.mockResolvedValue('jwt-token-123');

            const request = createRequest(validLoginData, 'https://dev.example.com');
            const response = await POST(request);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://dev.example.com');
        });

        it('returns first allowed origin when origin does not match', async () => {
            mockGetPlayerByEmail.mockResolvedValue(mockPlayerRecord);
            mockVerifyPassword.mockResolvedValue(true);
            mockGenerateToken.mockResolvedValue('jwt-token-123');

            const request = createRequest(validLoginData, 'https://malicious.com');
            const response = await POST(request);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
        });

        it('returns wildcard when no allowed origins configured', async () => {
            delete process.env.ALLOWED_ORIGINS;

            mockGetPlayerByEmail.mockResolvedValue(mockPlayerRecord);
            mockVerifyPassword.mockResolvedValue(true);
            mockGenerateToken.mockResolvedValue('jwt-token-123');

            const request = createRequest(validLoginData);
            const response = await POST(request);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
        });
    });

    describe('OPTIONS - CORS Preflight', () => {
        it('handles OPTIONS request for CORS preflight', async () => {
            const request = new NextRequest('http://localhost:3000/api/auth/login/player', {
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
            const request = new NextRequest('http://localhost:3000/api/auth/login/player', {
                method: 'OPTIONS',
                headers: {
                    'origin': 'http://localhost:3000',
                },
            });

            const response = await OPTIONS(request);
            const text = await response.text();

            expect(text).toBe('');
        });

        it('handles OPTIONS with allowed origin', async () => {
            const request = new NextRequest('http://localhost:3000/api/auth/login/player', {
                method: 'OPTIONS',
                headers: {
                    'origin': 'https://dev.example.com',
                },
            });

            const response = await OPTIONS(request);

            expect(response.status).toBe(200);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://dev.example.com');
        });

        it('handles OPTIONS with disallowed origin', async () => {
            const request = new NextRequest('http://localhost:3000/api/auth/login/player', {
                method: 'OPTIONS',
                headers: {
                    'origin': 'https://malicious.com',
                },
            });

            const response = await OPTIONS(request);

            expect(response.status).toBe(200);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
        });
    });

    describe('POST - Security Considerations', () => {
        it('does not expose player information in error responses', async () => {
            mockGetPlayerByEmail.mockResolvedValue(mockPlayerRecord);
            mockVerifyPassword.mockResolvedValue(false);

            const request = createRequest(validLoginData);
            const response = await POST(request);
            const data = await response.json();

            // Should not include player ID or any other player information
            expect(data.playerId).toBeUndefined();
            expect(data.email).toBeUndefined();
            expect(data.firstName).toBeUndefined();
        });

        it('does not set cookie on failed authentication', async () => {
            mockGetPlayerByEmail.mockResolvedValue(mockPlayerRecord);
            mockVerifyPassword.mockResolvedValue(false);

            const request = createRequest(validLoginData);
            const response = await POST(request);

            const setCookieHeader = response.headers.get('set-cookie');
            expect(setCookieHeader).toBeNull();
        });

        it('does not expose database errors to client', async () => {
            mockGetPlayerByEmail.mockRejectedValue(new Error('SELECT * FROM players failed'));

            const request = createRequest(validLoginData);
            const response = await POST(request);
            const data = await response.json();

            expect(data.message).toBe('An error occurred during login');
            expect(data.message).not.toContain('SELECT');
            expect(data.message).not.toContain('players');
        });
    });
});
