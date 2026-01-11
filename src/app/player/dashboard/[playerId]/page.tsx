import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { getPlayerById } from '@/authentication/db/players';
import PlayerDashboard from '@/dashboard/player/components/PlayerDashboard';

interface PlayerDashboardPageProps {
    params: Promise<{
        playerId: string;
    }>;
}

/**
 * Player Dashboard Page
 * Protected route that requires valid session
 * Displays player information and dashboard UI
 */
export default async function PlayerDashboardPage({ params }: PlayerDashboardPageProps) {
    // Await params to get playerId
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

    // Get player data from database
    const player = await getPlayerById(playerId);

    // Redirect if player not found
    if (!player) {
        redirect('/login');
    }

    return <PlayerDashboard playerId={playerId} />;
}
