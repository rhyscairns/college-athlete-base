import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/authentication/db/client';

/**
 * Normalise a promo code for comparison:
 * strip everything that isn't a letter or digit, then uppercase.
 */
function normalise(code: string): string {
    return code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/**
 * GET /api/auth/validate-referral?code=...
 *
 * Checks whether a referral/promo code is valid by comparing the
 * normalised input against all promo codes in both the players and
 * coaches tables.  No auth required — called during registration.
 *
 * @response 200 { valid: true,  owner: 'player'|'coach', rawCode: string }
 * @response 200 { valid: false }
 * @response 400 Missing or empty code
 */
export async function GET(request: NextRequest) {
    const code = new URL(request.url).searchParams.get('code')?.trim() ?? '';

    if (!code) {
        return NextResponse.json({ valid: false, error: 'Code is required' }, { status: 400 });
    }

    const normalised = normalise(code);
    if (!normalised) {
        return NextResponse.json({ valid: false });
    }

    try {
        // Fetch all promo codes from both tables in one round-trip
        const [playerRows, coachRows] = await Promise.all([
            query<{ promo_code: string }>(`SELECT promo_code FROM players WHERE promo_code IS NOT NULL`),
            query<{ promo_code: string }>(`SELECT promo_code FROM coaches WHERE promo_code IS NOT NULL`),
        ]);

        const matchPlayer = playerRows.find(r => normalise(r.promo_code) === normalised);
        if (matchPlayer) {
            return NextResponse.json({ valid: true, owner: 'player', rawCode: matchPlayer.promo_code });
        }

        const matchCoach = coachRows.find(r => normalise(r.promo_code) === normalised);
        if (matchCoach) {
            return NextResponse.json({ valid: true, owner: 'coach', rawCode: matchCoach.promo_code });
        }

        return NextResponse.json({ valid: false });
    } catch {
        return NextResponse.json({ valid: false, error: 'Lookup failed' }, { status: 500 });
    }
}
