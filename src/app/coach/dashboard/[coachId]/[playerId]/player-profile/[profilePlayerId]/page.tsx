import { PlayerProfileView } from '@/profile/player/components/view-page/PlayerProfileView';
import { logger } from '@/lib/logger';
import { PlayerProfile } from '@/profile/player/types';
import type { Metadata } from 'next';
import type { ReactElement } from 'react';

/**
 * Generates dynamic metadata for the player profile page
 * 
 * @param params - Route parameters
 * @returns Metadata object for the page
 */
export async function generateMetadata({ params }: { params: Promise<{ profilePlayerId: string }> }): Promise<Metadata> {
    const { profilePlayerId } = await params;

    return {
        title: `Player Profile - ${profilePlayerId}`,
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
        profilePlayerId: string;
    }>;
}

/**
 * Fetches player profile data from the API
 * 
 * @param playerId - The unique identifier of the player
 * @returns Promise resolving to PlayerProfile data or null if fetch fails
 * 
 * @example
 * ```ts
 * const profile = await fetchPlayerProfile('player-123');
 * if (profile) {
 *   console.log(profile.firstName, profile.lastName);
 * }
 * ```
 */
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
 * Coach viewing player profile page
 * 
 * This page allows coaches to view full player profiles from their dashboard.
 * It fetches player data server-side and renders the PlayerProfileView component.
 * 
 * Authentication is handled by the dashboard layout.
 * 
 * @param params - Route parameters containing coachId, playerId, and profilePlayerId
 * @returns JSX element displaying the player profile or error state
 * 
 * @example
 * Route: /coach/dashboard/[coachId]/[playerId]/player-profile/[profilePlayerId]
 * URL: /coach/dashboard/coach-123/player-456/player-profile/player-789
 */
export default async function CoachViewPlayerProfilePage({ params }: PageProps): Promise<ReactElement> {
    const { coachId, profilePlayerId } = await params;
    // Note: playerId param exists in route but profilePlayerId is the actual player being viewed

    // Fetch player data from API
    const playerData = await fetchPlayerProfile(profilePlayerId);

    // If API fetch fails, show error
    if (!playerData) {
        logger.error('Failed to load player profile', { playerId: profilePlayerId });
        return (
            <main className="flex items-center justify-center min-h-screen bg-slate-100">
                <div
                    className="text-center max-w-md mx-auto px-4"
                    role="alert"
                    aria-live="assertive"
                >
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Failed to Load Profile</h1>
                    <p className="text-gray-600 mb-6">Unable to load player profile. Please try again later.</p>
                    <a
                        href={`/coach/dashboard/${coachId}`}
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Return to Dashboard
                    </a>
                </div>
            </main>
        );
    }

    return (
        <PlayerProfileView
            playerId={profilePlayerId}
            currentUserId={coachId}
            userType="coach"
            initialData={playerData}
        />
    );
}
