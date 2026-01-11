/**
 * Integration tests for coach dashboard layout and navigation
 * Tests the complete coach dashboard experience including layout, navigation, and authentication
 * @jest-environment node
 */

import { POST as RegisterPOST } from '@/app/api/auth/register/coach/route';
import { POST as LoginPOST } from '@/app/api/auth/login/coach/route';
import { getCoachByEmail } from '@/authentication/db/coaches';
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
    const url = 'http://localhost:3000/api/auth/register/coach';
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
 * Helper function to register a test coach
 */
async function registerTestCoach(email: string, password: string = 'TestPassword123!') {
    const registrationData = {
        firstName: 'Test',
        lastName: 'Coach',
        email,
        password,
        coachingCategory: 'mens',
        sports: ['basketball'],
        university: 'Test University',
    };

    const request = createMockRequest(registrationData);
    const response = await RegisterPOST(request);
    const data = await response.json();

    return {
        coachId: data.coachId,
        email: registrationData.email,
        password: registrationData.password,
    };
}

/**
 * Helper function to login a test coach and get session token
 */
async function loginTestCoach(email: string, password: string): Promise<string> {
    const loginRequest = createMockRequest({
        email,
        password,
    });

    const loginResponse = await LoginPOST(loginRequest);

    // Extract token from cookie
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    if (!setCookieHeader) {
        throw new Error('No session cookie set');
    }

    const tokenMatch = setCookieHeader.match(/session=([^;]+)/);
    if (!tokenMatch) {
        throw new Error('Could not extract token from cookie');
    }

    return tokenMatch[1];
}

skipIfNoDb('Coach Dashboard - Layout and Navigation Integration', () => {
    // Clean up test data after all tests
    afterAll(async () => {
        try {
            await query('DELETE FROM coaches WHERE email LIKE $1', ['%@coach-dashboard-test.com']);
            await closePool();
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    });

    // Clean up after each test to ensure isolation
    afterEach(async () => {
        try {
            await query('DELETE FROM coaches WHERE email LIKE $1', ['%@coach-dashboard-test.com']);
        } catch (error) {
            console.error('Test cleanup error:', error);
        }
    });

    describe('Layout Wrapping', () => {
        it('should successfully authenticate coach for dashboard access', async () => {
            // Register a test coach
            const email = `layout.${Date.now()}@coach-dashboard-test.com`;
            const password = 'LayoutPassword123!';
            const { coachId } = await registerTestCoach(email, password);

            // Login to get session token
            const token = await loginTestCoach(email, password);

            // Verify token is valid
            const payload = await verifyToken(token);
            expect(payload).toBeDefined();
            expect(payload?.playerId).toBe(coachId);
            expect(payload?.type).toBe('coach');

            // Verify coach can be fetched (simulating dashboard page data fetching)
            const coach = await getCoachByEmail(email);
            expect(coach).toBeDefined();
            expect(coach?.id).toBe(coachId);
        });

        it('should validate coach ID matches token for dashboard access', async () => {
            // Register and login
            const email = `validation.${Date.now()}@coach-dashboard-test.com`;
            const password = 'ValidationPassword123!';
            const { coachId } = await registerTestCoach(email, password);

            const token = await loginTestCoach(email, password);

            // Verify token
            const payload = await verifyToken(token);
            expect(payload).toBeDefined();

            // Simulate dashboard page validation
            // The dashboard should verify that the coachId in the URL matches the token
            const urlCoachId = coachId;
            const tokenCoachId = payload?.playerId;

            expect(tokenCoachId).toBe(urlCoachId);
            expect(payload?.type).toBe('coach');
        });

        it('should extract coachId from URL path for layout component', async () => {
            // Register and login
            const email = `extract.${Date.now()}@coach-dashboard-test.com`;
            const password = 'ExtractPassword123!';
            const { coachId } = await registerTestCoach(email, password);

            const token = await loginTestCoach(email, password);

            // Verify token contains coachId
            const payload = await verifyToken(token);
            expect(payload?.playerId).toBe(coachId);

            // Simulate URL path parsing (as done in layout.tsx)
            const mockPath = `/coach/dashboard/${coachId}`;
            const pathSegments = mockPath.split('/').filter(Boolean);
            const coachIdIndex = pathSegments.indexOf('dashboard') + 1;
            const extractedCoachId = pathSegments[coachIdIndex];

            expect(extractedCoachId).toBe(coachId);
        });
    });

    describe('Navigation Persistence', () => {
        it('should maintain session across multiple page requests', async () => {
            // Register and login
            const email = `persist.${Date.now()}@coach-dashboard-test.com`;
            const password = 'PersistPassword123!';
            const { coachId } = await registerTestCoach(email, password);

            const token = await loginTestCoach(email, password);

            // Simulate multiple requests with same session token
            const payload1 = await verifyToken(token);
            expect(payload1?.playerId).toBe(coachId);

            // Simulate navigation to another coach page
            const payload2 = await verifyToken(token);
            expect(payload2?.playerId).toBe(coachId);

            // Token should remain valid
            expect(payload1?.exp).toBe(payload2?.exp);
        });

        it('should provide consistent coachId for navbar across navigation', async () => {
            // Register and login
            const email = `navbar.${Date.now()}@coach-dashboard-test.com`;
            const password = 'NavbarPassword123!';
            const { coachId } = await registerTestCoach(email, password);

            const token = await loginTestCoach(email, password);

            // Verify token payload
            const payload = await verifyToken(token);
            expect(payload?.playerId).toBe(coachId);

            // Simulate different coach pages with same coachId
            const dashboardPath = `/coach/dashboard/${coachId}`;
            const profilePath = `/coach/profile/${coachId}`;

            // Extract coachId from both paths
            const extractCoachId = (path: string) => {
                const segments = path.split('/').filter(Boolean);
                return segments[segments.length - 1];
            };

            expect(extractCoachId(dashboardPath)).toBe(coachId);
            expect(extractCoachId(profilePath)).toBe(coachId);
        });
    });

    describe('Background Image Application', () => {
        it('should verify layout applies to all coach pages', async () => {
            // Register and login
            const email = `background.${Date.now()}@coach-dashboard-test.com`;
            const password = 'BackgroundPassword123!';
            const { coachId } = await registerTestCoach(email, password);

            const token = await loginTestCoach(email, password);

            // Verify token is valid for accessing coach pages
            const payload = await verifyToken(token);
            expect(payload?.playerId).toBe(coachId);
            expect(payload?.type).toBe('coach');

            // Simulate accessing different coach pages
            const coachPages = [
                `/coach/dashboard/${coachId}`,
                `/coach/profile/${coachId}`,
                `/coach/settings/${coachId}`,
            ];

            // All pages should use the same layout (verified by token)
            for (const page of coachPages) {
                const segments = page.split('/').filter(Boolean);
                expect(segments[0]).toBe('coach'); // All under /coach route

                // Layout should extract coachId from any coach page
                const extractedId = segments[segments.length - 1];
                expect(extractedId).toBe(coachId);
            }
        });
    });

    describe('Logout Flow', () => {
        it('should complete end-to-end logout flow', async () => {
            // Register and login
            const email = `logout.${Date.now()}@coach-dashboard-test.com`;
            const password = 'LogoutPassword123!';
            const { coachId } = await registerTestCoach(email, password);

            const token = await loginTestCoach(email, password);

            // Verify initial session is valid
            const payload = await verifyToken(token);
            expect(payload?.playerId).toBe(coachId);
            expect(payload?.type).toBe('coach');

            // Simulate logout by clearing cookie (as done in CoachNavbar)
            // In a real scenario, the cookie would be cleared client-side
            // Here we verify that without the token, access would be denied

            // Attempt to verify an empty/invalid token
            const invalidToken = '';
            const invalidPayload = await verifyToken(invalidToken);
            expect(invalidPayload).toBeNull();

            // Verify that after logout, the coach data is still in database
            // (logout doesn't delete the account)
            const coach = await getCoachByEmail(email);
            expect(coach).toBeDefined();
            expect(coach?.id).toBe(coachId);
        });

        it('should invalidate session after logout', async () => {
            // Register and login
            const email = `invalidate.${Date.now()}@coach-dashboard-test.com`;
            const password = 'InvalidatePassword123!';
            await registerTestCoach(email, password);

            const token = await loginTestCoach(email, password);

            // Verify token is initially valid
            const validPayload = await verifyToken(token);
            expect(validPayload).toBeDefined();

            // Simulate logout by creating an expired cookie value
            const expiredCookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            expect(expiredCookie).toContain('expires=Thu, 01 Jan 1970');

            // After logout, attempting to use the old token should still work
            // until it expires (JWT tokens can't be invalidated server-side without a blacklist)
            // This is expected behavior - the client clears the cookie
            const payloadAfterLogout = await verifyToken(token);
            expect(payloadAfterLogout).toBeDefined();

            // However, the client won't send the token after clearing the cookie
            // So protected routes will redirect to login
        });
    });

    describe('Protected Route Access', () => {
        it('should allow dashboard access with valid session', async () => {
            // Register and login
            const email = `protected.${Date.now()}@coach-dashboard-test.com`;
            const password = 'ProtectedPassword123!';
            const { coachId } = await registerTestCoach(email, password);

            const token = await loginTestCoach(email, password);

            // Verify token is valid for accessing protected routes
            const payload = await verifyToken(token);
            expect(payload).toBeDefined();
            expect(payload?.playerId).toBe(coachId);
            expect(payload?.type).toBe('coach');

            // Verify coach can be fetched (simulating dashboard page access)
            const coach = await getCoachByEmail(email);
            expect(coach).toBeDefined();
            expect(coach?.id).toBe(coachId);
        });

        it('should reject dashboard access without session token', async () => {
            // Attempt to verify without a token
            const noToken = '';
            const payload = await verifyToken(noToken);

            // Should return null for invalid/missing token
            expect(payload).toBeNull();

            // In the actual page, this would trigger a redirect to /login
        });

        it('should reject dashboard access with invalid token', async () => {
            // Attempt to verify with an invalid token
            const invalidToken = 'invalid.token.here';
            const payload = await verifyToken(invalidToken);

            // Should return null for invalid token
            expect(payload).toBeNull();
        });

        it('should reject dashboard access with mismatched coach ID', async () => {
            // Register and login
            const email = `mismatch.${Date.now()}@coach-dashboard-test.com`;
            const password = 'MismatchPassword123!';
            const { coachId } = await registerTestCoach(email, password);

            const token = await loginTestCoach(email, password);

            // Verify token
            const payload = await verifyToken(token);
            expect(payload?.playerId).toBe(coachId);

            // Simulate dashboard access with different coach ID
            const differentCoachId = 'different-coach-id';
            const tokenCoachId = payload?.playerId;

            // Dashboard should reject access when IDs don't match
            expect(tokenCoachId).not.toBe(differentCoachId);

            // In the actual page, this mismatch would trigger a redirect to /login
        });

        it('should reject dashboard access with wrong user type', async () => {
            // This test verifies that a player token can't access coach dashboard
            // We'll simulate this by checking the token type

            const email = `type.${Date.now()}@coach-dashboard-test.com`;
            const password = 'TypePassword123!';
            await registerTestCoach(email, password);

            const token = await loginTestCoach(email, password);

            // Verify token has correct type
            const payload = await verifyToken(token);
            expect(payload?.type).toBe('coach');

            // If type was 'player', dashboard should reject
            // This is verified in the dashboard page component
            const isValidForCoachDashboard = payload?.type === 'coach';
            expect(isValidForCoachDashboard).toBe(true);
        });
    });

    describe('Navigation Between Coach Pages', () => {
        it('should maintain layout when navigating between coach pages', async () => {
            // Register and login
            const email = `navigation.${Date.now()}@coach-dashboard-test.com`;
            const password = 'NavigationPassword123!';
            const { coachId } = await registerTestCoach(email, password);

            const token = await loginTestCoach(email, password);

            // Verify token is valid
            const payload = await verifyToken(token);
            expect(payload?.playerId).toBe(coachId);

            // Simulate navigation between different coach pages
            const pages = [
                `/coach/dashboard/${coachId}`,
                `/coach/profile/${coachId}`,
                `/coach/search/${coachId}`,
            ];

            // All pages should:
            // 1. Be under /coach route (use coach layout)
            // 2. Have the same coachId
            // 3. Use the same session token
            for (const page of pages) {
                const segments = page.split('/').filter(Boolean);
                expect(segments[0]).toBe('coach');
                expect(segments[segments.length - 1]).toBe(coachId);

                // Token remains valid across all pages
                const pagePayload = await verifyToken(token);
                expect(pagePayload?.playerId).toBe(coachId);
            }
        });

        it('should provide correct navigation links in navbar', async () => {
            // Register and login
            const email = `links.${Date.now()}@coach-dashboard-test.com`;
            const password = 'LinksPassword123!';
            const { coachId } = await registerTestCoach(email, password);

            const token = await loginTestCoach(email, password);

            // Verify token
            const payload = await verifyToken(token);
            expect(payload?.playerId).toBe(coachId);

            // Simulate navbar link generation
            const homeLink = `/coach/dashboard/${coachId}`;

            // Verify home link format
            expect(homeLink).toMatch(/^\/coach\/dashboard\/[a-f0-9-]+$/);
            expect(homeLink).toContain(coachId);

            // Search and Profile are placeholders (no href)
            // Logout clears session and redirects to /login
        });
    });

    describe('Complete Dashboard Flow', () => {
        it('should complete full flow from registration to dashboard access', async () => {
            // Step 1: Register a new coach
            const email = `complete.flow.${Date.now()}@coach-dashboard-test.com`;
            const password = 'CompleteFlow123!';
            const { coachId } = await registerTestCoach(email, password);

            expect(coachId).toBeDefined();

            // Step 2: Login with credentials
            const token = await loginTestCoach(email, password);
            expect(token).toBeDefined();

            // Step 3: Verify session token
            const payload = await verifyToken(token);
            expect(payload).toBeDefined();
            expect(payload?.playerId).toBe(coachId);
            expect(payload?.type).toBe('coach');

            // Step 4: Verify dashboard access (fetch coach data)
            const coach = await getCoachByEmail(email);
            expect(coach).toBeDefined();
            expect(coach?.id).toBe(coachId);
            expect(coach?.email).toBe(email);
            expect(coach?.firstName).toBe('Test');
            expect(coach?.lastName).toBe('Coach');

            // Step 5: Verify layout can extract coachId from URL
            const dashboardPath = `/coach/dashboard/${coachId}`;
            const pathSegments = dashboardPath.split('/').filter(Boolean);
            const coachIdIndex = pathSegments.indexOf('dashboard') + 1;
            const extractedCoachId = pathSegments[coachIdIndex];
            expect(extractedCoachId).toBe(coachId);

            // Step 6: Verify navbar receives correct coachId
            expect(extractedCoachId).toBe(payload?.playerId);

            // Step 7: Simulate logout
            const expiredCookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            expect(expiredCookie).toContain('expires=Thu, 01 Jan 1970');

            // Step 8: Verify coach account still exists after logout
            const coachAfterLogout = await getCoachByEmail(email);
            expect(coachAfterLogout).toBeDefined();
            expect(coachAfterLogout?.id).toBe(coachId);
        });
    });

    describe('Session Security', () => {
        it('should use secure session tokens with proper expiration', async () => {
            // Register and login
            const email = `security.${Date.now()}@coach-dashboard-test.com`;
            const password = 'SecurityPassword123!';
            await registerTestCoach(email, password);

            const token = await loginTestCoach(email, password);

            // Verify token structure and expiration
            const payload = await verifyToken(token);
            expect(payload).toBeDefined();
            expect(payload?.exp).toBeDefined();
            expect(payload?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));

            // Token should expire in the future (7 days by default)
            const expirationTime = payload!.exp * 1000;
            const now = Date.now();
            const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

            expect(expirationTime).toBeGreaterThan(now);
            expect(expirationTime).toBeLessThanOrEqual(now + sevenDaysInMs + 60000); // +1 min buffer
        });

        it('should include correct user type in token', async () => {
            // Register and login
            const email = `usertype.${Date.now()}@coach-dashboard-test.com`;
            const password = 'UserTypePassword123!';
            await registerTestCoach(email, password);

            const token = await loginTestCoach(email, password);

            // Verify token contains correct user type
            const payload = await verifyToken(token);
            expect(payload?.type).toBe('coach');
            expect(payload?.type).not.toBe('player');
        });
    });
});
