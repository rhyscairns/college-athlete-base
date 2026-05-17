import { PlayerProfileView } from '@/profile/player/components/view-page/PlayerProfileView';
import { getPlayerProfileById } from '@/profile/player/lib/db/queries';
import { incrementPlayerProfileViews } from '@/lib/db/queries/prospects';
import { logger } from '@/lib/logger';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ playerId: string }> }): Promise<Metadata> {
    const { playerId } = await params;
    return {
        title: `Player Profile - ${playerId}`,
        description: 'View player profile and recruitment information',
    };
}

interface PageProps {
    params: Promise<{ coachId: string; playerId: string }>;
}

/**
 * Coach viewing player profile page
 * Route: /coach/[coachId]/dashboard/player-profile/[playerId]
 *
 * Fetches the player profile directly from the DB and increments the view counter.
 */
export default async function CoachViewPlayerProfilePage({ params }: PageProps) {
    const { coachId, playerId } = await params;

    logger.info('Coach viewing player profile', { coachId, playerId });

    const playerData = await getPlayerProfileById(playerId).catch(() => null);

    // Increment profile view count — fire and forget, non-blocking
    incrementPlayerProfileViews(playerId).catch(() => { /* non-critical */ });

    if (!playerData) {
        logger.error('Failed to load player profile', { playerId });
        return (
            <main className="flex items-center justify-center min-h-screen" style={{ background: 'var(--ink-0)' }}>
                <div className="text-center max-w-md mx-auto p-8" role="alert" aria-live="assertive">
                    <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-hi)' }}>Profile Not Available</h1>
                    <p className="mb-6" style={{ color: 'var(--text-mid)' }}>
                        This player hasn&apos;t completed their profile yet.
                    </p>
                    <a
                        href={`/coach/${coachId}/dashboard`}
                        className="inline-block px-6 py-3 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2"
                        style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
                        aria-label="Return to coach dashboard"
                    >
                        Back to Dashboard
                    </a>
                </div>
            </main>
        );
    }

    return (
        <PlayerProfileView
            playerId={playerId}
            currentUserId={coachId}
            userType="coach"
            initialData={playerData}
        />
    );
}
