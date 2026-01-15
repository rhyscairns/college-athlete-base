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
        <div
            className="min-h-screen bg-gray-900"
            style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
            }}
        >
            {/* Semi-transparent overlay for content readability */}
            <div className="min-h-screen bg-black/20">
                {/* Navigation Bar */}
                <PlayerNavbar playerId={playerId} />

                {/* Content Area */}
                <main>
                    {children}
                </main>
            </div>
        </div>
    );
}
