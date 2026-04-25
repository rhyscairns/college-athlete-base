import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/authentication/middleware/session';
import { getMessageThread, insertMessage, markThreadAsRead, getUnreadCount, getSenderName } from '@/lib/db/queries/messages';
import { getSocketServer } from '@/lib/socket/server';
import { logger } from '@/lib/logger';
import { isValidUUID, generateRequestId, formatExecutionTime } from '@/lib/api/utils';

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
            { success: false, error: 'You can only access your own messages' },
            { status: 403 }
        );
    }

    return null;
}

/**
 * GET /api/coach/[coachId]/messages/[playerId]
 *
 * Returns the full message thread between a coach and player, marks messages as read.
 *
 * @auth Required — coach session matching coachId
 * @response 200 { success: true, data: Message[] }
 * @response 400 Invalid ID format
 * @response 401 No valid session
 * @response 403 Session does not match coachId
 * @response 500 Database or unexpected error
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ coachId: string; playerId: string }> }
) {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const { coachId, playerId } = await context.params;
    const path = `/api/coach/${coachId}/messages/${playerId}`;

    logger.apiRequest('GET', path, { requestId, coachId, playerId });

    try {
        const authError = await authorizeCoach(request, coachId, 'GET', path, startTime, requestId);
        if (authError) return authError;

        if (!playerId || !isValidUUID(playerId)) {
            logger.validationError('Invalid player ID format', [
                { field: 'playerId', message: 'Player ID must be a valid UUID' }
            ], { requestId, playerId });
            logger.apiResponse('GET', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Invalid player ID format' }, { status: 400 });
        }

        let messages;
        try {
            logger.dbOperation('getMessageThread', { requestId, coachId, playerId });
            messages = await getMessageThread(coachId, playerId);
            await markThreadAsRead(coachId, playerId, 'coach');
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
            coachId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));
        logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
}

/**
 * POST /api/coach/[coachId]/messages/[playerId]
 *
 * Sends a message from the coach to the player.
 *
 * @auth Required — coach session matching coachId
 * @body { content: string }
 * @response 201 { success: true, data: Message }
 * @response 400 Empty/missing content or invalid ID format
 * @response 401 No valid session
 * @response 403 Session does not match coachId
 * @response 500 Database or unexpected error
 */
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ coachId: string; playerId: string }> }
) {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const { coachId, playerId } = await context.params;
    const path = `/api/coach/${coachId}/messages/${playerId}`;

    logger.apiRequest('POST', path, { requestId, coachId, playerId });

    try {
        const authError = await authorizeCoach(request, coachId, 'POST', path, startTime, requestId);
        if (authError) return authError;

        if (!playerId || !isValidUUID(playerId)) {
            logger.validationError('Invalid player ID format', [
                { field: 'playerId', message: 'Player ID must be a valid UUID' }
            ], { requestId, playerId });
            logger.apiResponse('POST', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Invalid player ID format' }, { status: 400 });
        }

        let body: { content?: string };
        try {
            body = await request.json();
        } catch {
            logger.validationError('Invalid JSON in request body', [], { requestId, coachId });
            logger.apiResponse('POST', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
        }

        const content = body.content?.trim();
        if (!content) {
            logger.validationError('Empty message content', [
                { field: 'content', message: 'Message content cannot be empty' }
            ], { requestId, coachId });
            logger.apiResponse('POST', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Message content cannot be empty' }, { status: 400 });
        }

        let message;
        try {
            logger.dbOperation('insertMessage', { requestId, coachId, playerId });
            message = await insertMessage(coachId, playerId, 'coach', coachId, content);
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

            // Notify the player's notification room with their real unread total
            const [playerUnreadCount, coachName] = await Promise.all([
                getUnreadCount(playerId, 'player'),
                getSenderName(coachId, 'coach'),
            ]);
            const notificationRoom = `notifications:${playerId}`;
            io.to(notificationRoom).emit('unread_update', {
                count: playerUnreadCount,
                notification: {
                    messageId: message.id,
                    senderName: coachName,
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
            coachId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));
        logger.apiResponse('POST', path, 500, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
}
