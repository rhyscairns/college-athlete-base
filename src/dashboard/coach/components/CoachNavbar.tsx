'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import type { CoachNavbarProps } from '../types';
import { AthleteSearchModal } from './AthleteSearchModal';
import { NotificationBell } from '../../../messages/components/NotificationBell';
import { useTheme } from '../../../hooks/useTheme';

// ── Nav items config ──────────────────────────────────────────────────────────
const NAV_ITEMS = (coachId: string) => [
    { key: 'home', label: 'Home', href: `/coach/${coachId}/dashboard` },
    { key: 'prospects', label: 'Prospects', href: `/coach/${coachId}/prospects` },
    { key: 'messages', label: 'Messages', href: `/coach/${coachId}/messages` },
    { key: 'scholarships', label: 'Scholarships', href: `/coach/${coachId}/scholarships` },
    { key: 'profile', label: 'Profile', href: `/coach/${coachId}/profile` },
] as const;

// ── Glass style shared between desktop + mobile ───────────────────────────────
const glassNavStyle: React.CSSProperties = {
    backdropFilter: 'blur(20px) saturate(1.4)',
    background: 'oklch(19% 0.018 260 / 0.85)',
    borderBottom: '1px solid oklch(30% 0.022 260 / 0.6)',
};

/**
 * CoachNavbar — 2026 redesign
 *
 * Desktop: glass horizontal bar with sliding active-route underline.
 * Mobile: glass top bar (branding + hamburger) + bottom tab bar.
 * Active indicator uses CSS custom property + transition for smooth slide.
 */
export function CoachNavbar({ coachId }: CoachNavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { theme, toggle: toggleTheme } = useTheme();

    const handleLogout = useCallback(async () => {
        document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/login');
    }, [router]);

    const handleSearchClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setMobileMenuOpen(false);
        setSearchModalOpen(true);
    }, []);

    const toggleMobileMenu = useCallback(() => setMobileMenuOpen(p => !p), []);

    const navItems = NAV_ITEMS(coachId);
    const isSearchActive = pathname?.includes('/dashboard/search') ?? false;

    return (
        <>
            {/* ── Desktop + tablet top bar ── */}
            <nav
                aria-label="Main navigation"
                className="glass-nav fixed top-0 left-0 right-0 z-50 hidden md:block"
                style={glassNavStyle}
            >
                <div className="flex items-center justify-between h-16 px-6 max-w-screen-xl mx-auto">
                    {/* Branding */}
                    <Link
                        href={`/coach/${coachId}/dashboard`}
                        className="text-2xl font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-white rounded"
                        aria-label="College Athlete Base - Return to home"
                        style={{ color: 'var(--text-hi)' }}
                    >
                        CAB
                    </Link>

                    {/* Desktop nav links */}
                    <div className="flex items-center gap-1" role="list">
                        {navItems.map(item => (
                            <NavLink
                                key={item.key}
                                href={item.href}
                                label={item.label}
                                active={
                                    item.key === 'home'
                                        ? pathname === item.href
                                        : (pathname?.startsWith(item.href) ?? false)
                                }
                            />
                        ))}
                        <button
                            onClick={handleSearchClick}
                            aria-label="Search"
                            className="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                            style={{ color: isSearchActive ? 'var(--text-hi)' : 'var(--text-mid)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-hi)')}
                            onMouseLeave={e => (e.currentTarget.style.color = isSearchActive ? 'var(--text-hi)' : 'var(--text-mid)')}
                        >
                            Search
                            <span
                                aria-hidden="true"
                                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full transition-all duration-[var(--d-base)] ease-[var(--e-glide)]"
                                style={{
                                    background: 'var(--brand-500)',
                                    opacity: isSearchActive ? 1 : 0,
                                    transform: isSearchActive ? 'scaleX(1)' : 'scaleX(0)',
                                    transformOrigin: 'left',
                                }}
                            />
                        </button>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle theme={theme} onToggle={toggleTheme} />
                        <NotificationBell userId={coachId} userType="coach" />
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1"
                            style={{
                                background: 'var(--ink-3)',
                                color: 'var(--text-mid)',
                                transition: `background var(--d-fast) var(--e-glide), color var(--d-fast) var(--e-glide)`,
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'var(--status-danger)';
                                e.currentTarget.style.color = 'var(--text-hi)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'var(--ink-3)';
                                e.currentTarget.style.color = 'var(--text-mid)';
                            }}
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Mobile top bar ── */}
            <nav
                aria-label="Main navigation"
                className="glass-nav fixed top-0 left-0 right-0 z-50 md:hidden"
                style={glassNavStyle}
            >
                <div className="flex items-center justify-between h-14 px-4">
                    <Link
                        href={`/coach/${coachId}/dashboard`}
                        className="text-xl font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-white rounded"
                        aria-label="College Athlete Base - Return to home"
                        style={{ color: 'var(--text-hi)' }}
                    >
                        CAB
                    </Link>
                    <div className="flex items-center gap-2">
                        <NotificationBell userId={coachId} userType="coach" />
                        <button
                            onClick={toggleMobileMenu}
                            aria-label="Toggle menu"
                            aria-expanded={mobileMenuOpen}
                            aria-controls="mobile-nav-menu"
                            className="mobile-menu-button flex flex-col justify-center items-center w-11 h-11 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                            style={{ background: 'transparent' }}
                        >
                            <span aria-hidden="true" className="block w-5 h-0.5 mb-1 transition-all duration-[var(--d-fast)]"
                                style={{ background: 'var(--text-hi)', transform: mobileMenuOpen ? 'rotate(45deg) translateY(6px)' : 'none' }} />
                            <span aria-hidden="true" className="block w-5 h-0.5 mb-1 transition-all duration-[var(--d-fast)]"
                                style={{ background: 'var(--text-hi)', opacity: mobileMenuOpen ? 0 : 1 }} />
                            <span aria-hidden="true" className="block w-5 h-0.5 transition-all duration-[var(--d-fast)]"
                                style={{ background: 'var(--text-hi)', transform: mobileMenuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none' }} />
                        </button>
                    </div>
                </div>

                {/* Mobile dropdown (hamburger) */}
                {mobileMenuOpen && (
                    <div
                        id="mobile-nav-menu"
                        className="mobile-dropdown py-2"
                        role="menu"
                        aria-label="Mobile navigation menu"
                        style={{ borderTop: '1px solid oklch(30% 0.022 260 / 0.5)' }}
                    >
                        {navItems.map(item => (
                            <Link
                                key={item.key}
                                href={item.href}
                                role="menuitem"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                style={{
                                    color: (item.key === 'home' ? pathname === item.href : pathname?.startsWith(item.href)) ? 'var(--brand-500)' : 'var(--text-mid)',
                                    borderBottom: '1px solid oklch(30% 0.022 260 / 0.3)',
                                }}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <button
                            role="menuitem"
                            onClick={handleSearchClick}
                            className="block w-full text-left px-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            style={{
                                color: isSearchActive ? 'var(--brand-500)' : 'var(--text-mid)',
                                borderBottom: '1px solid oklch(30% 0.022 260 / 0.3)',
                                background: 'transparent',
                            }}
                        >
                            Search
                        </button>
                        <button
                            role="menuitem"
                            onClick={handleLogout}
                            className="block w-full text-left px-5 py-3.5 text-sm font-semibold mt-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-400"
                            style={{ color: 'var(--status-danger)', background: 'transparent' }}
                        >
                            Log Out
                        </button>
                    </div>
                )}
            </nav>

            {/* ── Mobile bottom tab bar ── */}
            <BottomTabBar coachId={coachId} pathname={pathname ?? ''} onSearchClick={handleSearchClick} isSearchActive={isSearchActive} />

            <AthleteSearchModal
                isOpen={searchModalOpen}
                onClose={() => setSearchModalOpen(false)}
                coachId={coachId}
            />
        </>
    );
}

// ── Theme toggle button ───────────────────────────────────────────────────────
function ThemeToggle({ theme, onToggle }: { theme: 'dark' | 'light'; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="w-9 h-9 flex items-center justify-center rounded-lg focus:outline-none focus:ring-2 focus:ring-white transition-colors"
            style={{ background: 'transparent', color: 'var(--text-mid)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-hi)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-mid)')}
        >
            {theme === 'dark' ? (
                /* Sun icon */
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="5" />
                    <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
            ) : (
                /* Moon icon */
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
            )}
        </button>
    );
}

// ── NavLink with sliding active underline ─────────────────────────────────────
function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
    return (
        <Link
            href={href}
            role="listitem"
            className="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            style={{ color: active ? 'var(--text-hi)' : 'var(--text-mid)' }}
            onMouseEnter={e => !active && (e.currentTarget.style.color = 'var(--text-hi)')}
            onMouseLeave={e => !active && (e.currentTarget.style.color = 'var(--text-mid)')}
        >
            {label}
            {/* Sliding underline */}
            <span
                aria-hidden="true"
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full transition-all duration-[var(--d-base)] ease-[var(--e-glide)]"
                style={{
                    background: 'var(--brand-500)',
                    opacity: active ? 1 : 0,
                    transform: active ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left',
                }}
            />
        </Link>
    );
}

// ── Mobile bottom tab bar ─────────────────────────────────────────────────────
function BottomTabBar({
    coachId,
    pathname,
    onSearchClick,
    isSearchActive,
}: {
    coachId: string;
    pathname: string;
    onSearchClick: (e: React.MouseEvent) => void;
    isSearchActive: boolean;
}) {
    const tabs = [
        {
            key: 'home',
            label: 'Home',
            href: `/coach/${coachId}/dashboard`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            key: 'search',
            label: 'Search',
            href: null,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            ),
        },
        {
            key: 'prospects',
            label: 'Prospects',
            href: `/coach/${coachId}/prospects`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            ),
        },
        {
            key: 'messages',
            label: 'Messages',
            href: `/coach/${coachId}/messages`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            ),
        },
        {
            key: 'scholarships',
            label: 'Scholarships',
            href: `/coach/${coachId}/scholarships`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
            ),
        },
        {
            key: 'profile',
            label: 'Profile',
            href: `/coach/${coachId}/profile`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
    ] as const;

    return (
        <nav
            aria-label="Mobile tab navigation"
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
            style={{
                ...glassNavStyle,
                borderBottom: 'none',
                borderTop: '1px solid oklch(30% 0.022 260 / 0.6)',
            }}
        >
            <div className="flex items-stretch h-16 safe-area-inset-bottom">
                {tabs.map(tab => {
                    const isActive = tab.href
                        ? (tab.key === 'home' ? pathname === tab.href : pathname.startsWith(tab.href))
                        : (tab.key === 'search' && isSearchActive);
                    const color = isActive ? 'var(--brand-500)' : 'var(--text-lo)';

                    if (tab.href === null) {
                        return (
                            <button
                                key={tab.key}
                                onClick={onSearchClick}
                                aria-label={tab.label}
                                className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                style={{ background: 'transparent', color }}
                            >
                                {tab.icon}
                                <span className="text-[10px] font-medium">{tab.label}</span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={tab.key}
                            href={tab.href}
                            aria-label={tab.label}
                            aria-current={isActive ? 'page' : undefined}
                            className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            style={{ color }}
                        >
                            {tab.icon}
                            <span className="text-[10px] font-medium">{tab.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
