'use client';

import { useState, useEffect } from 'react';
import { JSX } from 'react/jsx-runtime';

/**
 * Section configuration for profile navigation
 */
interface Section {
    id: string;
    label: string;
}

/**
 * All available profile sections that can be navigated to
 */
const allSections: Section[] = [
    { id: 'hero', label: 'Profile' },
    { id: 'stats', label: 'Stats' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'academics', label: 'Academics' },
    { id: 'highlights', label: 'Highlights' },
    { id: 'coaches', label: 'Coaches' },
    { id: 'contact', label: 'Contact' },
];

/**
 * ProfileSideNav Component
 * 
 * A fixed side navigation bar for player profile pages that:
 * - Automatically detects which sections are present in the DOM
 * - Highlights the currently visible section based on scroll position
 * - Provides smooth scroll navigation to each section
 * - Only displays on desktop (lg breakpoint and above)
 * 
 * Features:
 * - Dynamic section detection (only shows sections that exist)
 * - Active section tracking with scroll spy
 * - Smooth scroll with navbar offset compensation
 * - Accessible keyboard navigation
 * - Visual active indicator
 * 
 * @returns Side navigation component or null if no sections detected
 * 
 * @example
 * ```tsx
 * // Used in PlayerProfileView
 * <ProfileSideNav />
 * ```
 */
export function ProfileSideNav(): JSX.Element | null {
    const [activeSection, setActiveSection] = useState('hero');
    const [availableSections, setAvailableSections] = useState<Section[]>([]);

    // Detect which sections are actually present in the DOM
    useEffect(() => {
        const detectSections = () => {
            const present = allSections.filter((section) => {
                const element = document.getElementById(section.id);
                return element !== null;
            });
            setAvailableSections(present);
        };

        // Initial detection
        detectSections();

        // Re-detect after a short delay to ensure all sections are rendered
        const timeoutId = setTimeout(detectSections, 100);

        return () => clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const handleScroll = (): void => {
            // Throttle scroll handler to improve performance
            if (timeoutId) {
                return;
            }

            timeoutId = setTimeout(() => {
                const scrollPosition = window.scrollY + 100;

                for (const section of availableSections) {
                    const element = document.getElementById(section.id);
                    if (element) {
                        const { offsetTop, offsetHeight } = element;
                        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                            setActiveSection(section.id);
                            break;
                        }
                    }
                }

                timeoutId = null as any;
            }, 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [availableSections]);

    const scrollToSection = (sectionId: string): void => {
        const element = document.getElementById(sectionId);
        if (element) {
            const navbarHeight = 80;
            const elementPosition = element.offsetTop - navbarHeight;
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth',
            });
        }
    };

    // Don't render if no sections are available
    if (availableSections.length === 0) {
        return null;
    }

    return (
        <nav
            className="fixed left-0 top-0 h-screen w-48 z-10 hidden lg:flex flex-col items-center justify-center"
            style={{ background: 'var(--ink-1)', borderRight: '1px solid var(--ink-3)' }}
        >
            <div className="space-y-1 w-full px-3">
                {availableSections.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className="group relative flex items-center w-full px-4 py-3 rounded-lg transition-all text-left text-sm"
                        style={{
                            background: activeSection === section.id ? 'oklch(68% 0.22 150 / 0.1)' : 'transparent',
                            color: activeSection === section.id ? 'var(--brand-500)' : 'var(--text-mid)',
                            fontWeight: activeSection === section.id ? 600 : 400,
                        }}
                        onMouseEnter={e => {
                            if (activeSection !== section.id) {
                                e.currentTarget.style.background = 'var(--ink-2)';
                                e.currentTarget.style.color = 'var(--text-hi)';
                            }
                        }}
                        onMouseLeave={e => {
                            if (activeSection !== section.id) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-mid)';
                            }
                        }}
                        title={section.label}
                        aria-current={activeSection === section.id ? 'location' : undefined}
                    >
                        <span>{section.label}</span>

                        {/* Active Indicator */}
                        {activeSection === section.id && (
                            <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                                style={{ background: 'var(--brand-500)' }}
                            ></div>
                        )}
                    </button>
                ))}
            </div>
        </nav>
    );
}
