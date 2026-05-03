import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import PlayerDashboard from '@/dashboard/player/components/PlayerDashboard';

interface PlayerDashboardPageProps {
    params: Promise<{ playerId: string }>;
}

export default async function PlayerDashboardPage({ params }: PlayerDashboardPageProps) {
    const { playerId } = await params;

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    if (!sessionCookie) redirect('/login');

    const tokenPayload = await verifyToken(sessionCookie.value);
    if (!tokenPayload || tokenPayload.type !== 'player') redirect('/login');
    if (tokenPayload.playerId !== playerId) redirect('/login');

    return <PlayerDashboard playerId={playerId} />;
}
