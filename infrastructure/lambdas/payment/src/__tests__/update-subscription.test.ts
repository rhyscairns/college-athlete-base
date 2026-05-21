import { updatePlayerSubscription } from '../db/update-subscription';
import * as clientModule from '../db/client';

jest.mock('../db/client');
const mockQuery = clientModule.query as jest.MockedFunction<typeof clientModule.query>;

const BASE_UPDATE = {
    stripeCustomerId: 'cus_abc',
    isCABMember: true,
    subscriptionStatus: 'active' as const,
};

describe('updatePlayerSubscription', () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    it('updates the player when state differs', async () => {
        // First call: SELECT returns player with different state
        mockQuery.mockResolvedValueOnce([
            { id: 'player_1', is_cab_member: false, subscription_status: 'none' },
        ]);
        // Second call: UPDATE
        mockQuery.mockResolvedValueOnce([]);

        await updatePlayerSubscription(BASE_UPDATE);

        expect(mockQuery).toHaveBeenCalledTimes(2);
        const updateCall = mockQuery.mock.calls[1];
        expect(updateCall[0]).toContain('UPDATE players');
        expect(updateCall[1]).toEqual(
            expect.arrayContaining([true, 'active', null, 'cus_abc'])
        );
    });

    it('skips the UPDATE when state already matches (idempotency)', async () => {
        mockQuery.mockResolvedValueOnce([
            { id: 'player_1', is_cab_member: true, subscription_status: 'active' },
        ]);

        await updatePlayerSubscription(BASE_UPDATE);

        // Only the SELECT should have been called
        expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('skips update when no player found for the customer ID', async () => {
        mockQuery.mockResolvedValueOnce([]);

        await updatePlayerSubscription(BASE_UPDATE);

        expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('includes stripe_subscription_id in UPDATE when provided', async () => {
        mockQuery.mockResolvedValueOnce([
            { id: 'player_1', is_cab_member: false, subscription_status: 'none' },
        ]);
        mockQuery.mockResolvedValueOnce([]);

        await updatePlayerSubscription({
            ...BASE_UPDATE,
            stripeSubscriptionId: 'sub_xyz',
        });

        const updateSql = mockQuery.mock.calls[1][0] as string;
        expect(updateSql).toContain('stripe_subscription_id');
        expect(mockQuery.mock.calls[1][1]).toContain('sub_xyz');
    });

    it('sets subscriptionPeriodEnd when provided', async () => {
        mockQuery.mockResolvedValueOnce([
            { id: 'player_1', is_cab_member: false, subscription_status: 'none' },
        ]);
        mockQuery.mockResolvedValueOnce([]);

        const periodEnd = new Date('2026-12-31T00:00:00Z');
        await updatePlayerSubscription({ ...BASE_UPDATE, subscriptionPeriodEnd: periodEnd });

        const params = mockQuery.mock.calls[1][1] as unknown[];
        expect(params).toContain(periodEnd);
    });
});
