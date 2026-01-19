'use client';

import { PlayerNavbar } from '@/dashboard/player/components/PlayerNavbar';
import { usePathname } from 'next/navigation';

interface PlayerLayoutProps {
    children: React.ReactNode;
}

/**
 * Player Layout Component
 * Wraps all player pages with consistent navigation and background styling
 * Applies background image and renders PlayerNavbar at the top
 */
export default function PlayerLayout({ children }: PlayerLayoutProps) {
    // Extract playerId from the URL path using client-side hook
    const pathname = usePathname();

    // Extract playerId from path like /player/[playerId]/dashboard or /player/[playerId]/profile
    const pathSegments = pathname.split('/').filter(Boolean);
    // Path structure: ['player', playerId, 'dashboard'] or ['player', playerId, 'profile']
    const playerId = pathSegments[1] || '';

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1a2942] to-[#0A1628]">
            {/* Navigation Bar */}
            <PlayerNavbar playerId={playerId} />

            {/* Content Area */}
            <main className="pt-20">
                {children}
            </main>
        </div>
    );
}
