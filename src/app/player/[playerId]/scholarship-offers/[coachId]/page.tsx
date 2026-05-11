import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { getScholarshipByCoachAndPlayer } from '@/scholarships/db/queries';
import { ScholarshipDetail } from '@/scholarships/components/ScholarshipDetail';
import { logger } from '@/lib/logger';
import type { Metadata } from 'next';
import type { Scholarship } from '@/scholarships/types';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PlayerOfferDetailPageProps {
    params: Promise<{ playerId: string; coachId: string }>;
}

export async function generateMetadata({ params }: PlayerOfferDetailPageProps): Promise<Metadata> {
    const { coachId } = await params;
    return {
        title: 'Scholarship Offer',
        description: `Scholarship offer from coach ${coachId}`,
    };
}

/**
 * Player Scholarship Offer Detail Page
 *
 * Protected server component — requires a valid player session.
 * Fetches the scholarship offer from a specific coach and renders ScholarshipDetail.
 *
 * Auth: JWT cookie validated via verifyToken; redirects to /login on failure.
 * 404: notFound() when no scholarship record exists for this coach+player pair.
 */
export default async function PlayerOfferDetailPage({ params }: PlayerOfferDetailPageProps) {
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
    let scholarship: Scholarship | null;

    try {
        scholarship = await getScholarshipByCoachAndPlayer(coachId, playerId);
        logger.info('Player offer detail page loaded', { playerId, coachId });
    } catch (error) {
        logger.error('Failed to fetch scholarship offer for player', { playerId, coachId }, error instanceof Error ? error : new Error('Unknown error'));
        notFound();
    }

    if (!scholarship) {
        notFound();
    }

    const schoolName = scholarship.schoolName ?? 'Scholarship Offer';

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
                        {schoolName}
                    </h1>
                    <p className="text-base" style={{ color: 'var(--text-mid)' }}>
                        {scholarship.coachFirstName} {scholarship.coachLastName}
                    </p>
                </header>

                {/* ── Back link ── */}
                <div className="mb-6">
                    <Link
                        href={`/player/${playerId}/scholarships`}
                        className="inline-flex items-center gap-1.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 rounded"
                        style={{ color: 'var(--text-mid)' }}
                    >
                        <span aria-hidden="true">←</span>
                        Back to Offers
                    </Link>
                </div>

                {/* ── Offer detail card ── */}
                <ScholarshipDetail
                    scholarship={scholarship}
                    playerId={playerId}
                    coachId={coachId}
                />
            </div>
        </div>
    );
}
