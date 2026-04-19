import { PlayerProfileView } from '@/profile/player/components/view-page/PlayerProfileView';
import { logger } from '@/lib/logger';
import { PlayerProfile } from '@/profile/player/types';
import type { Metadata } from 'next';

/**
 * Generates dynamic metadata for the player profile page
 * 
 * @param params - Route parameters
 * @returns Metadata object for the page
 */
export async function generateMetadata({ params }: { params: Promise<{ playerId: string }> }): Promise<Metadata> {
    const { playerId } = await params;

    return {
        title: `Player Profile - ${playerId}`,
        description: 'View player profile and recruitment information',
    };
}

interface PlayerProfileApiResponse {
    success: boolean;
    data?: PlayerProfile;
    error?: string;
}

interface PageProps {
    params: Promise<{
        coachId: string;
        playerId: string;
    }>;
}

async function fetchPlayerProfile(playerId: string): Promise<PlayerProfile | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const apiUrl = `${baseUrl}/api/player/${playerId}/profile`;

        logger.info('Fetching player profile from API', { playerId, apiUrl });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
            cache: 'no-store',
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            logger.warn('API request failed', {
                playerId,
                status: response.status,
                statusText: response.statusText,
                errorBody: errorText,
            });
            return null;
        }

        const data: PlayerProfileApiResponse = await response.json();

        if (!data.success || !data.data) {
            logger.warn('API returned unsuccessful response', {
                playerId,
                error: data.error,
                fullResponse: data,
            });
            return null;
        }

        logger.info('Successfully fetched player profile from API', { playerId });
        return data.data;
    } catch (error) {
        logger.error('Error fetching player profile from API', {
            playerId,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        });
        return null;
    }
}

/**
 * Coach viewing player profile page
 * 
 * Route: /coach/[coachId]/dashboard/player-profile/[playerId]
 */
export default async function CoachViewPlayerProfilePage({ params }: PageProps) {
    const { coachId, playerId } = await params;

    logger.info('Coach viewing player profile', { coachId, playerId });

    const playerData = await fetchPlayerProfile(playerId);

    if (!playerData) {
        logger.error('Failed to load player profile', { playerId });
        return (
            <main className="flex items-center justify-center min-h-screen bg-slate-100">
                <div
                    className="text-center max-w-md mx-auto p-8"
                    role="alert"
                    aria-live="assertive"
                >
                    <div className="mb-6" aria-hidden="true">
                        <svg
                            className="w-24 h-24 mx-auto text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Available</h1>
                    <p className="text-gray-600 mb-4">
                        This player hasn&apos;t completed their profile yet.
                    </p>
                    <a
                        href={`/coach/${coachId}/dashboard`}
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
