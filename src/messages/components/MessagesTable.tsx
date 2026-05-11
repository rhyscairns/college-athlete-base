'use client';

import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/primitives/EmptyState';
import { EmptyInboxIllustration } from '@/components/primitives/illustrations/EmptyInbox';
import type { MessagesTableProps } from '../types';

export function MessagesTable({ conversations, currentUserId, userType, emptyMessage }: MessagesTableProps) {
    const router = useRouter();

    const handleViewMessages = (counterpartId: string) => {
        if (userType === 'coach') {
            router.push(`/coach/${currentUserId}/messages/${counterpartId}`);
        } else {
            router.push(`/player/${currentUserId}/messages/${counterpartId}`);
        }
    };

    // ── Empty state (task 4.4 + 4.8) ──
    if (conversations.length === 0) {
        return (
            <EmptyState
                illustration={<EmptyInboxIllustration />}
                title="No messages yet"
                description={emptyMessage ?? 'Start a conversation — reach out to a player or coach.'}
                data-testid="empty-inbox"
            />
        );
    }

    const columns = userType === 'coach'
        ? ['Name', 'Sport', 'Position', 'Email', 'Actions']
        : ['Name', 'University', 'Position', 'Sport', 'Email', 'Actions'];

    return (
        <>
            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
                {conversations.map((conversation) => {
                    const fullName = `${conversation.firstName} ${conversation.lastName}`;
                    return (
                        <div key={conversation.counterpartId} className="rounded-xl p-4" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-hi)' }}>{fullName}</p>
                                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-lo)' }}>{conversation.email}</p>
                                </div>
                                <button
                                    onClick={() => handleViewMessages(conversation.counterpartId)}
                                    aria-label={`View messages with ${fullName}`}
                                    className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                                    style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--brand-600)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--brand-500)')}
                                >
                                    View Messages
                                </button>
                            </div>
                            <div className="mt-3 flex flex-col gap-1">
                                {userType === 'coach' ? (
                                    <>
                                        <span className="text-xs" style={{ color: 'var(--text-lo)' }}><span className="font-medium" style={{ color: 'var(--text-mid)' }}>Sport:</span> {conversation.sport ?? '—'}</span>
                                        <span className="text-xs" style={{ color: 'var(--text-lo)' }}><span className="font-medium" style={{ color: 'var(--text-mid)' }}>Position:</span> {conversation.position ?? '—'}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-xs" style={{ color: 'var(--text-lo)' }}><span className="font-medium" style={{ color: 'var(--text-mid)' }}>University:</span> {conversation.university ?? '—'}</span>
                                        <span className="text-xs" style={{ color: 'var(--text-lo)' }}><span className="font-medium" style={{ color: 'var(--text-mid)' }}>Position:</span> {conversation.position ?? '—'}</span>
                                        <span className="text-xs" style={{ color: 'var(--text-lo)' }}><span className="font-medium" style={{ color: 'var(--text-mid)' }}>Sport:</span> {conversation.sport ?? '—'}</span>
                                    </>
                                )}
                            </div>
                            {userType === 'coach' && (
                                <div className="mt-3">
                                    <button
                                        onClick={() => router.push(`/coach/${currentUserId}/scholarships/new?playerId=${conversation.counterpartId}`)}
                                        aria-label={`Send scholarship to ${fullName}`}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                                        style={{ background: 'oklch(75% 0.18 85 / 0.15)', color: 'oklch(75% 0.18 85)', border: '1px solid oklch(75% 0.18 85 / 0.3)' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'oklch(75% 0.18 85 / 0.25)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'oklch(75% 0.18 85 / 0.15)')}
                                    >
                                        Send Scholarship
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto overflow-hidden rounded-xl" style={{ border: '1px solid var(--ink-3)' }}>
                <table className="w-full divide-y" style={{ borderColor: 'var(--ink-3)', background: 'var(--ink-1)' }}>
                    <thead>
                        <tr style={{ background: 'var(--ink-2)' }}>
                            {columns.map((col) => (
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
                        {conversations.map((conversation) => {
                            const fullName = `${conversation.firstName} ${conversation.lastName}`;
                            return (
                                <tr
                                    key={conversation.counterpartId}
                                    className="transition-colors"
                                    style={{ borderColor: 'var(--ink-3)' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-2)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                                >
                                    <td className="px-4 py-3 text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--text-hi)' }}>
                                        {fullName}
                                    </td>
                                    {userType === 'coach' ? (
                                        <>
                                            <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--text-mid)' }}>
                                                {conversation.sport ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--text-mid)' }}>
                                                {conversation.position ?? '—'}
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--text-mid)' }}>
                                                {conversation.university ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--text-mid)' }}>
                                                {conversation.position ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--text-mid)' }}>
                                                {conversation.sport ?? '—'}
                                            </td>
                                        </>
                                    )}
                                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--text-mid)' }}>
                                        {conversation.email}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleViewMessages(conversation.counterpartId)}
                                                aria-label={`View messages with ${fullName}`}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                                                style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
                                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--brand-600)')}
                                                onMouseLeave={e => (e.currentTarget.style.background = 'var(--brand-500)')}
                                            >
                                                View Messages
                                            </button>
                                            {userType === 'coach' && (
                                                <button
                                                    onClick={() => router.push(`/coach/${currentUserId}/scholarships/new?playerId=${conversation.counterpartId}`)}
                                                    aria-label={`Send scholarship to ${fullName}`}
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                                                    style={{ background: 'oklch(75% 0.18 85 / 0.15)', color: 'oklch(75% 0.18 85)', border: '1px solid oklch(75% 0.18 85 / 0.3)' }}
                                                    onMouseEnter={e => (e.currentTarget.style.background = 'oklch(75% 0.18 85 / 0.25)')}
                                                    onMouseLeave={e => (e.currentTarget.style.background = 'oklch(75% 0.18 85 / 0.15)')}
                                                >
                                                    Send Scholarship
                                                </button>
                                            )}
                                        </div>
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
