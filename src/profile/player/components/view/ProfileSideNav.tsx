'use client';

import { useState, useEffect } from 'react';

const sections = [
    { id: 'hero', label: 'Profile', icon: '👤' },
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'academics', label: 'Academics', icon: '🎓' },
    { id: 'highlights', label: 'Highlights', icon: '🎥' },
    { id: 'coaches', label: 'Coaches', icon: '💬' },
    { id: 'contact', label: 'Contact', icon: '📧' },
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
        <nav className="fixed left-0 top-0 h-screen w-20 bg-black/40 backdrop-blur-md border-r border-white/10 z-40 hidden lg:flex flex-col items-center justify-center">
            <div className="space-y-4">
                {sections.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`group relative flex items-center justify-center w-14 h-14 rounded-xl transition-all ${activeSection === section.id
                                ? 'bg-yellow-400/20 text-yellow-400 scale-110'
                                : 'text-slate-400 hover:text-white hover:bg-white/10 hover:scale-105'
                            }`}
                        title={section.label}
                    >
                        <span className="text-2xl">{section.icon}</span>

                        {/* Tooltip */}
                        <div className="absolute left-full ml-4 px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                            <span className="text-sm font-medium text-white">{section.label}</span>
                        </div>

                        {/* Active Indicator */}
                        {activeSection === section.id && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-yellow-400 rounded-r-full"></div>
                        )}
                    </button>
                ))}
            </div>
        </nav>
    );
}
