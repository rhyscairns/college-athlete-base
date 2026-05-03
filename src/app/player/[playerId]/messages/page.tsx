import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { MessagesPageClient } from './MessagesPageClient';
import type { Metadata } from 'next';

interface MessagesPageProps {
    params: Promise<{ playerId: string }>;
}

export async function generateMetadata({ params }: MessagesPageProps): Promise<Metadata> {
    const { playerId } = await params;
    return {
        title: 'Messages',
        description: `Messages for player ${playerId}`,
    };
}

export default async function PlayerMessagesPage({ params }: MessagesPageProps) {
    const { playerId } = await params;

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    if (!sessionToken) redirect('/login');

    const tokenPayload = await verifyToken(sessionToken);
    if (!tokenPayload || tokenPayload.playerId !== playerId || tokenPayload.type !== 'player') redirect('/login');

    return <MessagesPageClient playerId={playerId} />;
}
