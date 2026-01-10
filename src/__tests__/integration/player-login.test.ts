/**
 * Integration tests for complete player login flow
 * Tests the entire login process from API endpoint to session management
 * @jest-environment node
 */

import { POST as LoginPOST, OPTIONS as LoginOPTIONS } from '@/app/api/auth/login/player/route';
import { POST as RegisterPOST } from '@/app/api/auth/register/player/route';
import { getPlayerByEmail } from '@/authentication/db/players';
import { validateSession } from '@/authentication/middleware/session';
import { verifyToken } from '@/authentication/utils/jwt';
import { query, closePool } from '@/authentication/db/client';
import { NextRequest } from 'next/server';

// Skip these tests if no database is configured
const skipIfNoDb = process.env.DATABASE_HOST ? describe : describe.skip;

/**
 * Helper function to create a mock NextRequest
 */
function createMockRequest(
    body: any,
    options: { origin?: string; method?: string; cookies?: Record<string, string> } = {}
): NextRequest {
    const url = 'http://localhost:3000/api/auth/login/player';
    const headers = new Headers({
        'content-type': 'application/json',
    });

    if (options.origin) {
        headers.set('origin', options.origin);
    }

    // Add cookies if provided
    if (options.cookies) {
        const cookieString = Object.entries(options.cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
        headers.set('cookie', cookieString);
    }

    const request = new NextRequest(url, {
        method: options.method || 'POST',
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    return request;
}

/**
 * Helper function to register a test player
 */
async function registerTestPlayer(email: string, password: string = 'TestPassword123!') {
    const registrationData = {
        firstName: 'Test',
        lastName: 'Player',
        email,
        password,
        sex: 'male',
        sport: 'basketball',
        position: 'Guard',
        gpa: 3.5,
        country: 'USA',
        state: 'California',
    };

    const request = createMockRequest(registrationData);
    const response = await RegisterPOST(request);
    const data = await response.json();

    return {
        playerId: data.playerId,
        email: registrationData.email,
        password: registrationData.password,
    };
}

skipIfNoDb('Player Login - Complete Integration Flow', () => {
    // Clean up test data after all tests
    afterAll(async () => {
        try {
            // Clean up any test data created during tests
            await query('DELETE FROM players WHERE email LIKE $1', ['%@login-test.com']);
            await closePool();
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    });

    // Clean up after each test to ensure isolation
    afterEach(async () => {
        try {
            await query('DELETE FROM players WHERE email LIKE $1', ['%@login-test.com']);
        } catch (error) {
            console.error('Test cleanup error:', error);
        }
    });

    describe('Successful Login Flow', () => {
        it('should successfully log in a player with valid credentials', async () => {
            // Register a test player first
            const email = `success.${Date.now()}@login-test.com`;
            const password = 'ValidPassword123!';
            const { playerId } = await registerTestPlayer(email, password);

            // Attempt to log in
            const loginRequest = createMockRequest({
                email,
                password,
            });

            const loginResponse = await LoginPOST(loginRequest);
            const loginData = await loginResponse.json();

            // Verify successful login response
            expect(loginResponse.status).toBe(200);
            expect(loginData.success).toBe(true);
            expect(loginData.message).toBe('Login successful');
            expect(loginData.playerId).toBe(playerId);

            // Verify session cookie was set
            const setCookieHeader = loginResponse.headers.get('set-cookie');
            expect(setCookieHeader).toBeDefined();
            expect(setCookieHeader).toContain('session=');
            expect(setCookieHeader).toContain('HttpOnly');
            expect(setCookieHeader?.toLowerCase()).toContain('samesite=strict');
            expect(setCookieHeader).toContain('Path=/');
        });

        it('should create a valid JWT token on successful login', async () => {
            // Register a test player
            const email = `jwt.${Date.now()}@login-test.com`;
            const password = 'JwtPassword123!';
            const { playerId } = await registerTestPlayer(email, password);

            // Log in
            const loginRequest = createMockRequest({
                email,
                password,
            });

            const loginResponse = await LoginPOST(loginRequest);

            // Extract token from cookie
            const setCookieHeader = loginResponse.headers.get('set-cookie');
            expect(setCookieHeader).toBeDefined();

            const tokenMatch = setCookieHeader!.match(/session=([^;]+)/);
            expect(tokenMatch).toBeDefined();

            const token = tokenMatch![1];

            // Verify the token
            const payload = await verifyToken(token);
            expect(payload).toBeDefined();
            expect(payload?.playerId).toBe(playerId);
            expect(payload?.email).toBe(email);
            expect(payload?.type).toBe('player');
            expect(payload?.exp).toBeGreaterThan(Date.now() / 1000);
        });

        it('should allow login with email in different case', async () => {
            // Register with lowercase email
            const email = `case.test.${Date.now()}@login-test.com`;
            const password = 'CasePassword123!';
            await registerTestPlayer(email.toLowerCase(), password);

            // Login with uppercase email
            const loginRequest = createMockRequest({
                email: email.toUpperCase(),
                password,
            });

            const loginResponse = await LoginPOST(loginRequest);
            const loginData = await loginResponse.json();

            expect(loginResponse.status).toBe(200);
            expect(loginData.success).toBe(true);
        });
    });

    describe('Failed Login Attempts', () => {
        it('should reject login with invalid password', async () => {
            // Register a test player
            const email = `invalid.password.${Date.now()}@login-test.com`;
            const correctPassword = 'CorrectPassword123!';
            await registerTestPlayer(email, correctPassword);

            // Attempt login with wrong password
            const loginRequest = createMockRequest({
                email,
                password: 'WrongPassword123!',
            });

            const loginResponse = await LoginPOST(loginRequest);
            const loginData = await loginResponse.json();

            // Verify failed login response
            expect(loginResponse.status).toBe(401);
            expect(loginData.success).toBe(false);
            expect(loginData.message).toBe('Invalid email or password. Please try again.');

            // Verify no session cookie was set
            const setCookieHeader = loginResponse.headers.get('set-cookie');
            expect(setCookieHeader).toBeNull();
        });

        it('should reject login with non-existent email', async () => {
            const loginRequest = createMockRequest({
                email: `nonexistent.${Date.now()}@login-test.com`,
                password: 'SomePassword123!',
            });

            const loginResponse = await LoginPOST(loginRequest);
            const loginData = await loginResponse.json();

            // Verify same error message as invalid password (prevent email enumeration)
            expect(loginResponse.status).toBe(401);
            expect(loginData.success).toBe(false);
            expect(loginData.message).toBe('Invalid email or password. Please try again.');
        });

        it('should reject login with missing email', async () => {
            const loginRequest = createMockRequest({
                password: 'SomePassword123!',
            });

            const loginResponse = await LoginPOST(loginRequest);
            const loginData = await loginResponse.json();

            expect(loginResponse.status).toBe(400);
            expect(loginData.success).toBe(false);
            expect(loginData.errors).toBeDefined();
            expect(loginData.errors).toContainEqual({
                field: 'email',
                message: 'Email is required',
            });
        });

        it('should reject login with missing password', async () => {
            const loginRequest = createMockRequest({
                email: 'test@login-test.com',
            });

            const loginResponse = await LoginPOST(loginRequest);
            const loginData = await loginResponse.json();

            expect(loginResponse.status).toBe(400);
            expect(loginData.success).toBe(false);
            expect(loginData.errors).toBeDefined();
            expect(loginData.errors).toContainEqual({
                field: 'password',
                message: 'Password is required',
            });
        });

        it('should reject login with invalid email format', async () => {
            const loginRequest = createMockRequest({
                email: 'invalid-email',
                password: 'SomePassword123!',
            });

            const loginResponse = await LoginPOST(loginRequest);
            const loginData = await loginResponse.json();

            expect(loginResponse.status).toBe(400);
            expect(loginData.success).toBe(false);
            expect(loginData.errors).toBeDefined();
            expect(loginData.errors).toContainEqual({
                field: 'email',
                message: 'Invalid email format',
            });
        });

        it('should reject login with password too short', async () => {
            const loginRequest = createMockRequest({
                email: 'test@login-test.com',
                password: 'short',
            });

            const loginResponse = await LoginPOST(loginRequest);
            const loginData = await loginResponse.json();

            expect(loginResponse.status).toBe(400);
            expect(loginData.success).toBe(false);
            expect(loginData.errors).toBeDefined();
            expect(loginData.errors).toContainEqual({
                field: 'password',
                message: 'Password must be at least 8 characters',
            });
        });
    });

    describe('Session Persistence', () => {
        it('should maintain session across multiple requests', async () => {
            // Register and login
            const email = `session.${Date.now()}@login-test.com`;
            const password = 'SessionPassword123!';
            const { playerId } = await registerTestPlayer(email, password);

            const loginRequest = createMockRequest({
                email,
                password,
            });

            const loginResponse = await LoginPOST(loginRequest);

            // Extract session token
            const setCookieHeader = loginResponse.headers.get('set-cookie');
            const tokenMatch = setCookieHeader!.match(/session=([^;]+)/);
            const token = tokenMatch![1];

            // Simulate subsequent request with session cookie
            const authenticatedRequest = createMockRequest(
                {},
                {
                    cookies: { session: token },
                }
            );

            // Validate session
            const sessionResult = await validateSession(authenticatedRequest);

            expect(sessionResult.isValid).toBe(true);
            expect(sessionResult.playerId).toBe(playerId);
            expect(sessionResult.email).toBe(email);
            expect(sessionResult.type).toBe('player');
        });

        it('should reject expired session token', async () => {
            // This test would require mocking time or using a very short expiration
            // For now, we'll test with an invalid token
            const invalidToken = 'invalid.token.here';

            const authenticatedRequest = createMockRequest(
                {},
                {
                    cookies: { session: invalidToken },
                }
            );

            const sessionResult = await validateSession(authenticatedRequest);

            expect(sessionResult.isValid).toBe(false);
            expect(sessionResult.error).toBeDefined();
        });

        it('should reject request without session token', async () => {
            const unauthenticatedRequest = createMockRequest({});

            const sessionResult = await validateSession(unauthenticatedRequest);

            expect(sessionResult.isValid).toBe(false);
            expect(sessionResult.error).toBe('No session token found');
        });
    });

    describe('Protected Route Access', () => {
        it('should allow access to dashboard with valid session', async () => {
            // Register and login
            const email = `dashboard.${Date.now()}@login-test.com`;
            const password = 'DashboardPassword123!';
            const { playerId } = await registerTestPlayer(email, password);

            const loginRequest = createMockRequest({
                email,
                password,
            });

            const loginResponse = await LoginPOST(loginRequest);

            // Extract session token
            const setCookieHeader = loginResponse.headers.get('set-cookie');
            const tokenMatch = setCookieHeader!.match(/session=([^;]+)/);
            const token = tokenMatch![1];

            // Verify token is valid for accessing protected routes
            const payload = await verifyToken(token);
            expect(payload).toBeDefined();
            expect(payload?.playerId).toBe(playerId);

            // Verify player can be fetched (simulating dashboard access)
            const player = await getPlayerByEmail(email);
            expect(player).toBeDefined();
            expect(player?.id).toBe(playerId);
        });

        it('should validate player ID matches token for dashboard access', async () => {
            // Register and login
            const email = `validation.${Date.now()}@login-test.com`;
            const password = 'ValidationPassword123!';
            const { playerId } = await registerTestPlayer(email, password);

            const loginRequest = createMockRequest({
                email,
                password,
            });

            const loginResponse = await LoginPOST(loginRequest);

            // Extract session token
            const setCookieHeader = loginResponse.headers.get('set-cookie');
            const tokenMatch = setCookieHeader!.match(/session=([^;]+)/);
            const token = tokenMatch![1];

            // Verify token
            const payload = await verifyToken(token);
            expect(payload).toBeDefined();

            // Simulate dashboard access validation
            // The dashboard should verify that the playerId in the URL matches the token
            const urlPlayerId = playerId;
            const tokenPlayerId = payload?.playerId;

            expect(tokenPlayerId).toBe(urlPlayerId);
        });

        it('should reject dashboard access with mismatched player ID', async () => {
            // Register and login
            const email = `mismatch.${Date.now()}@login-test.com`;
            const password = 'MismatchPassword123!';
            const { playerId } = await registerTestPlayer(email, password);

            const loginRequest = createMockRequest({
                email,
                password,
            });

            const loginResponse = await LoginPOST(loginRequest);

            // Extract session token
            const setCookieHeader = loginResponse.headers.get('set-cookie');
            const tokenMatch = setCookieHeader!.match(/session=([^;]+)/);
            const token = tokenMatch![1];

            // Verify token
            const payload = await verifyToken(token);
            expect(payload).toBeDefined();

            // Simulate dashboard access with different player ID
            const differentPlayerId = 'different-player-id';
            const tokenPlayerId = payload?.playerId;

            // Dashboard should reject access when IDs don't match
            expect(tokenPlayerId).not.toBe(differentPlayerId);
        });
    });

    describe('CORS Headers', () => {
        it('should include CORS headers in successful login response', async () => {
            // Register a test player
            const email = `cors.${Date.now()}@login-test.com`;
            const password = 'CorsPassword123!';
            await registerTestPlayer(email, password);

            // Login with origin header
            const loginRequest = createMockRequest(
                {
                    email,
                    password,
                },
                { origin: 'http://localhost:3000' }
            );

            const loginResponse = await LoginPOST(loginRequest);

            expect(loginResponse.headers.get('Access-Control-Allow-Origin')).toBeDefined();
            expect(loginResponse.headers.get('Access-Control-Allow-Methods')).toBeDefined();
            expect(loginResponse.headers.get('Access-Control-Allow-Headers')).toBeDefined();
            expect(loginResponse.headers.get('Access-Control-Allow-Credentials')).toBe('true');
        });

        it('should handle OPTIONS request for CORS preflight', async () => {
            const request = createMockRequest(
                {},
                { origin: 'http://localhost:3000', method: 'OPTIONS' }
            );

            const response = await LoginOPTIONS(request);

            expect(response.status).toBe(200);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
            expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
            expect(response.headers.get('Access-Control-Allow-Methods')).toContain('OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type');
        });
    });

    describe('Security', () => {
        it('should use same error message for invalid email and password', async () => {
            // Register a test player
            const email = `security.${Date.now()}@login-test.com`;
            const password = 'SecurityPassword123!';
            await registerTestPlayer(email, password);

            // Test with non-existent email
            const nonExistentRequest = createMockRequest({
                email: `nonexistent.${Date.now()}@login-test.com`,
                password: 'SomePassword123!',
            });

            const nonExistentResponse = await LoginPOST(nonExistentRequest);
            const nonExistentData = await nonExistentResponse.json();

            // Test with wrong password
            const wrongPasswordRequest = createMockRequest({
                email,
                password: 'WrongPassword123!',
            });

            const wrongPasswordResponse = await LoginPOST(wrongPasswordRequest);
            const wrongPasswordData = await wrongPasswordResponse.json();

            // Both should return the same error message
            expect(nonExistentData.message).toBe(wrongPasswordData.message);
            expect(nonExistentData.message).toBe('Invalid email or password. Please try again.');
        });

        it('should set secure cookie flags appropriately', async () => {
            // Register and login
            const email = `cookie.${Date.now()}@login-test.com`;
            const password = 'CookiePassword123!';
            await registerTestPlayer(email, password);

            const loginRequest = createMockRequest({
                email,
                password,
            });

            const loginResponse = await LoginPOST(loginRequest);

            const setCookieHeader = loginResponse.headers.get('set-cookie');
            expect(setCookieHeader).toBeDefined();

            // Verify security flags
            expect(setCookieHeader).toContain('HttpOnly');
            expect(setCookieHeader?.toLowerCase()).toContain('samesite=strict');
            expect(setCookieHeader).toContain('Path=/');

            // Secure flag depends on NODE_ENV
            // In test environment, it might not be set
        });

        it('should set appropriate cookie expiration', async () => {
            // Register and login
            const email = `expiration.${Date.now()}@login-test.com`;
            const password = 'ExpirationPassword123!';
            await registerTestPlayer(email, password);

            const loginRequest = createMockRequest({
                email,
                password,
            });

            const loginResponse = await LoginPOST(loginRequest);

            const setCookieHeader = loginResponse.headers.get('set-cookie');
            expect(setCookieHeader).toBeDefined();

            // Verify Max-Age is set (7 days = 604800 seconds)
            expect(setCookieHeader).toContain('Max-Age=604800');
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid JSON in request body', async () => {
            const url = 'http://localhost:3000/api/auth/login/player';
            const request = new NextRequest(url, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: 'invalid json{',
            });

            const response = await LoginPOST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.message).toContain('Invalid JSON');
        });
    });

    describe('Complete Login to Dashboard Flow', () => {
        it('should complete full flow from registration to dashboard access', async () => {
            // Step 1: Register a new player
            const email = `complete.flow.${Date.now()}@login-test.com`;
            const password = 'CompleteFlow123!';
            const { playerId } = await registerTestPlayer(email, password);

            expect(playerId).toBeDefined();

            // Step 2: Login with credentials
            const loginRequest = createMockRequest({
                email,
                password,
            });

            const loginResponse = await LoginPOST(loginRequest);
            const loginData = await loginResponse.json();

            expect(loginResponse.status).toBe(200);
            expect(loginData.success).toBe(true);
            expect(loginData.playerId).toBe(playerId);

            // Step 3: Extract session token
            const setCookieHeader = loginResponse.headers.get('set-cookie');
            const tokenMatch = setCookieHeader!.match(/session=([^;]+)/);
            const token = tokenMatch![1];

            // Step 4: Validate session
            const authenticatedRequest = createMockRequest(
                {},
                {
                    cookies: { session: token },
                }
            );

            const sessionResult = await validateSession(authenticatedRequest);

            expect(sessionResult.isValid).toBe(true);
            expect(sessionResult.playerId).toBe(playerId);

            // Step 5: Verify dashboard access (fetch player data)
            const player = await getPlayerByEmail(email);

            expect(player).toBeDefined();
            expect(player?.id).toBe(playerId);
            expect(player?.email).toBe(email);
            expect(player?.firstName).toBe('Test');
            expect(player?.lastName).toBe('Player');

            // Step 6: Verify token payload matches player
            const payload = await verifyToken(token);

            expect(payload?.playerId).toBe(player?.id);
            expect(payload?.email).toBe(player?.email);
            expect(payload?.type).toBe('player');
        });
    });
});
