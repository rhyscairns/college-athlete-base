import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { getPlayerById } from '@/authentication/db/players';
import { ScholarshipForm } from '@/scholarships/components/ScholarshipForm';
import { logger } from '@/lib/logger';
import type { Metadata } from 'next';
import type { ScholarshipFormData } from '@/scholarships/types';

interface NewScholarshipPageProps {
    params: Promise<{ coachId: string }>;
    searchParams: Promise<{ playerId?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'New Scholarship Offer',
        description: 'Create a new scholarship offer for a player',
    };
}

/**
 * New Scholarship Page
 *
 * Protected server component — requires a valid coach session.
 * Reads optional `playerId` query param and pre-fetches player data if present.
 * Renders ScholarshipForm with pre-populated or blank initial data.
 *
 * Auth: JWT cookie validated via verifyToken; redirects to /login on failure.
 */
export default async function NewScholarshipPage({ params, searchParams }: NewScholarshipPageProps) {
    const { coachId } = await params;
    const { playerId } = await searchParams;

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

    // ── Pre-fetch player data if playerId provided ────────────────────────────
    let initialData: Partial<ScholarshipFormData> = {};

    if (playerId) {
        try {
            const player = await getPlayerById(playerId);
            if (player) {
                initialData = {
                    playerId,
                    playerFirstName: player.firstName,
                    playerLastName: player.lastName,
                    playerEmail: player.email,
                    sport: player.sport ?? '',
                };
                logger.info('Pre-populated scholarship form with player data', { coachId, playerId });
            }
        } catch (error) {
            logger.error('Failed to fetch player for scholarship form', { coachId, playerId }, error instanceof Error ? error : new Error('Unknown error'));
            // Continue with blank form — non-fatal
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen">
            <div className="max-w-3xl mx-auto px-4 py-8">

                {/* ── Page header ── */}
                <header className="relative overflow-hidden text-center px-6 pt-12 pb-10 mb-8 rounded-2xl">
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
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 opacity-[0.03] rounded-2xl"
                        style={{
                            backgroundImage: `linear-gradient(var(--text-hi) 1px, transparent 1px),
                                              linear-gradient(90deg, var(--text-hi) 1px, transparent 1px)`,
                            backgroundSize: '48px 48px',
                        }}
                    />

                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-5"
                        style={{
                            background: 'oklch(68% 0.22 150 / 0.15)',
                            border: '1px solid oklch(68% 0.22 150 / 0.3)',
                            color: 'var(--brand-500)',
                        }}
                    >
                        <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand-500)' }} />
                        Recruitment
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
                        New Scholarship Offer
                    </h1>
                    <p className="text-base" style={{ color: 'var(--text-mid)' }}>
                        Fill in the details below to send a scholarship offer to a player
                    </p>
                </header>

                {/* ── Form card ── */}
                <div
                    className="rounded-2xl p-6 md:p-8"
                    style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}
                >
                    <ScholarshipForm
                        coachId={coachId}
                        initialData={initialData}
                    />
                </div>
            </div>
        </div>
    );
}
