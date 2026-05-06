'use client';

import { useState, useEffect, useRef } from 'react';
import { InviteModal } from '../../common/components/InviteModal';

interface PlayerStats {
    profileViews: number;
    coachesFavorited: number;
    playersReferred: number;
    coachesReferred: number;
    promoCode: string | null;
}

interface StatTileProps {
    label: string;
    value: number;
    isLoading: boolean;
    accent?: 'brand' | 'amber' | 'danger';
}

function StatTile({ label, value, isLoading, accent = 'brand' }: StatTileProps) {
    const prevRef = useRef(0);
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (isLoading || value === prevRef.current) return;
        const start = prevRef.current;
        const end = value;
        const duration = 600;
        const startTime = performance.now();

        const tick = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(start + (end - start) * eased));
            if (progress < 1) requestAnimationFrame(tick);
            else prevRef.current = end;
        };
        requestAnimationFrame(tick);
    }, [value, isLoading]);

    const accentColor = {
        brand: 'oklch(68% 0.22 150)',
        amber: 'oklch(78% 0.18 75)',
        danger: 'oklch(65% 0.24 25)',
    }[accent];

    return (
        <div
            className="relative flex flex-col justify-between p-4 rounded-2xl overflow-hidden"
            style={{
                background: `oklch(19% 0.018 260)`,
                border: `1px solid ${accentColor}33`,
                boxShadow: `0 0 0 1px ${accentColor}11, inset 0 1px 0 ${accentColor}22`,
            }}
        >
            <div
                aria-hidden="true"
                className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl pointer-events-none"
                style={{ background: `${accentColor}20` }}
            />

            <span
                className="text-xs font-semibold uppercase tracking-widest mb-3 relative"
                style={{ color: 'var(--text-lo)' }}
            >
                {label}
            </span>

            {isLoading ? (
                <span
                    className="h-9 w-14 rounded-lg animate-pulse"
                    style={{ background: 'var(--ink-3)' }}
                    aria-hidden="true"
                />
            ) : (
                <span
                    className="text-4xl font-black tabular-nums leading-none relative"
                    style={{
                        color: accentColor,
                        fontFamily: 'var(--font-geist-mono, monospace)',
                        textShadow: `0 0 24px ${accentColor}55`,
                    }}
                >
                    {display}
                </span>
            )}
        </div>
    );
}

export function PlayerDashboardHeader({ playerId }: { playerId: string }) {
    const [stats, setStats] = useState<PlayerStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [inviteOpen, setInviteOpen] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`/api/player/${playerId}/stats`);
                const data = await res.json();
                if (data.success) setStats(data.data);
            } catch {
                // non-critical
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [playerId]);

    return (
        <>
            <header
                className="relative overflow-hidden px-6 pt-8 pb-8 sm:px-8"
                role="banner"
                data-testid="player-dashboard-header"
            >
                {/* Background */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10"
                    style={{
                        background: `
                            radial-gradient(ellipse 70% 50% at 20% 50%,
                                oklch(68% 0.22 150 / 0.12) 0%, transparent 60%),
                            radial-gradient(ellipse 50% 60% at 80% 20%,
                                oklch(78% 0.18 75 / 0.07) 0%, transparent 60%),
                            var(--ink-0)
                        `,
                    }}
                />
                <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10"
                    style={{
                        backgroundImage: `radial-gradient(circle, oklch(72% 0.015 260 / 0.15) 1px, transparent 1px)`,
                        backgroundSize: '28px 28px',
                    }}
                />

                <div className="max-w-7xl mx-auto">
                    {/* Invite banner */}
                    <button
                        onClick={() => setInviteOpen(true)}
                        aria-label="Open invite link modal — earn rewards"
                        className="btn-brand w-full flex items-center justify-between gap-4 px-5 py-4 rounded-2xl mb-6 group focus:outline-none focus:ring-2 focus:ring-offset-2"
                        style={{
                            background: 'linear-gradient(135deg, oklch(68% 0.22 150), oklch(60% 0.22 150) 50%, oklch(78% 0.18 75))',
                            boxShadow: '0 4px 24px oklch(68% 0.22 150 / 0.35), 0 1px 0 oklch(85% 0.15 150 / 0.3) inset',
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl" aria-hidden="true">💰</span>
                            <div className="text-left">
                                <p className="text-sm font-black tracking-tight" style={{ color: 'oklch(15% 0.015 260)' }}>
                                    Invite &amp; Earn
                                </p>
                                <p className="text-xs font-medium opacity-80" style={{ color: 'oklch(15% 0.015 260)' }}>
                                    Share your link — get rewarded for every signup
                                </p>
                            </div>
                        </div>
                        <div
                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-transform group-hover:scale-105"
                            style={{ background: 'oklch(15% 0.015 260 / 0.2)', color: 'oklch(15% 0.015 260)' }}
                        >
                            Get link
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>

                    {/* Stat grid — 2 cols mobile → 4 cols lg, always full width */}
                    <div
                        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
                        role="region"
                        aria-label="Profile statistics"
                    >
                        <StatTile label="Profile Views" value={stats?.profileViews ?? 0} isLoading={isLoading} accent="brand" />
                        <StatTile label="Coaches Interested" value={stats?.coachesFavorited ?? 0} isLoading={isLoading} accent="amber" />
                        <StatTile label="Players Referred" value={stats?.playersReferred ?? 0} isLoading={isLoading} accent="brand" />
                        <StatTile label="Coaches Referred" value={stats?.coachesReferred ?? 0} isLoading={isLoading} accent="amber" />
                    </div>
                </div>
            </header>

            <InviteModal
                isOpen={inviteOpen}
                onClose={() => setInviteOpen(false)}
                promoCode={stats?.promoCode ?? null}
            />
        </>
    );
}
