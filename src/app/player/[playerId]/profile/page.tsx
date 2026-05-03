import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { ProfilePageClient } from './ProfilePageClient';
import type { PlayerProfilePageProps } from './types';

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
    const { playerId } = await params;

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    if (!sessionCookie) redirect('/login');

    const tokenPayload = await verifyToken(sessionCookie.value);
    if (!tokenPayload || tokenPayload.type !== 'player') redirect('/login');
    if (tokenPayload.playerId !== playerId) redirect('/login');

    return <ProfilePageClient playerId={playerId} currentUserId={tokenPayload.playerId} />;
}
