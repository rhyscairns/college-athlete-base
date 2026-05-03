import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { getConversationsForCoach } from '@/lib/db/queries/messages';
import { MessagesTable } from '@/messages/components/MessagesTable';
import { logger } from '@/lib/logger';
import type { Metadata } from 'next';
import type { Conversation } from '@/messages/types';

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
    let conversations: Conversation[];

    try {
        conversations = await getConversationsForCoach(coachId);
        logger.info('Coach messages page loaded', { coachId, count: conversations.length });
    } catch (error) {
        logger.error('Failed to fetch conversations for page', { coachId }, error instanceof Error ? error : new Error('Unknown error'));
        conversations = [];
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* Page header */}
                <header className="relative overflow-hidden text-center px-6 pt-12 pb-10 mb-8 rounded-2xl">
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 rounded-2xl"
                        style={{
                            background: `radial-gradient(ellipse 80% 60% at 50% -10%, oklch(68% 0.22 150 / 0.18) 0%, transparent 70%), var(--ink-1)`,
                        }}
                    />
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 opacity-[0.03] rounded-2xl"
                        style={{
                            backgroundImage: `linear-gradient(var(--text-hi) 1px, transparent 1px), linear-gradient(90deg, var(--text-hi) 1px, transparent 1px)`,
                            backgroundSize: '48px 48px',
                        }}
                    />
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-5"
                        style={{ background: 'oklch(68% 0.22 150 / 0.15)', border: '1px solid oklch(68% 0.22 150 / 0.3)', color: 'var(--brand-500)' }}
                    >
                        <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand-500)' }} />
                        Inbox
                    </div>
                    <h1
                        className="font-black tracking-tight leading-none mb-3"
                        style={{
                            fontSize: 'clamp(2rem, 4vw + 1rem, 3rem)',
                            background: `linear-gradient(135deg, var(--text-hi) 0%, oklch(85% 0.15 150) 50%, var(--text-hi) 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Messages
                    </h1>
                    <p className="text-base" style={{ color: 'var(--text-mid)' }}>
                        Your conversations with players
                    </p>
                </header>

                <MessagesTable
                    conversations={conversations}
                    currentUserId={coachId}
                    userType="coach"
                    emptyMessage="No messages yet. Start a conversation from the dashboard."
                />
            </div>
        </div>
    );
}
