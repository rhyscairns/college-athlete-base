import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/authentication/middleware/session';
import { removeProspect } from '@/lib/db/queries/prospects';
import { logger } from '@/lib/logger';
import { isValidUUID, generateRequestId, formatExecutionTime } from '@/lib/api/utils';

/**
 * DELETE /api/coach/[coachId]/prospects/[playerId]
 * Removes a player from the coach's prospects list.
 */
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ coachId: string; playerId: string }> }
) {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const { coachId, playerId } = await context.params;
    const path = `/api/coach/${coachId}/prospects/${playerId}`;

    logger.apiRequest('DELETE', path, { requestId, coachId, playerId });

    try {
        if (!coachId || !isValidUUID(coachId)) {
            logger.validationError('Invalid coach ID format', [
                { field: 'coachId', message: 'Coach ID must be a valid UUID' }
            ], { requestId, coachId });
            logger.apiResponse('DELETE', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Invalid coach ID format' }, { status: 400 });
        }

        if (!playerId || !isValidUUID(playerId)) {
            logger.validationError('Invalid player ID format', [
                { field: 'playerId', message: 'Player ID must be a valid UUID' }
            ], { requestId, playerId });
            logger.apiResponse('DELETE', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Invalid player ID format' }, { status: 400 });
        }

        const session = await validateSession(request);

        if (!session.isValid) {
            logger.info('Unauthenticated request', { requestId, coachId, error: session.error });
            logger.apiResponse('DELETE', path, 401, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        if (session.playerId !== coachId || session.type !== 'coach') {
            logger.info('Unauthorized prospects modification attempt', {
                requestId,
                coachId,
                userId: session.playerId,
                userType: session.type,
            });
            logger.apiResponse('DELETE', path, 403, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'You can only modify your own prospects' }, { status: 403 });
        }

        let removed: boolean;
        try {
            logger.dbOperation('removeProspect', { requestId, coachId, playerId });
            removed = await removeProspect(coachId, playerId);
        } catch (error) {
            logger.dbError('removeProspect', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
                coachId,
                playerId,
            });
            logger.apiResponse('DELETE', path, 500, Date.now() - startTime, { requestId });
            return NextResponse.json(
                { success: false, error: 'Failed to remove prospect' },
                { status: 500 }
            );
        }

        if (!removed) {
            logger.info('Prospect not found for removal', { requestId, coachId, playerId });
            logger.apiResponse('DELETE', path, 404, Date.now() - startTime, { requestId });
            return NextResponse.json(
                { success: false, error: 'Prospect not found' },
                { status: 404 }
            );
        }

        logger.info('Prospect removed successfully', {
            requestId,
            coachId,
            playerId,
            executionTime: formatExecutionTime(startTime),
        });
        logger.apiResponse('DELETE', path, 200, Date.now() - startTime, { requestId, coachId });
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        logger.error('Unexpected error removing prospect', {
            requestId,
            coachId,
            playerId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));
        logger.apiResponse('DELETE', path, 500, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
}
