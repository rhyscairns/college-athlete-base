import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/authentication/middleware/session';
import { getScholarshipsByCoach, createScholarship } from '@/scholarships/db/queries';
import { logger } from '@/lib/logger';
import { isValidUUID, generateRequestId, formatExecutionTime } from '@/lib/api/utils';

const invalidCoachId = 'Invalid coach ID format';

async function authorizeCoach(
    request: NextRequest,
    coachId: string,
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

    const session = await validateSession(request);

    if (!session.isValid) {
        logger.info('Unauthenticated request', { requestId, coachId, error: session.error });
        logger.apiResponse(method, path, 401, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (session.playerId !== coachId || session.type !== 'coach') {
        logger.info('Unauthorized scholarships access attempt', {
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
 * GET /api/coach/[coachId]/scholarships
 *
 * Returns all scholarships sent by the coach.
 *
 * @auth Required — coach session matching coachId
 * @response 200 { success: true, data: Scholarship[] }
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
    const path = `/api/coach/${coachId}/scholarships`;

    logger.apiRequest('GET', path, { requestId, coachId });

    try {
        const authError = await authorizeCoach(request, coachId, 'GET', path, startTime, requestId);
        if (authError) return authError;

        let scholarships;
        try {
            logger.dbOperation('getScholarshipsByCoach', { requestId, coachId });
            scholarships = await getScholarshipsByCoach(coachId);
        } catch (error) {
            logger.dbError('getScholarshipsByCoach', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
                coachId,
            });
            logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Failed to fetch scholarships' }, { status: 500 });
        }

        logger.info('Scholarships retrieved successfully', {
            requestId,
            coachId,
            count: scholarships.length,
            executionTime: formatExecutionTime(startTime),
        });
        logger.apiResponse('GET', path, 200, Date.now() - startTime, { requestId, coachId });
        return NextResponse.json({ success: true, data: scholarships }, { status: 200 });
    } catch (error) {
        logger.error('Unexpected error fetching scholarships', {
            requestId,
            coachId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));
        logger.apiResponse('GET', path, 500, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
}

/**
 * POST /api/coach/[coachId]/scholarships
 *
 * Creates a new scholarship offer for a player.
 *
 * @auth Required — coach session matching coachId
 * @body CreateScholarshipData (minus coachId)
 * @response 201 { success: true, data: Scholarship }
 * @response 400 Invalid coachId/playerId format, missing required fields, or invalid values
 * @response 401 No valid session
 * @response 403 Session does not match coachId or is not a coach
 * @response 500 Database or unexpected error
 */
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ coachId: string }> }
) {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const { coachId } = await context.params;
    const path = `/api/coach/${coachId}/scholarships`;

    logger.apiRequest('POST', path, { requestId, coachId });

    try {
        const authError = await authorizeCoach(request, coachId, 'POST', path, startTime, requestId);
        if (authError) return authError;

        let body: Record<string, unknown>;
        try {
            body = await request.json();
        } catch {
            logger.validationError('Invalid JSON in request body', [], { requestId, coachId });
            logger.apiResponse('POST', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
        }

        const { playerId, schoolName, sport, scholarshipAmount, requiredGpa, division, startYear, durationYears, notes } = body;

        // Required field validation
        if (!playerId || !isValidUUID(playerId as string)) {
            logger.validationError('Invalid player ID', [{ field: 'playerId', message: 'Player ID must be a valid UUID' }], { requestId });
            logger.apiResponse('POST', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Invalid player ID format' }, { status: 400 });
        }

        if (!schoolName || typeof schoolName !== 'string' || schoolName.trim() === '') {
            logger.apiResponse('POST', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'School name is required' }, { status: 400 });
        }

        if (!sport || typeof sport !== 'string' || sport.trim() === '') {
            logger.apiResponse('POST', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Sport is required' }, { status: 400 });
        }

        const amount = Number(scholarshipAmount);
        if (scholarshipAmount === undefined || scholarshipAmount === null || isNaN(amount) || amount <= 0) {
            logger.apiResponse('POST', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Scholarship amount must be a positive number' }, { status: 400 });
        }

        const gpa = Number(requiredGpa);
        if (requiredGpa === undefined || requiredGpa === null || isNaN(gpa) || gpa < 0 || gpa > 4) {
            logger.apiResponse('POST', path, 400, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Required GPA must be between 0.0 and 4.0' }, { status: 400 });
        }

        try {
            logger.dbOperation('createScholarship', { requestId, coachId, playerId });
            const scholarship = await createScholarship({
                coachId,
                playerId: playerId as string,
                schoolName: (schoolName as string).trim(),
                sport: (sport as string).trim(),
                scholarshipAmount: amount,
                requiredGpa: gpa,
                division: division ? String(division) : null,
                startYear: startYear ? Number(startYear) : null,
                durationYears: durationYears ? Number(durationYears) : null,
                notes: notes ? String(notes) : null,
            });

            logger.info('Scholarship created successfully', {
                requestId,
                coachId,
                playerId,
                scholarshipId: scholarship.id,
                executionTime: formatExecutionTime(startTime),
            });
            logger.apiResponse('POST', path, 201, Date.now() - startTime, { requestId, coachId });
            return NextResponse.json({ success: true, data: scholarship }, { status: 201 });
        } catch (error) {
            logger.dbError('createScholarship', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
                coachId,
                playerId,
            });
            logger.apiResponse('POST', path, 500, Date.now() - startTime, { requestId });
            return NextResponse.json({ success: false, error: 'Failed to create scholarship' }, { status: 500 });
        }
    } catch (error) {
        logger.error('Unexpected error creating scholarship', {
            requestId,
            coachId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));
        logger.apiResponse('POST', path, 500, Date.now() - startTime, { requestId });
        return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
    }
}
