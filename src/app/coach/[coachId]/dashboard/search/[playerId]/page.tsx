import { PlayerProfileView } from '@/profile/player/components/view-page/PlayerProfileView';
import { logger } from '@/lib/logger';
import { PlayerProfile } from '@/profile/player/types';
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

async function fetchPlayerProfile(playerId: string): Promise<PlayerProfile | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/player/${playerId}/profile`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });

        if (!response.ok) return null;

        const data = await response.json();
        if (!data.success || !data.data) return null;

        return data.data;
    } catch (error) {
        logger.error('Error fetching player profile', {
            playerId,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        return null;
    }
}

/**
 * Coach viewing player profile from search results
 *
 * Route: /coach/[coachId]/dashboard/search/[playerId]
 */
export default async function CoachSearchPlayerProfilePage({ params }: PageProps) {
    const { coachId, playerId } = await params;

    logger.info('Coach viewing player profile from search', { coachId, playerId });

    const playerData = await fetchPlayerProfile(playerId);

    if (!playerData) {
        return (
            <main
                className="flex items-center justify-center min-h-screen"
                style={{ background: 'var(--ink-0)' }}
            >
                <div className="text-center max-w-md mx-auto p-8" role="alert" aria-live="assertive">
                    <svg
                        className="w-20 h-20 mx-auto mb-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        style={{ color: 'var(--text-lo)' }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-hi)' }}>
                        Profile Not Available
                    </h1>
                    <p className="mb-6" style={{ color: 'var(--text-mid)' }}>
                        This player hasn&apos;t completed their profile yet.
                    </p>
                    <a
                        href={`/coach/${coachId}/dashboard/search`}
                        className="inline-block px-6 py-3 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2"
                        style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
                        aria-label="Return to search results"
                    >
                        Back to Search
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
