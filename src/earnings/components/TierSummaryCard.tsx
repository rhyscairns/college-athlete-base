'use client';

interface TierSummaryCardProps {
    /** Display label, e.g. "Tier 1", "Tier 2", "Total" */
    tier: string;
    /** Number of players in this tier (omit for the Total card) */
    playerCount?: number;
    /** Monthly earnings in dollars */
    monthlyEarnings: number;
    /** Highlight the card (used for the Total card) */
    highlight?: boolean;
}

/**
 * Displays a single tier's stats: label, player count, and monthly earnings.
 * Requirements: 4.2
 */
export function TierSummaryCard({ tier, playerCount, monthlyEarnings, highlight = false }: TierSummaryCardProps) {
    return (
        <div
            className="rounded-xl p-4 flex flex-col gap-2"
            style={{
                background: highlight ? 'oklch(68% 0.22 150 / 0.12)' : 'var(--ink-1)',
                border: highlight
                    ? '1px solid oklch(68% 0.22 150 / 0.35)'
                    : '1px solid var(--ink-3)',
            }}
            data-testid={`tier-summary-card-${tier.toLowerCase().replace(/\s+/g, '-')}`}
        >
            <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: highlight ? 'oklch(68% 0.22 150)' : 'var(--brand-500)' }}
            >
                {tier}
            </span>

            {playerCount !== undefined && (
                <p className="text-sm" style={{ color: 'var(--text-mid)' }}>
                    <span
                        className="text-2xl font-bold"
                        style={{ color: 'var(--text-hi)' }}
                        data-testid="player-count"
                    >
                        {playerCount}
                    </span>{' '}
                    {playerCount === 1 ? 'player' : 'players'}
                </p>
            )}

            <p
                className="text-xl font-bold font-mono"
                style={{ color: highlight ? 'oklch(68% 0.22 150)' : 'var(--text-hi)' }}
                data-testid="monthly-earnings"
            >
                ${monthlyEarnings.toFixed(2)}
                <span className="text-xs font-normal ml-1" style={{ color: 'var(--text-lo)' }}>
                    /mo
                </span>
            </p>
        </div>
    );
}
