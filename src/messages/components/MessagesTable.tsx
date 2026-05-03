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
                        <div key={conversation.counterpartId} className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{fullName}</p>
                                    <p className="text-xs text-gray-500 truncate mt-0.5">{conversation.email}</p>
                                </div>
                                <button
                                    onClick={() => handleViewMessages(conversation.counterpartId)}
                                    aria-label={`View messages with ${fullName}`}
                                    className="shrink-0 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                >
                                    View Messages
                                </button>
                            </div>
                            <div className="mt-3 flex flex-col gap-1">
                                {userType === 'coach' ? (
                                    <>
                                        <span className="text-xs text-gray-500"><span className="font-medium text-gray-700">Sport:</span> {conversation.sport ?? '—'}</span>
                                        <span className="text-xs text-gray-500"><span className="font-medium text-gray-700">Position:</span> {conversation.position ?? '—'}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-xs text-gray-500"><span className="font-medium text-gray-700">University:</span> {conversation.university ?? '—'}</span>
                                        <span className="text-xs text-gray-500"><span className="font-medium text-gray-700">Position:</span> {conversation.position ?? '—'}</span>
                                        <span className="text-xs text-gray-500"><span className="font-medium text-gray-700">Sport:</span> {conversation.sport ?? '—'}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full divide-y divide-gray-200 bg-white">
                    <thead>
                        <tr className="bg-blue-50">
                            {columns.map((col) => (
                                <th
                                    key={col}
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider whitespace-nowrap"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {conversations.map((conversation) => {
                            const fullName = `${conversation.firstName} ${conversation.lastName}`;
                            return (
                                <tr key={conversation.counterpartId} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                                        {fullName}
                                    </td>
                                    {userType === 'coach' ? (
                                        <>
                                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                                {conversation.sport ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                                {conversation.position ?? '—'}
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                                {conversation.university ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                                {conversation.position ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                                {conversation.sport ?? '—'}
                                            </td>
                                        </>
                                    )}
                                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                        {conversation.email}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <button
                                            onClick={() => handleViewMessages(conversation.counterpartId)}
                                            aria-label={`View messages with ${fullName}`}
                                            className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
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
        </>
    );
}
