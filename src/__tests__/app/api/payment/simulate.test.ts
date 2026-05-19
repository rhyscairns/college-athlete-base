/**
 * @jest-environment node
 *
 * Unit tests for POST /api/payment/simulate
 * Requirements: 3.13
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/payment/simulate/route';

// Mock environment utility
jest.mock('@/lib/environment', () => ({
    isCloudEnvironment: jest.fn(),
}));

// Mock DB client
jest.mock('@/authentication/db/client', () => ({
    query: jest.fn(),
}));

import { isCloudEnvironment } from '@/lib/environment';
import { query } from '@/authentication/db/client';

const mockIsCloudEnvironment = isCloudEnvironment as jest.MockedFunction<typeof isCloudEnvironment>;
const mockQuery = query as jest.MockedFunction<typeof query>;

function makeRequest(body: unknown): NextRequest {
    return new NextRequest('http://localhost/api/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

describe('POST /api/payment/simulate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('cloud environment blocking', () => {
        it('returns 403 when RUNTIME_ENV=development', async () => {
            mockIsCloudEnvironment.mockReturnValue(true);

            const res = await POST(makeRequest({ playerId: 'player-123' }));
            const data = await res.json();

            expect(res.status).toBe(403);
            expect(data.success).toBe(false);
            expect(data.message).toMatch(/local development/i);
        });

        it('returns 403 when RUNTIME_ENV=production', async () => {
            mockIsCloudEnvironment.mockReturnValue(true);

            const res = await POST(makeRequest({ playerId: 'player-123' }));

            expect(res.status).toBe(403);
        });

        it('does NOT call the database in cloud environments', async () => {
            mockIsCloudEnvironment.mockReturnValue(true);

            await POST(makeRequest({ playerId: 'player-123' }));

            expect(mockQuery).not.toHaveBeenCalled();
        });
    });

    describe('local environment', () => {
        beforeEach(() => {
            mockIsCloudEnvironment.mockReturnValue(false);
        });

        it('returns 400 when playerId is missing', async () => {
            const res = await POST(makeRequest({}));
            const data = await res.json();

            expect(res.status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('returns 400 when playerId is not a string', async () => {
            const res = await POST(makeRequest({ playerId: 42 }));

            expect(res.status).toBe(400);
        });

        it('returns 400 for invalid JSON body', async () => {
            const req = new NextRequest('http://localhost/api/payment/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: 'not-json',
            });
            const res = await POST(req);

            expect(res.status).toBe(400);
        });

        it('sets is_cab_member=true and subscription_status=active for a valid player', async () => {
            mockQuery.mockResolvedValue([{ id: 'player-123' }] as any);

            const res = await POST(makeRequest({ playerId: 'player-123' }));
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.success).toBe(true);

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('is_cab_member = true'),
                ['player-123']
            );
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("subscription_status = 'active'"),
                ['player-123']
            );
        });

        it('returns 404 when player does not exist', async () => {
            mockQuery.mockResolvedValue([] as any);

            const res = await POST(makeRequest({ playerId: 'nonexistent' }));
            const data = await res.json();

            expect(res.status).toBe(404);
            expect(data.success).toBe(false);
        });

        it('returns 500 when the database throws', async () => {
            mockQuery.mockRejectedValue(new Error('DB connection failed'));

            const res = await POST(makeRequest({ playerId: 'player-123' }));
            const data = await res.json();

            expect(res.status).toBe(500);
            expect(data.success).toBe(false);
        });
    });
});
