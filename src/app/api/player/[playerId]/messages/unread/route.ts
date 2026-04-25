import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/authentication/middleware/session';
import { getUnreadCount, getUnreadNotifications } from '@/lib/db/queries/messages';
import { logger } from '@/lib/logger';
import { isValidUUID, generateRequestId, formatExecutionTime } from '@/lib/api/utils';

/**
 * GET /api/player/[playerId]/messages/unread
 *
 * Returns the unread message count and up to 5 recent unread notifications for the player.
 *
 * @auth Required — player session matching playerId
 * @response 200 { success: true, data: { count: number, notifications: NotificationItem[] } }
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
    const path = `/api/player/${playerId}/messages/unread`;

    logger.apiRequest('GET', path, { requestId, playerId });

    try {
        if (!playerId || !isValidUUID(playerId)) {
            logger.validationError('Invalid player ID format', [
                { field: 'playerId', message: 'Player ID must be a valid UUID' }
            ], { requestId, playerId });
            logger.apiResponse('GET', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Invalid player ID format' }, { status: 400 });
        }

        const session = await validateSession(request);

        if (!session.isValid) {
            logger.info('Unauthenticated request', { requestId, playerId, error: session.error });
            logger.apiResponse('GET', path, 401, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        if (session.playerId !== playerId || session.type !== 'player') {
            logger.info('Unauthorized unread access attempt', {
                requestId,
                playerId,
                userId: session.playerId,
                userType: session.type,
            });
            logger.apiResponse('GET', path, 403, Date.now() - startTime, { requestId });
            return NextResponse.json(
                { success: false, error: 'You can only view your own notifications' },
                { status: 403 }
            );
        }

        let count: number;
        let notifications;
        try {
            logger.dbOperation('getUnreadCount + getUnreadNotifications', { requestId, playerId });
            const [countResult, notificationsResult] = await Promise.allSettled([
                getUnreadCount(playerId, 'player'),
                getUnreadNotifications(playerId, 'player'),
            ]);
            count = countResult.status === 'fulfilled' ? countResult.value : 0;
            notifications = notificationsResult.status === 'fulfilled' ? notificationsResult.value : [];
            if (countResult.status === 'rejected') {
                logger.dbError('getUnreadCount', countResult.reason instanceof Error ? countResult.reason : new Error('Unknown'), { requestId, playerId });
            }
            if (notificationsResult.status === 'rejected') {
                logger.dbError('getUnreadNotifications', notificationsResult.reason instanceof Error ? notificationsResult.reason : new Error('Unknown'), { requestId, playerId });
            }
        } catch (error) {
            logger.dbError('getUnreadCount/getUnreadNotifications', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
                playerId,
            });
            logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Failed to fetch unread data' }, { status: 500 });
        }

        logger.info('Unread data retrieved', {
            requestId,
            playerId,
            count,
            executionTime: formatExecutionTime(startTime),
        });
        logger.apiResponse('GET', path, 200, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: true, data: { count, notifications } }, { status: 200 });
    } catch (error) {
        logger.error('Unexpected error fetching unread data', {
            requestId,
            playerId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));
        logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
}
