import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { PlayerProfileView } from '../../../../profile/player/components/view-page/PlayerProfileView';
import { logger } from '@/lib/logger';
import { PlayerProfile } from '@/profile/player/types';
import { PlayerProfilePageProps, PlayerProfileApiResponse } from './types';

/**
 * Fetch player profile data from API
 * @param playerId - The player ID to fetch
 * @returns Player profile data or null if fetch fails
 */
async function fetchPlayerProfile(playerId: string): Promise<PlayerProfile | null> {
    try {
        // Construct the API URL
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const apiUrl = `${baseUrl}/api/player/${playerId}/profile`;

        logger.info('Fetching player profile from API', { playerId, apiUrl });

        // Fetch from API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
            cache: 'no-store', // Disable caching for server-side fetches
        });

        clearTimeout(timeoutId);

        // Check if response is ok
        if (!response.ok) {
            logger.warn('API request failed', {
                playerId,
                status: response.status,
                statusText: response.statusText,
            });
            return null;
        }

        // Parse response
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
        // Log error and return null to fall back to mock data
        logger.error('Error fetching player profile from API', {
            playerId,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        return null;
    }
}

/**
 * Player Profile Page (Public View)
 * Displays the player's public-facing profile
 * Fetches data from API with fallback to mock data
 */
export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
    const { playerId } = await params;

    // Get session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    // Redirect to login if no session
    if (!sessionCookie) {
        redirect('/login');
    }

    // Verify token
    const tokenPayload = await verifyToken(sessionCookie.value);

    // Redirect if token is invalid or not a player token
    if (!tokenPayload || tokenPayload.type !== 'player') {
        redirect('/login');
    }

    // Verify the playerId in the URL matches the token
    if (tokenPayload.playerId !== playerId) {
        redirect('/login');
    }

    // Fetch player data from API
    const playerData = await fetchPlayerProfile(playerId);

    // If API fetch fails, show error page
    if (!playerData) {
        logger.error('Failed to load player profile', { playerId });
        // In a real app, you might want to show an error page or redirect
        // For now, we'll throw an error which Next.js will handle
        throw new Error('Failed to load player profile');
    }

    return (
        <PlayerProfileView
            playerId={playerId}
            currentUserId={tokenPayload.playerId}
            initialData={playerData}
        />
    );
}
