import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/authentication/middleware/session';
import { getScholarshipsByPlayer } from '@/scholarships/db/queries';
import { logger } from '@/lib/logger';
import { isValidUUID, generateRequestId, formatExecutionTime } from '@/lib/api/utils';

async function authorizePlayer(
    request: NextRequest,
    playerId: string,
    method: string,
    path: string,
    startTime: number,
    requestId: string,
): Promise<NextResponse | null> {
    if (!playerId || !isValidUUID(playerId)) {
        logger.validationError('Invalid player ID format', [
            { field: 'playerId', message: 'Player ID must be a valid UUID' }
        ], { requestId, playerId });
        logger.apiResponse(method, path, 400, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'Invalid player ID format' }, { status: 400 });
    }

    const session = await validateSession(request);

    if (!session.isValid) {
        logger.info('Unauthenticated request', { requestId, playerId, error: session.error });
        logger.apiResponse(method, path, 401, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (session.playerId !== playerId || session.type !== 'player') {
        logger.info('Unauthorized scholarships access attempt', {
            requestId,
            playerId,
            userId: session.playerId,
            userType: session.type,
        });
        logger.apiResponse(method, path, 403, Date.now() - startTime, { requestId });
        return NextResponse.json(
            { success: false, error: 'You can only access your own scholarship offers' },
            { status: 403 }
        );
    }

    return null;
}

/**
 * GET /api/player/[playerId]/scholarships
 *
 * Returns all scholarship offers received by the player.
 *
 * @auth Required — player session matching playerId
 * @response 200 { success: true, data: Scholarship[] }
 * @response 400 Invalid playerId format
 * @response 401 No valid session
 * @response 403 Session does not match playerId or is not a player
 * @response 500 Database or unexpected error
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ playerId: string }> }
) {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const { playerId } = await context.params;
    const path = `/api/player/${playerId}/scholarships`;

    logger.apiRequest('GET', path, { requestId, playerId });

    try {
        const authError = await authorizePlayer(request, playerId, 'GET', path, startTime, requestId);
        if (authError) return authError;

        let scholarships;
        try {
            logger.dbOperation('getScholarshipsByPlayer', { requestId, playerId });
            scholarships = await getScholarshipsByPlayer(playerId);
        } catch (error) {
            logger.dbError('getScholarshipsByPlayer', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
                playerId,
            });
            logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Failed to fetch scholarship offers' }, { status: 500 });
        }

        logger.info('Scholarship offers retrieved successfully', {
            requestId,
            playerId,
            count: scholarships.length,
            executionTime: formatExecutionTime(startTime),
        });
        logger.apiResponse('GET', path, 200, Date.now() - startTime, { requestId, playerId });
        return NextResponse.json({ success: true, data: scholarships }, { status: 200 });
    } catch (error) {
        logger.error('Unexpected error fetching scholarship offers', {
            requestId,
            playerId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));
        logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
}
