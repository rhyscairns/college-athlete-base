import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { getProspectsWithPlayerData } from '@/lib/db/queries/prospects';
import { ProspectsTable } from '@/prospects/components/ProspectsTable';
import { logger } from '@/lib/logger';
import type { Metadata } from 'next';

interface ProspectsPageProps {
    params: Promise<{ coachId: string }>;
}

export async function generateMetadata({ params }: ProspectsPageProps): Promise<Metadata> {
    const { coachId } = await params;
    return {
        title: 'My Prospects',
        description: `Recruitment prospects list for coach ${coachId}`,
    };
}

/**
 * Prospects Page
 *
 * Protected server component — requires a valid coach session.
 * Fetches the coach's favorited players server-side and renders ProspectsTable.
 *
 * Auth: JWT cookie validated via verifyToken; redirects to /login on failure.
 * Data: getProspectsWithPlayerData called directly (server-side, no HTTP round-trip).
 */
export default async function ProspectsPage({ params }: ProspectsPageProps) {
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
    let prospects: string | any[];

    try {
        prospects = await getProspectsWithPlayerData(coachId);
        logger.info('Prospects page loaded', { coachId, count: prospects.length });
    } catch (error) {
        logger.error('Failed to fetch prospects for page', { coachId }, error instanceof Error ? error : new Error('Unknown error'));
        prospects = [];
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-100">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-8 sm:px-8 sm:py-10">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">My Prospects</h1>
                        <p className="text-blue-100 mt-1">Players you&apos;ve saved from the dashboard</p>
                    </div>

                    <div className="p-6 sm:p-8">
                        {prospects.length === 0 ? (
                            <p className="text-gray-500 text-center py-12">
                                No prospects yet. Start favoriting players from the dashboard.
                            </p>
                        ) : (
                            <ProspectsTable prospects={prospects} coachId={coachId} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
