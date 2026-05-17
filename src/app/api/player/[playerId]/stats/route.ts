import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/authentication/db/client';
import { isValidUUID, generateRequestId } from '@/lib/api/utils';

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ playerId: string }> }
) {
    generateRequestId();
    const { playerId } = await context.params;

    if (!playerId || !isValidUUID(playerId)) {
        return NextResponse.json({ success: false, error: 'Invalid player ID' }, { status: 400 });
    }

    try {
        const [playerResult, promoCodeResult, referralsResult] = await Promise.all([
            // Profile views and coaches who favorited this player (from player row)
            query<{ profile_views: string; favorited_count: string }>(
                `SELECT profile_views,
                        COALESCE(array_length(favorited_by_coaches, 1), 0) AS favorited_count
                 FROM players WHERE id = $1`,
                [playerId]
            ),
            // Player's own promo code
            query<{ promo_code: string | null }>(
                `SELECT promo_code FROM players WHERE id = $1`,
                [playerId]
            ),
            // Players and coaches referred via this player's promo code
            query<{ type: string; count: string }>(
                `SELECT 'player' AS type, COUNT(*) AS count
                 FROM players referred
                 JOIN players p ON p.id = $1
                 WHERE referred.referral_promo_code = p.promo_code
                    OR referred.external_referral_promo_code = p.promo_code
                 UNION ALL
                 SELECT 'coach' AS type, COUNT(*) AS count
                 FROM coaches c
                 JOIN players p ON p.id = $1
                 WHERE c.referral_promo_code = p.promo_code
                    OR c.external_referral_promo_code = p.promo_code`,
                [playerId]
            ),
        ]);

        const promoCode = promoCodeResult[0]?.promo_code ?? null;
        const playersReferred = parseInt(referralsResult.find(r => r.type === 'player')?.count ?? '0', 10);
        const coachesReferred = parseInt(referralsResult.find(r => r.type === 'coach')?.count ?? '0', 10);

        return NextResponse.json({
            success: true,
            data: {
                profileViews: parseInt(playerResult[0]?.profile_views ?? '0', 10),
                coachesFavorited: parseInt(playerResult[0]?.favorited_count ?? '0', 10),
                playersReferred,
                coachesReferred,
                promoCode,
            },
        });
    } catch {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
