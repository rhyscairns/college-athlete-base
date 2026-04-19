'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CoachNavbarProps } from '../types';
import { AthleteSearchModal } from './AthleteSearchModal';
import { JSX } from 'react/jsx-runtime';

/**
 * Color constants for the coach navigation bar
 * Provides consistent theming across all navigation elements
 */
const COLORS = {
    LIGHT_GRAY: '#d1d5db',
    DARK_GRAY: '#1f2937',
    DARKER_GRAY: '#374151',
    RED: '#dc2626',
    DARK_RED: '#b91c1c',
} as const;

/**
 * Creates reusable hover event handlers for navigation items
 * 
 * @param activeColor - Background color when hovering
 * @param inactiveColor - Text color when not hovering
 * @returns Object with onMouseEnter and onMouseLeave handlers
 * 
 * @example
 * ```tsx
 * const handlers = createHoverHandlers('#1f2937', '#d1d5db');
 * <button {...handlers}>Click me</button>
 * ```
 */
const createHoverHandlers = (activeColor: string, inactiveColor: string): {
    onMouseEnter: (_e: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave: (_e: React.MouseEvent<HTMLElement>) => void;
} => ({
    onMouseEnter: (_e: React.MouseEvent<HTMLElement>): void => {
        _e.currentTarget.style.backgroundColor = activeColor;
        _e.currentTarget.style.color = 'white';
    },
    onMouseLeave: (_e: React.MouseEvent<HTMLElement>): void => {
        _e.currentTarget.style.backgroundColor = 'transparent';
        _e.currentTarget.style.color = inactiveColor;
    },
});

const navItemHoverHandlers = createHoverHandlers(COLORS.DARK_GRAY, COLORS.LIGHT_GRAY);
const mobileItemHoverHandlers = createHoverHandlers(COLORS.DARKER_GRAY, COLORS.LIGHT_GRAY);

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

    const handleLogout = async (): Promise<void> => {
        try {
            document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            window.location.href = '/login';
        } catch (error) {
            // Log error silently - user will be redirected regardless
            // In production, this should be sent to error tracking service
        }
    };

    const handleSearchClick = (e: React.MouseEvent): void => {
        e.preventDefault();
        setMobileMenuOpen(false);
        setSearchModalOpen(true);
    };

    const handleCloseSearchModal = (): void => {
        setSearchModalOpen(false);
    };

    const handleProfileClick = (e: React.MouseEvent): void => {
        e.preventDefault();
        setMobileMenuOpen(false);
        window.location.href = `/coach/${coachId}/profile`;
    };

    const toggleMobileMenu = (): void => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <nav style={{ width: '100%', backgroundColor: '#111827', borderBottom: '1px solid #1f2937', position: 'relative', zIndex: 50 }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '80px',
                paddingLeft: '24px',
                paddingRight: '24px'
            }}>
                <CABBranding />
                <HamburgerButton isOpen={mobileMenuOpen} onClick={toggleMobileMenu} />
                <DesktopNav
                    coachId={coachId}
                    onSearchClick={handleSearchClick}
                    onProfileClick={handleProfileClick}
                    onLogout={handleLogout}
                />
            </div>

            {mobileMenuOpen && (
                <MobileDropdown
                    coachId={coachId}
                    onSearchClick={handleSearchClick}
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

function CABBranding(): JSX.Element {
    return (
        <Link
            href="/coach/dashboard"
            style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: 'white',
                letterSpacing: '-0.5px',
                textDecoration: 'none',
                display: 'inline-block'
            }}
            aria-label="College Athlete Base - Return to home"
        >
            CAB
        </Link>
    );
}

function HamburgerButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }): JSX.Element {
    return (
        <button
            onClick={onClick}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            style={{
                display: 'none',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '44px',
                height: '44px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px'
            }}
            className="mobile-menu-button"
        >
            <span
                aria-hidden="true"
                style={{
                    width: '24px',
                    height: '2px',
                    backgroundColor: 'white',
                    marginBottom: '5px',
                    transition: 'all 0.3s',
                    transform: isOpen ? 'rotate(45deg) translateY(7px)' : 'none'
                }}
            />
            <span
                aria-hidden="true"
                style={{
                    width: '24px',
                    height: '2px',
                    backgroundColor: 'white',
                    marginBottom: '5px',
                    transition: 'all 0.3s',
                    opacity: isOpen ? 0 : 1
                }}
            />
            <span
                aria-hidden="true"
                style={{
                    width: '24px',
                    height: '2px',
                    backgroundColor: 'white',
                    transition: 'all 0.3s',
                    transform: isOpen ? 'rotate(-45deg) translateY(-7px)' : 'none'
                }}
            />
        </button>
    );
}

interface NavProps {
    coachId: string;
    onSearchClick: (_e: React.MouseEvent) => void;
    onProfileClick: (_e: React.MouseEvent) => void;
    onLogout: () => void;
}

function DesktopNav({ coachId, onSearchClick, onProfileClick, onLogout }: NavProps): JSX.Element {
    const baseStyle = {
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '500',
        color: COLORS.LIGHT_GRAY,
        backgroundColor: 'transparent',
        borderRadius: '8px',
        transition: 'all 0.2s',
        cursor: 'pointer'
    };

    return (
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a
                href={`/coach/${coachId}/dashboard`}
                style={{ ...baseStyle, textDecoration: 'none' }}
                {...navItemHoverHandlers}
            >
                Home
            </a>
            <button onClick={onSearchClick} style={{ ...baseStyle, border: 'none' }} {...navItemHoverHandlers}>
                Search
            </button>
            <button onClick={onProfileClick} style={{ ...baseStyle, border: 'none' }} {...navItemHoverHandlers}>
                Profile
            </button>
            <button
                onClick={onLogout}
                style={{
                    ...baseStyle,
                    color: 'white',
                    backgroundColor: COLORS.RED,
                    border: 'none'
                }}
                onMouseEnter={(_e) => { _e.currentTarget.style.backgroundColor = COLORS.DARK_RED; }}
                onMouseLeave={(_e) => { _e.currentTarget.style.backgroundColor = COLORS.RED; }}
            >
                Log Out
            </button>
        </div>
    );
}

function MobileDropdown({ coachId, onSearchClick, onProfileClick, onLogout }: NavProps): JSX.Element {
    const baseStyle = {
        padding: '16px 24px',
        fontSize: '16px',
        fontWeight: '500',
        color: COLORS.LIGHT_GRAY,
        backgroundColor: 'transparent',
        transition: 'all 0.2s',
        cursor: 'pointer'
    };

    return (
        <div
            className="mobile-dropdown"
            role="menu"
            aria-label="Mobile navigation menu"
            style={{
                display: 'none',
                flexDirection: 'column',
                backgroundColor: COLORS.DARK_GRAY,
                borderTop: `1px solid ${COLORS.DARKER_GRAY}`,
                paddingTop: '8px',
                paddingBottom: '8px'
            }}
        >
            <a
                href={`/coach/${coachId}/dashboard`}
                role="menuitem"
                style={{
                    ...baseStyle,
                    textDecoration: 'none',
                    borderBottom: `1px solid ${COLORS.DARKER_GRAY}`
                }}
                {...mobileItemHoverHandlers}
            >
                Home
            </a>
            <button
                onClick={onSearchClick}
                role="menuitem"
                style={{
                    ...baseStyle,
                    border: 'none',
                    borderBottom: `1px solid ${COLORS.DARKER_GRAY}`,
                    textAlign: 'left',
                    width: '100%'
                }}
                {...mobileItemHoverHandlers}
            >
                Search
            </button>
            <button
                onClick={onProfileClick}
                role="menuitem"
                style={{
                    ...baseStyle,
                    border: 'none',
                    borderBottom: `1px solid ${COLORS.DARKER_GRAY}`,
                    textAlign: 'left',
                    width: '100%'
                }}
                {...mobileItemHoverHandlers}
            >
                Profile
            </button>
            <button
                onClick={onLogout}
                role="menuitem"
                style={{
                    ...baseStyle,
                    color: 'white',
                    backgroundColor: COLORS.RED,
                    border: 'none',
                    textAlign: 'left',
                    width: '100%',
                    marginTop: '8px'
                }}
                onMouseEnter={(_e) => { _e.currentTarget.style.backgroundColor = COLORS.DARK_RED; }}
                onMouseLeave={(_e) => { _e.currentTarget.style.backgroundColor = COLORS.RED; }}
            >
                Log Out
            </button>
        </div>
    );
}

function ResponsiveStyles(): JSX.Element {
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
