import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/authentication/middleware/session';
import { getScholarshipByCoachAndPlayer, updateScholarship } from '@/scholarships/db/queries';
import { logger } from '@/lib/logger';
import { isValidUUID, generateRequestId, formatExecutionTime } from '@/lib/api/utils';

const invalidCoachId = 'Invalid coach ID format';
const invalidPlayerId = 'Invalid player ID format';

async function authorizeCoach(
    request: NextRequest,
    coachId: string,
    playerId: string,
    method: string,
    path: string,
    startTime: number,
    requestId: string,
): Promise<NextResponse | null> {
    if (!coachId || !isValidUUID(coachId)) {
        logger.validationError(invalidCoachId, [
            { field: 'coachId', message: 'Coach ID must be a valid UUID' }
        ], { requestId, coachId });
        logger.apiResponse(method, path, 400, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: invalidCoachId }, { status: 400 });
    }

    if (!playerId || !isValidUUID(playerId)) {
        logger.validationError(invalidPlayerId, [
            { field: 'playerId', message: 'Player ID must be a valid UUID' }
        ], { requestId, playerId });
        logger.apiResponse(method, path, 400, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: invalidPlayerId }, { status: 400 });
    }

    const session = await validateSession(request);

    if (!session.isValid) {
        logger.info('Unauthenticated request', { requestId, coachId, error: session.error });
        logger.apiResponse(method, path, 401, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (session.playerId !== coachId || session.type !== 'coach') {
        logger.info('Unauthorized scholarship access attempt', {
            requestId,
            coachId,
            userId: session.playerId,
            userType: session.type,
        });
        logger.apiResponse(method, path, 403, Date.now() - startTime, { requestId });
        return NextResponse.json(
            { success: false, error: 'You can only access your own scholarships' },
            { status: 403 }
        );
    }

    return null;
}

/**
 * GET /api/coach/[coachId]/scholarships/[playerId]
 *
 * Returns the scholarship between the coach and a specific player.
 *
 * @auth Required — coach session matching coachId
 * @response 200 { success: true, data: Scholarship }
 * @response 400 Invalid coachId or playerId format
 * @response 401 No valid session
 * @response 403 Session does not match coachId or is not a coach
 * @response 404 Scholarship not found
 * @response 500 Database or unexpected error
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ coachId: string; playerId: string }> }
) {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const { coachId, playerId } = await context.params;
    const path = `/api/coach/${coachId}/scholarships/${playerId}`;

    logger.apiRequest('GET', path, { requestId, coachId, playerId });

    try {
        const authError = await authorizeCoach(request, coachId, playerId, 'GET', path, startTime, requestId);
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
            return NextResponse.json({ success: false, error: 'Failed to fetch scholarship' }, { status: 500 });
        }

        if (!scholarship) {
            logger.info('Scholarship not found', { requestId, coachId, playerId });
            logger.apiResponse('GET', path, 404, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Scholarship not found' }, { status: 404 });
        }

        logger.info('Scholarship retrieved successfully', {
            requestId,
            coachId,
            playerId,
            scholarshipId: scholarship.id,
            executionTime: formatExecutionTime(startTime),
        });
        logger.apiResponse('GET', path, 200, Date.now() - startTime, { requestId, coachId });
        return NextResponse.json({ success: true, data: scholarship }, { status: 200 });
    } catch (error) {
        logger.error('Unexpected error fetching scholarship', {
            requestId,
            coachId,
            playerId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));
        logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
}

/**
 * PATCH /api/coach/[coachId]/scholarships/[playerId]
 *
 * Updates scholarship terms and resets status to 'pending'.
 *
 * @auth Required — coach session matching coachId
 * @body Partial scholarship fields to update
 * @response 200 { success: true, data: Scholarship }
 * @response 400 Invalid IDs or invalid field values
 * @response 401 No valid session
 * @response 403 Session does not match coachId or is not a coach
 * @response 404 Scholarship not found
 * @response 500 Database or unexpected error
 */
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ coachId: string; playerId: string }> }
) {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const { coachId, playerId } = await context.params;
    const path = `/api/coach/${coachId}/scholarships/${playerId}`;

    logger.apiRequest('PATCH', path, { requestId, coachId, playerId });

    try {
        const authError = await authorizeCoach(request, coachId, playerId, 'PATCH', path, startTime, requestId);
        if (authError) return authError;

        let body: Record<string, unknown>;
        try {
            body = await request.json();
        } catch {
            logger.validationError('Invalid JSON in request body', [], { requestId, coachId });
            logger.apiResponse('PATCH', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
        }

        // Validate optional numeric fields if provided
        if (body.scholarshipAmount !== undefined) {
            const amount = Number(body.scholarshipAmount);
            if (isNaN(amount) || amount <= 0) {
                logger.apiResponse('PATCH', path, 400, Date.now() - startTime, { requestId });
                return NextResponse.json({ success: false, error: 'Scholarship amount must be a positive number' }, { status: 400 });
            }
        }

        if (body.requiredGpa !== undefined) {
            const gpa = Number(body.requiredGpa);
            if (isNaN(gpa) || gpa < 0 || gpa > 4) {
                logger.apiResponse('PATCH', path, 400, Date.now() - startTime, { requestId });
                return NextResponse.json({ success: false, error: 'Required GPA must be between 0.0 and 4.0' }, { status: 400 });
            }
        }

        // Fetch existing scholarship first to get its ID
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
            return NextResponse.json({ success: false, error: 'Failed to fetch scholarship' }, { status: 500 });
        }

        if (!existing) {
            logger.info('Scholarship not found for update', { requestId, coachId, playerId });
            logger.apiResponse('PATCH', path, 404, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Scholarship not found' }, { status: 404 });
        }

        // Build update payload — always reset status to pending on coach edit
        const updateData: Record<string, unknown> = { status: 'pending' };
        const allowedFields = ['schoolName', 'sport', 'scholarshipAmount', 'requiredGpa', 'division', 'startYear', 'durationYears', 'notes'];
        for (const field of allowedFields) {
            if (field in body) {
                updateData[field] = body[field];
            }
        }

        try {
            logger.dbOperation('updateScholarship', { requestId, scholarshipId: existing.id });
            const updated = await updateScholarship(existing.id, updateData as Parameters<typeof updateScholarship>[1]);

            logger.info('Scholarship updated successfully', {
                requestId,
                coachId,
                playerId,
                scholarshipId: existing.id,
                executionTime: formatExecutionTime(startTime),
            });
            logger.apiResponse('PATCH', path, 200, Date.now() - startTime, { requestId, coachId });
            return NextResponse.json({ success: true, data: updated }, { status: 200 });
        } catch (error) {
            logger.dbError('updateScholarship', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
                coachId,
                playerId,
            });
            logger.apiResponse('PATCH', path, 500, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Failed to update scholarship' }, { status: 500 });
        }
    } catch (error) {
        logger.error('Unexpected error updating scholarship', {
            requestId,
            coachId,
            playerId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));
        logger.apiResponse('PATCH', path, 500, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
}
