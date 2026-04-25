'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { CoachNavbarProps, NavProps } from '../types';
import { AthleteSearchModal } from './AthleteSearchModal';
import { NotificationBell } from '../../../messages/components/NotificationBell';


/**
 * Coach Navigation Bar Component
 * 
 * Provides navigation for coaches with responsive design:
 * - Desktop: Horizontal navigation with Home, Search, Profile, and Logout
 * - Mobile: Hamburger menu with dropdown navigation
 * 
 * Features:
 * - Athlete search modal integration
 * - Responsive breakpoint at 768px
 * - Accessible keyboard navigation
 * - ARIA labels for screen readers
 * 
 * @param props - Component props
 * @param props.coachId - Unique identifier for the coach
 * @returns Navigation bar with responsive menu and search functionality
 * 
 * @example
 * ```tsx
 * <CoachNavbar coachId="coach-123" />
 * ```
 */
export function CoachNavbar({ coachId }: CoachNavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchModalOpen, setSearchModalOpen] = useState(false);

    const router = useRouter();

    const handleLogout = useCallback(async (): Promise<void> => {
        document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/login');
    }, [router]);

    const handleSearchClick = useCallback((e: React.MouseEvent): void => {
        e.preventDefault();
        setMobileMenuOpen(false);
        setSearchModalOpen(true);
    }, []);

    const handleCloseSearchModal = useCallback((): void => {
        setSearchModalOpen(false);
    }, []);

    const handleProspectsClick = useCallback((e: React.MouseEvent): void => {
        e.preventDefault();
        setMobileMenuOpen(false);
        router.push(`/coach/${coachId}/prospects`);
    }, [router, coachId]);

    const handleMessagesClick = useCallback((e: React.MouseEvent): void => {
        e.preventDefault();
        setMobileMenuOpen(false);
        router.push(`/coach/${coachId}/messages`);
    }, [router, coachId]);

    const handleProfileClick = useCallback((e: React.MouseEvent): void => {
        e.preventDefault();
        setMobileMenuOpen(false);
        router.push(`/coach/${coachId}/profile`);
    }, [router, coachId]);

    const toggleMobileMenu = useCallback((): void => {
        setMobileMenuOpen((prev) => !prev);
    }, []);

    return (
        <nav
            aria-label="Main navigation"
            className="w-full bg-gray-900 border-b border-gray-800 relative z-50"
        >
            <div className="flex items-center justify-between h-20 px-6">
                <CABBranding coachId={coachId} />
                <HamburgerButton isOpen={mobileMenuOpen} onClick={toggleMobileMenu} />
                <DesktopNav
                    coachId={coachId}
                    onSearchClick={handleSearchClick}
                    onProspectsClick={handleProspectsClick}
                    onMessagesClick={handleMessagesClick}
                    onProfileClick={handleProfileClick}
                    onLogout={handleLogout}
                />
            </div>

            {mobileMenuOpen && (
                <MobileDropdown
                    coachId={coachId}
                    onSearchClick={handleSearchClick}
                    onProspectsClick={handleProspectsClick}
                    onMessagesClick={handleMessagesClick}
                    onProfileClick={handleProfileClick}
                    onLogout={handleLogout}
                />
            )}

            <AthleteSearchModal
                isOpen={searchModalOpen}
                onClose={handleCloseSearchModal}
                coachId={coachId}
            />

            <ResponsiveStyles />
        </nav>
    );
}

function CABBranding({ coachId }: { coachId: string }): React.ReactElement {
    return (
        <Link
            href={`/coach/${coachId}/dashboard`}
            className="text-3xl font-bold text-white tracking-tight"
            aria-label="College Athlete Base - Return to home"
        >
            CAB
        </Link>
    );
}

function HamburgerButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }): React.ReactElement {
    return (
        <button
            onClick={onClick}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="mobile-nav-menu"
            className="mobile-menu-button hidden flex-col justify-center items-center w-11 h-11 bg-transparent border-none cursor-pointer p-2 focus:outline-none focus:ring-2 focus:ring-white rounded"
        >
            <span
                aria-hidden="true"
                className="block w-6 h-0.5 bg-white mb-1.5 transition-all duration-300"
                style={{ transform: isOpen ? 'rotate(45deg) translateY(7px)' : 'none' }}
            />
            <span
                aria-hidden="true"
                className="block w-6 h-0.5 bg-white mb-1.5 transition-all duration-300"
                style={{ opacity: isOpen ? 0 : 1 }}
            />
            <span
                aria-hidden="true"
                className="block w-6 h-0.5 bg-white transition-all duration-300"
                style={{ transform: isOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }}
            />
        </button>
    );
}


function DesktopNav({ coachId, onSearchClick, onProspectsClick, onMessagesClick, onProfileClick, onLogout }: NavProps): React.ReactElement {
    const baseCls = 'px-6 py-3 text-sm font-medium text-gray-300 bg-transparent rounded-lg transition-all duration-200 cursor-pointer hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-white';

    return (
        <div className="desktop-nav hidden md:flex items-center gap-6">
            <a href={`/coach/${coachId}/dashboard`} className={baseCls}>
                Home
            </a>
            <button onClick={onSearchClick} className={`${baseCls} border-none`}>
                Search
            </button>
            <button onClick={onProspectsClick} className={`${baseCls} border-none`}>
                Prospects
            </button>
            <button onClick={onMessagesClick} className={`${baseCls} border-none`}>
                Messages
            </button>
            <button onClick={onProfileClick} className={`${baseCls} border-none`}>
                Profile
            </button>
            <NotificationBell userId={coachId} userType="coach" />
            <button
                onClick={onLogout}
                className="px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-lg border-none transition-all duration-200 cursor-pointer hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
                Log Out
            </button>
        </div>
    );
}

function MobileDropdown({ coachId, onSearchClick, onProspectsClick, onMessagesClick, onProfileClick, onLogout }: NavProps): React.ReactElement {
    const baseCls = 'px-6 py-4 text-base font-medium text-gray-300 bg-transparent border-none border-b border-gray-700 text-left w-full transition-all duration-200 cursor-pointer hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white';

    return (
        <div
            id="mobile-nav-menu"
            className="mobile-dropdown md:hidden flex-col bg-gray-800 border-t border-gray-700 py-2"
            role="menu"
            aria-label="Mobile navigation menu"
        >
            <a
                href={`/coach/${coachId}/dashboard`}
                role="menuitem"
                className={`${baseCls} block no-underline`}
            >
                Home
            </a>
            <button onClick={onSearchClick} role="menuitem" className={baseCls}>
                Search
            </button>
            <button onClick={onProspectsClick} role="menuitem" className={baseCls}>
                Prospects
            </button>
            <button onClick={onMessagesClick} role="menuitem" className={baseCls}>
                Messages
            </button>
            <button onClick={onProfileClick} role="menuitem" className={baseCls}>
                Profile
            </button>
            <button
                onClick={onLogout}
                role="menuitem"
                className="px-6 py-4 text-base font-medium text-white bg-red-600 border-none text-left w-full mt-2 transition-all duration-200 cursor-pointer hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-400"
            >
                Log Out
            </button>
        </div>
    );
}

function ResponsiveStyles(): React.ReactElement {
    return (
        <style dangerouslySetInnerHTML={{
            __html: `
                @media (max-width: 768px) {
                    .mobile-menu-button {
                        display: flex !important;
                    }
                    .desktop-nav {
                        display: none !important;
                    }
                    .mobile-dropdown {
                        display: flex !important;
                    }
                }
            `
        }} />
    );
}
