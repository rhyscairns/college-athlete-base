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
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* ── Page header — matches DashboardHeader style ── */}
                <header className="relative overflow-hidden text-center px-6 pt-12 pb-10 mb-8 rounded-2xl">
                    {/* Gradient background */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 rounded-2xl"
                        style={{
                            background: `
                                radial-gradient(ellipse 80% 60% at 50% -10%,
                                    oklch(68% 0.22 150 / 0.18) 0%,
                                    transparent 70%),
                                var(--ink-1)
                            `,
                        }}
                    />
                    {/* Grid texture */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 opacity-[0.03] rounded-2xl"
                        style={{
                            backgroundImage: `linear-gradient(var(--text-hi) 1px, transparent 1px),
                                              linear-gradient(90deg, var(--text-hi) 1px, transparent 1px)`,
                            backgroundSize: '48px 48px',
                        }}
                    />

                    {/* Eyebrow */}
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-5"
                        style={{
                            background: 'oklch(68% 0.22 150 / 0.15)',
                            border: '1px solid oklch(68% 0.22 150 / 0.3)',
                            color: 'var(--brand-500)',
                        }}
                    >
                        <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand-500)' }} />
                        Scouting
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
                        My Prospects
                    </h1>
                    <p className="text-base" style={{ color: 'var(--text-mid)' }}>
                        Players you&apos;ve saved from the dashboard
                    </p>
                </header>

                <ProspectsTable prospects={prospects} coachId={coachId} />
            </div>
        </div>
    );
}
