import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/authentication/middleware/session';
import { getUnreadCount, getUnreadNotifications } from '@/lib/db/queries/messages';
import { query } from '@/authentication/db/client';
import { logger } from '@/lib/logger';
import { isValidUUID, generateRequestId, formatExecutionTime } from '@/lib/api/utils';
import type { NotificationItem } from '@/messages/types';

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
        let notifications: NotificationItem[];
        try {
            logger.dbOperation('getUnreadCount + getUnreadNotifications + pendingScholarships', { requestId, playerId });
            const [countResult, notificationsResult, scholarshipsResult] = await Promise.allSettled([
                getUnreadCount(playerId, 'player'),
                getUnreadNotifications(playerId, 'player'),
                // Fetch pending scholarship offers as notifications
                query<{ id: string; school_name: string; coach_first_name: string | null; coach_last_name: string | null; coach_id: string; created_at: string }>(
                    `SELECT s.id, s.school_name, s.coach_id, s.created_at,
                            c.first_name AS coach_first_name, c.last_name AS coach_last_name
                     FROM scholarships s
                     LEFT JOIN coaches c ON c.id = s.coach_id
                     WHERE s.player_id = $1 AND s.status = 'pending'
                     ORDER BY s.created_at DESC
                     LIMIT 5`,
                    [playerId]
                ),
            ]);

            count = countResult.status === 'fulfilled' ? countResult.value : 0;
            const messageNotifications: NotificationItem[] = notificationsResult.status === 'fulfilled'
                ? notificationsResult.value.map(n => ({ ...n, type: 'message' as const }))
                : [];

            const scholarshipNotifications: NotificationItem[] = scholarshipsResult.status === 'fulfilled'
                ? scholarshipsResult.value.map(row => ({
                    messageId: row.id,
                    senderName: [row.coach_first_name, row.coach_last_name].filter(Boolean).join(' ') || row.school_name,
                    preview: `New scholarship offer from ${row.school_name}`,
                    sentAt: row.created_at,
                    coachId: row.coach_id,
                    playerId,
                    type: 'scholarship' as const,
                    href: `/player/${playerId}/scholarship-offers/${row.coach_id}`,
                }))
                : [];

            // Merge and sort by sentAt descending, cap at 5
            notifications = [...messageNotifications, ...scholarshipNotifications]
                .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
                .slice(0, 5);

            // Total count = unread messages + pending scholarship offers
            count = count + scholarshipNotifications.length;

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
