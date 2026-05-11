import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { getScholarshipsByCoach } from '@/scholarships/db/queries';
import { ScholarshipsTable } from '@/scholarships/components/ScholarshipsTable';
import { logger } from '@/lib/logger';
import type { Metadata } from 'next';
import type { Scholarship } from '@/scholarships/types';

export const dynamic = 'force-dynamic';

interface ScholarshipsPageProps {
    params: Promise<{ coachId: string }>;
}

export async function generateMetadata({ params }: ScholarshipsPageProps): Promise<Metadata> {
    const { coachId } = await params;
    return {
        title: 'Scholarships',
        description: `Scholarship offers sent by coach ${coachId}`,
    };
}

/**
 * Coach Scholarships List Page
 *
 * Protected server component — requires a valid coach session.
 * Fetches all scholarships sent by the coach and renders ScholarshipsTable.
 *
 * Auth: JWT cookie validated via verifyToken; redirects to /login on failure.
 */
export default async function CoachScholarshipsPage({ params }: ScholarshipsPageProps) {
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
    let scholarships: Scholarship[];

    try {
        scholarships = await getScholarshipsByCoach(coachId);
        logger.info('Coach scholarships page loaded', { coachId, count: scholarships.length });
    } catch (error) {
        logger.error('Failed to fetch scholarships for page', { coachId }, error instanceof Error ? error : new Error('Unknown error'));
        scholarships = [];
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* ── Page header ── */}
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
                        Scholarships
                    </h1>
                    <p className="text-base mb-6" style={{ color: 'var(--text-mid)' }}>
                        Scholarship offers you&apos;ve sent to players
                    </p>

                    <Link
                        href={`/coach/${coachId}/scholarships/new`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                        style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
                    >
                        <span aria-hidden="true">+</span>
                        New Scholarship
                    </Link>
                </header>

                <ScholarshipsTable
                    scholarships={scholarships}
                    userType="coach"
                    currentUserId={coachId}
                />
            </div>
        </div>
    );
}
