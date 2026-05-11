import { NextRequest, NextResponse } from 'next/server';
import { getPlayerByEmail } from '@/authentication/db/players';
import { validateSession } from '@/authentication/middleware/session';
import { logger } from '@/lib/logger';
import { generateRequestId } from '@/lib/api/utils';

/**
 * GET /api/players/lookup?email=...
 *
 * Looks up a player by email address. Returns minimal public info (id, name)
 * so a coach can resolve a playerId before creating a scholarship offer.
 *
 * @auth Required — any valid session (coach or player)
 * @query email — the player's email address
 * @response 200 { success: true, data: { id, firstName, lastName, email } }
 * @response 400 Missing or invalid email
 * @response 401 No valid session
 * @response 404 No player found with that email
 * @response 500 Unexpected error
 */
export async function GET(request: NextRequest) {
    const requestId = generateRequestId();

    const session = await validateSession(request);
    if (!session.isValid) {
        return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ success: false, error: 'A valid email address is required' }, { status: 400 });
    }

    try {
        logger.dbOperation('getPlayerByEmail (lookup)', { requestId, email });
        const player = await getPlayerByEmail(email);

        if (!player) {
            return NextResponse.json({ success: false, error: 'No player found with that email address' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                id: player.id,
                firstName: player.firstName,
                lastName: player.lastName,
                email: player.email,
            },
        });
    } catch (error) {
        logger.error('Player lookup failed', { requestId }, error instanceof Error ? error : new Error('Unknown error'));
        return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
}
