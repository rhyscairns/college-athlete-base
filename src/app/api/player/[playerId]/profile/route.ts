import { NextRequest, NextResponse } from 'next/server';
import { getPlayerProfileById, updatePlayerProfile } from '@/profile/player/lib/db/queries';
import { logger } from '@/lib/logger';
import { isValidUUID, generateRequestId, formatExecutionTime } from '@/lib/api/utils';
import { getAllSportNames, getPositionsForSport, getEventsForSport } from '@/constants/sports';

/**
 * Handle GET request for player profile
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing playerId
 * @returns JSON response with player profile data
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ playerId: string }> }
) {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const { playerId } = await params;

    // Log incoming request
    logger.apiRequest('GET', `/api/player/${playerId}/profile`, { requestId, playerId });

    try {
        // Validate playerId format
        if (!playerId || !isValidUUID(playerId)) {
            logger.validationError('Invalid player ID format', [
                { field: 'playerId', message: 'Player ID must be a valid UUID' }
            ], { requestId, playerId });

            const response = NextResponse.json(
                {
                    success: false,
                    error: 'Invalid player ID format',
                    data: null,
                },
                { status: 400 }
            );

            logger.apiResponse('GET', `/api/player/${playerId}/profile`, 400, Date.now() - startTime, { requestId });
            return response;
        }

        // Fetch player profile from database
        let profileData;
        try {
            logger.dbOperation('getPlayerProfileById', { requestId, playerId });
            profileData = await getPlayerProfileById(playerId);
        } catch (error) {
            logger.dbError('getPlayerProfileById', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
                playerId,
            });

            const response = NextResponse.json(
                {
                    success: false,
                    error: 'Failed to fetch player profile',
                    data: null,
                },
                { status: 500 }
            );

            logger.apiResponse('GET', `/api/player/${playerId}/profile`, 500, Date.now() - startTime, { requestId });
            return response;
        }

        // Check if player exists
        if (!profileData) {
            logger.info('Player profile not found', { requestId, playerId });

            const response = NextResponse.json(
                {
                    success: false,
                    error: 'Player not found',
                    data: null,
                },
                { status: 404 }
            );

            logger.apiResponse('GET', `/api/player/${playerId}/profile`, 404, Date.now() - startTime, { requestId });
            return response;
        }

        // Log successful fetch
        logger.info('Player profile fetched successfully', {
            requestId,
            playerId,
            executionTime: formatExecutionTime(startTime),
        });

        // Create successful response with caching headers
        const response = NextResponse.json(
            {
                success: true,
                data: profileData,
            },
            { status: 200 }
        );

        // Add caching headers
        // Cache for 5 minutes (300 seconds) in browser and CDN
        // Revalidate in background after 5 minutes
        response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');

        // Add ETag for conditional requests
        const etag = `"${playerId}-${Date.now()}"`;
        response.headers.set('ETag', etag);

        logger.apiResponse('GET', `/api/player/${playerId}/profile`, 200, Date.now() - startTime, { requestId, playerId });
        return response;
    } catch (error) {
        // Catch any unexpected errors
        logger.error('Unexpected error fetching player profile', {
            requestId,
            playerId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));

        const response = NextResponse.json(
            {
                success: false,
                error: 'An unexpected error occurred',
                data: null,
            },
            { status: 500 }
        );

        logger.apiResponse('GET', `/api/player/${playerId}/profile`, 500, Date.now() - startTime, { requestId });
        return response;
    }
}

/**
 * Handle PUT request to update player profile
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing playerId
 * @returns JSON response with success status
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ playerId: string }> }
) {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const { playerId } = await params;

    // Log incoming request
    logger.apiRequest('PUT', `/api/player/${playerId}/profile`, { requestId, playerId });

    try {
        // Validate playerId format
        if (!playerId || !isValidUUID(playerId)) {
            logger.validationError('Invalid player ID format', [
                { field: 'playerId', message: 'Player ID must be a valid UUID' }
            ], { requestId, playerId });

            const response = NextResponse.json(
                {
                    success: false,
                    error: 'Invalid player ID format',
                    data: null,
                },
                { status: 400 }
            );

            logger.apiResponse('PUT', `/api/player/${playerId}/profile`, 400, Date.now() - startTime, { requestId });
            return response;
        }

        // Parse request body
        let body;
        try {
            body = await request.json();
        } catch (error) {
            logger.validationError('Invalid request body', [
                { field: 'body', message: 'Request body must be valid JSON' }
            ], { requestId, playerId });

            const response = NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request body',
                    data: null,
                },
                { status: 400 }
            );

            logger.apiResponse('PUT', `/api/player/${playerId}/profile`, 400, Date.now() - startTime, { requestId });
            return response;
        }

        // Validate sport if provided
        if (body.sport !== undefined && body.sport !== null && body.sport !== '') {
            const allSports = getAllSportNames();
            const isValidSport = allSports.some(s => s.toLowerCase() === body.sport.toLowerCase());

            if (!isValidSport) {
                logger.validationError('Invalid sport', [
                    { field: 'sport', message: 'Please select a sport from the list' }
                ], { requestId, playerId, sport: body.sport });

                const response = NextResponse.json(
                    {
                        success: false,
                        error: 'Invalid sport',
                        validationErrors: {
                            sport: 'Please select a sport from the list'
                        },
                        data: null,
                    },
                    { status: 400 }
                );

                logger.apiResponse('PUT', `/api/player/${playerId}/profile`, 400, Date.now() - startTime, { requestId });
                return response;
            }
        }

        // Validate position/event if provided along with sport
        if (body.position !== undefined && body.position !== null && body.position !== '' && body.sport) {
            const positions = getPositionsForSport(body.sport);
            const events = getEventsForSport(body.sport);
            const validOptions = [...positions, ...events];

            const isValidPosition = validOptions.some(opt => opt.toLowerCase() === body.position.toLowerCase());

            if (!isValidPosition) {
                logger.validationError('Invalid position/event', [
                    { field: 'position', message: 'Please select a valid position/event from the list' }
                ], { requestId, playerId, position: body.position, sport: body.sport });

                const response = NextResponse.json(
                    {
                        success: false,
                        error: 'Invalid position/event',
                        validationErrors: {
                            position: 'Please select a valid position/event from the list'
                        },
                        data: null,
                    },
                    { status: 400 }
                );

                logger.apiResponse('PUT', `/api/player/${playerId}/profile`, 400, Date.now() - startTime, { requestId });
                return response;
            }
        }

        // Update player profile in database
        try {
            logger.dbOperation('updatePlayerProfile', { requestId, playerId, updates: body });
            await updatePlayerProfile(playerId, body);
        } catch (error) {
            logger.dbError('updatePlayerProfile', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
                playerId,
            });

            const response = NextResponse.json(
                {
                    success: false,
                    error: 'Failed to update player profile',
                    data: null,
                },
                { status: 500 }
            );

            logger.apiResponse('PUT', `/api/player/${playerId}/profile`, 500, Date.now() - startTime, { requestId });
            return response;
        }

        // Log successful update
        logger.info('Player profile updated successfully', {
            requestId,
            playerId,
            executionTime: formatExecutionTime(startTime),
        });

        // Create successful response
        const response = NextResponse.json(
            {
                success: true,
                message: 'Profile updated successfully',
            },
            { status: 200 }
        );

        logger.apiResponse('PUT', `/api/player/${playerId}/profile`, 200, Date.now() - startTime, { requestId, playerId });
        return response;
    } catch (error) {
        // Catch any unexpected errors
        logger.error('Unexpected error updating player profile', {
            requestId,
            playerId,
            executionTime: formatExecutionTime(startTime),
        }, error instanceof Error ? error : new Error('Unknown error'));

        const response = NextResponse.json(
            {
                success: false,
                error: 'An unexpected error occurred',
                data: null,
            },
            { status: 500 }
        );

        logger.apiResponse('PUT', `/api/player/${playerId}/profile`, 500, Date.now() - startTime, { requestId });
        return response;
    }
}
