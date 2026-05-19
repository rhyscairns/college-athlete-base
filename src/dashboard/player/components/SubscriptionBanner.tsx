'use client';

import { useState } from 'react';

interface SubscriptionBannerProps {
    /** The player's ID — used by the local simulate endpoint */
    playerId: string;
    /** Whether the app is running in a cloud environment */
    isCloud: boolean;
    /** Called after a successful simulate or redirect so the parent can refresh state */
    onSubscribed?: () => void;
}

/**
 * SubscriptionBanner
 *
 * Shown when a player's is_cab_member flag is false.
 * - Local env: "Simulate Payment" button → POST /api/payment/simulate
 * - Cloud env: "Subscribe Now" button → Stripe Checkout (via /api/payment/create-checkout-session)
 *
 * Requirements: 3.11, 3.13, 3.14
 */
export function SubscriptionBanner({ playerId, isCloud, onSubscribed }: SubscriptionBannerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSimulate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/payment/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message ?? 'Simulation failed');
            }

            onSubscribed?.();
            // Reload the page so the server re-reads is_cab_member and the player list loads
            window.location.reload();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubscribe = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/payment/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message ?? 'Failed to start checkout');
            }

            const { url } = await res.json();
            if (url) {
                window.location.href = url;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setIsLoading(false);
        }
    };

    return (
        <div
            role="alert"
            aria-live="polite"
            className="w-full rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            style={{
                background: 'oklch(22% 0.04 75 / 0.4)',
                border: '1px solid oklch(78% 0.18 75 / 0.35)',
                boxShadow: '0 0 0 1px oklch(78% 0.18 75 / 0.1)',
            }}
        >
            <div className="flex items-center gap-3">
                <span className="text-xl shrink-0" aria-hidden="true">⚠️</span>
                <p className="text-sm font-medium" style={{ color: 'var(--text-mid)' }}>
                    Please start your direct debit to become visible to the coaches on the College Athlete Base system
                </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                {isCloud ? (
                    <button
                        onClick={handleSubscribe}
                        disabled={isLoading}
                        aria-label="Subscribe to College Athlete Base"
                        className="px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50"
                        style={{
                            background: 'linear-gradient(135deg, oklch(68% 0.22 150), oklch(60% 0.22 150))',
                            color: 'oklch(15% 0.015 260)',
                        }}
                    >
                        {isLoading ? 'Loading…' : 'Subscribe Now'}
                    </button>
                ) : (
                    <button
                        onClick={handleSimulate}
                        disabled={isLoading}
                        aria-label="Simulate payment for local development"
                        className="px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50"
                        style={{
                            background: 'oklch(78% 0.18 75)',
                            color: 'oklch(15% 0.015 260)',
                        }}
                    >
                        {isLoading ? 'Simulating…' : 'Simulate Payment'}
                    </button>
                )}

                {error && (
                    <p className="text-xs" style={{ color: 'var(--status-danger)' }} role="alert">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}
