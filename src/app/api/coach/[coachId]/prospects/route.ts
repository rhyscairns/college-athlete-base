import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/authentication/middleware/session';
import { getProspectsWithPlayerData, addProspect } from '@/lib/db/queries/prospects';
import { logger } from '@/lib/logger';
import { isValidUUID, generateRequestId, formatExecutionTime } from '@/lib/api/utils';

const invalidCoachId = 'Invalid coach ID format';

/**
 * GET /api/coach/[coachId]/prospects
 * Returns all favorited players for the coach with their profile data.
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ coachId: string }> }
) {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const { coachId } = await context.params;
    const path = `/api/coach/${coachId}/prospects`;

    logger.apiRequest('GET', path, { requestId, coachId });

    try {
        if (!coachId || !isValidUUID(coachId)) {
            logger.validationError(invalidCoachId, [
                { field: 'coachId', message: 'Coach ID must be a valid UUID' }
            ], { requestId, coachId });
            logger.apiResponse('GET', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: invalidCoachId }, { status: 400 });
        }

        const session = await validateSession(request);

        if (!session.isValid) {
            logger.info('Unauthenticated request', { requestId, coachId, error: session.error });
            logger.apiResponse('GET', path, 401, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        if (session.playerId !== coachId || session.type !== 'coach') {
            logger.info('Unauthorized prospects access attempt', {
                requestId,
                coachId,
                userId: session.playerId,
                userType: session.type,
            });
            logger.apiResponse('GET', path, 403, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'You can only view your own prospects' }, { status: 403 });
        }

        let prospects;
        try {
            logger.dbOperation('getProspectsWithPlayerData', { requestId, coachId });
            prospects = await getProspectsWithPlayerData(coachId);
        } catch (error) {
            logger.dbError('getProspectsWithPlayerData', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
                coachId,
            });
            logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Failed to fetch prospects' }, { status: 500 });
        }

        logger.info('Prospects retrieved successfully', {
            requestId,
            coachId,
            count: prospects.length,
            executionTime: formatExecutionTime(startTime),
        });
        logger.apiResponse('GET', path, 200, Date.now() - startTime, { requestId, coachId });
        return NextResponse.json({ success: true, data: prospects }, { status: 200 });
    } catch (error) {
        logger.error('Unexpected error fetching prospects', {
            requestId,
            coachId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));
        logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
}

/**
 * POST /api/coach/[coachId]/prospects
 * Adds a player to the coach's prospects list.
 * Body: { playerId: string }
 */
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ coachId: string }> }
) {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const { coachId } = await context.params;
    const path = `/api/coach/${coachId}/prospects`;

    logger.apiRequest('POST', path, { requestId, coachId });

    try {
        if (!coachId || !isValidUUID(coachId)) {
            logger.validationError(invalidCoachId, [
                { field: 'coachId', message: 'Coach ID must be a valid UUID' }
            ], { requestId, coachId });
            logger.apiResponse('POST', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: invalidCoachId }, { status: 400 });
        }

        const session = await validateSession(request);

        if (!session.isValid) {
            logger.info('Unauthenticated request', { requestId, coachId, error: session.error });
            logger.apiResponse('POST', path, 401, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        if (session.playerId !== coachId || session.type !== 'coach') {
            logger.info('Unauthorized prospects modification attempt', {
                requestId,
                coachId,
                userId: session.playerId,
                userType: session.type,
            });
            logger.apiResponse('POST', path, 403, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'You can only modify your own prospects' }, { status: 403 });
        }

        let body: { playerId?: string };
        try {
            body = await request.json();
        } catch {
            logger.validationError('Invalid JSON in request body', [], { requestId, coachId });
            logger.apiResponse('POST', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
        }

        const { playerId } = body;

        if (!playerId || !isValidUUID(playerId)) {
            logger.validationError('Invalid player ID', [
                { field: 'playerId', message: 'Player ID must be a valid UUID' }
            ], { requestId, coachId });
            logger.apiResponse('POST', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Invalid player ID format' }, { status: 400 });
        }

        try {
            logger.dbOperation('addProspect', { requestId, coachId, playerId });
            const prospect = await addProspect(coachId, playerId);

            logger.info('Prospect added successfully', {
                requestId,
                coachId,
                playerId,
                executionTime: formatExecutionTime(startTime),
            });
            logger.apiResponse('POST', path, 201, Date.now() - startTime, { requestId, coachId });
            return NextResponse.json({ success: true, data: prospect }, { status: 201 });
        } catch (error) {
            // Postgres unique violation code
            const isConflict =
                error instanceof Error &&
                'code' in (error as NodeJS.ErrnoException) &&
                (error as NodeJS.ErrnoException).code === '23505';

            if (isConflict) {
                logger.info('Duplicate prospect entry', { requestId, coachId, playerId });
                logger.apiResponse('POST', path, 409, Date.now() - startTime, { requestId });
                return NextResponse.json({ success: false, error: 'Player is already in your prospects' }, { status: 409 });
            }

            logger.dbError('addProspect', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
                coachId,
                playerId,
            });
            logger.apiResponse('POST', path, 500, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Failed to add prospect' }, { status: 500 });
        }
    } catch (error) {
        logger.error('Unexpected error adding prospect', {
            requestId,
            coachId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));
        logger.apiResponse('POST', path, 500, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
}
