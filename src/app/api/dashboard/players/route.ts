import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/authentication/db/client';
import { logger } from '@/lib/logger';
import { isValidUUID, generateRequestId, formatExecutionTime } from '@/lib/api/utils';

/**
 * Player data for dashboard display
 */
interface DashboardPlayer {
    id: string;
    firstName: string;
    lastName: string;
    sport: string;
    position: string;
    profileImage?: string;
    videoThumbnail?: string;
}

/**
 * Pagination metadata
 */
interface PaginationMetadata {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
}

/**
 * Validate query parameters
 */
function validateQueryParams(searchParams: URLSearchParams): {
    isValid: boolean;
    errors: Array<{ field: string; message: string }>;
    params: {
        sport?: string;
        position?: string;
        page: number;
        pageSize: number;
        excludeUserId?: string;
    };
} {
    const errors: Array<{ field: string; message: string }> = [];

    // Parse page (default to 1)
    const pageParam = searchParams.get('page');
    let page = 1;
    if (pageParam) {
        page = parseInt(pageParam, 10);
        if (isNaN(page) || page < 1) {
            errors.push({ field: 'page', message: 'Page must be a positive integer' });
            page = 1;
        }
    }

    // Parse pageSize (default to 12, max 100)
    const pageSizeParam = searchParams.get('pageSize');
    let pageSize = 12;
    if (pageSizeParam) {
        pageSize = parseInt(pageSizeParam, 10);
        if (isNaN(pageSize) || pageSize < 1) {
            errors.push({ field: 'pageSize', message: 'Page size must be a positive integer' });
            pageSize = 12;
        } else if (pageSize > 100) {
            errors.push({ field: 'pageSize', message: 'Page size cannot exceed 100' });
            pageSize = 100;
        }
    }

    // Validate excludeUserId if provided
    const excludeUserId = searchParams.get('excludeUserId') || undefined;
    if (excludeUserId && !isValidUUID(excludeUserId)) {
        errors.push({ field: 'excludeUserId', message: 'Exclude user ID must be a valid UUID' });
    }

    // Get optional filter parameters
    const sport = searchParams.get('sport') || undefined;
    const position = searchParams.get('position') || undefined;

    return {
        isValid: errors.length === 0,
        errors,
        params: {
            sport,
            position,
            page,
            pageSize,
            excludeUserId,
        },
    };
}

/**
 * Build SQL query with filters
 */
function buildQuery(params: {
    sport?: string;
    position?: string;
    excludeUserId?: string;
}): { whereClause: string; queryParams: any[] } {
    const conditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Filter by sport (case-insensitive)
    if (params.sport && params.sport !== 'All Sports') {
        conditions.push(`LOWER(sport) = LOWER($${paramIndex})`);
        queryParams.push(params.sport);
        paramIndex++;
    }

    // Filter by position (case-insensitive)
    if (params.position && params.position !== 'All Positions') {
        conditions.push(`LOWER(position) = LOWER($${paramIndex})`);
        queryParams.push(params.position);
        paramIndex++;
    }

    // Exclude specific user
    if (params.excludeUserId) {
        conditions.push(`id != $${paramIndex}`);
        queryParams.push(params.excludeUserId);
        paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    return { whereClause, queryParams };
}

/**
 * Handle GET request for dashboard players
 * 
 * @param request - Next.js request object
 * @returns JSON response with players array and pagination metadata
 */
export async function GET(request: NextRequest) {
    const startTime = Date.now();
    const requestId = generateRequestId();

    // Log incoming request
    logger.apiRequest('GET', '/api/dashboard/players', { requestId });

    try {
        // Validate query parameters
        const { searchParams } = new URL(request.url);
        const validation = validateQueryParams(searchParams);

        if (!validation.isValid) {
            logger.validationError('Dashboard players query validation failed', validation.errors, {
                requestId,
            });

            const response = NextResponse.json(
                {
                    success: false,
                    error: 'Invalid query parameters',
                    errors: validation.errors,
                    data: null,
                },
                { status: 400 }
            );

            logger.apiResponse('GET', '/api/dashboard/players', 400, Date.now() - startTime, { requestId });
            return response;
        }

        const { sport, position, page, pageSize, excludeUserId } = validation.params;

        // Build query with filters
        const { whereClause, queryParams } = buildQuery({ sport, position, excludeUserId });

        // Get total count for pagination
        let totalCount = 0;
        try {
            logger.dbOperation('countPlayers', { requestId, sport, position, excludeUserId });
            const countResult = await query<{ count: string }>(
                `SELECT COUNT(*) as count FROM players ${whereClause}`,
                queryParams
            );
            totalCount = parseInt(countResult[0]?.count || '0', 10);
        } catch (error) {
            logger.dbError('countPlayers', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
            });

            const response = NextResponse.json(
                {
                    success: false,
                    error: 'Failed to fetch player count',
                    data: null,
                },
                { status: 500 }
            );

            logger.apiResponse('GET', '/api/dashboard/players', 500, Date.now() - startTime, { requestId });
            return response;
        }

        // Calculate pagination
        const totalPages = Math.ceil(totalCount / pageSize);
        const offset = (page - 1) * pageSize;

        // Fetch players with pagination
        let players: DashboardPlayer[] = [];
        try {
            logger.dbOperation('getPlayers', { requestId, sport, position, page, pageSize, excludeUserId });
            const result = await query<any>(
                `SELECT 
                    id, 
                    first_name, 
                    last_name, 
                    sport, 
                    position,
                    profile_image,
                    video_thumbnail
                FROM players 
                ${whereClause}
                ORDER BY created_at DESC
                LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
                [...queryParams, pageSize, offset]
            );

            players = result.map(row => ({
                id: row.id,
                firstName: row.first_name,
                lastName: row.last_name,
                sport: row.sport,
                position: row.position,
                profileImage: row.profile_image || undefined,
                videoThumbnail: row.video_thumbnail || undefined,
            }));
        } catch (error) {
            logger.dbError('getPlayers', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
            });

            const response = NextResponse.json(
                {
                    success: false,
                    error: 'Failed to fetch players',
                    data: null,
                },
                { status: 500 }
            );

            logger.apiResponse('GET', '/api/dashboard/players', 500, Date.now() - startTime, { requestId });
            return response;
        }

        // Build pagination metadata
        const pagination: PaginationMetadata = {
            currentPage: page,
            totalPages,
            totalCount,
            pageSize,
        };

        // Log successful fetch
        logger.info('Dashboard players fetched successfully', {
            requestId,
            playerCount: players.length,
            totalCount,
            page,
            totalPages,
            executionTime: formatExecutionTime(startTime),
        });

        // Create successful response
        const response = NextResponse.json(
            {
                success: true,
                data: {
                    players,
                    pagination,
                },
            },
            { status: 200 }
        );

        // Add caching headers (cache for 1 minute)
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');

        logger.apiResponse('GET', '/api/dashboard/players', 200, Date.now() - startTime, { requestId });
        return response;
    } catch (error) {
        // Catch any unexpected errors
        logger.error('Unexpected error fetching dashboard players', {
            requestId,
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

        logger.apiResponse('GET', '/api/dashboard/players', 500, Date.now() - startTime, { requestId });
        return response;
    }
}
