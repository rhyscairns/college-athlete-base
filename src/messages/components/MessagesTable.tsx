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
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--ink-3)' }}>
            <table className="w-full divide-y" style={{ background: 'var(--ink-1)', borderColor: 'var(--ink-3)' }}>
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
                        const hasUnread = (conversation.unreadCount ?? 0) > 0;
                        return (
                            <tr
                                key={conversation.counterpartId}
                                className={`transition-colors${hasUnread ? ' unread-border' : ''}`}
                                style={{ borderColor: 'var(--ink-3)' }}
                            >
                                <td className="px-4 py-3 text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--text-hi)' }}>
                                    {fullName}
                                    {hasUnread && (
                                        <span
                                            className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
                                            style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
                                            aria-label={`${conversation.unreadCount} unread`}
                                        >
                                            {conversation.unreadCount}
                                        </span>
                                    )}
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
                                    <button
                                        onClick={() => handleViewMessages(conversation.counterpartId)}
                                        aria-label={`View messages with ${fullName}`}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                                        style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
                                    >
                                        View Messages
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
