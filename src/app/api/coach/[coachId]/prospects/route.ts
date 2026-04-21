import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/authentication/middleware/session';
import { getProspectsWithPlayerData, addProspect } from '@/lib/db/queries/prospects';
import { logger } from '@/lib/logger';
import { isValidUUID, generateRequestId, formatExecutionTime } from '@/lib/api/utils';

const invalidCoachId = 'Invalid coach ID format';

/**
 * Validates coachId format and session authorization.
 * Returns an error response if invalid, or null if all checks pass.
 */
async function authorizeCoach(
    request: NextRequest,
    coachId: string,
    method: string,
    path: string,
    startTime: number,
    requestId: string,
): Promise<NextResponse | null> {
    if (!coachId || !isValidUUID(coachId)) {
        logger.validationError(invalidCoachId, [
            { field: 'coachId', message: 'Coach ID must be a valid UUID' }
        ], { requestId, coachId });
        logger.apiResponse(method, path, 400, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: invalidCoachId }, { status: 400 });
    }

    const session = await validateSession(request);

    if (!session.isValid) {
        logger.info('Unauthenticated request', { requestId, coachId, error: session.error });
        logger.apiResponse(method, path, 401, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (session.playerId !== coachId || session.type !== 'coach') {
        logger.info('Unauthorized prospects access attempt', {
            requestId,
            coachId,
            userId: session.playerId,
            userType: session.type,
        });
        logger.apiResponse(method, path, 403, Date.now() - startTime, { requestId });
        return NextResponse.json(
            { success: false, error: method === 'GET' ? 'You can only view your own prospects' : 'You can only modify your own prospects' },
            { status: 403 }
        );
    }

    return null;
}

/**
 * GET /api/coach/[coachId]/prospects
 *
 * Returns all favorited players for the coach with their profile data.
 *
 * @auth Required — coach session matching coachId
 * @response 200 { success: true, data: ProspectPlayerData[] }
 * @response 400 Invalid coachId format
 * @response 401 No valid session
 * @response 403 Session does not match coachId or is not a coach
 * @response 500 Database or unexpected error
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
        const authError = await authorizeCoach(request, coachId, 'GET', path, startTime, requestId);
        if (authError) return authError;

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
 *
 * Adds a player to the coach's prospects list.
 *
 * @auth Required — coach session matching coachId
 * @body { playerId: string } — UUID of the player to add
 * @response 201 { success: true, data: ProspectRow }
 * @response 400 Invalid coachId/playerId format or malformed body
 * @response 401 No valid session
 * @response 403 Session does not match coachId or is not a coach
 * @response 409 Player is already in prospects
 * @response 500 Database or unexpected error
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
        const authError = await authorizeCoach(request, coachId, 'POST', path, startTime, requestId);
        if (authError) return authError;

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
