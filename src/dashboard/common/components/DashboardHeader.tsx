'use client';

import React from 'react';

export interface DashboardHeaderProps {
    title: string;
    subtitle: string;
}

export const DashboardHeader = React.memo(function DashboardHeader({
    title,
    subtitle,
}: DashboardHeaderProps) {
    return (
        <header
            className="relative overflow-hidden px-6 pt-14 pb-12 sm:px-8 text-center"
            role="banner"
            data-testid="dashboard-header"
        >
            {/* Gradient background */}
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10"
                style={{
                    background: `
                        radial-gradient(ellipse 80% 60% at 50% -10%,
                            oklch(68% 0.22 150 / 0.18) 0%,
                            transparent 70%),
                        radial-gradient(ellipse 50% 40% at 80% 100%,
                            oklch(78% 0.18 75 / 0.08) 0%,
                            transparent 60%),
                        var(--ink-0)
                    `,
                }}
            />

            {/* Subtle grid texture */}
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(var(--text-hi) 1px, transparent 1px),
                                      linear-gradient(90deg, var(--text-hi) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                }}
            />

            <div className="max-w-3xl mx-auto relative">
                {/* Eyebrow label */}
                <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-5"
                    style={{
                        background: 'oklch(68% 0.22 150 / 0.15)',
                        border: '1px solid oklch(68% 0.22 150 / 0.3)',
                        color: 'var(--brand-500)',
                    }}
                >
                    <span
                        aria-hidden="true"
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: 'var(--brand-500)' }}
                    />
                    Recruitment Hub
                </div>

                <h1
                    className="font-black tracking-tight leading-none mb-4"
                    id="dashboard-title"
                    data-testid="dashboard-title"
                    style={{
                        fontSize: 'clamp(2rem, 4vw + 1rem, 3.25rem)',
                        /* Gradient text */
                        background: `linear-gradient(135deg,
                            var(--text-hi) 0%,
                            oklch(85% 0.15 150) 50%,
                            var(--text-hi) 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    {title}
                </h1>

                <p
                    className="text-base sm:text-lg max-w-xl mx-auto"
                    id="dashboard-subtitle"
                    data-testid="dashboard-subtitle"
                    style={{ color: 'var(--text-mid)' }}
                >
                    {subtitle}
                </p>
            </div>
        </header>
    );
});
