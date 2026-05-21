/**
 * @jest-environment node
 *
 * Integration tests for environment-aware auth routes.
 * Verifies that:
 *   - In local mode, routes handle requests directly (existing behaviour unchanged)
 *   - In cloud mode, routes proxy to the Auth Lambda
 *   - 503 is returned when the Lambda is unreachable
 *
 * Requirements: 2.1, 2.2, 2.8, 2.10
 */
import { NextRequest } from 'next/server';

// Mock DB and auth utilities so local-mode tests don't need a real DB
jest.mock('@/authentication/db/client');
jest.mock('@/authentication/db/players');
jest.mock('@/authentication/db/coaches');
jest.mock('@/authentication/utils/password');
jest.mock('@/authentication/utils/jwt');
jest.mock('@/earnings/utils/resolveReferralChain');

// Mock the auth-client module so we can control Lambda invocation
jest.mock('@/lib/auth-client', () => ({
    ...jest.requireActual('@/lib/auth-client'),
    invokeAuthLambda: jest.fn(),
    isCloudEnvironment: jest.fn(),
}));

import { invokeAuthLambda, isCloudEnvironment } from '@/lib/auth-client';
import { getPlayerByEmail } from '@/authentication/db/players';
import { getCoachByEmail } from '@/authentication/db/coaches';
import { verifyPassword } from '@/authentication/utils/password';
import { generateToken } from '@/authentication/utils/jwt';
import { resolveReferralChain } from '@/earnings/utils/resolveReferralChain';
import { checkEmailExists, createPlayer } from '@/authentication/db/players';
import { checkCoachEmailExists, createCoach } from '@/authentication/db/coaches';
import { hashPassword } from '@/authentication/utils/password';

const mockInvokeAuthLambda = invokeAuthLambda as jest.MockedFunction<typeof invokeAuthLambda>;
const mockIsCloudEnvironment = isCloudEnvironment as jest.MockedFunction<typeof isCloudEnvironment>;
const mockGetPlayerByEmail = getPlayerByEmail as jest.MockedFunction<typeof getPlayerByEmail>;
const mockGetCoachByEmail = getCoachByEmail as jest.MockedFunction<typeof getCoachByEmail>;
const mockVerifyPassword = verifyPassword as jest.MockedFunction<typeof verifyPassword>;
const mockGenerateToken = generateToken as jest.MockedFunction<typeof generateToken>;
const mockResolveReferralChain = resolveReferralChain as jest.MockedFunction<typeof resolveReferralChain>;
const mockCheckEmailExists = checkEmailExists as jest.MockedFunction<typeof checkEmailExists>;
const mockCreatePlayer = createPlayer as jest.MockedFunction<typeof createPlayer>;
const mockCheckCoachEmailExists = checkCoachEmailExists as jest.MockedFunction<typeof checkCoachEmailExists>;
const mockCreateCoach = createCoach as jest.MockedFunction<typeof createCoach>;
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;

function makeRequest(url: string, body: unknown): NextRequest {
    return new NextRequest(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', origin: 'http://localhost:3000' },
        body: JSON.stringify(body),
    });
}

function makeLambdaResponse(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
    process.env.AUTH_LAMBDA_URL = 'https://lambda.example.com';
});

afterEach(() => {
    delete process.env.JWT_SECRET;
    delete process.env.ALLOWED_ORIGINS;
    delete process.env.AUTH_LAMBDA_URL;
});

// ─── Player Login ────────────────────────────────────────────────────────────

describe('POST /api/auth/login/player', () => {
    let POST: (req: NextRequest) => Promise<Response>;

    beforeEach(async () => {
        ({ POST } = await import('@/app/api/auth/login/player/route'));
    });

    describe('local mode', () => {
        beforeEach(() => mockIsCloudEnvironment.mockReturnValue(false));

        it('handles login directly without calling Lambda', async () => {
            mockGetPlayerByEmail.mockResolvedValueOnce({
                id: 'player-1', email: 'p@test.com', passwordHash: 'hash',
            } as any);
            mockVerifyPassword.mockResolvedValueOnce(true);
            mockGenerateToken.mockResolvedValueOnce('local-token');

            const res = await POST(makeRequest('http://localhost/api/auth/login/player', { email: 'p@test.com', password: 'Password1!' }));
            expect(res.status).toBe(200);
            expect(mockInvokeAuthLambda).not.toHaveBeenCalled();
        });
    });

    describe('cloud mode', () => {
        beforeEach(() => mockIsCloudEnvironment.mockReturnValue(true));

        it('proxies to Lambda and returns its response', async () => {
            mockInvokeAuthLambda.mockResolvedValueOnce(
                makeLambdaResponse(200, { success: true, playerId: 'p-1', token: 'lambda-token' })
            );

            const res = await POST(makeRequest('http://localhost/api/auth/login/player', { email: 'p@test.com', password: 'Password1!' }));
            expect(res.status).toBe(200);
            const body = await res.json();
            expect(body.playerId).toBe('p-1');
            expect(mockInvokeAuthLambda).toHaveBeenCalledWith('/auth/login/player', expect.any(Object));
        });

        it('returns 503 when Lambda is unreachable', async () => {
            mockInvokeAuthLambda.mockRejectedValueOnce(new Error('Network error'));

            const res = await POST(makeRequest('http://localhost/api/auth/login/player', { email: 'p@test.com', password: 'Password1!' }));
            expect(res.status).toBe(503);
            const body = await res.json();
            expect(body.message).toBe('Service temporarily unavailable');
        });

        it('passes through 401 from Lambda', async () => {
            mockInvokeAuthLambda.mockResolvedValueOnce(
                makeLambdaResponse(401, { success: false, message: 'Invalid email or password. Please try again.' })
            );

            const res = await POST(makeRequest('http://localhost/api/auth/login/player', { email: 'p@test.com', password: 'WrongPass1!' }));
            expect(res.status).toBe(401);
        });
    });
});

// ─── Coach Login ─────────────────────────────────────────────────────────────

describe('POST /api/auth/login/coach', () => {
    let POST: (req: NextRequest) => Promise<Response>;

    beforeEach(async () => {
        ({ POST } = await import('@/app/api/auth/login/coach/route'));
    });

    describe('local mode', () => {
        beforeEach(() => mockIsCloudEnvironment.mockReturnValue(false));

        it('handles login directly without calling Lambda', async () => {
            mockGetCoachByEmail.mockResolvedValueOnce({
                id: 'coach-1', email: 'c@test.com', passwordHash: 'hash',
            } as any);
            mockVerifyPassword.mockResolvedValueOnce(true);
            mockGenerateToken.mockResolvedValueOnce('local-coach-token');

            const res = await POST(makeRequest('http://localhost/api/auth/login/coach', { email: 'c@test.com', password: 'Password1!' }));
            expect(res.status).toBe(200);
            expect(mockInvokeAuthLambda).not.toHaveBeenCalled();
        });
    });

    describe('cloud mode', () => {
        beforeEach(() => mockIsCloudEnvironment.mockReturnValue(true));

        it('proxies to Lambda', async () => {
            mockInvokeAuthLambda.mockResolvedValueOnce(
                makeLambdaResponse(200, { success: true, coachId: 'c-1', token: 'lambda-coach-token' })
            );

            const res = await POST(makeRequest('http://localhost/api/auth/login/coach', { email: 'c@test.com', password: 'Password1!' }));
            expect(res.status).toBe(200);
            expect(mockInvokeAuthLambda).toHaveBeenCalledWith('/auth/login/coach', expect.any(Object));
        });

        it('returns 503 when Lambda is unreachable', async () => {
            mockInvokeAuthLambda.mockRejectedValueOnce(new Error('Network error'));

            const res = await POST(makeRequest('http://localhost/api/auth/login/coach', { email: 'c@test.com', password: 'Password1!' }));
            expect(res.status).toBe(503);
        });
    });
});

// ─── Player Registration ─────────────────────────────────────────────────────

describe('POST /api/auth/register/player', () => {
    let POST: (req: NextRequest) => Promise<Response>;

    beforeEach(async () => {
        ({ POST } = await import('@/app/api/auth/register/player/route'));
    });

    describe('local mode', () => {
        beforeEach(() => mockIsCloudEnvironment.mockReturnValue(false));

        it('creates player directly without calling Lambda', async () => {
            mockCheckEmailExists.mockResolvedValueOnce(false);
            mockHashPassword.mockResolvedValueOnce('hashed');
            mockResolveReferralChain.mockResolvedValueOnce(null);
            mockCreatePlayer.mockResolvedValueOnce('new-player-id');

            const res = await POST(makeRequest('http://localhost/api/auth/register/player', {
                firstName: 'John', lastName: 'Doe', dateOfBirth: '2000-01-01',
                email: 'john@test.com', password: 'Password1!', sex: 'male',
                sport: 'Soccer', gpa: 3.5, country: 'UK', region: 'London',
            }));
            expect(res.status).toBe(201);
            expect(mockInvokeAuthLambda).not.toHaveBeenCalled();
        });
    });

    describe('cloud mode', () => {
        beforeEach(() => mockIsCloudEnvironment.mockReturnValue(true));

        it('proxies to Lambda', async () => {
            mockInvokeAuthLambda.mockResolvedValueOnce(
                makeLambdaResponse(201, { success: true, playerId: 'new-player-id' })
            );

            const res = await POST(makeRequest('http://localhost/api/auth/register/player', { email: 'john@test.com' }));
            expect(res.status).toBe(201);
            expect(mockInvokeAuthLambda).toHaveBeenCalledWith('/auth/register/player', expect.any(Object));
        });

        it('returns 503 when Lambda is unreachable', async () => {
            mockInvokeAuthLambda.mockRejectedValueOnce(new Error('Network error'));

            const res = await POST(makeRequest('http://localhost/api/auth/register/player', {}));
            expect(res.status).toBe(503);
        });
    });
});

// ─── Coach Registration ───────────────────────────────────────────────────────

describe('POST /api/auth/register/coach', () => {
    let POST: (req: NextRequest) => Promise<Response>;

    beforeEach(async () => {
        ({ POST } = await import('@/app/api/auth/register/coach/route'));
    });

    describe('local mode', () => {
        beforeEach(() => mockIsCloudEnvironment.mockReturnValue(false));

        it('creates coach directly without calling Lambda', async () => {
            mockCheckCoachEmailExists.mockResolvedValueOnce(false);
            mockHashPassword.mockResolvedValueOnce('hashed');
            mockResolveReferralChain.mockResolvedValueOnce(null);
            mockCreateCoach.mockResolvedValueOnce('new-coach-id');

            const res = await POST(makeRequest('http://localhost/api/auth/register/coach', {
                firstName: 'Jane', lastName: 'Smith', email: 'jane@uni.edu',
                password: 'Password1!', coachingCategory: 'collegiate',
                sports: ['Soccer'], university: 'State University',
            }));
            expect(res.status).toBe(201);
            expect(mockInvokeAuthLambda).not.toHaveBeenCalled();
        });
    });

    describe('cloud mode', () => {
        beforeEach(() => mockIsCloudEnvironment.mockReturnValue(true));

        it('proxies to Lambda', async () => {
            mockInvokeAuthLambda.mockResolvedValueOnce(
                makeLambdaResponse(201, { success: true, coachId: 'new-coach-id' })
            );

            const res = await POST(makeRequest('http://localhost/api/auth/register/coach', { email: 'jane@uni.edu' }));
            expect(res.status).toBe(201);
            expect(mockInvokeAuthLambda).toHaveBeenCalledWith('/auth/register/coach', expect.any(Object));
        });

        it('returns 503 when Lambda is unreachable', async () => {
            mockInvokeAuthLambda.mockRejectedValueOnce(new Error('Network error'));

            const res = await POST(makeRequest('http://localhost/api/auth/register/coach', {}));
            expect(res.status).toBe(503);
        });
    });
});
