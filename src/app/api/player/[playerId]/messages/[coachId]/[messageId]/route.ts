import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/authentication/middleware/session';
import { softDeleteMessage } from '@/lib/db/queries/messages';
import { getSocketServer } from '@/lib/socket/server';
import { logger } from '@/lib/logger';
import { isValidUUID, generateRequestId, formatExecutionTime } from '@/lib/api/utils';

/**
 * DELETE /api/player/[playerId]/messages/[coachId]/[messageId]
 *
 * Soft-deletes a message sent by the player.
 *
 * @auth Required — player session matching playerId
 * @response 200 { success: true }
 * @response 400 Invalid ID format
 * @response 401 No valid session
 * @response 403 Message doesn't belong to requester, or session mismatch
 * @response 404 Message not found or already deleted
 * @response 500 Database or unexpected error
 */
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ playerId: string; coachId: string; messageId: string }> }
) {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const { playerId, coachId, messageId } = await context.params;
    const path = `/api/player/${playerId}/messages/${coachId}/${messageId}`;

    logger.apiRequest('DELETE', path, { requestId, playerId, coachId, messageId });

    try {
        if (!playerId || !isValidUUID(playerId)) {
            logger.validationError('Invalid player ID format', [
                { field: 'playerId', message: 'Player ID must be a valid UUID' }
            ], { requestId, playerId });
            logger.apiResponse('DELETE', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Invalid player ID format' }, { status: 400 });
        }

        if (!coachId || !isValidUUID(coachId)) {
            logger.validationError('Invalid coach ID format', [
                { field: 'coachId', message: 'Coach ID must be a valid UUID' }
            ], { requestId, coachId });
            logger.apiResponse('DELETE', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Invalid coach ID format' }, { status: 400 });
        }

        if (!messageId || !isValidUUID(messageId)) {
            logger.validationError('Invalid message ID format', [
                { field: 'messageId', message: 'Message ID must be a valid UUID' }
            ], { requestId, messageId });
            logger.apiResponse('DELETE', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Invalid message ID format' }, { status: 400 });
        }

        const session = await validateSession(request);

        if (!session.isValid) {
            logger.info('Unauthenticated request', { requestId, playerId, error: session.error });
            logger.apiResponse('DELETE', path, 401, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        if (session.playerId !== playerId || session.type !== 'player') {
            logger.info('Unauthorized message delete attempt', {
                requestId,
                playerId,
                userId: session.playerId,
                userType: session.type,
            });
            logger.apiResponse('DELETE', path, 403, Date.now() - startTime, { requestId });
            return NextResponse.json(
                { success: false, error: 'You can only delete your own messages' },
                { status: 403 }
            );
        }

        let deleted: boolean;
        try {
            logger.dbOperation('softDeleteMessage', { requestId, messageId, requesterId: playerId });
            // softDeleteMessage checks sender_id = playerId, returns false if not owner or not found
            deleted = await softDeleteMessage(messageId, playerId);
        } catch (error) {
            logger.dbError('softDeleteMessage', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
                messageId,
            });
            logger.apiResponse('DELETE', path, 500, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Failed to delete message' }, { status: 500 });
        }

        if (!deleted) {
            logger.info('Message not found or not owned by requester', { requestId, messageId, playerId });
            logger.apiResponse('DELETE', path, 404, Date.now() - startTime, { requestId });
            return NextResponse.json(
                { success: false, error: 'Message not found' },
                { status: 404 }
            );
        }

        // Emit real-time delete event
        const io = getSocketServer();
        if (io) {
            const conversationRoom = `conversation:${coachId}:${playerId}`;
            io.to(conversationRoom).emit('message_deleted', { messageId });
        }

        logger.info('Message deleted successfully', {
            requestId,
            coachId,
            playerId,
            messageId,
            executionTime: formatExecutionTime(startTime),
        });
        logger.apiResponse('DELETE', path, 200, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        logger.error('Unexpected error deleting message', {
            requestId,
            playerId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));
        logger.apiResponse('DELETE', path, 500, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
}
