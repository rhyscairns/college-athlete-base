'use client';

import { useState } from 'react';
import type { CoachNavbarProps } from '../types';

export function CoachNavbar({ coachId }: CoachNavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            // Clear session cookie by calling logout endpoint or clearing client-side
            document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

            // Redirect to login page
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleSearchClick = (e: React.MouseEvent) => {
        e.preventDefault();
        // Placeholder for future modal functionality
        setMobileMenuOpen(false);
    };

    const handleProfileClick = (e: React.MouseEvent) => {
        e.preventDefault();
        // Placeholder for future profile page navigation
        setMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <nav style={{ width: '100%', backgroundColor: '#111827', borderBottom: '1px solid #1f2937' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '80px',
                paddingLeft: '24px',
                paddingRight: '24px'
            }}>
                {/* CAB Branding */}
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

                {/* Mobile Hamburger Menu */}
                <button
                    onClick={toggleMobileMenu}
                    aria-label="Toggle menu"
                    aria-expanded={mobileMenuOpen}
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
                        transform: mobileMenuOpen ? 'rotate(45deg) translateY(7px)' : 'none'
                    }} />
                    <span style={{
                        width: '24px',
                        height: '2px',
                        backgroundColor: 'white',
                        marginBottom: '5px',
                        transition: 'all 0.3s',
                        opacity: mobileMenuOpen ? 0 : 1
                    }} />
                    <span style={{
                        width: '24px',
                        height: '2px',
                        backgroundColor: 'white',
                        transition: 'all 0.3s',
                        transform: mobileMenuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none'
                    }} />
                </button>

                {/* Desktop Navigation */}
                <div
                    className="desktop-nav"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '24px'
                    }}
                >
                    <a
                        href={`/coach/dashboard/${coachId}`}
                        style={{
                            padding: '12px 24px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#d1d5db',
                            backgroundColor: 'transparent',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#1f2937';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#d1d5db';
                        }}
                    >
                        Home
                    </a>
                    <button
                        onClick={handleSearchClick}
                        style={{
                            padding: '12px 24px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#d1d5db',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#1f2937';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#d1d5db';
                        }}
                    >
                        Search
                    </button>
                    <button
                        onClick={handleProfileClick}
                        style={{
                            padding: '12px 24px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#d1d5db',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#1f2937';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#d1d5db';
                        }}
                    >
                        Profile
                    </button>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '12px 24px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: 'white',
                            backgroundColor: '#dc2626',
                            border: 'none',
                            borderRadius: '8px',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#b91c1c';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                        }}
                    >
                        Log Out
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div
                    className="mobile-dropdown"
                    style={{
                        display: 'none',
                        flexDirection: 'column',
                        backgroundColor: '#1f2937',
                        borderTop: '1px solid #374151',
                        paddingTop: '8px',
                        paddingBottom: '8px'
                    }}
                >
                    <a
                        href={`/coach/dashboard/${coachId}`}
                        style={{
                            padding: '16px 24px',
                            fontSize: '16px',
                            fontWeight: '500',
                            color: '#d1d5db',
                            backgroundColor: 'transparent',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            borderBottom: '1px solid #374151'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#374151';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#d1d5db';
                        }}
                    >
                        Home
                    </a>
                    <button
                        onClick={handleSearchClick}
                        style={{
                            padding: '16px 24px',
                            fontSize: '16px',
                            fontWeight: '500',
                            color: '#d1d5db',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderBottom: '1px solid #374151',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#374151';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#d1d5db';
                        }}
                    >
                        Search
                    </button>
                    <button
                        onClick={handleProfileClick}
                        style={{
                            padding: '16px 24px',
                            fontSize: '16px',
                            fontWeight: '500',
                            color: '#d1d5db',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderBottom: '1px solid #374151',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#374151';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#d1d5db';
                        }}
                    >
                        Profile
                    </button>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '16px 24px',
                            fontSize: '16px',
                            fontWeight: '500',
                            color: 'white',
                            backgroundColor: '#dc2626',
                            border: 'none',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            width: '100%',
                            marginTop: '8px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#b91c1c';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                        }}
                    >
                        Log Out
                    </button>
                </div>
            )}

            {/* Responsive Styles */}
            <style jsx>{`
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
            `}</style>
        </nav>
    );
}
