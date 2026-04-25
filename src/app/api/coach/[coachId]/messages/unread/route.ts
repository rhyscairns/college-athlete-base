import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/authentication/middleware/session';
import { getUnreadCount, getUnreadNotifications } from '@/lib/db/queries/messages';
import { logger } from '@/lib/logger';
import { isValidUUID, generateRequestId, formatExecutionTime } from '@/lib/api/utils';

/**
 * GET /api/coach/[coachId]/messages/unread
 *
 * Returns the unread message count and up to 5 recent unread notifications for the coach.
 *
 * @auth Required — coach session matching coachId
 * @response 200 { success: true, data: { count: number, notifications: NotificationItem[] } }
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
    const path = `/api/coach/${coachId}/messages/unread`;

    logger.apiRequest('GET', path, { requestId, coachId });

    try {
        if (!coachId || !isValidUUID(coachId)) {
            logger.validationError('Invalid coach ID format', [
                { field: 'coachId', message: 'Coach ID must be a valid UUID' }
            ], { requestId, coachId });
            logger.apiResponse('GET', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Invalid coach ID format' }, { status: 400 });
        }

        const session = await validateSession(request);

        if (!session.isValid) {
            logger.info('Unauthenticated request', { requestId, coachId, error: session.error });
            logger.apiResponse('GET', path, 401, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        if (session.playerId !== coachId || session.type !== 'coach') {
            logger.info('Unauthorized unread access attempt', {
                requestId,
                coachId,
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
            logger.dbOperation('getUnreadCount + getUnreadNotifications', { requestId, coachId });
            const [countResult, notificationsResult] = await Promise.allSettled([
                getUnreadCount(coachId, 'coach'),
                getUnreadNotifications(coachId, 'coach'),
            ]);
            count = countResult.status === 'fulfilled' ? countResult.value : 0;
            notifications = notificationsResult.status === 'fulfilled' ? notificationsResult.value : [];
            if (countResult.status === 'rejected') {
                logger.dbError('getUnreadCount', countResult.reason instanceof Error ? countResult.reason : new Error('Unknown'), { requestId, coachId });
            }
            if (notificationsResult.status === 'rejected') {
                logger.dbError('getUnreadNotifications', notificationsResult.reason instanceof Error ? notificationsResult.reason : new Error('Unknown'), { requestId, coachId });
            }
        } catch (error) {
            logger.dbError('getUnreadCount/getUnreadNotifications', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
                coachId,
            });
            logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Failed to fetch unread data' }, { status: 500 });
        }

        logger.info('Unread data retrieved', {
            requestId,
            coachId,
            count,
            executionTime: formatExecutionTime(startTime),
        });
        logger.apiResponse('GET', path, 200, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: true, data: { count, notifications } }, { status: 200 });
    } catch (error) {
        logger.error('Unexpected error fetching unread data', {
            requestId,
            coachId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));
        logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
}
