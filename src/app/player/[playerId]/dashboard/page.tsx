import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { getPlayerSubscriptionStatus } from '@/authentication/db/players';
import { isCloudEnvironment } from '@/lib/environment';
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

    // Fetch subscription status server-side (Req 3.11, 3.12)
    let isCABMember = false;
    let subscriptionStatus = 'none';
    let subscriptionPeriodEnd: Date | null = null;

    try {
        const sub = await getPlayerSubscriptionStatus(playerId);
        if (sub) {
            isCABMember = sub.isCABMember;
            subscriptionStatus = sub.subscriptionStatus;
            subscriptionPeriodEnd = sub.subscriptionPeriodEnd;
        }
    } catch {
        // Non-fatal — dashboard still renders, banner defaults to showing
    }

    return (
        <PlayerDashboard
            playerId={playerId}
            isCABMember={isCABMember}
            subscriptionStatus={subscriptionStatus}
            subscriptionPeriodEnd={subscriptionPeriodEnd?.toISOString() ?? null}
            isCloud={isCloudEnvironment()}
        />
    );
}
