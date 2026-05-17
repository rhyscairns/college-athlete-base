'use client';

import Link from 'next/link';
import type { ReferredPlayer } from '../types';

interface ReferredPlayersTableProps {
    players: ReferredPlayer[];
}

const PLAN_LABELS: Record<ReferredPlayer['subscriptionPlan'], string> = {
    standard: 'Standard ($9.99)',
    promo_699: 'Promo ($6.99)',
    promo_599: 'Promo ($5.99)',
};

/**
 * Table of tier-1 referred players.
 * Inactive rows are visually dimmed and show $0.00 contribution.
 * Requirements: 5.1, 5.6, 5.7
 */
export function ReferredPlayersTable({ players }: ReferredPlayersTableProps) {
    if (players.length === 0) {
        return (
            <div
                className="rounded-xl p-8 text-center"
                style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}
                data-testid="referred-players-empty"
            >
                <p className="text-sm" style={{ color: 'var(--text-lo)' }}>
                    No referred players yet. Share your promo code to start earning.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--ink-3)' }}>
            <table
                className="w-full divide-y"
                style={{ borderColor: 'var(--ink-3)', background: 'var(--ink-1)' }}
                aria-label="Referred players"
            >
                <thead>
                    <tr style={{ background: 'var(--ink-2)' }}>
                        {['Name', 'Status', 'Plan', 'Monthly contribution', 'Joined'].map(col => (
                            <th
                                key={col}
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                                style={{ color: 'var(--brand-500)' }}
                            >
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--ink-3)' }}>
                    {players.map(player => {
                        const isActive = player.subscriptionStatus === 'active';
                        const fullName = `${player.firstName} ${player.lastName}`;
                        const rowOpacity = isActive ? 1 : 0.45;

                        return (
                            <tr
                                key={player.playerId}
                                data-testid={`player-row-${player.playerId}`}
                                style={{ opacity: rowOpacity }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--ink-2)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                            >
                                {/* Name — links to player profile */}
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <Link
                                        href={`/player/${player.playerId}`}
                                        className="text-sm font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-offset-1 rounded"
                                        style={{ color: 'var(--brand-500)' }}
                                        aria-label={`View profile for ${fullName}`}
                                    >
                                        {fullName}
                                    </Link>
                                </td>

                                {/* Status badge */}
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span
                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                                        style={
                                            isActive
                                                ? {
                                                    background: 'oklch(68% 0.22 150 / 0.15)',
                                                    color: 'oklch(68% 0.22 150)',
                                                    border: '1px solid oklch(68% 0.22 150 / 0.3)',
                                                }
                                                : {
                                                    background: 'var(--ink-3)',
                                                    color: 'var(--text-lo)',
                                                    border: '1px solid var(--ink-3)',
                                                }
                                        }
                                        data-testid={`status-badge-${player.playerId}`}
                                    >
                                        {isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>

                                {/* Plan */}
                                <td
                                    className="px-4 py-3 text-sm whitespace-nowrap"
                                    style={{ color: 'var(--text-mid)' }}
                                >
                                    {PLAN_LABELS[player.subscriptionPlan]}
                                </td>

                                {/* Monthly contribution */}
                                <td
                                    className="px-4 py-3 text-sm font-mono whitespace-nowrap"
                                    style={{ color: isActive ? 'var(--text-hi)' : 'var(--text-lo)' }}
                                    data-testid={`contribution-${player.playerId}`}
                                >
                                    ${player.monthlyContribution.toFixed(2)}
                                </td>

                                {/* Joined date */}
                                <td
                                    className="px-4 py-3 text-sm whitespace-nowrap"
                                    style={{ color: 'var(--text-lo)' }}
                                >
                                    {new Date(player.joinedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
