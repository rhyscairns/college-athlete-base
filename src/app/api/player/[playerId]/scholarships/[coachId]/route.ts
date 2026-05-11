import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/authentication/middleware/session';
import { getScholarshipByCoachAndPlayer, updateScholarship } from '@/scholarships/db/queries';
import { logger } from '@/lib/logger';
import { isValidUUID, generateRequestId, formatExecutionTime } from '@/lib/api/utils';
import type { ScholarshipStatus } from '@/scholarships/types';

const ALLOWED_PLAYER_TRANSITIONS: Record<ScholarshipStatus, ScholarshipStatus[]> = {
    pending: ['accepted', 'rejected', 'countered'],
    countered: [],
    accepted: [],
    rejected: [],
};

async function authorizePlayer(
    request: NextRequest,
    playerId: string,
    coachId: string,
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

    if (!coachId || !isValidUUID(coachId)) {
        logger.validationError('Invalid coach ID format', [
            { field: 'coachId', message: 'Coach ID must be a valid UUID' }
        ], { requestId, coachId });
        logger.apiResponse(method, path, 400, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'Invalid coach ID format' }, { status: 400 });
    }

    const session = await validateSession(request);

    if (!session.isValid) {
        logger.info('Unauthenticated request', { requestId, playerId, error: session.error });
        logger.apiResponse(method, path, 401, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (session.playerId !== playerId || session.type !== 'player') {
        logger.info('Unauthorized scholarship offer access attempt', {
            requestId,
            playerId,
            userId: session.playerId,
            userType: session.type,
        });
        logger.apiResponse(method, path, 403, Date.now() - startTime, { requestId });
        return NextResponse.json(
            { success: false, error: 'You can only access your own scholarship offers' },
            { status: 403 }
        );
    }

    return null;
}

/**
 * GET /api/player/[playerId]/scholarships/[coachId]
 *
 * Returns the scholarship offer from a specific coach to this player.
 *
 * @auth Required — player session matching playerId
 * @response 200 { success: true, data: Scholarship }
 * @response 400 Invalid playerId or coachId format
 * @response 401 No valid session
 * @response 403 Session does not match playerId or is not a player
 * @response 404 Scholarship not found
 * @response 500 Database or unexpected error
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ playerId: string; coachId: string }> }
) {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const { playerId, coachId } = await context.params;
    const path = `/api/player/${playerId}/scholarships/${coachId}`;

    logger.apiRequest('GET', path, { requestId, playerId, coachId });

    try {
        const authError = await authorizePlayer(request, playerId, coachId, 'GET', path, startTime, requestId);
        if (authError) return authError;

        let scholarship;
        try {
            logger.dbOperation('getScholarshipByCoachAndPlayer', { requestId, coachId, playerId });
            scholarship = await getScholarshipByCoachAndPlayer(coachId, playerId);
        } catch (error) {
            logger.dbError('getScholarshipByCoachAndPlayer', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
                coachId,
                playerId,
            });
            logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Failed to fetch scholarship offer' }, { status: 500 });
        }

        if (!scholarship) {
            logger.info('Scholarship offer not found', { requestId, coachId, playerId });
            logger.apiResponse('GET', path, 404, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Scholarship offer not found' }, { status: 404 });
        }

        logger.info('Scholarship offer retrieved successfully', {
            requestId,
            playerId,
            coachId,
            scholarshipId: scholarship.id,
            executionTime: formatExecutionTime(startTime),
        });
        logger.apiResponse('GET', path, 200, Date.now() - startTime, { requestId, playerId });
        return NextResponse.json({ success: true, data: scholarship }, { status: 200 });
    } catch (error) {
        logger.error('Unexpected error fetching scholarship offer', {
            requestId,
            playerId,
            coachId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));
        logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
}

/**
 * PATCH /api/player/[playerId]/scholarships/[coachId]
 *
 * Allows a player to accept, reject, or counter a scholarship offer.
 * Only valid status transitions from the current state are permitted.
 *
 * Accept:  { status: 'accepted' }
 * Reject:  { status: 'rejected' }
 * Counter: { status: 'countered', counterAmount?, counterGpa?, counterNotes? }
 *
 * @auth Required — player session matching playerId
 * @response 200 { success: true, data: Scholarship }
 * @response 400 Invalid IDs, missing status, or invalid transition
 * @response 401 No valid session
 * @response 403 Session does not match playerId or is not a player
 * @response 404 Scholarship not found
 * @response 500 Database or unexpected error
 */
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ playerId: string; coachId: string }> }
) {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const { playerId, coachId } = await context.params;
    const path = `/api/player/${playerId}/scholarships/${coachId}`;

    logger.apiRequest('PATCH', path, { requestId, playerId, coachId });

    try {
        const authError = await authorizePlayer(request, playerId, coachId, 'PATCH', path, startTime, requestId);
        if (authError) return authError;

        let body: Record<string, unknown>;
        try {
            body = await request.json();
        } catch {
            logger.validationError('Invalid JSON in request body', [], { requestId, playerId });
            logger.apiResponse('PATCH', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
        }

        const { status, counterAmount, counterGpa, counterNotes } = body;

        // status is required
        if (!status || typeof status !== 'string') {
            logger.apiResponse('PATCH', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'status is required' }, { status: 400 });
        }

        const newStatus = status as ScholarshipStatus;
        const validStatuses: ScholarshipStatus[] = ['accepted', 'rejected', 'countered'];
        if (!validStatuses.includes(newStatus)) {
            logger.apiResponse('PATCH', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json(
                { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
                { status: 400 }
            );
        }

        // Validate counter fields when countering
        if (newStatus === 'countered') {
            if (counterAmount !== undefined) {
                const amount = Number(counterAmount);
                if (isNaN(amount) || amount <= 0) {
                    logger.apiResponse('PATCH', path, 400, Date.now() - startTime, { requestId });
                    return NextResponse.json({ success: false, error: 'Counter amount must be a positive number' }, { status: 400 });
                }
            }
            if (counterGpa !== undefined) {
                const gpa = Number(counterGpa);
                if (isNaN(gpa) || gpa < 0 || gpa > 4) {
                    logger.apiResponse('PATCH', path, 400, Date.now() - startTime, { requestId });
                    return NextResponse.json({ success: false, error: 'Counter GPA must be between 0.0 and 4.0' }, { status: 400 });
                }
            }
        }

        // Fetch existing scholarship to validate transition
        let existing;
        try {
            logger.dbOperation('getScholarshipByCoachAndPlayer', { requestId, coachId, playerId });
            existing = await getScholarshipByCoachAndPlayer(coachId, playerId);
        } catch (error) {
            logger.dbError('getScholarshipByCoachAndPlayer', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
                coachId,
                playerId,
            });
            logger.apiResponse('PATCH', path, 500, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Failed to fetch scholarship offer' }, { status: 500 });
        }

        if (!existing) {
            logger.info('Scholarship offer not found for update', { requestId, coachId, playerId });
            logger.apiResponse('PATCH', path, 404, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Scholarship offer not found' }, { status: 404 });
        }

        // Validate the status transition
        const allowedTransitions = ALLOWED_PLAYER_TRANSITIONS[existing.status];
        if (!allowedTransitions.includes(newStatus)) {
            logger.info('Invalid status transition attempted', {
                requestId,
                currentStatus: existing.status,
                requestedStatus: newStatus,
            });
            logger.apiResponse('PATCH', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json(
                {
                    success: false,
                    error: `Cannot transition from '${existing.status}' to '${newStatus}'`,
                },
                { status: 400 }
            );
        }

        // Build update payload
        const updateData: Parameters<typeof updateScholarship>[1] = { status: newStatus };
        if (newStatus === 'countered') {
            if (counterAmount !== undefined) updateData.counterAmount = Number(counterAmount);
            if (counterGpa !== undefined) updateData.counterGpa = Number(counterGpa);
            if (counterNotes !== undefined) updateData.counterNotes = String(counterNotes);
        }

        try {
            logger.dbOperation('updateScholarship', { requestId, scholarshipId: existing.id, newStatus });
            const updated = await updateScholarship(existing.id, updateData);

            logger.info('Scholarship offer updated successfully', {
                requestId,
                playerId,
                coachId,
                scholarshipId: existing.id,
                newStatus,
                executionTime: formatExecutionTime(startTime),
            });
            logger.apiResponse('PATCH', path, 200, Date.now() - startTime, { requestId, playerId });
            return NextResponse.json({ success: true, data: updated }, { status: 200 });
        } catch (error) {
            logger.dbError('updateScholarship', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
                playerId,
                coachId,
            });
            logger.apiResponse('PATCH', path, 500, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Failed to update scholarship offer' }, { status: 500 });
        }
    } catch (error) {
        logger.error('Unexpected error updating scholarship offer', {
            requestId,
            playerId,
            coachId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));
        logger.apiResponse('PATCH', path, 500, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
}
