import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/authentication/middleware/session';
import { getConversationsForCoach } from '@/lib/db/queries/messages';
import { logger } from '@/lib/logger';
import { isValidUUID, generateRequestId, formatExecutionTime } from '@/lib/api/utils';

/**
 * Validates coachId format and session authorization for messages routes.
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
        logger.validationError('Invalid coach ID format', [
            { field: 'coachId', message: 'Coach ID must be a valid UUID' }
        ], { requestId, coachId });
        logger.apiResponse(method, path, 400, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'Invalid coach ID format' }, { status: 400 });
    }

    const session = await validateSession(request);

    if (!session.isValid) {
        logger.info('Unauthenticated request', { requestId, coachId, error: session.error });
        logger.apiResponse(method, path, 401, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (session.playerId !== coachId || session.type !== 'coach') {
        logger.info('Unauthorized messages access attempt', {
            requestId,
            coachId,
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
 * GET /api/coach/[coachId]/messages
 *
 * Returns all conversations for the coach, one per unique player.
 *
 * @auth Required — coach session matching coachId
 * @response 200 { success: true, data: Conversation[] }
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
    const path = `/api/coach/${coachId}/messages`;

    logger.apiRequest('GET', path, { requestId, coachId });

    try {
        const authError = await authorizeCoach(request, coachId, 'GET', path, startTime, requestId);
        if (authError) return authError;

        let conversations;
        try {
            logger.dbOperation('getConversationsForCoach', { requestId, coachId });
            conversations = await getConversationsForCoach(coachId);
        } catch (error) {
            logger.dbError('getConversationsForCoach', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
                coachId,
            });
            logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Failed to fetch conversations' }, { status: 500 });
        }

        logger.info('Conversations retrieved successfully', {
            requestId,
            coachId,
            count: conversations.length,
            executionTime: formatExecutionTime(startTime),
        });
        logger.apiResponse('GET', path, 200, Date.now() - startTime, { requestId, coachId });
        return NextResponse.json({ success: true, data: conversations }, { status: 200 });
    } catch (error) {
        logger.error('Unexpected error fetching conversations', {
            requestId,
            coachId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));
        logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
}
