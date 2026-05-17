import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/authentication/middleware/session';
import { query } from '@/authentication/db/client';
import { getTier1Players, getTier1Coaches, getTier2Summary, getTier3Summary, getMonthlySeries } from '@/earnings/db/earnings';
import { logger } from '@/lib/logger';
import { isValidUUID, generateRequestId, formatExecutionTime } from '@/lib/api/utils';
import type { EarningsData } from '@/earnings/types';

/**
 * GET /api/coach/[coachId]/earnings
 *
 * Returns full earnings data for the authenticated coach.
 *
 * @auth Required — coach session matching coachId
 * @response 200 { success: true, data: EarningsData }
 * @response 400 Invalid coachId format
 * @response 401 No valid session
 * @response 403 Session does not match coachId or is not a coach
 * @response 404 Coach not found
 * @response 500 Database or unexpected error
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.6
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ coachId: string }> }
) {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const { coachId } = await context.params;
    const path = `/api/coach/${coachId}/earnings`;

    logger.apiRequest('GET', path, { requestId, coachId });

    try {
        // Validate coachId format
        if (!coachId || !isValidUUID(coachId)) {
            logger.validationError('Invalid coach ID format', [
                { field: 'coachId', message: 'Coach ID must be a valid UUID' }
            ], { requestId, coachId });
            logger.apiResponse('GET', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Invalid coach ID format' }, { status: 400 });
        }

        // Validate session — must be the coach themselves (Requirement 6.6)
        const session = await validateSession(request);

        if (!session.isValid) {
            logger.info('Unauthenticated request', { requestId, coachId, error: session.error });
            logger.apiResponse('GET', path, 401, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        if (session.playerId !== coachId || session.type !== 'coach') {
            logger.info('Unauthorized earnings access attempt', {
                requestId,
                coachId,
                userId: session.playerId,
                userType: session.type,
            });
            logger.apiResponse('GET', path, 403, Date.now() - startTime, { requestId });
            return NextResponse.json(
                { success: false, error: 'You can only access your own earnings' },
                { status: 403 }
            );
        }

        // Fetch the coach's promo code
        const coachRows = await query<{ promo_code: string | null }>(
            `SELECT promo_code FROM coaches WHERE id = $1`,
            [coachId]
        );

        if (coachRows.length === 0) {
            logger.info('Coach not found', { requestId, coachId });
            logger.apiResponse('GET', path, 404, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Coach not found' }, { status: 404 });
        }

        const promoCode = coachRows[0].promo_code;

        // If the coach has no promo code, return empty earnings
        if (!promoCode) {
            const emptyData: EarningsData = {
                tier1Players: [],
                tier1Coaches: [],
                tier2: { playerCount: 0, activePlayerCount: 0, monthlyEarnings: 0 },
                tier3: { playerCount: 0, activePlayerCount: 0, monthlyEarnings: 0 },
                totalMonthlyEarnings: 0,
                monthlySeries: [],
            };
            logger.apiResponse('GET', path, 200, Date.now() - startTime, { requestId, coachId });
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

        logger.info('Coach earnings fetched successfully', {
            requestId,
            coachId,
            tier1PlayerCount: tier1Players.length,
            executionTime: formatExecutionTime(startTime),
        });
        logger.apiResponse('GET', path, 200, Date.now() - startTime, { requestId, coachId });
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        logger.error('Unexpected error fetching coach earnings', {
            requestId,
            coachId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));
        logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'Failed to fetch earnings' }, { status: 500 });
    }
}
