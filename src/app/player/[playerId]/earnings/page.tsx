import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { EarningsOverview } from '@/earnings/components/EarningsOverview';
import { getTier1Players, getTier1Coaches, getTier2Summary, getTier3Summary, getMonthlySeries } from '@/earnings/db/earnings';
import { query } from '@/authentication/db/client';
import type { EarningsData } from '@/earnings/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Earnings',
    description: 'View your referral earnings and network stats.',
};

interface PlayerEarningsPageProps {
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
    } catch (error) {
        console.error('[PlayerEarningsPage] getEarningsData failed:', error);
        return null;
    }
}

/**
 * Player Earnings Overview Page
 * Server component — queries DB directly and renders EarningsOverview.
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
export default async function PlayerEarningsPage({ params }: PlayerEarningsPageProps) {
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
                    Unable to load earnings data. Please try again.
                </p>
                <a
                    href={`/player/${playerId}/earnings`}
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

    if (isEmpty) {
        return (
            <div className="p-4 sm:p-6 max-w-4xl mx-auto">
                <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text-hi)' }}>
                    Your Earnings
                </h1>
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-base font-medium" style={{ color: 'var(--text-mid)' }}>
                        No earnings yet
                    </p>
                    <p className="text-sm max-w-xs" style={{ color: 'var(--text-lo)' }}>
                        Share your referral code to start earning. Your earnings will appear here once someone signs up using your code.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <EarningsOverview data={data} basePath={`/player/${playerId}/earnings`} />
        </div>
    );
}
