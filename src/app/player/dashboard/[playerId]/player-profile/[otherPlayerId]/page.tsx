import { PlayerProfileView } from '@/profile/player/components/view-page/PlayerProfileView';
import { getPlayerProfileById } from '@/profile/player/lib/db/queries';
import { logger } from '@/lib/logger';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Player Profile',
    description: 'View player profile',
};

interface PageProps {
    params: Promise<{
        playerId: string;
        otherPlayerId: string;
    }>;
}

/**
 * Player viewing another player's profile page
 * Route: /player/dashboard/[playerId]/player-profile/[otherPlayerId]
 */
export default async function PlayerViewPlayerProfilePage({ params }: PageProps) {
    const { playerId, otherPlayerId } = await params;

    logger.info('Player viewing another player profile', { playerId, otherPlayerId });

    const playerData = await getPlayerProfileById(otherPlayerId).catch(() => null);

    if (!playerData) {
        logger.error('Failed to load player profile', { playerId: otherPlayerId });
        return (
            <main className="flex items-center justify-center min-h-screen" style={{ background: 'var(--ink-0)' }}>
                <div className="text-center max-w-md mx-auto p-8" role="alert">
                    <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-hi)' }}>Profile Not Available</h1>
                    <p className="mb-6" style={{ color: 'var(--text-mid)' }}>
                        This player hasn&apos;t completed their profile yet.
                    </p>
                    <a
                        href={`/player/dashboard/${playerId}`}
                        className="inline-block px-6 py-3 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2"
                        style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
                    >
                        Back to Dashboard
                    </a>
                </div>
            </main>
        );
    }

    return (
        <PlayerProfileView
            playerId={otherPlayerId}
            currentUserId={playerId}
            userType="player"
            initialData={playerData}
        />
    );
}
