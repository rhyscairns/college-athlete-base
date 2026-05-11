'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUnreadCount } from '../hooks/useUnreadCount';
import type { NotificationBellProps, NotificationItem } from '../types';

function getRelativeTime(isoString: string): string {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}

function BellIcon({ animated }: { animated: boolean }) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{
                transformOrigin: '50% 0%',
                animation: animated ? 'bell-ring 0.6s ease-in-out' : 'none',
            }}
        >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
}

function MessageIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}

function ScholarshipIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
    );
}

export function NotificationBell({ userId, userType }: NotificationBellProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [bellAnimating, setBellAnimating] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const prevCountRef = useRef(0);
    const { unreadCount, notifications, markThreadAsRead } = useUnreadCount(userId, userType);

    const badgeCount = Math.min(unreadCount, 99);
    const hasUnread = unreadCount > 0;

    // Animate bell when count increases
    useEffect(() => {
        if (unreadCount > prevCountRef.current) {
            setBellAnimating(true);
            const t = setTimeout(() => setBellAnimating(false), 700);
            prevCountRef.current = unreadCount;
            return () => clearTimeout(t);
        }
        prevCountRef.current = unreadCount;
    }, [unreadCount]);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    const handleNotificationClick = (notification: NotificationItem) => {
        setIsOpen(false);
        if (notification.type === 'scholarship' && notification.href) {
            router.push(notification.href);
            return;
        }
        markThreadAsRead(notification.coachId, notification.playerId);
        const path = userType === 'coach'
            ? `/coach/${notification.coachId}/messages/${notification.playerId}`
            : `/player/${notification.playerId}/messages/${notification.coachId}`;
        router.push(path);
    };

    return (
        <>
            {/* Bell-ring keyframe injected once */}
            <style>{`
                @keyframes bell-ring {
                    0%   { transform: rotate(0deg); }
                    15%  { transform: rotate(18deg); }
                    30%  { transform: rotate(-16deg); }
                    45%  { transform: rotate(12deg); }
                    60%  { transform: rotate(-8deg); }
                    75%  { transform: rotate(4deg); }
                    100% { transform: rotate(0deg); }
                }
            `}</style>

            <div ref={dropdownRef} className="relative" data-testid="notification-bell">
                {/* ── Bell button ── */}
                <button
                    onClick={() => setIsOpen(p => !p)}
                    aria-label={hasUnread ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'Notifications'}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                    style={{
                        background: isOpen ? 'oklch(30% 0.022 260 / 0.6)' : 'transparent',
                        color: hasUnread ? 'var(--text-hi)' : 'var(--text-lo)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-hi)')}
                    onMouseLeave={e => (e.currentTarget.style.color = hasUnread ? 'var(--text-hi)' : 'var(--text-lo)')}
                >
                    <BellIcon animated={bellAnimating} />

                    {/* Badge — overlaps top-right of the icon */}
                    {hasUnread && (
                        <span
                            aria-hidden="true"
                            data-testid="unread-badge"
                            className="absolute top-0.5 right-0.5 flex items-center justify-center rounded-full font-black leading-none"
                            style={{
                                minWidth: badgeCount > 9 ? '18px' : '14px',
                                height: badgeCount > 9 ? '18px' : '14px',
                                fontSize: badgeCount > 9 ? '9px' : '8px',
                                padding: '0 3px',
                                background: 'var(--brand-500)',
                                color: 'oklch(12% 0.015 260)',
                                boxShadow: '0 0 0 2px oklch(19% 0.018 260)',
                            }}
                        >
                            {badgeCount > 99 ? '99+' : badgeCount}
                        </span>
                    )}
                </button>

                {/* ── Dropdown panel ── */}
                {isOpen && (
                    <div
                        role="menu"
                        aria-label="Notifications"
                        data-testid="notification-dropdown"
                        className="absolute right-0 mt-2 w-[22rem] rounded-2xl overflow-hidden z-50"
                        style={{
                            backdropFilter: 'blur(20px) saturate(1.4)',
                            background: 'oklch(17% 0.018 260 / 0.96)',
                            border: '1px solid oklch(32% 0.022 260 / 0.7)',
                            boxShadow: '0 24px 48px oklch(0% 0 0 / 0.5), 0 0 0 1px oklch(100% 0 0 / 0.04) inset',
                        }}
                    >
                        {/* Header */}
                        <div
                            className="flex items-center justify-between px-4 py-3"
                            style={{ borderBottom: '1px solid oklch(28% 0.02 260 / 0.6)' }}
                        >
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-lo)' }}>
                                Notifications
                            </span>
                            {hasUnread && (
                                <span
                                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                    style={{
                                        background: 'oklch(68% 0.22 150 / 0.15)',
                                        color: 'var(--brand-500)',
                                        border: '1px solid oklch(68% 0.22 150 / 0.25)',
                                    }}
                                >
                                    {unreadCount} new
                                </span>
                            )}
                        </div>

                        {/* Items */}
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-3">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--text-lo)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                                <p className="text-sm" style={{ color: 'var(--text-lo)' }}>All caught up</p>
                            </div>
                        ) : (
                            <ul className="max-h-[360px] overflow-y-auto">
                                {notifications.slice(0, 5).map((notification) => {
                                    const isScholarship = notification.type === 'scholarship';
                                    const accentColor = isScholarship
                                        ? 'oklch(68% 0.22 150)'   // brand green
                                        : 'oklch(65% 0.18 250)';  // blue-ish

                                    return (
                                        <li key={`${notification.type ?? 'message'}-${notification.messageId}`}>
                                            <button
                                                role="menuitem"
                                                onClick={() => handleNotificationClick(notification)}
                                                className="w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset"
                                                style={{ borderBottom: '1px solid oklch(28% 0.02 260 / 0.5)' }}
                                                onMouseEnter={e => (e.currentTarget.style.background = 'oklch(24% 0.02 260 / 0.6)')}
                                                onMouseLeave={e => (e.currentTarget.style.background = '')}
                                            >
                                                {/* Icon pill */}
                                                <span
                                                    className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl mt-0.5"
                                                    style={{
                                                        background: `${accentColor.replace(')', ' / 0.15)')}`,
                                                        color: accentColor,
                                                        border: `1px solid ${accentColor.replace(')', ' / 0.25)')}`,
                                                    }}
                                                >
                                                    {isScholarship ? <ScholarshipIcon /> : <MessageIcon />}
                                                </span>

                                                <div className="flex-1 min-w-0">
                                                    {/* Type label + time */}
                                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                                        <span
                                                            className="text-[10px] font-bold uppercase tracking-wider"
                                                            style={{ color: accentColor }}
                                                        >
                                                            {isScholarship ? 'Scholarship Offer' : 'Message'}
                                                        </span>
                                                        <span className="text-[10px] shrink-0" style={{ color: 'var(--text-lo)' }}>
                                                            {getRelativeTime(notification.sentAt)}
                                                        </span>
                                                    </div>
                                                    {/* Sender */}
                                                    <p className="text-sm font-semibold truncate leading-snug" style={{ color: 'var(--text-hi)' }}>
                                                        {notification.senderName}
                                                    </p>
                                                    {/* Preview */}
                                                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-mid)' }}>
                                                        {notification.preview}
                                                    </p>
                                                </div>

                                                {/* Chevron */}
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-2" aria-hidden="true" style={{ color: 'var(--text-lo)' }}>
                                                    <path d="M9 18l6-6-6-6" />
                                                </svg>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
