/**
 * @jest-environment node
 *
 * Unit tests for POST /api/payment/cancel-subscription
 * Requirements: 3.9
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/payment/cancel-subscription/route';

// Mock environment utility
jest.mock('@/lib/environment', () => ({
    isCloudEnvironment: jest.fn(),
}));

// Mock DB client
jest.mock('@/authentication/db/client', () => ({
    query: jest.fn(),
}));

// Hoist the subscriptions update mock so it's accessible in tests
const mockSubscriptionsUpdate = jest.fn();

// Mock Stripe SDK — stripe uses `export = Stripe` (CJS), so the mock must be the constructor itself
jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        subscriptions: {
            update: mockSubscriptionsUpdate,
        },
    }));
});

import { isCloudEnvironment } from '@/lib/environment';
import { query } from '@/authentication/db/client';

const mockIsCloud = isCloudEnvironment as jest.MockedFunction<typeof isCloudEnvironment>;
const mockQuery = query as jest.MockedFunction<typeof query>;

const PLAYER_ROW = {
    id: 'player-123',
    stripe_subscription_id: 'sub_abc123',
    subscription_status: 'active',
};

function makeRequest(body: unknown): NextRequest {
    return new NextRequest('http://localhost/api/payment/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

describe('POST /api/payment/cancel-subscription', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = {
            ...originalEnv,
            STRIPE_SECRET_KEY: 'sk_test_abc123',
        };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('local environment blocking', () => {
        it('returns 403 when not in a cloud environment', async () => {
            mockIsCloud.mockReturnValue(false);

            const res = await POST(makeRequest({ playerId: 'player-123' }));
            const data = await res.json();

            expect(res.status).toBe(403);
            expect(data.success).toBe(false);
            expect(data.message).toMatch(/cloud environments/i);
        });

        it('does not call Stripe or DB in local environment', async () => {
            mockIsCloud.mockReturnValue(false);

            await POST(makeRequest({ playerId: 'player-123' }));

            expect(mockQuery).not.toHaveBeenCalled();
            expect(mockSubscriptionsUpdate).not.toHaveBeenCalled();
        });
    });

    describe('cloud environment', () => {
        beforeEach(() => {
            mockIsCloud.mockReturnValue(true);
        });

        it('returns 503 when STRIPE_SECRET_KEY is not set', async () => {
            delete process.env.STRIPE_SECRET_KEY;

            const res = await POST(makeRequest({ playerId: 'player-123' }));
            const data = await res.json();

            expect(res.status).toBe(503);
            expect(data.success).toBe(false);
        });

        it('returns 400 for invalid JSON body', async () => {
            const req = new NextRequest('http://localhost/api/payment/cancel-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: 'not-json',
            });
            const res = await POST(req);

            expect(res.status).toBe(400);
        });

        it('returns 400 when playerId is missing', async () => {
            const res = await POST(makeRequest({}));
            const data = await res.json();

            expect(res.status).toBe(400);
            expect(data.message).toMatch(/playerId/i);
        });

        it('returns 400 when playerId is not a string', async () => {
            const res = await POST(makeRequest({ playerId: 42 }));

            expect(res.status).toBe(400);
        });

        it('returns 500 when DB lookup throws', async () => {
            mockQuery.mockRejectedValue(new Error('DB error'));

            const res = await POST(makeRequest({ playerId: 'player-123' }));
            const data = await res.json();

            expect(res.status).toBe(500);
            expect(data.success).toBe(false);
        });

        it('returns 404 when player does not exist', async () => {
            mockQuery.mockResolvedValue([] as any);

            const res = await POST(makeRequest({ playerId: 'nonexistent' }));
            const data = await res.json();

            expect(res.status).toBe(404);
            expect(data.success).toBe(false);
        });

        it('returns 422 when player has no stripe_subscription_id', async () => {
            mockQuery.mockResolvedValue([{ ...PLAYER_ROW, stripe_subscription_id: null }] as any);

            const res = await POST(makeRequest({ playerId: 'player-123' }));
            const data = await res.json();

            expect(res.status).toBe(422);
            expect(data.success).toBe(false);
            expect(data.message).toMatch(/active subscription/i);
        });

        it('cancels the subscription at period end via Stripe', async () => {
            mockQuery
                .mockResolvedValueOnce([PLAYER_ROW] as any)  // SELECT
                .mockResolvedValueOnce([] as any);             // UPDATE
            mockSubscriptionsUpdate.mockResolvedValue({});

            const res = await POST(makeRequest({ playerId: 'player-123' }));
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.success).toBe(true);

            expect(mockSubscriptionsUpdate).toHaveBeenCalledWith('sub_abc123', {
                cancel_at_period_end: true,
            });
        });

        it('updates subscription_status to "cancelled" in the DB', async () => {
            mockQuery
                .mockResolvedValueOnce([PLAYER_ROW] as any)
                .mockResolvedValueOnce([] as any);
            mockSubscriptionsUpdate.mockResolvedValue({});

            await POST(makeRequest({ playerId: 'player-123' }));

            const updateCall = mockQuery.mock.calls[1];
            expect(updateCall[0]).toContain("subscription_status = 'cancelled'");
            expect(updateCall[1]).toEqual(['player-123']);
        });

        it('returns 500 when Stripe throws an error', async () => {
            mockQuery.mockResolvedValueOnce([PLAYER_ROW] as any);
            mockSubscriptionsUpdate.mockRejectedValue(new Error('Stripe API error'));

            const res = await POST(makeRequest({ playerId: 'player-123' }));
            const data = await res.json();

            expect(res.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.message).toMatch(/Stripe API error/i);
        });

        it('returns 500 when DB update fails after successful Stripe cancellation', async () => {
            mockQuery
                .mockResolvedValueOnce([PLAYER_ROW] as any)   // SELECT succeeds
                .mockRejectedValueOnce(new Error('DB write failed')); // UPDATE fails
            mockSubscriptionsUpdate.mockResolvedValue({});

            const res = await POST(makeRequest({ playerId: 'player-123' }));
            const data = await res.json();

            expect(res.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.message).toMatch(/failed to update local status/i);
        });
    });
});
