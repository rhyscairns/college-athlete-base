import { PlayerProfileView } from '@/profile/player/components/view-page/PlayerProfileView';
import { logger } from '@/lib/logger';
import { PlayerProfile } from '@/profile/player/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Player Profile',
    description: 'View player profile',
};

interface PlayerProfileApiResponse {
    success: boolean;
    data?: PlayerProfile;
    error?: string;
}

interface PageProps {
    params: Promise<{
        playerId: string;
        otherPlayerId: string;
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
            logger.warn('API request failed', {
                playerId,
                status: response.status,
                statusText: response.statusText,
            });
            return null;
        }

        const data: PlayerProfileApiResponse = await response.json();

        if (!data.success || !data.data) {
            logger.warn('API returned unsuccessful response', {
                playerId,
                error: data.error,
            });
            return null;
        }

        logger.info('Successfully fetched player profile from API', { playerId });
        return data.data;
    } catch (error) {
        logger.error('Error fetching player profile from API', {
            playerId,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        return null;
    }
}

/**
 * Player viewing another player's profile page
 * Shows limited view (hero + videos only)
 * Authentication is handled by the dashboard layout
 */
export default async function PlayerViewPlayerProfilePage({ params }: PageProps) {
    const { playerId, otherPlayerId } = await params;

    logger.info('Player viewing another player profile', { playerId, otherPlayerId });

    // Fetch player data from API
    const playerData = await fetchPlayerProfile(otherPlayerId);

    // If API fetch fails, show error
    if (!playerData) {
        logger.error('Failed to load player profile', { playerId: otherPlayerId });
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="mb-6">
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
                        href={`/player/${playerId}/dashboard`}
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Dashboard
                    </a>
                </div>
            </div>
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
