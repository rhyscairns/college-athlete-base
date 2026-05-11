'use client';

import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/primitives/EmptyState';
import { ScholarshipStatusBadge } from './ScholarshipStatusBadge';
import type { ScholarshipsTableProps } from '../types';

function EmptyScholarshipsIllustration() {
    return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="20" y="30" width="80" height="60" rx="6" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--brand-500)' }} />
            <path d="M20 46 L100 46" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--brand-500)' }} />
            <path d="M36 62 L60 62 M36 72 L52 72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--text-lo)' }} />
            <circle cx="84" cy="67" r="10" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-500)' }} />
            <path d="M84 63 L84 71 M80 67 L88 67" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--accent-500)' }} />
        </svg>
    );
}

function formatAmount(amount: number): string {
    return amount.toLocaleString();
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ScholarshipsTable({ scholarships, userType, currentUserId }: ScholarshipsTableProps) {
    const router = useRouter();

    const handleView = (id: string) => {
        if (userType === 'coach') {
            router.push(`/coach/${currentUserId}/scholarships/${id}`);
        } else {
            router.push(`/player/${currentUserId}/scholarship-offers/${id}`);
        }
    };

    if (scholarships.length === 0) {
        return (
            <EmptyState
                illustration={<EmptyScholarshipsIllustration />}
                title="No scholarships yet"
                description={
                    userType === 'coach'
                        ? 'No scholarship offers sent yet — create your first offer.'
                        : 'No scholarship offers received yet.'
                }
                data-testid="empty-scholarships"
            />
        );
    }

    const coachColumns = ['Player', 'Sport', 'Amount', 'GPA', 'Status', 'Date', ''];
    const playerColumns = ['School', 'Sport', 'Contribution / yr', 'GPA', 'Status', 'Date', ''];
    const columns = userType === 'coach' ? coachColumns : playerColumns;

    return (
        <>
            {/* Mobile card list */}
            <div className="md:hidden space-y-3" data-testid="scholarships-mobile-list">
                {scholarships.map((scholarship) => {
                    const rowId = userType === 'coach' ? scholarship.playerId : scholarship.coachId;
                    const primaryLabel = userType === 'coach'
                        ? `${scholarship.playerFirstName ?? ''} ${scholarship.playerLastName ?? ''}`.trim() || '—'
                        : scholarship.coachUniversity ?? scholarship.schoolName;

                    return (
                        <div
                            key={scholarship.id}
                            className="rounded-xl p-4"
                            style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-hi)' }}>
                                        {primaryLabel}
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-lo)' }}>
                                        {formatDate(scholarship.createdAt)}
                                    </p>
                                </div>
                                <ScholarshipStatusBadge status={scholarship.status} />
                            </div>
                            <div className="mt-2 flex flex-col gap-1">
                                <span className="text-xs" style={{ color: 'var(--text-lo)' }}>
                                    <span className="font-medium" style={{ color: 'var(--text-mid)' }}>Sport:</span> {scholarship.sport}
                                </span>
                                <span className="text-xs" style={{ color: 'var(--text-lo)' }}>
                                    <span className="font-medium" style={{ color: 'var(--text-mid)' }}>
                                        {userType === 'player' ? 'Contribution Required:' : 'Amount:'}
                                    </span>{' '}
                                    ${formatAmount(scholarship.scholarshipAmount)}{userType === 'player' ? ' / yr' : ''}
                                </span>
                                <span className="text-xs" style={{ color: 'var(--text-lo)' }}>
                                    <span className="font-medium" style={{ color: 'var(--text-mid)' }}>Required GPA:</span> {scholarship.requiredGpa}
                                </span>
                            </div>
                            <div className="mt-3">
                                <button
                                    onClick={() => handleView(rowId)}
                                    aria-label={`View scholarship for ${primaryLabel}`}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                                    style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--brand-600)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--brand-500)')}
                                >
                                    View
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop table — fixed layout so columns never overflow */}
            <div
                className="hidden md:block w-full rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--ink-3)' }}
                data-testid="scholarships-desktop-table"
            >
                <table
                    className="w-full divide-y"
                    style={{ borderColor: 'var(--ink-3)', background: 'var(--ink-1)', tableLayout: 'fixed' }}
                >
                    <colgroup>
                        {/* Player/School — widest */}
                        <col style={{ width: '20%' }} />
                        {/* Sport */}
                        <col style={{ width: '13%' }} />
                        {/* Amount */}
                        <col style={{ width: '16%' }} />
                        {/* GPA */}
                        <col style={{ width: '8%' }} />
                        {/* Status */}
                        <col style={{ width: '12%' }} />
                        {/* Date */}
                        <col style={{ width: '16%' }} />
                        {/* Actions */}
                        <col style={{ width: '10%' }} />
                    </colgroup>
                    <thead>
                        <tr style={{ background: 'var(--ink-2)' }}>
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider truncate"
                                    style={{ color: 'var(--brand-500)' }}
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--ink-3)' }}>
                        {scholarships.map((scholarship) => {
                            const rowId = userType === 'coach' ? scholarship.playerId : scholarship.coachId;
                            const primaryLabel = userType === 'coach'
                                ? `${scholarship.playerFirstName ?? ''} ${scholarship.playerLastName ?? ''}`.trim() || '—'
                                : scholarship.coachUniversity ?? scholarship.schoolName;

                            return (
                                <tr
                                    key={scholarship.id}
                                    className="transition-colors"
                                    style={{ borderColor: 'var(--ink-3)' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-2)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                                >
                                    <td className="px-4 py-3 text-sm font-semibold truncate" style={{ color: 'var(--text-hi)' }}>
                                        {primaryLabel}
                                    </td>
                                    <td className="px-4 py-3 text-sm truncate" style={{ color: 'var(--text-mid)' }}>
                                        {scholarship.sport}
                                    </td>
                                    <td className="px-4 py-3 text-sm truncate" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: 'var(--text-mid)' }}>
                                        ${formatAmount(scholarship.scholarshipAmount)}{userType === 'player' ? ' / yr' : ''}
                                    </td>
                                    <td className="px-4 py-3 text-sm truncate" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: 'var(--text-mid)' }}>
                                        {scholarship.requiredGpa}
                                    </td>
                                    <td className="px-4 py-3">
                                        <ScholarshipStatusBadge status={scholarship.status} />
                                    </td>
                                    <td className="px-4 py-3 text-sm truncate" style={{ color: 'var(--text-mid)' }}>
                                        {formatDate(scholarship.createdAt)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleView(rowId)}
                                            aria-label={`View scholarship for ${primaryLabel}`}
                                            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                                            style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--brand-600)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'var(--brand-500)')}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}
