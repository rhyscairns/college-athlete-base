'use client';

import { PlayerNavbar } from '@/dashboard/player/components/PlayerNavbar';
import { usePathname } from 'next/navigation';
import { extractPlayerId } from './utils/extractPlayerId';

interface PlayerLayoutProps {
    children: React.ReactNode;
}

/**
 * Player Layout Component
 * 
 * Wraps all player pages with consistent navigation and background styling.
 * Extracts playerId from URL patterns and provides it to the PlayerNavbar.
 * 
 * Supported URL patterns:
 * - /player/[playerId]/dashboard
 * - /player/[playerId]/profile
 * - /player/dashboard/[playerId]/...
 * 
 * @param props - Component props
 * @param props.children - Child components to render within the layout
 * @returns Layout wrapper with navigation and gradient background
 */
export default function PlayerLayout({ children }: PlayerLayoutProps) {
    const pathname = usePathname();
    const playerId = extractPlayerId(pathname);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1a2942] to-[#0A1628]">
            {/* Navigation Bar */}
            <PlayerNavbar playerId={playerId} />

            {/* Content Area */}
            <main className="pt-20" role="main" aria-label="Player content">
                {children}
            </main>
        </div>
    );
}
