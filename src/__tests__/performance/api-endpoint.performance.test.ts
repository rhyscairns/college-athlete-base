/**
 * End-to-end API endpoint performance tests
 * Tests the complete registration flow including HTTP overhead
 * 
 * Note: These tests directly call the route handler function
 * For full HTTP stack testing, use Playwright e2e tests
 * 
 * Run with: npm test -- api-endpoint.performance.test.ts
 * 
 * These tests are skipped in CI environments as they are environment-dependent
 */

import { POST } from '@/app/api/auth/register/player/route';
import { query, closePool } from '@/authentication/db/client';

// Skip performance tests in CI environments
const describePerformance = process.env.CI ? describe.skip : describe;

// Mock NextRequest for testing
class MockNextRequest {
    public url: string;
    public method: string;
    public headers: {
        get: (name: string) => string | null;
        has: (name: string) => boolean;
        entries: () => IterableIterator<[string, string]>;
    };
    private _body: string;
    private _headers: Map<string, string>;

    constructor(url: string, init?: { method?: string; headers?: Record<string, string>; body?: string }) {
        this.url = url;
        this.method = init?.method || 'GET';
        this._headers = new Map(Object.entries(init?.headers || {}));
        this._body = init?.body || '';

        // Create headers object with required methods
        this.headers = {
            get: (name: string) => this._headers.get(name.toLowerCase()) || null,
            has: (name: string) => this._headers.has(name.toLowerCase()),
            entries: () => this._headers.entries(),
        };
    }

    async json() {
        return JSON.parse(this._body);
    }

    async text() {
        return this._body;
    }
}

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
    SUCCESSFUL_REGISTRATION: 300,  // Complete registration should be < 300ms
    VALIDATION_ERROR: 50,           // Validation errors should be < 50ms
    DUPLICATE_EMAIL: 100,           // Duplicate check should be < 100ms
};

describePerformance('API Endpoint Performance Tests', () => {
    afterAll(async () => {
        // Clean up test data
        await query('DELETE FROM players WHERE email LIKE $1', ['api-perf-%@example.com']);
        await closePool();
    });

    describe('Successful Registration Performance', () => {
        it('should complete registration within threshold', async () => {
            const requestBody = {
                firstName: 'API',
                lastName: 'Performance',
                email: `api-perf-${Date.now()}@example.com`,
                password: 'Password123!',
                sex: 'male',
                sport: 'basketball',
                position: 'Guard',
                gpa: 3.5,
                country: 'USA',
                state: 'California',
            };

            const request = new MockNextRequest('http://localhost:3000/api/auth/register/player', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const startTime = Date.now();
            const response = await POST(request as any);
            const duration = Date.now() - startTime;

            expect(response.status).toBe(201);
            expect(duration).toBeLessThan(THRESHOLDS.SUCCESSFUL_REGISTRATION);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.playerId).toBeTruthy();

            console.log(`✓ Complete registration completed in ${duration}ms (threshold: ${THRESHOLDS.SUCCESSFUL_REGISTRATION}ms)`);
            console.log(`  Breakdown: validation + email check + password hash + DB insert`);
        });
    });

    describe('Validation Error Performance', () => {
        it('should return validation errors quickly', async () => {
            const requestBody = {
                firstName: 'A', // Too short
                lastName: 'Test',
                email: 'invalid-email', // Invalid format
                password: '123', // Too weak
                sex: 'male',
                sport: 'basketball',
                position: 'Guard',
                gpa: 5.0, // Out of range
                country: 'USA',
                // Missing state
            };

            const request = new MockNextRequest('http://localhost:3000/api/auth/register/player', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const startTime = Date.now();
            const response = await POST(request as any);
            const duration = Date.now() - startTime;

            expect(response.status).toBe(400);
            expect(duration).toBeLessThan(THRESHOLDS.VALIDATION_ERROR);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.errors).toBeDefined();

            console.log(`✓ Validation error response in ${duration}ms (threshold: ${THRESHOLDS.VALIDATION_ERROR}ms)`);
        });
    });

    describe('Duplicate Email Performance', () => {
        const duplicateEmail = `api-perf-duplicate-${Date.now()}@example.com`;

        it('should detect duplicate email quickly', async () => {
            // First registration
            const requestBody = {
                firstName: 'First',
                lastName: 'User',
                email: duplicateEmail,
                password: 'Password123!',
                sex: 'female',
                sport: 'soccer',
                position: 'Forward',
                gpa: 3.8,
                country: 'USA',
                state: 'Texas',
            };

            const request1 = new MockNextRequest('http://localhost:3000/api/auth/register/player', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const response1 = await POST(request1 as any);
            expect(response1.status).toBe(201);

            // Duplicate registration
            const request2 = new MockNextRequest('http://localhost:3000/api/auth/register/player', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const startTime = Date.now();
            const response2 = await POST(request2 as any);
            const duration = Date.now() - startTime;

            expect(response2.status).toBe(409);
            expect(duration).toBeLessThan(THRESHOLDS.DUPLICATE_EMAIL);

            const data = await response2.json();
            expect(data.success).toBe(false);
            expect(data.message).toContain('already registered');

            console.log(`✓ Duplicate email detection in ${duration}ms (threshold: ${THRESHOLDS.DUPLICATE_EMAIL}ms)`);
        });
    });

    describe('Concurrent API Requests', () => {
        it('should handle 10 concurrent registrations', async () => {
            const requests = Array.from({ length: 10 }, (_, i) => {
                const requestBody = {
                    firstName: 'Concurrent',
                    lastName: `User${i}`,
                    email: `api-perf-concurrent-${Date.now()}-${i}@example.com`,
                    password: 'Password123!',
                    sex: i % 2 === 0 ? 'male' : 'female',
                    sport: 'basketball',
                    position: 'Guard',
                    gpa: 3.5,
                    country: 'USA',
                    state: 'California',
                };

                return new MockNextRequest('http://localhost:3000/api/auth/register/player', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                });
            });

            const startTime = Date.now();
            const responses = await Promise.all(requests.map(req => POST(req as any)));
            const duration = Date.now() - startTime;

            const successCount = responses.filter(r => r.status === 201).length;
            expect(successCount).toBe(10);

            console.log(`✓ 10 concurrent registrations completed in ${duration}ms`);
            console.log(`  Average per request: ${(duration / 10).toFixed(2)}ms`);
            console.log(`  Requests per second: ${(10000 / duration).toFixed(2)}`);
        });

        it('should handle mixed concurrent requests (success + validation errors)', async () => {
            const validRequest = {
                firstName: 'Valid',
                lastName: 'User',
                email: `api-perf-mixed-valid-${Date.now()}@example.com`,
                password: 'Password123!',
                sex: 'male',
                sport: 'basketball',
                position: 'Guard',
                gpa: 3.5,
                country: 'USA',
                state: 'California',
            };

            const invalidRequest = {
                firstName: 'Invalid',
                lastName: 'User',
                email: 'not-an-email',
                password: '123',
                sex: 'male',
                sport: 'basketball',
                position: 'Guard',
                gpa: 5.0,
                country: 'USA',
            };

            const requests = [
                ...Array.from({ length: 5 }, () =>
                    new MockNextRequest('http://localhost:3000/api/auth/register/player', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...validRequest,
                            email: `api-perf-mixed-${Date.now()}-${Math.random()}@example.com`,
                        }),
                    })
                ),
                ...Array.from({ length: 5 }, () =>
                    new MockNextRequest('http://localhost:3000/api/auth/register/player', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(invalidRequest),
                    })
                ),
            ];

            const startTime = Date.now();
            const responses = await Promise.all(requests.map(req => POST(req as any)));
            const duration = Date.now() - startTime;

            const successCount = responses.filter(r => r.status === 201).length;
            const errorCount = responses.filter(r => r.status === 400).length;

            expect(successCount).toBe(5);
            expect(errorCount).toBe(5);

            console.log(`✓ 10 mixed concurrent requests completed in ${duration}ms`);
            console.log(`  ${successCount} successful, ${errorCount} validation errors`);
        });
    });

    describe('Response Time Statistics', () => {
        it('should measure and report response time distribution', async () => {
            const iterations = 20;
            const durations: number[] = [];

            for (let i = 0; i < iterations; i++) {
                const requestBody = {
                    firstName: 'Stats',
                    lastName: `Test${i}`,
                    email: `api-perf-stats-${Date.now()}-${i}@example.com`,
                    password: 'Password123!',
                    sex: 'male',
                    sport: 'basketball',
                    position: 'Guard',
                    gpa: 3.5,
                    country: 'USA',
                    state: 'California',
                };

                const request = new MockNextRequest('http://localhost:3000/api/auth/register/player', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                });

                const startTime = Date.now();
                await POST(request as any);
                const duration = Date.now() - startTime;
                durations.push(duration);
            }

            // Calculate statistics
            const sorted = durations.sort((a, b) => a - b);
            const min = sorted[0];
            const max = sorted[sorted.length - 1];
            const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
            const p50 = sorted[Math.floor(sorted.length * 0.5)];
            const p95 = sorted[Math.floor(sorted.length * 0.95)];
            const p99 = sorted[Math.floor(sorted.length * 0.99)];

            console.log('\n📊 Response Time Statistics (20 requests):');
            console.log(`  Min:     ${min}ms`);
            console.log(`  Max:     ${max}ms`);
            console.log(`  Average: ${avg.toFixed(2)}ms`);
            console.log(`  P50:     ${p50}ms`);
            console.log(`  P95:     ${p95}ms`);
            console.log(`  P99:     ${p99}ms`);

            // Verify P95 is within acceptable range
            expect(p95).toBeLessThan(THRESHOLDS.SUCCESSFUL_REGISTRATION * 1.5);
        });
    });
});
