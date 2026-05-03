'use client';

import { PlayerNavbar } from '@/dashboard/player/components/PlayerNavbar';
import { ProgressBar } from '@/components/primitives/ProgressBar';
import { PlayerCacheProvider } from './PlayerCacheContext';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { extractPlayerId } from './utils/extractPlayerId';

interface PlayerLayoutProps {
    children: React.ReactNode;
}

export default function PlayerLayout({ children }: PlayerLayoutProps) {
    const pathname = usePathname();
    const playerId = extractPlayerId(pathname);

    // ProgressBar: active during route transitions
    const [navLoading, setNavLoading] = useState(false);
    const prevPathname = useRef(pathname);

    useEffect(() => {
        if (prevPathname.current !== pathname) {
            setNavLoading(true);
            const t = setTimeout(() => setNavLoading(false), 500);
            prevPathname.current = pathname;
            return () => clearTimeout(t);
        }
    }, [pathname]);

    return (
        <PlayerCacheProvider>
            <div
                className="relative min-h-screen"
                style={{ background: 'var(--ink-0)' }}
            >
                <div aria-hidden="true" className="field-bg" />
                <div className="relative z-10">
                    <ProgressBar active={navLoading} />
                    <PlayerNavbar playerId={playerId} />
                    <main className="pt-14 md:pt-16 pb-16 md:pb-0" role="main" aria-label="Player content">
                        {children}
                    </main>
                </div>
            </div>
        </PlayerCacheProvider>
    );
}
