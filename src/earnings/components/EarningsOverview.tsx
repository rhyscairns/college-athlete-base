'use client';

import Link from 'next/link';
import { TierSummaryCard } from './TierSummaryCard';
import { EarningsCharts } from './EarningsCharts';
import type { EarningsData } from '../types';

interface EarningsOverviewProps {
    data: EarningsData;
    /** Base path for the "View full breakdown" link, e.g. "/coach/123/earnings" */
    basePath: string;
}

/**
 * Earnings overview — four tier summary cards, two charts, and a breakdown link.
 * Requirements: 4.2, 4.3, 4.4, 4.5
 */
export function EarningsOverview({ data, basePath }: EarningsOverviewProps) {
    const tier1ActiveCount = data.tier1Players.filter(p => p.subscriptionStatus === 'active').length;
    const tier1Earnings = data.tier1Players.reduce((sum, p) => sum + p.monthlyContribution, 0);

    return (
        <div className="flex flex-col gap-6" data-testid="earnings-overview">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-hi)' }}>
                Your Earnings
            </h2>

            {/* Tier summary cards */}
            <div
                className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                data-testid="tier-cards"
            >
                <TierSummaryCard
                    tier="Tier 1"
                    playerCount={tier1ActiveCount}
                    monthlyEarnings={tier1Earnings}
                />
                <TierSummaryCard
                    tier="Tier 2"
                    playerCount={data.tier2.activePlayerCount}
                    monthlyEarnings={data.tier2.monthlyEarnings}
                />
                <TierSummaryCard
                    tier="Tier 3"
                    playerCount={data.tier3.activePlayerCount}
                    monthlyEarnings={data.tier3.monthlyEarnings}
                />
                <TierSummaryCard
                    tier="Total"
                    monthlyEarnings={data.totalMonthlyEarnings}
                    highlight
                />
            </div>

            {/* Charts */}
            <EarningsCharts monthlySeries={data.monthlySeries} />

            {/* Breakdown CTA */}
            <div>
                <Link
                    href={`${basePath}/breakdown`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-offset-1 rounded"
                    style={{ color: 'var(--brand-500)' }}
                    data-testid="breakdown-link"
                >
                    View full breakdown
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
