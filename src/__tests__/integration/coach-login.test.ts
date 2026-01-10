/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/login/coach/route';
import { query } from '@/authentication/db/client';
import { hashPassword } from '@/authentication/utils/password';
import { verifyToken } from '@/authentication/utils/jwt';

// Mock the database client
jest.mock('@/authentication/db/client');

describe('Coach Login - Complete Integration Flow', () => {
    const mockQuery = query as jest.MockedFunction<typeof query>;

    beforeEach(() => {
        jest.clearAllMocks();
        // Set required environment variables
        process.env.JWT_SECRET = 'test-secret-key-for-integration-tests';
        process.env.JWT_EXPIRATION = '7d';
        process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
    });

    afterEach(() => {
        delete process.env.JWT_SECRET;
        delete process.env.JWT_EXPIRATION;
        delete process.env.ALLOWED_ORIGINS;
    });

    const createMockRequest = (body: any) => {
        return new NextRequest('http://localhost:3000/api/auth/login/coach', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'origin': 'http://localhost:3000',
            },
            body: JSON.stringify(body),
        });
    };

    const mockCoachData = {
        id: 'coach-uuid-123',
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@university.edu',
        password_hash: '', // Will be set in tests
        sport: 'basketball',
        coaching_level: 'mens',
        years_experience: 5,
        phone: '+1234567890',
        country: 'USA',
        state: 'California',
        city: 'Los Angeles',
        current_organization: 'State University',
        position_title: 'Head Coach',
        certifications: ['Level 1', 'Level 2'],
        specializations: ['Basketball', 'Strength Training'],
        bio: 'Experienced coach',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    };

    describe('Complete Login Flow', () => {
        it('should successfully authenticate coach with valid credentials', async () => {
            // Hash the password for testing
            const hashedPassword = await hashPassword('Password123!');
            const coachWithHashedPassword = {
                ...mockCoachData,
                password_hash: hashedPassword,
            };

            // Mock database query to return coach
            mockQuery.mockResolvedValue([coachWithHashedPassword]);

            const loginData = {
                email: 'john.smith@university.edu',
                password: 'Password123!',
            };

            const request = createMockRequest(loginData);
            const response = await POST(request);
            const data = await response.json();

            // Verify response
            expect(response.status).toBe(200);
            expect(data).toEqual({
                success: true,
                message: 'Login successful',
                coachId: 'coach-uuid-123',
            });

            // Verify session cookie is set
            const setCookieHeader = response.headers.get('set-cookie');
            expect(setCookieHeader).toBeTruthy();
            expect(setCookieHeader).toContain('session=');
            expect(setCookieHeader).toContain('HttpOnly');
            expect(setCookieHeader).toContain('Path=/');

            // Verify CORS headers
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
            expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');

            // Verify database was queried correctly
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                ['john.smith@university.edu']
            );
        });

        it('should generate valid JWT token on successful login', async () => {
            const hashedPassword = await hashPassword('Password123!');
            const coachWithHashedPassword = {
                ...mockCoachData,
                password_hash: hashedPassword,
            };

            mockQuery.mockResolvedValue([coachWithHashedPassword]);

            const loginData = {
                email: 'john.smith@university.edu',
                password: 'Password123!',
            };

            const request = createMockRequest(loginData);
            const response = await POST(request);

            // Extract token from cookie
            const setCookieHeader = response.headers.get('set-cookie');
            const tokenMatch = setCookieHeader?.match(/session=([^;]+)/);
            expect(tokenMatch).toBeTruthy();

            const token = tokenMatch![1];

            // Verify token is valid and contains correct data
            const tokenPayload = await verifyToken(token);
            expect(tokenPayload).toBeTruthy();
            expect(tokenPayload?.playerId).toBe('coach-uuid-123'); // Note: JWT uses playerId field for both
            expect(tokenPayload?.email).toBe('john.smith@university.edu');
            expect(tokenPayload?.type).toBe('coach');
            expect(tokenPayload?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
        });
    });

    describe('Authentication Errors', () => {
        it('should return 401 for non-existent coach', async () => {
            // Mock database query to return no results
            mockQuery.mockResolvedValue([]);

            const loginData = {
                email: 'nonexistent@university.edu',
                password: 'Password123!',
            };

            const request = createMockRequest(loginData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({
                success: false,
                message: 'Invalid email or password. Please try again.',
            });

            // Verify no session cookie is set
            const setCookieHeader = response.headers.get('set-cookie');
            expect(setCookieHeader).toBeNull();
        });

        it('should return 401 for incorrect password', async () => {
            const hashedPassword = await hashPassword('CorrectPassword123!');
            const coachWithHashedPassword = {
                ...mockCoachData,
                password_hash: hashedPassword,
            };

            mockQuery.mockResolvedValue([coachWithHashedPassword]);

            const loginData = {
                email: 'john.smith@university.edu',
                password: 'WrongPassword123!', // Wrong password
            };

            const request = createMockRequest(loginData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({
                success: false,
                message: 'Invalid email or password. Please try again.',
            });

            // Verify no session cookie is set
            const setCookieHeader = response.headers.get('set-cookie');
            expect(setCookieHeader).toBeNull();
        });
    });

    describe('Validation Errors', () => {
        it('should return 400 for missing email', async () => {
            const loginData = {
                password: 'Password123!',
            };

            const request = createMockRequest(loginData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'email',
                message: 'Email is required',
            });

            // Verify database was not queried
            expect(mockQuery).not.toHaveBeenCalled();
        });

        it('should return 400 for invalid email format', async () => {
            const loginData = {
                email: 'invalid-email',
                password: 'Password123!',
            };

            const request = createMockRequest(loginData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'email',
                message: 'Invalid email format',
            });

            // Verify database was not queried
            expect(mockQuery).not.toHaveBeenCalled();
        });

        it('should return 400 for missing password', async () => {
            const loginData = {
                email: 'coach@university.edu',
            };

            const request = createMockRequest(loginData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'password',
                message: 'Password is required',
            });

            // Verify database was not queried
            expect(mockQuery).not.toHaveBeenCalled();
        });

        it('should return 400 for password too short', async () => {
            const loginData = {
                email: 'coach@university.edu',
                password: 'short',
            };

            const request = createMockRequest(loginData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'password',
                message: 'Password must be at least 8 characters',
            });

            // Verify database was not queried
            expect(mockQuery).not.toHaveBeenCalled();
        });
    });

    describe('Database Errors', () => {
        it('should return 500 when database query fails', async () => {
            mockQuery.mockRejectedValue(new Error('Database connection failed'));

            const loginData = {
                email: 'john.smith@university.edu',
                password: 'Password123!',
            };

            const request = createMockRequest(loginData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                success: false,
                message: 'An error occurred during login',
            });

            // Verify no session cookie is set
            const setCookieHeader = response.headers.get('set-cookie');
            expect(setCookieHeader).toBeNull();
        });
    });

    describe('Security', () => {
        it('should not expose coach information in error responses', async () => {
            const hashedPassword = await hashPassword('Password123!');
            const coachWithHashedPassword = {
                ...mockCoachData,
                password_hash: hashedPassword,
            };

            mockQuery.mockResolvedValue([coachWithHashedPassword]);

            const loginData = {
                email: 'john.smith@university.edu',
                password: 'WrongPassword123!',
            };

            const request = createMockRequest(loginData);
            const response = await POST(request);
            const data = await response.json();

            // Should not include coach ID or any other coach information
            expect(data.coachId).toBeUndefined();
            expect(data.email).toBeUndefined();
            expect(data.firstName).toBeUndefined();
        });

        it('should use same error message for non-existent email and wrong password', async () => {
            // Test non-existent email
            mockQuery.mockResolvedValue([]);
            const request1 = createMockRequest({
                email: 'nonexistent@university.edu',
                password: 'Password123!',
            });
            const response1 = await POST(request1);
            const data1 = await response1.json();

            // Test wrong password
            const hashedPassword = await hashPassword('CorrectPassword123!');
            mockQuery.mockResolvedValue([{
                ...mockCoachData,
                password_hash: hashedPassword,
            }]);
            const request2 = createMockRequest({
                email: 'john.smith@university.edu',
                password: 'WrongPassword123!',
            });
            const response2 = await POST(request2);
            const data2 = await response2.json();

            // Both should return the same error message to prevent email enumeration
            expect(data1.message).toBe(data2.message);
            expect(data1.message).toBe('Invalid email or password. Please try again.');
        });
    });
});
