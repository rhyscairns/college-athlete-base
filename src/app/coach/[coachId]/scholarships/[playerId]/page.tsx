import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { getScholarshipByCoachAndPlayer } from '@/scholarships/db/queries';
import { ScholarshipForm } from '@/scholarships/components/ScholarshipForm';
import { logger } from '@/lib/logger';
import type { Metadata } from 'next';

interface ScholarshipDetailPageProps {
    params: Promise<{ coachId: string; playerId: string }>;
}

export async function generateMetadata({ params }: ScholarshipDetailPageProps): Promise<Metadata> {
    const { playerId } = await params;
    return {
        title: 'Edit Scholarship Offer',
        description: `Edit scholarship offer for player ${playerId}`,
    };
}

/**
 * Coach Scholarship Detail / Edit Page
 *
 * Protected server component — requires a valid coach session.
 * Fetches the scholarship between this coach and player, renders ScholarshipForm in edit mode.
 * Displays player's counter notes prominently when status is 'countered'.
 *
 * Auth: JWT cookie validated via verifyToken; redirects to /login on failure.
 * 404: notFound() when no scholarship record exists for this coach+player pair.
 */
export default async function CoachScholarshipDetailPage({ params }: ScholarshipDetailPageProps) {
    const { coachId, playerId } = await params;

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
    let scholarship;

    try {
        scholarship = await getScholarshipByCoachAndPlayer(coachId, playerId);
        logger.info('Coach scholarship detail page loaded', { coachId, playerId });
    } catch (error) {
        logger.error('Failed to fetch scholarship for detail page', { coachId, playerId }, error instanceof Error ? error : new Error('Unknown error'));
        notFound();
    }

    if (!scholarship) {
        notFound();
    }

    const playerName = [scholarship.playerFirstName, scholarship.playerLastName].filter(Boolean).join(' ') || 'Player';
    const isCountered = scholarship.status === 'countered';
    const isReadOnly = scholarship.status === 'accepted' || scholarship.status === 'rejected';

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
                        {isReadOnly ? 'Scholarship Offer' : 'Edit Scholarship Offer'}
                    </h1>
                    <p className="text-base" style={{ color: 'var(--text-mid)' }}>
                        {playerName}
                    </p>
                </header>

                {/* ── Counter notes banner ── */}
                {isCountered && scholarship.counterNotes && (
                    <div
                        className="mb-6 p-4 rounded-xl"
                        style={{
                            background: 'oklch(75% 0.18 80 / 0.12)',
                            border: '1px solid oklch(75% 0.18 80 / 0.35)',
                        }}
                        role="note"
                        aria-label="Player counter offer notes"
                    >
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'oklch(75% 0.18 80)' }}>
                            Player&apos;s Counter Offer Notes
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-hi)' }}>
                            {scholarship.counterNotes}
                        </p>
                        {(scholarship.counterAmount !== null || scholarship.counterGpa !== null) && (
                            <div className="mt-3 flex flex-wrap gap-4">
                                {scholarship.counterAmount !== null && (
                                    <span className="text-sm" style={{ color: 'var(--text-mid)' }}>
                                        <span className="font-medium" style={{ color: 'var(--text-hi)' }}>Proposed Amount:</span>{' '}
                                        ${scholarship.counterAmount.toLocaleString()}
                                    </span>
                                )}
                                {scholarship.counterGpa !== null && (
                                    <span className="text-sm" style={{ color: 'var(--text-mid)' }}>
                                        <span className="font-medium" style={{ color: 'var(--text-hi)' }}>Proposed GPA:</span>{' '}
                                        {scholarship.counterGpa}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Read-only status banner for accepted/rejected ── */}
                {isReadOnly && (
                    <div
                        className="mb-6 p-4 rounded-xl text-center"
                        style={{
                            background: scholarship.status === 'accepted'
                                ? 'oklch(68% 0.22 150 / 0.12)'
                                : 'oklch(65% 0.24 25 / 0.12)',
                            border: `1px solid ${scholarship.status === 'accepted'
                                ? 'oklch(68% 0.22 150 / 0.3)'
                                : 'oklch(65% 0.24 25 / 0.3)'}`,
                        }}
                        role="status"
                    >
                        <p
                            className="text-sm font-semibold"
                            style={{
                                color: scholarship.status === 'accepted'
                                    ? 'var(--brand-500)'
                                    : 'var(--status-danger)',
                            }}
                        >
                            {scholarship.status === 'accepted'
                                ? '✓ This offer has been accepted — no further edits allowed.'
                                : '✗ This offer has been rejected — no further edits allowed.'}
                        </p>
                    </div>
                )}

                {/* ── Form card ── */}
                <div
                    className="rounded-2xl p-6 md:p-8"
                    style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}
                >
                    {isReadOnly ? (
                        <ReadOnlyScholarship scholarship={scholarship} coachId={coachId} />
                    ) : (
                        <ScholarshipForm
                            coachId={coachId}
                            existingScholarship={scholarship}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Read-only view for accepted/rejected scholarships ────────────────────────

import type { Scholarship } from '@/scholarships/types';
import Link from 'next/link';

function ReadOnlyScholarship({ scholarship, coachId }: { scholarship: Scholarship; coachId: string }) {
    const fields: { label: string; value: string | number | null | undefined }[] = [
        { label: 'Player', value: [scholarship.playerFirstName, scholarship.playerLastName].filter(Boolean).join(' ') || '—' },
        { label: 'Player Email', value: scholarship.playerEmail ?? '—' },
        { label: 'School Name', value: scholarship.schoolName },
        { label: 'Sport', value: scholarship.sport },
        { label: 'Division', value: scholarship.division ?? '—' },
        { label: 'Scholarship Amount', value: `$${scholarship.scholarshipAmount.toLocaleString()}` },
        { label: 'Required GPA', value: scholarship.requiredGpa },
        { label: 'Start Year', value: scholarship.startYear ?? '—' },
        { label: 'Duration', value: scholarship.durationYears ? `${scholarship.durationYears} year${scholarship.durationYears !== 1 ? 's' : ''}` : '—' },
        { label: 'Notes', value: scholarship.notes ?? '—' },
    ];

    return (
        <div>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(({ label, value }) => (
                    <div key={label} className={label === 'Notes' ? 'md:col-span-2' : ''}>
                        <dt className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-lo)' }}>
                            {label}
                        </dt>
                        <dd className="text-sm" style={{ color: 'var(--text-hi)' }}>
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>
            <div className="mt-8">
                <Link
                    href={`/coach/${coachId}/scholarships`}
                    className="inline-flex px-6 py-2.5 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                    style={{ background: 'var(--ink-3)', color: 'var(--text-mid)' }}
                >
                    Back to Scholarships
                </Link>
            </div>
        </div>
    );
}
