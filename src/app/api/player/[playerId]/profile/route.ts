import { NextRequest, NextResponse } from 'next/server';
import { getPlayerProfileById } from '@/profile/player/lib/db/queries';
import { logger } from '@/lib/logger';
import { isValidUUID, generateRequestId, formatExecutionTime } from '@/lib/api/utils';

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
