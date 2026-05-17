import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/authentication/middleware/session';
import { query } from '@/authentication/db/client';
import { getTier1Players, getTier1Coaches, getTier2Summary, getTier3Summary, getMonthlySeries } from '@/earnings/db/earnings';
import { logger } from '@/lib/logger';
import { isValidUUID, generateRequestId, formatExecutionTime } from '@/lib/api/utils';
import type { EarningsData } from '@/earnings/types';

/**
 * GET /api/player/[playerId]/earnings
 *
 * Returns full earnings data for the authenticated player.
 *
 * @auth Required — player session matching playerId
 * @response 200 { success: true, data: EarningsData }
 * @response 400 Invalid playerId format
 * @response 401 No valid session
 * @response 403 Session does not match playerId or is not a player
 * @response 404 Player not found
 * @response 500 Database or unexpected error
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.6
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ playerId: string }> }
) {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const { playerId } = await context.params;
    const path = `/api/player/${playerId}/earnings`;

    logger.apiRequest('GET', path, { requestId, playerId });

    try {
        // Validate playerId format
        if (!playerId || !isValidUUID(playerId)) {
            logger.validationError('Invalid player ID format', [
                { field: 'playerId', message: 'Player ID must be a valid UUID' }
            ], { requestId, playerId });
            logger.apiResponse('GET', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Invalid player ID format' }, { status: 400 });
        }

        // Validate session — must be the player themselves (Requirement 6.6)
        const session = await validateSession(request);

        if (!session.isValid) {
            logger.info('Unauthenticated request', { requestId, playerId, error: session.error });
            logger.apiResponse('GET', path, 401, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        if (session.playerId !== playerId || session.type !== 'player') {
            logger.info('Unauthorized earnings access attempt', {
                requestId,
                playerId,
                userId: session.playerId,
                userType: session.type,
            });
            logger.apiResponse('GET', path, 403, Date.now() - startTime, { requestId });
            return NextResponse.json(
                { success: false, error: 'You can only access your own earnings' },
                { status: 403 }
            );
        }

        // Fetch the player's promo code
        const playerRows = await query<{ promo_code: string | null }>(
            `SELECT promo_code FROM players WHERE id = $1`,
            [playerId]
        );

        if (playerRows.length === 0) {
            logger.info('Player not found', { requestId, playerId });
            logger.apiResponse('GET', path, 404, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
        }

        const promoCode = playerRows[0].promo_code;

        // If the player has no promo code, return empty earnings
        if (!promoCode) {
            const emptyData: EarningsData = {
                tier1Players: [],
                tier1Coaches: [],
                tier2: { playerCount: 0, activePlayerCount: 0, monthlyEarnings: 0 },
                tier3: { playerCount: 0, activePlayerCount: 0, monthlyEarnings: 0 },
                totalMonthlyEarnings: 0,
                monthlySeries: [],
            };
            logger.apiResponse('GET', path, 200, Date.now() - startTime, { requestId, playerId });
            return NextResponse.json({ success: true, data: emptyData }, { status: 200 });
        }

        // Fetch all earnings data in parallel (Requirements 6.1, 6.2, 6.3, 6.4)
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

        const data: EarningsData = {
            tier1Players,
            tier1Coaches,
            tier2,
            tier3,
            totalMonthlyEarnings,
            monthlySeries,
        };

        logger.info('Player earnings fetched successfully', {
            requestId,
            playerId,
            tier1PlayerCount: tier1Players.length,
            executionTime: formatExecutionTime(startTime),
        });
        logger.apiResponse('GET', path, 200, Date.now() - startTime, { requestId, playerId });
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        logger.error('Unexpected error fetching player earnings', {
            requestId,
            playerId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));
        logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'Failed to fetch earnings' }, { status: 500 });
    }
}
