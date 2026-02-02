import { PlayerProfile } from '@/profile/player/types';

/**
 * Props for the Player Profile Page component
 */
export interface PlayerProfilePageProps {
    params: Promise<{
        playerId: string;
    }>;
}

/**
 * API response structure for player profile endpoint
 */
export interface PlayerProfileApiResponse {
    success: boolean;
    data: PlayerProfile | null;
    error?: string;
}
