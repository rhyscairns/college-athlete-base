import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { ReferralBreakdownPage } from '@/earnings/components/ReferralBreakdownPage';
import { getTier1Players, getTier1Coaches, getTier2Summary, getTier3Summary, getMonthlySeries } from '@/earnings/db/earnings';
import { query } from '@/authentication/db/client';
import type { EarningsData } from '@/earnings/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Referral Breakdown',
    description: 'Detailed breakdown of your referral network and earnings.',
};

interface PlayerEarningsBreakdownPageProps {
    params: Promise<{ playerId: string }>;
}

async function getEarningsData(playerId: string): Promise<EarningsData | null> {
    try {
        const playerRows = await query<{ promo_code: string | null }>(
            `SELECT promo_code FROM players WHERE id = $1`,
            [playerId]
        );

        if (playerRows.length === 0) return null;

        const promoCode = playerRows[0].promo_code;

        if (!promoCode) {
            return {
                tier1Players: [],
                tier1Coaches: [],
                tier2: { playerCount: 0, activePlayerCount: 0, monthlyEarnings: 0 },
                tier3: { playerCount: 0, activePlayerCount: 0, monthlyEarnings: 0 },
                totalMonthlyEarnings: 0,
                monthlySeries: [],
            };
        }

        const [tier1Players, tier1Coaches, tier2, tier3, monthlySeries] = await Promise.all([
            getTier1Players(promoCode),
            getTier1Coaches(promoCode),
            getTier2Summary(promoCode),
            getTier3Summary(promoCode),
            getMonthlySeries(promoCode),
        ]);

        const totalMonthlyEarnings =
            tier1Players.reduce((sum, p) => sum + p.monthlyContribution, 0) +
            tier2.monthlyEarnings +
            tier3.monthlyEarnings;

        return { tier1Players, tier1Coaches, tier2, tier3, totalMonthlyEarnings, monthlySeries };
    } catch {
        return null;
    }
}

/**
 * Player Earnings Breakdown Page
 * Server component — queries DB directly and renders ReferralBreakdownPage.
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export default async function PlayerEarningsBreakdownPage({ params }: PlayerEarningsBreakdownPageProps) {
    const { playerId } = await params;

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) redirect('/login');

    const tokenPayload = await verifyToken(sessionToken);
    if (!tokenPayload || tokenPayload.playerId !== playerId || tokenPayload.type !== 'player') {
        redirect('/login');
    }

    const data = await getEarningsData(playerId);

    if (data === null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8">
                <p className="text-base" style={{ color: 'var(--text-lo)' }}>
                    Unable to load referral breakdown. Please try again.
                </p>
                <a
                    href={`/player/${playerId}/earnings/breakdown`}
                    className="text-sm font-semibold hover:underline"
                    style={{ color: 'var(--brand-500)' }}
                >
                    Retry
                </a>
            </div>
        );
    }

    const isEmpty =
        data.tier1Players.length === 0 &&
        data.tier1Coaches.length === 0 &&
        data.totalMonthlyEarnings === 0;

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text-hi)' }}>
                Referral Breakdown
            </h1>
            {isEmpty ? (
                <div
                    className="flex flex-col items-center justify-center gap-4 rounded-xl p-12 text-center"
                    style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)' }}
                >
                    <svg
                        className="w-12 h-12 opacity-30"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        style={{ color: 'var(--text-lo)' }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-base font-medium" style={{ color: 'var(--text-mid)' }}>
                        No referrals yet
                    </p>
                    <p className="text-sm max-w-xs" style={{ color: 'var(--text-lo)' }}>
                        Your referred players and coaches will appear here once they sign up using your referral code.
                    </p>
                    <a
                        href={`/player/${playerId}/earnings`}
                        className="text-sm font-semibold hover:underline mt-2"
                        style={{ color: 'var(--brand-500)' }}
                    >
                        Back to Earnings
                    </a>
                </div>
            ) : (
                <ReferralBreakdownPage data={data} />
            )}
        </div>
    );
}
