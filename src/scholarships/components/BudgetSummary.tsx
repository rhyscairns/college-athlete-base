import Link from 'next/link';
import type { Scholarship } from '../types';

interface BudgetSummaryProps {
    scholarshipBudget?: number;
    annualCostPerPlayer?: number;
    scholarships: Scholarship[];
    coachId: string;
}

function fmt(n: number) {
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

/**
 * Budget summary bar shown above the scholarships table.
 * Displays total budget, amount committed (accepted offers), remaining, and cost per player.
 */
export function BudgetSummary({ scholarshipBudget, annualCostPerPlayer, scholarships, coachId }: BudgetSummaryProps) {
    // Sum all scholarship amounts as "committed" (all offers, regardless of status)
    const committed = scholarships
        .filter(s => s.status !== 'rejected')
        .reduce((sum, s) => sum + Number(s.scholarshipAmount), 0);

    const remaining = scholarshipBudget !== undefined ? scholarshipBudget - committed : undefined;
    const usedPct = scholarshipBudget ? Math.min(100, (committed / scholarshipBudget) * 100) : 0;

    return (
        <div
            className="mb-6 rounded-2xl p-3 m-4 sm:p-6"
            style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}
        >
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-500)' }}>
                    Budget Overview
                </h2>
                <Link
                    href={`/coach/${coachId}/profile`}
                    className="text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 rounded"
                    style={{ color: 'var(--text-lo)' }}
                    onMouseEnter={undefined}
                >
                    Edit in Profile →
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {/* Total budget */}
                <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-lo)' }}>Annual Budget</p>
                    <p className="text-lg font-bold" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: 'var(--text-hi)' }}>
                        {scholarshipBudget !== undefined ? fmt(scholarshipBudget) : '—'}
                    </p>
                </div>

                {/* Committed */}
                <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-lo)' }}>Committed</p>
                    <p className="text-lg font-bold" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: 'var(--status-warning)' }}>
                        {fmt(committed)}
                    </p>
                </div>

                {/* Remaining */}
                <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-lo)' }}>Remaining</p>
                    <p
                        className="text-lg font-bold"
                        style={{
                            fontFamily: 'var(--font-geist-mono, monospace)',
                            color: remaining !== undefined
                                ? remaining < 0 ? 'var(--status-danger)' : 'var(--brand-500)'
                                : 'var(--text-lo)',
                        }}
                    >
                        {remaining !== undefined ? fmt(remaining) : '—'}
                    </p>
                </div>

                {/* Cost per player */}
                <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-lo)' }}>Cost / Player / yr</p>
                    <p className="text-lg font-bold" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: 'var(--text-mid)' }}>
                        {annualCostPerPlayer !== undefined ? fmt(annualCostPerPlayer) : '—'}
                    </p>
                </div>
            </div>

            {/* Progress bar — only when budget is set */}
            {scholarshipBudget !== undefined && scholarshipBudget > 0 && (
                <div>
                    <div
                        className="w-full h-2 rounded-full overflow-hidden"
                        style={{ background: 'var(--ink-3)' }}
                        role="progressbar"
                        aria-valuenow={Math.round(usedPct)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${Math.round(usedPct)}% of budget committed`}
                    >
                        <div
                            className="h-full rounded-full transition-all"
                            style={{
                                width: `${usedPct}%`,
                                background: usedPct >= 100
                                    ? 'var(--status-danger)'
                                    : usedPct >= 80
                                        ? 'var(--status-warning)'
                                        : 'var(--brand-500)',
                            }}
                        />
                    </div>
                    <p className="mt-1.5 text-xs" style={{ color: 'var(--text-lo)' }}>
                        {Math.round(usedPct)}% of budget committed across active offers
                    </p>
                </div>
            )}
        </div>
    );
}
