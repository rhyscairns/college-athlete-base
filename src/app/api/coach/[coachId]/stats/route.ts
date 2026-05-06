import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/authentication/db/client';
import { isValidUUID, generateRequestId } from '@/lib/api/utils';

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ coachId: string }> }
) {
    generateRequestId();
    const { coachId } = await context.params;

    if (!coachId || !isValidUUID(coachId)) {
        return NextResponse.json({ success: false, error: 'Invalid coach ID' }, { status: 400 });
    }

    try {
        const [prospectsResult, newPlayersResult, promoCodeResult, referralsResult] = await Promise.all([
            // Total prospects saved
            query<{ count: string }>(
                `SELECT COUNT(*) AS count FROM coach_prospects WHERE coach_id = $1`,
                [coachId]
            ),
            // New players added to the platform today
            query<{ count: string }>(
                `SELECT COUNT(*) AS count FROM players WHERE created_at >= CURRENT_DATE`,
                []
            ),
            // Coach's own promo code
            query<{ promo_code: string | null }>(
                `SELECT promo_code FROM coaches WHERE id = $1`,
                [coachId]
            ),
            // Players and coaches referred via this coach's promo code
            query<{ type: string; count: string }>(
                `SELECT 'player' AS type, COUNT(*) AS count
                 FROM players p
                 JOIN coaches c ON c.id = $1
                 WHERE p.referral_promo_code = c.promo_code
                    OR p.external_referral_promo_code = c.promo_code
                 UNION ALL
                 SELECT 'coach' AS type, COUNT(*) AS count
                 FROM coaches referred
                 JOIN coaches c ON c.id = $1
                 WHERE referred.referral_promo_code = c.promo_code
                    OR referred.external_referral_promo_code = c.promo_code`,
                [coachId]
            ),
        ]);

        const promoCode = promoCodeResult[0]?.promo_code ?? null;
        const playersReferred = parseInt(referralsResult.find(r => r.type === 'player')?.count ?? '0', 10);
        const coachesReferred = parseInt(referralsResult.find(r => r.type === 'coach')?.count ?? '0', 10);

        return NextResponse.json({
            success: true,
            data: {
                prospectsCount: parseInt(prospectsResult[0]?.count ?? '0', 10),
                newPlayersToday: parseInt(newPlayersResult[0]?.count ?? '0', 10),
                scholarshipsAgreed: 0, // placeholder — feature coming soon
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
