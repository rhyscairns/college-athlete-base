/**
 * Integration tests for SubscriptionBanner in PlayerDashboard
 * Covers both isCABMember=false (banner shown) and isCABMember=true (status shown)
 * Requirements: 3.11, 3.12
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import PlayerDashboard from '@/dashboard/player/components/PlayerDashboard';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

const mockRouter = { push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() };

const emptyPlayersResponse = {
    success: true,
    data: {
        players: [],
        pagination: { currentPage: 1, totalPages: 1, totalCount: 0, pageSize: 6 },
    },
};

beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => emptyPlayersResponse,
    } as Response);
});

describe('PlayerDashboard — subscription integration', () => {
    describe('when isCABMember=false', () => {
        it('renders the subscription banner with the correct message', async () => {
            render(
                <PlayerDashboard
                    playerId="player-1"
                    isCABMember={false}
                    isCloud={false}
                />
            );

            expect(
                await screen.findByText(/please start your direct debit/i)
            ).toBeInTheDocument();
        });

        it('renders the "Simulate Payment" button in local env', async () => {
            render(
                <PlayerDashboard
                    playerId="player-1"
                    isCABMember={false}
                    isCloud={false}
                />
            );

            expect(
                await screen.findByRole('button', { name: /simulate payment/i })
            ).toBeInTheDocument();
        });

        it('renders the "Subscribe Now" button in cloud env', async () => {
            render(
                <PlayerDashboard
                    playerId="player-1"
                    isCABMember={false}
                    isCloud={true}
                />
            );

            expect(
                await screen.findByRole('button', { name: /subscribe to college athlete base/i })
            ).toBeInTheDocument();
        });

        it('hides the banner after a successful simulate', async () => {
            const user = userEvent.setup();

            // First call: players list; second call: simulate endpoint
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => emptyPlayersResponse,
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => emptyPlayersResponse,
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => ({ success: true }),
                } as Response);

            render(
                <PlayerDashboard
                    playerId="player-1"
                    isCABMember={false}
                    isCloud={false}
                />
            );

            const btn = await screen.findByRole('button', { name: /simulate payment/i });
            await user.click(btn);

            await waitFor(() => {
                expect(screen.queryByText(/please start your direct debit/i)).not.toBeInTheDocument();
            });
        });
    });

    describe('when isCABMember=true', () => {
        it('does NOT render the subscription banner', async () => {
            render(
                <PlayerDashboard
                    playerId="player-1"
                    isCABMember={true}
                    subscriptionStatus="active"
                    isCloud={false}
                />
            );

            // Wait for component to settle
            await screen.findByTestId('subscription-active');

            expect(
                screen.queryByText(/please start your direct debit/i)
            ).not.toBeInTheDocument();
        });

        it('renders the subscription active status', async () => {
            render(
                <PlayerDashboard
                    playerId="player-1"
                    isCABMember={true}
                    subscriptionStatus="active"
                    isCloud={false}
                />
            );

            expect(await screen.findByTestId('subscription-active')).toBeInTheDocument();
            expect(screen.getByText(/subscription active/i)).toBeInTheDocument();
        });

        it('renders the next billing date when subscriptionPeriodEnd is provided', async () => {
            render(
                <PlayerDashboard
                    playerId="player-1"
                    isCABMember={true}
                    subscriptionStatus="active"
                    subscriptionPeriodEnd="2026-06-18T00:00:00.000Z"
                    isCloud={false}
                />
            );

            await screen.findByTestId('subscription-active');
            expect(screen.getByText(/next billing date/i)).toBeInTheDocument();
        });

        it('does NOT render a billing date when subscriptionPeriodEnd is null', async () => {
            render(
                <PlayerDashboard
                    playerId="player-1"
                    isCABMember={true}
                    subscriptionStatus="active"
                    subscriptionPeriodEnd={null}
                    isCloud={false}
                />
            );

            await screen.findByTestId('subscription-active');
            expect(screen.queryByText(/next billing date/i)).not.toBeInTheDocument();
        });
    });
});
