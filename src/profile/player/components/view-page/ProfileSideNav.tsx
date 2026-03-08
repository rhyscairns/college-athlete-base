'use client';

import { useState, useEffect } from 'react';

const sections = [
    { id: 'hero', label: 'Profile' },
    { id: 'stats', label: 'Stats' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'academics', label: 'Academics' },
    { id: 'highlights', label: 'Highlights' },
    { id: 'coaches', label: 'Coaches' },
    { id: 'contact', label: 'Contact' },
];

export function ProfileSideNav() {
    const [activeSection, setActiveSection] = useState('hero');

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 100;

            for (const section of sections) {
                const element = document.getElementById(section.id);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section.id);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId: string) => {
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

    return (
        <nav className="fixed left-0 top-0 h-screen w-48 bg-white border-r border-gray-200 z-40 hidden lg:flex flex-col items-center justify-center shadow-lg">
            <div className="space-y-1 w-full px-3">
                {sections.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`group relative flex items-center w-full px-4 py-3 rounded-lg transition-all text-left ${activeSection === section.id
                            ? 'bg-blue-50 text-blue-600 font-semibold'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        title={section.label}
                    >
                        <span className="text-sm">{section.label}</span>

                        {/* Active Indicator */}
                        {activeSection === section.id && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full"></div>
                        )}
                    </button>
                ))}
            </div>
        </nav>
    );
}
