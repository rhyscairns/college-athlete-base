'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PlayerNavbar } from '@/dashboard/player/components/PlayerNavbar';
import { PlayerCacheProvider } from './PlayerCacheContext';
import { extractPlayerId } from './utils/extractPlayerId';

/**
 * Player layout — wraps all /player/* routes.
 *
 * Also detects bfcache restores (back-button after logout) and redirects
 * to /login if the session is no longer valid.
 */
export default function PlayerLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const playerId = extractPlayerId(pathname ?? '');

    useEffect(() => {
        const handlePageShow = async (e: PageTransitionEvent) => {
            // persisted = true means the page was restored from bfcache
            if (!e.persisted) return;

            try {
                const res = await fetch('/api/auth/session', { method: 'GET', cache: 'no-store' });
                if (!res.ok) {
                    router.replace('/login');
                }
            } catch {
                // Network error — leave the user where they are
            }
        };

        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, [router]);

    return (
        <PlayerCacheProvider>
            <div className="min-h-screen" style={{ background: 'var(--ink-0)' }}>
                <PlayerNavbar playerId={playerId} />
                <main className="pt-16 pb-16 md:pb-0" aria-label="Player content">
                    {children}
                </main>
            </div>
        </PlayerCacheProvider>
    );
}
