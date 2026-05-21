/**
 * @jest-environment node
 *
 * Unit tests for POST /api/payment/create-checkout-session
 * Requirements: 3.2, 3.3, 3.4
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/payment/create-checkout-session/route';

// Mock environment utility
jest.mock('@/lib/environment', () => ({
    isCloudEnvironment: jest.fn(),
}));

// Mock DB client
jest.mock('@/authentication/db/client', () => ({
    query: jest.fn(),
}));

// Hoist the session create mock so it's accessible in tests
const mockSessionCreate = jest.fn();

// Mock Stripe SDK — stripe uses `export = Stripe` (CJS), so the mock must be the constructor itself
jest.mock('stripe', () => {
    const MockStripe = jest.fn().mockImplementation(() => ({
        checkout: {
            sessions: {
                create: mockSessionCreate,
            },
        },
    }));
    return MockStripe;
});

import { isCloudEnvironment } from '@/lib/environment';
import { query } from '@/authentication/db/client';

const mockIsCloud = isCloudEnvironment as jest.MockedFunction<typeof isCloudEnvironment>;
const mockQuery = query as jest.MockedFunction<typeof query>;

const PLAYER_ROW = { id: 'player-123', stripe_customer_id: null, email: 'player@example.com' };

function makeRequest(body: unknown): NextRequest {
    return new NextRequest('http://localhost/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

describe('POST /api/payment/create-checkout-session', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = {
            ...originalEnv,
            STRIPE_SECRET_KEY: 'sk_test_abc123',
            STRIPE_MONTHLY_PRICE_ID: 'price_monthly_test',
            STRIPE_ANNUAL_PRICE_ID: 'price_annual_test',
            NEXT_PUBLIC_APP_URL: 'https://collegeathletebase-dev.com',
        };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('local environment blocking', () => {
        it('returns 403 when not in a cloud environment', async () => {
            mockIsCloud.mockReturnValue(false);

            const res = await POST(makeRequest({ playerId: 'player-123', priceType: 'monthly' }));
            const data = await res.json();

            expect(res.status).toBe(403);
            expect(data.success).toBe(false);
            expect(data.message).toMatch(/cloud environments/i);
        });

        it('does not call Stripe or DB in local environment', async () => {
            mockIsCloud.mockReturnValue(false);

            await POST(makeRequest({ playerId: 'player-123', priceType: 'monthly' }));

            expect(mockQuery).not.toHaveBeenCalled();
            expect(mockSessionCreate).not.toHaveBeenCalled();
        });
    });

    describe('cloud environment', () => {
        beforeEach(() => {
            mockIsCloud.mockReturnValue(true);
        });

        it('returns 503 when STRIPE_SECRET_KEY is not set', async () => {
            delete process.env.STRIPE_SECRET_KEY;

            const res = await POST(makeRequest({ playerId: 'player-123', priceType: 'monthly' }));
            const data = await res.json();

            expect(res.status).toBe(503);
            expect(data.success).toBe(false);
        });

        it('returns 400 for invalid JSON body', async () => {
            const req = new NextRequest('http://localhost/api/payment/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: 'not-json',
            });
            const res = await POST(req);

            expect(res.status).toBe(400);
        });

        it('returns 400 when playerId is missing', async () => {
            const res = await POST(makeRequest({ priceType: 'monthly' }));
            const data = await res.json();

            expect(res.status).toBe(400);
            expect(data.message).toMatch(/playerId/i);
        });

        it('returns 400 when priceType is invalid', async () => {
            const res = await POST(makeRequest({ playerId: 'player-123', priceType: 'weekly' }));
            const data = await res.json();

            expect(res.status).toBe(400);
            expect(data.message).toMatch(/priceType/i);
        });

        it('returns 503 when monthly price ID is not configured', async () => {
            delete process.env.STRIPE_MONTHLY_PRICE_ID;

            const res = await POST(makeRequest({ playerId: 'player-123', priceType: 'monthly' }));
            const data = await res.json();

            expect(res.status).toBe(503);
            expect(data.message).toMatch(/monthly/i);
        });

        it('returns 503 when annual price ID is not configured', async () => {
            delete process.env.STRIPE_ANNUAL_PRICE_ID;

            const res = await POST(makeRequest({ playerId: 'player-123', priceType: 'annual' }));
            const data = await res.json();

            expect(res.status).toBe(503);
            expect(data.message).toMatch(/annual/i);
        });

        it('returns 503 when NEXT_PUBLIC_APP_URL is not configured', async () => {
            delete process.env.NEXT_PUBLIC_APP_URL;

            const res = await POST(makeRequest({ playerId: 'player-123', priceType: 'monthly' }));
            const data = await res.json();

            expect(res.status).toBe(503);
        });

        it('returns 500 when DB lookup throws', async () => {
            mockQuery.mockRejectedValue(new Error('DB error'));

            const res = await POST(makeRequest({ playerId: 'player-123', priceType: 'monthly' }));
            const data = await res.json();

            expect(res.status).toBe(500);
            expect(data.success).toBe(false);
        });

        it('returns 404 when player does not exist', async () => {
            mockQuery.mockResolvedValue([] as any);

            const res = await POST(makeRequest({ playerId: 'nonexistent', priceType: 'monthly' }));
            const data = await res.json();

            expect(res.status).toBe(404);
            expect(data.success).toBe(false);
        });

        it('creates a monthly checkout session and returns the URL', async () => {
            mockQuery.mockResolvedValue([PLAYER_ROW] as any);
            mockSessionCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session_monthly' });

            const res = await POST(makeRequest({ playerId: 'player-123', priceType: 'monthly' }));
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.url).toBe('https://checkout.stripe.com/session_monthly');

            expect(mockSessionCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    mode: 'subscription',
                    line_items: [{ price: 'price_monthly_test', quantity: 1 }],
                    success_url: expect.stringContaining('/player/dashboard'),
                    cancel_url: expect.stringContaining('/player/dashboard'),
                    metadata: { playerId: 'player-123' },
                })
            );
        });

        it('creates an annual checkout session with the annual price ID', async () => {
            mockQuery.mockResolvedValue([PLAYER_ROW] as any);
            mockSessionCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session_annual' });

            const res = await POST(makeRequest({ playerId: 'player-123', priceType: 'annual' }));
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(mockSessionCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    line_items: [{ price: 'price_annual_test', quantity: 1 }],
                })
            );
        });

        it('passes existing stripe_customer_id when player already has one', async () => {
            const playerWithCustomer = { ...PLAYER_ROW, stripe_customer_id: 'cus_existing123' };
            mockQuery.mockResolvedValue([playerWithCustomer] as any);
            mockSessionCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session_existing' });

            await POST(makeRequest({ playerId: 'player-123', priceType: 'monthly' }));

            expect(mockSessionCreate).toHaveBeenCalledWith(
                expect.objectContaining({ customer: 'cus_existing123' })
            );
        });

        it('passes customer_email when player has no stripe_customer_id', async () => {
            mockQuery.mockResolvedValue([PLAYER_ROW] as any);
            mockSessionCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session_email' });

            await POST(makeRequest({ playerId: 'player-123', priceType: 'monthly' }));

            expect(mockSessionCreate).toHaveBeenCalledWith(
                expect.objectContaining({ customer_email: 'player@example.com' })
            );
        });

        it('returns 500 when Stripe throws an error', async () => {
            mockQuery.mockResolvedValue([PLAYER_ROW] as any);
            mockSessionCreate.mockRejectedValue(new Error('Stripe API error'));

            const res = await POST(makeRequest({ playerId: 'player-123', priceType: 'monthly' }));
            const data = await res.json();

            expect(res.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.message).toMatch(/Stripe API error/i);
        });
    });
});
