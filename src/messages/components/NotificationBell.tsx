'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useUnreadCount } from '../hooks/useUnreadCount';
import type { NotificationBellProps, NotificationItem } from '../types';

function getRelativeTime(isoString: string): string {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours !== 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

export function NotificationBell({ userId, userType }: NotificationBellProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { unreadCount, notifications, markThreadAsRead } = useUnreadCount(userId, userType);

    const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount);

    // Bell is highlighted white when there are unread messages and the dropdown is closed
    const hasUnread = unreadCount > 0;
    const bellColor = hasUnread && !isOpen ? 'text-white' : 'text-gray-400';

    // Close dropdown on outside click
    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isOpen]);

    const handleNotificationClick = (notification: NotificationItem) => {
        markThreadAsRead(notification.coachId, notification.playerId);
        setIsOpen(false);
        const path = userType === 'coach'
            ? `/coach/${notification.coachId}/messages/${notification.playerId}`
            : `/player/${notification.playerId}/messages/${notification.coachId}`;
        router.push(path);
    };

    return (
        <div ref={dropdownRef} className="relative" data-testid="notification-bell">
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={unreadCount > 0 ? `${unreadCount} unread messages` : 'Notifications'}
                aria-expanded={isOpen}
                className={`relative p-2 ${bellColor} hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg`}
            >
                <Bell size={20} />
                {hasUnread && (
                    <span
                        aria-hidden="true"
                        data-testid="unread-badge"
                        className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm"
                    >
                        {badgeLabel}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    role="menu"
                    data-testid="notification-dropdown"
                    className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
                >
                    <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Notifications
                        </p>
                    </div>
                    {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-gray-400 text-center">
                            No new notifications
                        </p>
                    ) : (
                        <ul>
                            {notifications.slice(0, 5).map((notification) => (
                                <li key={notification.messageId}>
                                    <button
                                        role="menuitem"
                                        onClick={() => handleNotificationClick(notification)}
                                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0 focus:outline-none focus:bg-blue-50"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                {notification.senderName}
                                            </p>
                                            <p className="text-[10px] text-gray-400 whitespace-nowrap mt-0.5 flex-shrink-0">
                                                {getRelativeTime(notification.sentAt)}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                            {notification.preview}
                                        </p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
