import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/authentication/middleware/session';
import { getConversationsForPlayer } from '@/lib/db/queries/messages';
import { logger } from '@/lib/logger';
import { isValidUUID, generateRequestId, formatExecutionTime } from '@/lib/api/utils';

/**
 * Validates playerId format and session authorization for player messages routes.
 * Returns an error response if invalid, or null if all checks pass.
 */
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
        logger.info('Unauthorized messages access attempt', {
            requestId,
            playerId,
            userId: session.playerId,
            userType: session.type,
        });
        logger.apiResponse(method, path, 403, Date.now() - startTime, { requestId });
        return NextResponse.json(
            { success: false, error: 'You can only view your own messages' },
            { status: 403 }
        );
    }

    return null;
}

/**
 * GET /api/player/[playerId]/messages
 *
 * Returns all conversations for the player, one per unique coach.
 *
 * @auth Required — player session matching playerId
 * @response 200 { success: true, data: Conversation[] }
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
    const path = `/api/player/${playerId}/messages`;

    logger.apiRequest('GET', path, { requestId, playerId });

    try {
        const authError = await authorizePlayer(request, playerId, 'GET', path, startTime, requestId);
        if (authError) return authError;

        let conversations;
        try {
            logger.dbOperation('getConversationsForPlayer', { requestId, playerId });
            conversations = await getConversationsForPlayer(playerId);
        } catch (error) {
            logger.dbError('getConversationsForPlayer', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
                playerId,
            });
            logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Failed to fetch conversations' }, { status: 500 });
        }

        logger.info('Conversations retrieved successfully', {
            requestId,
            playerId,
            count: conversations.length,
            executionTime: formatExecutionTime(startTime),
        });
        logger.apiResponse('GET', path, 200, Date.now() - startTime, { requestId, playerId });
        return NextResponse.json({ success: true, data: conversations }, { status: 200 });
    } catch (error) {
        logger.error('Unexpected error fetching conversations', {
            requestId,
            playerId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));
        logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
}
