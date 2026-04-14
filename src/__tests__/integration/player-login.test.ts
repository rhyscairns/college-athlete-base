/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/login/player/route';
import { query } from '@/authentication/db/client';
import { hashPassword } from '@/authentication/utils/password';
import {
    generatePlayerRegistration,
} from '@/__tests__/utils/test-data-generators';

// Mock the database client
jest.mock('@/authentication/db/client');

describe('Player Login - Integration Tests', () => {
    const mockQuery = query as jest.MockedFunction<typeof query>;

    beforeEach(() => {
        jest.clearAllMocks();
        // Set required environment variables
        process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
        process.env.JWT_SECRET = 'test-secret-key-for-jwt-signing';
    });

    afterEach(() => {
        delete process.env.ALLOWED_ORIGINS;
        delete process.env.JWT_SECRET;
    });

    const createMockRequest = (body: any) => {
        return new NextRequest('http://localhost:3000/api/auth/login/player', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'origin': 'http://localhost:3000',
            },
            body: JSON.stringify(body),
        });
    };

    describe('Successful Login', () => {
        it('should successfully login with valid credentials', async () => {
            const playerData = generatePlayerRegistration({
                email: 'test.player@example.com',
                password: 'SecurePass123!',
            });

            // Hash the password as it would be stored in the database
            const passwordHash = await hashPassword(playerData.password);

            // Mock database query to return player with hashed password
            mockQuery.mockResolvedValueOnce([
                {
                    id: 'player-uuid-123',
                    first_name: playerData.firstName,
                    last_name: playerData.lastName,
                    email: playerData.email.toLowerCase(),
                    password_hash: passwordHash,
                    sex: playerData.sex,
                    sport: playerData.sport,
                    position: playerData.position,
                    gpa: playerData.gpa,
                    country: playerData.country,
                    state: playerData.state,
                    region: null,
                    scholarship_amount: null,
                    test_scores: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ]);

            const request = createMockRequest({
                email: playerData.email,
                password: playerData.password,
            });

            const response = await POST(request);
            const data = await response.json();

            // Verify response
            expect(response.status).toBe(200);
            expect(data).toEqual({
                success: true,
                message: 'Login successful',
                playerId: 'player-uuid-123',
            });

            // Verify session cookie was set
            const cookies = response.headers.get('set-cookie');
            expect(cookies).toContain('session=');
            expect(cookies).toContain('HttpOnly');
            expect(cookies).toContain('Path=/');

            // Verify CORS headers
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');

            // Verify database was called to fetch player
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                [playerData.email.toLowerCase()]
            );
        });

        it('should successfully login with player that has dateOfBirth', async () => {
            const playerData = generatePlayerRegistration({
                email: 'player.with.dob@example.com',
                password: 'MyPassword123!',
            });

            const passwordHash = await hashPassword(playerData.password);

            // Mock database query with dateOfBirth included
            mockQuery.mockResolvedValueOnce([
                {
                    id: 'player-uuid-dob',
                    first_name: playerData.firstName,
                    last_name: playerData.lastName,
                    email: playerData.email.toLowerCase(),
                    password_hash: passwordHash,
                    date_of_birth: playerData.dateOfBirth,
                    sex: playerData.sex,
                    sport: playerData.sport,
                    position: playerData.position,
                    gpa: playerData.gpa,
                    country: playerData.country,
                    state: playerData.state,
                    region: null,
                    scholarship_amount: null,
                    test_scores: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ]);

            const request = createMockRequest({
                email: playerData.email,
                password: playerData.password,
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.playerId).toBe('player-uuid-dob');
        });
    });

    describe('Email Case-Insensitivity', () => {
        it('should login successfully with uppercase email', async () => {
            const playerData = generatePlayerRegistration({
                email: 'test.player@example.com',
                password: 'SecurePass123!',
            });

            const passwordHash = await hashPassword(playerData.password);

            // Database stores email in lowercase
            mockQuery.mockResolvedValueOnce([
                {
                    id: 'player-uuid-upper',
                    first_name: playerData.firstName,
                    last_name: playerData.lastName,
                    email: 'test.player@example.com',
                    password_hash: passwordHash,
                    sex: playerData.sex,
                    sport: playerData.sport,
                    position: playerData.position,
                    gpa: playerData.gpa,
                    country: playerData.country,
                    state: playerData.state,
                    region: null,
                    scholarship_amount: null,
                    test_scores: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ]);

            // Login with uppercase email
            const request = createMockRequest({
                email: 'TEST.PLAYER@EXAMPLE.COM',
                password: playerData.password,
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.playerId).toBe('player-uuid-upper');

            // Verify email was normalized before querying
            expect(mockQuery).toHaveBeenCalledWith(
                expect.any(String),
                ['test.player@example.com']
            );
        });

        it('should login successfully with mixed case email', async () => {
            const playerData = generatePlayerRegistration({
                email: 'test.player@example.com',
                password: 'SecurePass123!',
            });

            const passwordHash = await hashPassword(playerData.password);

            mockQuery.mockResolvedValueOnce([
                {
                    id: 'player-uuid-mixed',
                    first_name: playerData.firstName,
                    last_name: playerData.lastName,
                    email: 'test.player@example.com',
                    password_hash: passwordHash,
                    sex: playerData.sex,
                    sport: playerData.sport,
                    position: playerData.position,
                    gpa: playerData.gpa,
                    country: playerData.country,
                    state: playerData.state,
                    region: null,
                    scholarship_amount: null,
                    test_scores: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ]);

            // Login with mixed case email
            const request = createMockRequest({
                email: 'Test.Player@Example.COM',
                password: playerData.password,
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);

            // Verify email was normalized
            expect(mockQuery).toHaveBeenCalledWith(
                expect.any(String),
                ['test.player@example.com']
            );
        });
    });

    describe('Failed Login - Invalid Credentials', () => {
        it('should fail login with non-existent email', async () => {
            // Mock database query to return no results
            mockQuery.mockResolvedValueOnce([]);

            const request = createMockRequest({
                email: 'nonexistent@example.com',
                password: 'SomePassword123!',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({
                success: false,
                message: 'Invalid email or password. Please try again.',
            });

            // Verify no session cookie was set
            const cookies = response.headers.get('set-cookie');
            expect(cookies).toBeNull();

            // Verify database was queried
            expect(mockQuery).toHaveBeenCalledTimes(1);
        });

        it('should fail login with incorrect password', async () => {
            const playerData = generatePlayerRegistration({
                email: 'test.player@example.com',
                password: 'CorrectPassword123!',
            });

            const passwordHash = await hashPassword(playerData.password);

            // Mock database query to return player
            mockQuery.mockResolvedValueOnce([
                {
                    id: 'player-uuid-wrong-pass',
                    first_name: playerData.firstName,
                    last_name: playerData.lastName,
                    email: playerData.email.toLowerCase(),
                    password_hash: passwordHash,
                    sex: playerData.sex,
                    sport: playerData.sport,
                    position: playerData.position,
                    gpa: playerData.gpa,
                    country: playerData.country,
                    state: playerData.state,
                    region: null,
                    scholarship_amount: null,
                    test_scores: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ]);

            // Attempt login with wrong password
            const request = createMockRequest({
                email: playerData.email,
                password: 'WrongPassword123!',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({
                success: false,
                message: 'Invalid email or password. Please try again.',
            });

            // Verify no session cookie was set
            const cookies = response.headers.get('set-cookie');
            expect(cookies).toBeNull();
        });

        it('should use same error message for non-existent email and wrong password', async () => {
            // Test non-existent email
            mockQuery.mockResolvedValueOnce([]);
            const request1 = createMockRequest({
                email: 'nonexistent@example.com',
                password: 'Password123!',
            });
            const response1 = await POST(request1);
            const data1 = await response1.json();

            // Test wrong password
            const playerData = generatePlayerRegistration({
                password: 'CorrectPassword123!',
            });
            const passwordHash = await hashPassword(playerData.password);

            mockQuery.mockResolvedValueOnce([
                {
                    id: 'player-uuid-test',
                    first_name: playerData.firstName,
                    last_name: playerData.lastName,
                    email: playerData.email.toLowerCase(),
                    password_hash: passwordHash,
                    sex: playerData.sex,
                    sport: playerData.sport,
                    position: playerData.position,
                    gpa: playerData.gpa,
                    country: playerData.country,
                    state: playerData.state,
                    region: null,
                    scholarship_amount: null,
                    test_scores: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ]);

            const request2 = createMockRequest({
                email: playerData.email,
                password: 'WrongPassword123!',
            });
            const response2 = await POST(request2);
            const data2 = await response2.json();

            // Both should return the same error message (prevents email enumeration)
            expect(data1.message).toBe(data2.message);
            expect(data1.message).toBe('Invalid email or password. Please try again.');
            expect(response1.status).toBe(401);
            expect(response2.status).toBe(401);
        });
    });

    describe('Password Verification', () => {
        it('should verify password correctly using bcrypt', async () => {
            const playerData = generatePlayerRegistration({
                email: 'verify.test@example.com',
                password: 'MySecurePassword123!',
            });

            // Hash the password
            const passwordHash = await hashPassword(playerData.password);

            mockQuery.mockResolvedValueOnce([
                {
                    id: 'player-uuid-verify',
                    first_name: playerData.firstName,
                    last_name: playerData.lastName,
                    email: playerData.email.toLowerCase(),
                    password_hash: passwordHash,
                    sex: playerData.sex,
                    sport: playerData.sport,
                    position: playerData.position,
                    gpa: playerData.gpa,
                    country: playerData.country,
                    state: playerData.state,
                    region: null,
                    scholarship_amount: null,
                    test_scores: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ]);

            const request = createMockRequest({
                email: playerData.email,
                password: playerData.password,
            });

            const response = await POST(request);
            const data = await response.json();

            // Should succeed because password matches hash
            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it('should reject similar but incorrect passwords', async () => {
            const playerData = generatePlayerRegistration({
                email: 'similar.test@example.com',
                password: 'MyPassword123!',
            });

            const passwordHash = await hashPassword(playerData.password);

            mockQuery.mockResolvedValueOnce([
                {
                    id: 'player-uuid-similar',
                    first_name: playerData.firstName,
                    last_name: playerData.lastName,
                    email: playerData.email.toLowerCase(),
                    password_hash: passwordHash,
                    sex: playerData.sex,
                    sport: playerData.sport,
                    position: playerData.position,
                    gpa: playerData.gpa,
                    country: playerData.country,
                    state: playerData.state,
                    region: null,
                    scholarship_amount: null,
                    test_scores: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ]);

            // Try with slightly different password
            const request = createMockRequest({
                email: playerData.email,
                password: 'MyPassword123',  // Missing exclamation mark
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
        });

        it('should be case-sensitive for passwords', async () => {
            const playerData = generatePlayerRegistration({
                email: 'case.test@example.com',
                password: 'MyPassword123!',
            });

            const passwordHash = await hashPassword(playerData.password);

            mockQuery.mockResolvedValueOnce([
                {
                    id: 'player-uuid-case',
                    first_name: playerData.firstName,
                    last_name: playerData.lastName,
                    email: playerData.email.toLowerCase(),
                    password_hash: passwordHash,
                    sex: playerData.sex,
                    sport: playerData.sport,
                    position: playerData.position,
                    gpa: playerData.gpa,
                    country: playerData.country,
                    state: playerData.state,
                    region: null,
                    scholarship_amount: null,
                    test_scores: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ]);

            // Try with different case
            const request = createMockRequest({
                email: playerData.email,
                password: 'mypassword123!',  // All lowercase
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
        });
    });

    describe('Validation Errors', () => {
        it('should return 400 for missing email', async () => {
            const request = createMockRequest({
                password: 'Password123!',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'email',
                message: 'Email is required',
            });

            // Verify database was not called
            expect(mockQuery).not.toHaveBeenCalled();
        });

        it('should return 400 for missing password', async () => {
            const request = createMockRequest({
                email: 'test@example.com',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'password',
                message: 'Password is required',
            });

            expect(mockQuery).not.toHaveBeenCalled();
        });

        it('should return 400 for invalid email format', async () => {
            const request = createMockRequest({
                email: 'invalid-email',
                password: 'Password123!',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'email',
                message: 'Invalid email format',
            });

            expect(mockQuery).not.toHaveBeenCalled();
        });

        it('should return 400 for password shorter than 8 characters', async () => {
            const request = createMockRequest({
                email: 'test@example.com',
                password: 'Pass1!',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'password',
                message: 'Password must be at least 8 characters',
            });

            expect(mockQuery).not.toHaveBeenCalled();
        });

        it('should return 400 for invalid JSON in request body', async () => {
            const request = new NextRequest('http://localhost:3000/api/auth/login/player', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'origin': 'http://localhost:3000',
                },
                body: 'invalid-json{',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({
                success: false,
                message: 'Invalid JSON in request body',
            });

            expect(mockQuery).not.toHaveBeenCalled();
        });
    });

    describe('Database Errors', () => {
        it('should return 500 when database query fails', async () => {
            // Mock database error
            mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

            const request = createMockRequest({
                email: 'test@example.com',
                password: 'Password123!',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                success: false,
                message: 'An error occurred during login',
            });
        });
    });

    describe('CORS Headers', () => {
        it('should include CORS headers in successful response', async () => {
            const playerData = generatePlayerRegistration();
            const passwordHash = await hashPassword(playerData.password);

            mockQuery.mockResolvedValueOnce([
                {
                    id: 'player-uuid-cors',
                    first_name: playerData.firstName,
                    last_name: playerData.lastName,
                    email: playerData.email.toLowerCase(),
                    password_hash: passwordHash,
                    sex: playerData.sex,
                    sport: playerData.sport,
                    position: playerData.position,
                    gpa: playerData.gpa,
                    country: playerData.country,
                    state: playerData.state,
                    region: null,
                    scholarship_amount: null,
                    test_scores: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ]);

            const request = createMockRequest({
                email: playerData.email,
                password: playerData.password,
            });

            const response = await POST(request);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
        });

        it('should include CORS headers in error response', async () => {
            const request = createMockRequest({
                email: 'invalid-email',
                password: 'Password123!',
            });

            const response = await POST(request);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
        });
    });
});
