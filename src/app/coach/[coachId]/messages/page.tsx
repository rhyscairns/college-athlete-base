import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { getConversationsForCoach } from '@/lib/db/queries/messages';
import { MessagesTable } from '@/messages/components/MessagesTable';
import { logger } from '@/lib/logger';
import type { Metadata } from 'next';

// Always fetch fresh — messages change frequently
export const dynamic = 'force-dynamic';

interface MessagesPageProps {
    params: Promise<{ coachId: string }>;
}

export async function generateMetadata({ params }: MessagesPageProps): Promise<Metadata> {
    const { coachId } = await params;
    return {
        title: 'Messages',
        description: `Messages for coach ${coachId}`,
    };
}

/**
 * Coach Messages Page
 *
 * Protected server component — requires a valid coach session.
 * Fetches conversations server-side and renders MessagesTable.
 *
 * Auth: JWT cookie validated via verifyToken; redirects to /login on failure.
 * Data: getConversationsForCoach called directly (server-side, no HTTP round-trip).
 */
export default async function CoachMessagesPage({ params }: MessagesPageProps) {
    const { coachId } = await params;

    // ── Auth ──────────────────────────────────────────────────────────────────
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
        redirect('/login');
    }

    const tokenPayload = await verifyToken(sessionToken);

    if (!tokenPayload || tokenPayload.playerId !== coachId || tokenPayload.type !== 'coach') {
        redirect('/login');
    }

    // ── Data ──────────────────────────────────────────────────────────────────
    let conversations;

    try {
        conversations = await getConversationsForCoach(coachId);
        logger.info('Coach messages page loaded', { coachId, count: conversations.length });
    } catch (error) {
        logger.error('Failed to fetch conversations for page', { coachId }, error instanceof Error ? error : new Error('Unknown error'));
        conversations = [];
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-100">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-8 sm:px-8 sm:py-10">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Messages</h1>
                        <p className="text-blue-100 mt-1">Your conversations with players</p>
                    </div>

                    <div className="p-6 sm:p-8">
                        <MessagesTable
                            conversations={conversations}
                            currentUserId={coachId}
                            userType="coach"
                            emptyMessage="No messages yet. Start a conversation from the dashboard."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
