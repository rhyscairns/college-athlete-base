import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { PlayerProfileView } from '@/profile/player/components/view/PlayerProfileView';
import { mockPlayerData } from '@/profile/player/data/mockPlayerData';

interface PlayerProfilePageProps {
    params: Promise<{
        playerId: string;
    }>;
}

/**
 * Player Profile Page (Public View)
 * Displays the player's public-facing profile
 * Using mock data for UI development - will integrate with real data later
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

    // TODO: Fetch real player data from database
    // For now, using mock data for UI development

    return (
        <PlayerProfileView
            playerId={playerId}
            currentUserId={tokenPayload.playerId}
            initialData={mockPlayerData}
        />
    );
}
