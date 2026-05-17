'use client';

import Link from 'next/link';
import type { ReferredCoach } from '../types';

interface ReferredCoachesTableProps {
    coaches: ReferredCoach[];
}

/**
 * Table of tier-1 referred coaches.
 * Columns: Name (links to profile), Joined date, Their player referrals, Their coach referrals.
 * Requirements: 5.2, 5.3, 5.8
 */
export function ReferredCoachesTable({ coaches }: ReferredCoachesTableProps) {
    if (coaches.length === 0) {
        return (
            <div
                className="rounded-xl p-8 text-center"
                style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}
                data-testid="referred-coaches-empty"
            >
                <p className="text-sm" style={{ color: 'var(--text-lo)' }}>
                    No referred coaches yet. Share your promo code with coaches to grow your network.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--ink-3)' }}>
            <table
                className="w-full divide-y"
                style={{ borderColor: 'var(--ink-3)', background: 'var(--ink-1)' }}
                aria-label="Referred coaches"
            >
                <thead>
                    <tr style={{ background: 'var(--ink-2)' }}>
                        {['Name', 'Joined', 'Their player referrals', 'Their coach referrals'].map(col => (
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
                    {coaches.map(coach => {
                        const fullName = `${coach.firstName} ${coach.lastName}`;
                        return (
                            <tr
                                key={coach.coachId}
                                data-testid={`coach-row-${coach.coachId}`}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--ink-2)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                            >
                                {/* Name — links to coach profile */}
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <Link
                                        href={`/coach/${coach.coachId}/profile`}
                                        className="text-sm font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-offset-1 rounded"
                                        style={{ color: 'var(--brand-500)' }}
                                        aria-label={`View profile for ${fullName}`}
                                    >
                                        {fullName}
                                    </Link>
                                </td>

                                {/* Joined date */}
                                <td
                                    className="px-4 py-3 text-sm whitespace-nowrap"
                                    style={{ color: 'var(--text-lo)' }}
                                >
                                    {new Date(coach.joinedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </td>

                                {/* Their player referrals */}
                                <td
                                    className="px-4 py-3 text-sm font-mono whitespace-nowrap"
                                    style={{ color: 'var(--text-mid)' }}
                                    data-testid={`player-referrals-${coach.coachId}`}
                                >
                                    {coach.directPlayerReferrals}
                                </td>

                                {/* Their coach referrals */}
                                <td
                                    className="px-4 py-3 text-sm font-mono whitespace-nowrap"
                                    style={{ color: 'var(--text-mid)' }}
                                    data-testid={`coach-referrals-${coach.coachId}`}
                                >
                                    {coach.directCoachReferrals}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
