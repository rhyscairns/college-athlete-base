import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/authentication/middleware/session';
import { getCoachProfileById, updateCoachProfile } from '@/profile/coach/lib/db/queries';
import { validateCoachProfile } from '@/profile/coach/utils/validation';
import { logger } from '@/lib/logger';
import type { CoachProfile } from '@/profile/coach/types';

/**
 * Validate UUID format
 */
function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

/**
 * Handle GET request for coach profile retrieval
 * 
 * @param request - Next.js request object
 * @param context - Route context containing params
 * @returns JSON response with coach profile data
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ coachId: string }> }
) {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    const { coachId } = await context.params;

    // Log incoming request
    logger.apiRequest('GET', `/api/coach/${coachId}/profile`, { requestId, coachId });

    try {
        // Validate coachId format
        if (!coachId || !isValidUUID(coachId)) {
            logger.validationError('Invalid coach ID format', [
                { field: 'coachId', message: 'Coach ID must be a valid UUID' }
            ], { requestId, coachId });

            const response = NextResponse.json(
                {
                    success: false,
                    error: 'Invalid coach ID format',
                },
                { status: 400 }
            );

            logger.apiResponse('GET', `/api/coach/${coachId}/profile`, 400, Date.now() - startTime, { requestId });
            return response;
        }

        // Fetch coach profile from database
        let coachProfile: CoachProfile | null;
        try {
            logger.dbOperation('getCoachProfileById', { requestId, coachId });
            coachProfile = await getCoachProfileById(coachId);
        } catch (error) {
            logger.dbError('getCoachProfileById', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
                coachId,
            });

            const response = NextResponse.json(
                {
                    success: false,
                    error: 'Failed to fetch coach profile',
                },
                { status: 500 }
            );

            logger.apiResponse('GET', `/api/coach/${coachId}/profile`, 500, Date.now() - startTime, { requestId });
            return response;
        }

        // Check if coach profile exists
        if (!coachProfile) {
            logger.info('Coach profile not found', { requestId, coachId });

            const response = NextResponse.json(
                {
                    success: false,
                    error: 'Coach profile not found',
                },
                { status: 404 }
            );

            logger.apiResponse('GET', `/api/coach/${coachId}/profile`, 404, Date.now() - startTime, { requestId });
            return response;
        }

        // Log successful retrieval
        const executionTime = Date.now() - startTime;
        logger.info('Coach profile retrieved successfully', {
            requestId,
            coachId,
            executionTime: `${executionTime}ms`,
        });

        // Return successful response
        const response = NextResponse.json(
            {
                success: true,
                data: coachProfile,
            },
            { status: 200 }
        );

        logger.apiResponse('GET', `/api/coach/${coachId}/profile`, 200, executionTime, { requestId, coachId });
        return response;
    } catch (error) {
        // Catch any unexpected errors
        const executionTime = Date.now() - startTime;
        logger.error('Unexpected error fetching coach profile', {
            requestId,
            coachId,
            executionTime: `${executionTime}ms`,
        }, error instanceof Error ? error : new Error('Unknown error'));

        const response = NextResponse.json(
            {
                success: false,
                error: 'An unexpected error occurred',
            },
            { status: 500 }
        );

        logger.apiResponse('GET', `/api/coach/${coachId}/profile`, 500, executionTime, { requestId });
        return response;
    }
}

/**
 * Handle PUT request for coach profile update
 * 
 * @param request - Next.js request object
 * @param context - Route context containing params
 * @returns JSON response with updated coach profile data
 */
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ coachId: string }> }
) {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    const { coachId } = await context.params;

    // Log incoming request
    logger.apiRequest('PUT', `/api/coach/${coachId}/profile`, { requestId, coachId });

    try {
        // Validate coachId format
        if (!coachId || !isValidUUID(coachId)) {
            logger.validationError('Invalid coach ID format', [
                { field: 'coachId', message: 'Coach ID must be a valid UUID' }
            ], { requestId, coachId });

            const response = NextResponse.json(
                {
                    success: false,
                    error: 'Invalid coach ID format',
                },
                { status: 400 }
            );

            logger.apiResponse('PUT', `/api/coach/${coachId}/profile`, 400, Date.now() - startTime, { requestId });
            return response;
        }

        // Validate session
        const session = await validateSession(request);

        if (!session.isValid) {
            logger.info('Unauthenticated request', { requestId, coachId, error: session.error });

            const response = NextResponse.json(
                {
                    success: false,
                    error: 'Authentication required',
                },
                { status: 401 }
            );

            logger.apiResponse('PUT', `/api/coach/${coachId}/profile`, 401, Date.now() - startTime, { requestId });
            return response;
        }

        // Verify user is editing their own profile
        if (session.playerId !== coachId || session.type !== 'coach') {
            logger.info('Unauthorized edit attempt', {
                requestId,
                coachId,
                userId: session.playerId,
                userType: session.type
            });

            const response = NextResponse.json(
                {
                    success: false,
                    error: 'You can only edit your own profile',
                },
                { status: 403 }
            );

            logger.apiResponse('PUT', `/api/coach/${coachId}/profile`, 403, Date.now() - startTime, { requestId });
            return response;
        }

        // Parse request body
        let body: Partial<CoachProfile>;
        try {
            body = await request.json();
        } catch (error) {
            logger.validationError('Invalid JSON in request body', [], { requestId, coachId });

            const response = NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request body',
                },
                { status: 400 }
            );

            logger.apiResponse('PUT', `/api/coach/${coachId}/profile`, 400, Date.now() - startTime, { requestId });
            return response;
        }

        // Validate input fields
        const validationErrors = validateCoachProfile({
            firstName: body.firstName || '',
            lastName: body.lastName || '',
            email: body.email || '',
            phone: body.phone,
            university: body.university,
            position: body.position,
            sport: body.sport,
            profileImage: body.profileImage,
            teamWebsiteUrl: body.teamWebsiteUrl,
        });

        if (Object.keys(validationErrors).length > 0) {
            logger.validationError('Coach profile validation failed',
                Object.entries(validationErrors).map(([field, message]) => ({ field, message })),
                { requestId, coachId }
            );

            const response = NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    validationErrors,
                },
                { status: 400 }
            );

            logger.apiResponse('PUT', `/api/coach/${coachId}/profile`, 400, Date.now() - startTime, { requestId });
            return response;
        }

        // Update coach profile in database
        let updatedProfile: CoachProfile;
        try {
            logger.dbOperation('updateCoachProfile', { requestId, coachId });

            // Extract only the fields that can be updated
            const updates: Partial<Omit<CoachProfile, 'id' | 'initials' | 'createdAt' | 'updatedAt'>> = {};

            if (body.firstName !== undefined) updates.firstName = body.firstName;
            if (body.lastName !== undefined) updates.lastName = body.lastName;
            if (body.email !== undefined) updates.email = body.email;
            if (body.phone !== undefined) updates.phone = body.phone;
            if (body.university !== undefined) updates.university = body.university;
            if (body.position !== undefined) updates.position = body.position;
            if (body.sport !== undefined) updates.sport = body.sport;
            if (body.profileImage !== undefined) updates.profileImage = body.profileImage;
            if (body.teamWebsiteUrl !== undefined) updates.teamWebsiteUrl = body.teamWebsiteUrl;

            updatedProfile = await updateCoachProfile(coachId, updates);
        } catch (error) {
            logger.dbError('updateCoachProfile', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
                coachId,
            });

            const response = NextResponse.json(
                {
                    success: false,
                    error: 'Failed to update coach profile',
                },
                { status: 500 }
            );

            logger.apiResponse('PUT', `/api/coach/${coachId}/profile`, 500, Date.now() - startTime, { requestId });
            return response;
        }

        // Log successful update
        const executionTime = Date.now() - startTime;
        logger.info('Coach profile updated successfully', {
            requestId,
            coachId,
            executionTime: `${executionTime}ms`,
        });

        // Return successful response
        const response = NextResponse.json(
            {
                success: true,
                data: updatedProfile,
            },
            { status: 200 }
        );

        logger.apiResponse('PUT', `/api/coach/${coachId}/profile`, 200, executionTime, { requestId, coachId });
        return response;
    } catch (error) {
        // Catch any unexpected errors
        const executionTime = Date.now() - startTime;
        logger.error('Unexpected error updating coach profile', {
            requestId,
            coachId,
            executionTime: `${executionTime}ms`,
        }, error instanceof Error ? error : new Error('Unknown error'));

        const response = NextResponse.json(
            {
                success: false,
                error: 'An unexpected error occurred',
            },
            { status: 500 }
        );

        logger.apiResponse('PUT', `/api/coach/${coachId}/profile`, 500, executionTime, { requestId });
        return response;
    }
}
