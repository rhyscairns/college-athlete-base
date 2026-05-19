/**
 * Unit tests for SubscriptionBanner component
 * Requirements: 3.11, 3.13, 3.14
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubscriptionBanner } from '../SubscriptionBanner';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('SubscriptionBanner', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('message', () => {
        it('always displays the subscription prompt message', () => {
            render(<SubscriptionBanner playerId="player-1" isCloud={false} />);
            expect(
                screen.getByText(/please start your direct debit to become visible/i)
            ).toBeInTheDocument();
        });
    });

    describe('local environment render path', () => {
        it('renders a "Simulate Payment" button when isCloud=false', () => {
            render(<SubscriptionBanner playerId="player-1" isCloud={false} />);
            expect(screen.getByRole('button', { name: /simulate payment/i })).toBeInTheDocument();
        });

        it('does NOT render a "Subscribe Now" button in local env', () => {
            render(<SubscriptionBanner playerId="player-1" isCloud={false} />);
            expect(screen.queryByRole('button', { name: /subscribe now/i })).not.toBeInTheDocument();
        });

        it('calls /api/payment/simulate with the playerId on click', async () => {
            const user = userEvent.setup();
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true }),
            } as Response);

            render(<SubscriptionBanner playerId="player-42" isCloud={false} />);
            await user.click(screen.getByRole('button', { name: /simulate payment/i }));

            expect(mockFetch).toHaveBeenCalledWith('/api/payment/simulate', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ playerId: 'player-42' }),
            }));
        });

        it('calls onSubscribed callback after successful simulation', async () => {
            const user = userEvent.setup();
            const onSubscribed = jest.fn();
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true }),
            } as Response);

            render(<SubscriptionBanner playerId="player-1" isCloud={false} onSubscribed={onSubscribed} />);
            await user.click(screen.getByRole('button', { name: /simulate payment/i }));

            await waitFor(() => expect(onSubscribed).toHaveBeenCalledTimes(1));
        });

        it('shows an error message when simulation fails', async () => {
            const user = userEvent.setup();
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'Player not found' }),
            } as Response);

            render(<SubscriptionBanner playerId="player-1" isCloud={false} />);
            await user.click(screen.getByRole('button', { name: /simulate payment/i }));

            await waitFor(() => expect(screen.getByText('Player not found')).toBeInTheDocument());
        });

        it('disables the button while the request is in flight', async () => {
            const user = userEvent.setup();
            let resolve: (v: Response) => void;
            mockFetch.mockReturnValueOnce(new Promise(r => { resolve = r; }) as Promise<Response>);

            render(<SubscriptionBanner playerId="player-1" isCloud={false} />);
            const btn = screen.getByRole('button', { name: /simulate payment/i });
            await user.click(btn);

            expect(btn).toBeDisabled();

            // Resolve the promise to clean up
            resolve!({ ok: true, json: async () => ({}) } as Response);
        });
    });

    describe('cloud environment render path', () => {
        it('renders a "Subscribe Now" button when isCloud=true', () => {
            render(<SubscriptionBanner playerId="player-1" isCloud={true} />);
            expect(
                screen.getByRole('button', { name: /subscribe to college athlete base/i })
            ).toBeInTheDocument();
            expect(screen.getByText('Subscribe Now')).toBeInTheDocument();
        });

        it('does NOT render a "Simulate Payment" button in cloud env', () => {
            render(<SubscriptionBanner playerId="player-1" isCloud={true} />);
            expect(
                screen.queryByRole('button', { name: /simulate payment/i })
            ).not.toBeInTheDocument();
        });

        it('calls /api/payment/create-checkout-session on click', async () => {
            const user = userEvent.setup();
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ url: 'https://checkout.stripe.com/session-123' }),
            } as Response);

            render(<SubscriptionBanner playerId="player-99" isCloud={true} />);
            await user.click(
                screen.getByRole('button', { name: /subscribe to college athlete base/i })
            );

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith(
                    '/api/payment/create-checkout-session',
                    expect.objectContaining({
                        method: 'POST',
                        body: JSON.stringify({ playerId: 'player-99' }),
                    })
                );
            });
        });

        it('shows an error when checkout session creation fails', async () => {
            const user = userEvent.setup();
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'Stripe unavailable' }),
            } as Response);

            render(<SubscriptionBanner playerId="player-1" isCloud={true} />);
            await user.click(
                screen.getByRole('button', { name: /subscribe to college athlete base/i })
            );

            await waitFor(() => expect(screen.getByText('Stripe unavailable')).toBeInTheDocument());
        });
    });

    describe('accessibility', () => {
        it('has role="alert" on the banner container', () => {
            render(<SubscriptionBanner playerId="player-1" isCloud={false} />);
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });
    });
});
