'use client';

import { TierSummaryCard } from './TierSummaryCard';
import { ReferredPlayersTable } from './ReferredPlayersTable';
import { ReferredCoachesTable } from './ReferredCoachesTable';
import type { EarningsData } from '../types';

interface ReferralBreakdownPageProps {
    data: EarningsData;
}

/**
 * Full referral breakdown — tier-1 players table, tier-1 coaches table,
 * and aggregate summary cards for tier-2 and tier-3.
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export function ReferralBreakdownPage({ data }: ReferralBreakdownPageProps) {
    return (
        <div className="flex flex-col gap-8" data-testid="referral-breakdown-page">
            {/* Tier-1 players */}
            <section aria-labelledby="tier1-players-heading">
                <h2
                    id="tier1-players-heading"
                    className="text-lg font-bold mb-3"
                    style={{ color: 'var(--text-hi)' }}
                >
                    Direct referrals — Players
                </h2>
                <ReferredPlayersTable players={data.tier1Players} />
            </section>

            {/* Tier-1 coaches */}
            <section aria-labelledby="tier1-coaches-heading">
                <h2
                    id="tier1-coaches-heading"
                    className="text-lg font-bold mb-3"
                    style={{ color: 'var(--text-hi)' }}
                >
                    Direct referrals — Coaches
                </h2>
                <ReferredCoachesTable coaches={data.tier1Coaches} />
            </section>

            {/* Tier-2 and Tier-3 aggregate summary */}
            <section aria-labelledby="indirect-heading">
                <h2
                    id="indirect-heading"
                    className="text-lg font-bold mb-3"
                    style={{ color: 'var(--text-hi)' }}
                >
                    Indirect referrals
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" data-testid="indirect-tier-cards">
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
                </div>
            </section>
        </div>
    );
}
