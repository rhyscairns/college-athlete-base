import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/authentication/middleware/session';
import { getMessageThread, insertMessage, markThreadAsRead, getUnreadCount, getSenderName } from '@/lib/db/queries/messages';
import { getSocketServer } from '@/lib/socket/server';
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
        logger.info('Unauthorized messages access attempt', {
            requestId,
            playerId,
            userId: session.playerId,
            userType: session.type,
        });
        logger.apiResponse(method, path, 403, Date.now() - startTime, { requestId });
        return NextResponse.json(
            { success: false, error: 'You can only access your own messages' },
            { status: 403 }
        );
    }

    return null;
}

/**
 * GET /api/player/[playerId]/messages/[coachId]
 *
 * Returns the full message thread between a player and coach, marks messages as read.
 *
 * @auth Required — player session matching playerId
 * @response 200 { success: true, data: Message[] }
 * @response 400 Invalid ID format
 * @response 401 No valid session
 * @response 403 Session does not match playerId
 * @response 500 Database or unexpected error
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ playerId: string; coachId: string }> }
) {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const { playerId, coachId } = await context.params;
    const path = `/api/player/${playerId}/messages/${coachId}`;

    logger.apiRequest('GET', path, { requestId, playerId, coachId });

    try {
        const authError = await authorizePlayer(request, playerId, 'GET', path, startTime, requestId);
        if (authError) return authError;

        if (!coachId || !isValidUUID(coachId)) {
            logger.validationError('Invalid coach ID format', [
                { field: 'coachId', message: 'Coach ID must be a valid UUID' }
            ], { requestId, coachId });
            logger.apiResponse('GET', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Invalid coach ID format' }, { status: 400 });
        }

        let messages;
        try {
            logger.dbOperation('getMessageThread', { requestId, coachId, playerId });
            messages = await getMessageThread(coachId, playerId);
            await markThreadAsRead(coachId, playerId, 'player');
        } catch (error) {
            logger.dbError('getMessageThread', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
                coachId,
                playerId,
            });
            logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Failed to fetch messages' }, { status: 500 });
        }

        logger.info('Message thread retrieved', {
            requestId,
            coachId,
            playerId,
            count: messages.length,
            executionTime: formatExecutionTime(startTime),
        });
        logger.apiResponse('GET', path, 200, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: true, data: messages }, { status: 200 });
    } catch (error) {
        logger.error('Unexpected error fetching message thread', {
            requestId,
            playerId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));
        logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
}

/**
 * POST /api/player/[playerId]/messages/[coachId]
 *
 * Sends a message from the player to the coach.
 *
 * @auth Required — player session matching playerId
 * @body { content: string }
 * @response 201 { success: true, data: Message }
 * @response 400 Empty/missing content or invalid ID format
 * @response 401 No valid session
 * @response 403 Session does not match playerId
 * @response 500 Database or unexpected error
 */
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ playerId: string; coachId: string }> }
) {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const { playerId, coachId } = await context.params;
    const path = `/api/player/${playerId}/messages/${coachId}`;

    logger.apiRequest('POST', path, { requestId, playerId, coachId });

    try {
        const authError = await authorizePlayer(request, playerId, 'POST', path, startTime, requestId);
        if (authError) return authError;

        if (!coachId || !isValidUUID(coachId)) {
            logger.validationError('Invalid coach ID format', [
                { field: 'coachId', message: 'Coach ID must be a valid UUID' }
            ], { requestId, coachId });
            logger.apiResponse('POST', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Invalid coach ID format' }, { status: 400 });
        }

        let body: { content?: string };
        try {
            body = await request.json();
        } catch {
            logger.validationError('Invalid JSON in request body', [], { requestId, playerId });
            logger.apiResponse('POST', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
        }

        const content = body.content?.trim();
        if (!content) {
            logger.validationError('Empty message content', [
                { field: 'content', message: 'Message content cannot be empty' }
            ], { requestId, playerId });
            logger.apiResponse('POST', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Message content cannot be empty' }, { status: 400 });
        }

        let message;
        try {
            logger.dbOperation('insertMessage', { requestId, coachId, playerId });
            message = await insertMessage(coachId, playerId, 'player', playerId, content);
        } catch (error) {
            logger.dbError('insertMessage', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
                coachId,
                playerId,
            });
            logger.apiResponse('POST', path, 500, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
        }

        // Emit real-time events via Socket.IO
        const io = getSocketServer();
        if (io) {
            const conversationRoom = `conversation:${coachId}:${playerId}`;
            io.to(conversationRoom).emit('new_message', message);

            // Notify the coach's notification room with their real unread total
            const [coachUnreadCount, playerName] = await Promise.all([
                getUnreadCount(coachId, 'coach'),
                getSenderName(playerId, 'player'),
            ]);
            const notificationRoom = `notifications:${coachId}`;
            io.to(notificationRoom).emit('unread_update', {
                count: coachUnreadCount,
                notification: {
                    messageId: message.id,
                    senderName: playerName,
                    preview: content.slice(0, 60),
                    sentAt: message.createdAt,
                    coachId,
                    playerId,
                },
            });
        }

        logger.info('Message sent successfully', {
            requestId,
            coachId,
            playerId,
            messageId: message.id,
            executionTime: formatExecutionTime(startTime),
        });
        logger.apiResponse('POST', path, 201, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: true, data: message }, { status: 201 });
    } catch (error) {
        logger.error('Unexpected error sending message', {
            requestId,
            playerId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));
        logger.apiResponse('POST', path, 500, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
}
