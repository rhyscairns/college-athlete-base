'use client';

import { useRouter } from 'next/navigation';
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

    if (conversations.length === 0) {
        return (
            <p className="text-gray-500 text-center py-12">{emptyMessage}</p>
        );
    }

    const columns = userType === 'coach'
        ? ['Name', 'Sport', 'Position', 'Email', 'Actions']
        : ['Name', 'University', 'Position', 'Sport', 'Email', 'Actions'];

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
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
    );
}
