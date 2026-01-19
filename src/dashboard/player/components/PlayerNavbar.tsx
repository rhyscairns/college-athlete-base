'use client';

import { useState } from 'react';
import type { PlayerNavbarProps } from '../types';

// Constants
const COLORS = {
    LIGHT_GRAY: '#d1d5db',
    DARK_GRAY: '#1f2937',
    DARKER_GRAY: '#374151',
    RED: '#dc2626',
    DARK_RED: '#b91c1c',
} as const;

// Shared hover handlers
const createHoverHandlers = (activeColor: string, inactiveColor: string) => ({
    onMouseEnter: (_e: React.MouseEvent<HTMLElement>) => {
        _e.currentTarget.style.backgroundColor = activeColor;
        _e.currentTarget.style.color = 'white';
    },
    onMouseLeave: (_e: React.MouseEvent<HTMLElement>) => {
        _e.currentTarget.style.backgroundColor = 'transparent';
        _e.currentTarget.style.color = inactiveColor;
    },
});

const navItemHoverHandlers = createHoverHandlers(COLORS.DARK_GRAY, COLORS.LIGHT_GRAY);
const mobileItemHoverHandlers = createHoverHandlers(COLORS.DARKER_GRAY, COLORS.LIGHT_GRAY);

export function PlayerNavbar({ playerId }: PlayerNavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleProfileClick = (_e: React.MouseEvent) => {
        _e.preventDefault();
        window.location.href = `/player/${playerId}/profile`;
        setMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            width: '100%',
            backgroundColor: '#111827',
            borderBottom: '1px solid #1f2937',
            zIndex: 50
        }}>
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
                    playerId={playerId}
                    onProfileClick={handleProfileClick}
                    onLogout={handleLogout}
                />
            </div>

            {
                mobileMenuOpen && (
                    <MobileDropdown
                        playerId={playerId}
                        onProfileClick={handleProfileClick}
                        onLogout={handleLogout}
                    />
                )
            }

            <ResponsiveStyles />
        </nav >
    );
}

function CABBranding() {
    return (
        <div>
            <span style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: 'white',
                letterSpacing: '-0.5px'
            }}>
                CAB
            </span>
        </div>
    );
}

function HamburgerButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
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
            <span style={{
                width: '24px',
                height: '2px',
                backgroundColor: 'white',
                marginBottom: '5px',
                transition: 'all 0.3s',
                transform: isOpen ? 'rotate(45deg) translateY(7px)' : 'none'
            }} />
            <span style={{
                width: '24px',
                height: '2px',
                backgroundColor: 'white',
                marginBottom: '5px',
                transition: 'all 0.3s',
                opacity: isOpen ? 0 : 1
            }} />
            <span style={{
                width: '24px',
                height: '2px',
                backgroundColor: 'white',
                transition: 'all 0.3s',
                transform: isOpen ? 'rotate(-45deg) translateY(-7px)' : 'none'
            }} />
        </button>
    );
}

interface NavProps {
    playerId: string;
    onProfileClick: (_e: React.MouseEvent) => void;
    onLogout: () => void;
}

function DesktopNav({ playerId, onProfileClick, onLogout }: NavProps) {
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
                href={`/player/${playerId}/dashboard`}
                style={{ ...baseStyle, textDecoration: 'none' }}
                {...navItemHoverHandlers}
            >
                Home
            </a>
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

function MobileDropdown({ playerId, onProfileClick, onLogout }: NavProps) {
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
                href={`/player/${playerId}/dashboard`}
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
                onClick={onProfileClick}
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

function ResponsiveStyles() {
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
