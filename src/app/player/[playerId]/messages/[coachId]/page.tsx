import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { getMessageThread, markThreadAsRead } from '@/lib/db/queries/messages';
import { getCoachProfileById } from '@/profile/coach/lib/db/queries';
import { MessageThread } from '@/messages/components/MessageThread';
import { logger } from '@/lib/logger';
import type { Metadata } from 'next';

// Always fetch fresh — thread content changes in real time
export const dynamic = 'force-dynamic';

interface ThreadPageProps {
    params: Promise<{ playerId: string; coachId: string }>;
}

export async function generateMetadata({ params }: ThreadPageProps): Promise<Metadata> {
    const { coachId } = await params;
    return {
        title: 'Message Thread',
        description: `Message conversation with coach ${coachId}`,
    };
}

/**
 * Player Message Thread Page
 *
 * Protected server component — requires a valid player session.
 * Fetches the message thread and coach info server-side, marks messages as read.
 *
 * Auth: JWT cookie validated via verifyToken; redirects to /login on failure.
 */
export default async function PlayerMessageThreadPage({ params }: ThreadPageProps) {
    const { playerId, coachId } = await params;

    // ── Auth ──────────────────────────────────────────────────────────────────
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
        redirect('/login');
    }

    const tokenPayload = await verifyToken(sessionToken);

    if (!tokenPayload || tokenPayload.playerId !== playerId || tokenPayload.type !== 'player') {
        redirect('/login');
    }

    // ── Data ──────────────────────────────────────────────────────────────────
    const [messagesResult, coachResult] = await Promise.allSettled([
        getMessageThread(coachId, playerId).then(async (msgs) => {
            await markThreadAsRead(coachId, playerId, 'player');
            return msgs;
        }),
        getCoachProfileById(coachId),
    ]);

    const messages = messagesResult.status === 'fulfilled' ? messagesResult.value : [];
    const coach = coachResult.status === 'fulfilled' ? coachResult.value : null;

    if (messagesResult.status === 'rejected') {
        logger.error('Failed to fetch message thread', { playerId, coachId }, messagesResult.reason instanceof Error ? messagesResult.reason : new Error('Unknown error'));
    }

    const counterpartName = coach
        ? `${coach.firstName} ${coach.lastName}`
        : 'Coach';

    const headerSubtitle = coach?.university ?? '';

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-100">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 sm:px-8">
                        <h1 className="text-xl font-bold text-white">{counterpartName}</h1>
                        {headerSubtitle && (
                            <p className="text-blue-100 text-sm mt-0.5">{headerSubtitle}</p>
                        )}
                    </div>

                    <div className="flex-1 min-h-0">
                        <MessageThread
                            messages={messages}
                            currentUserId={playerId}
                            userType="player"
                            counterpartName={counterpartName}
                            coachId={coachId}
                            playerId={playerId}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
