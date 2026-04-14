import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { generateRequestId, formatExecutionTime } from '@/lib/api/utils';
import { searchAthletes } from '@/lib/db/queries/athletes';
import { SearchCriteria } from '@/dashboard/coach/types';

/**
 * Athlete data for search results
 */
interface SearchAthlete {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    sport: string;
    position: string;
    gpa: number;
    heightInches?: number;
    weightLbs?: number;
    desiredDivision?: string;
    affordableAmount?: number;
    profileImage?: string;
    videoUrl?: string;
    videoThumbnail?: string;
    videoTitle?: string;
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
 * Validate and sanitize query parameters
 */
function validateQueryParams(searchParams: URLSearchParams): {
    isValid: boolean;
    errors: Array<{ field: string; message: string }>;
    params: {
        criteria: SearchCriteria;
        page: number;
        pageSize: number;
    };
} {
    const errors: Array<{ field: string; message: string }> = [];
    const criteria: SearchCriteria = {};

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

    // Parse pageSize (default to 20, max 100)
    const pageSizeParam = searchParams.get('pageSize');
    let pageSize = 20;
    if (pageSizeParam) {
        pageSize = parseInt(pageSizeParam, 10);
        if (isNaN(pageSize) || pageSize < 1) {
            errors.push({ field: 'pageSize', message: 'Page size must be a positive integer' });
            pageSize = 20;
        } else if (pageSize > 100) {
            errors.push({ field: 'pageSize', message: 'Page size cannot exceed 100' });
            pageSize = 100;
        }
    }

    // Validate sport (optional string)
    const sport = searchParams.get('sport');
    if (sport) {
        criteria.sport = sport.trim();
    }

    // Validate position (optional string)
    const position = searchParams.get('position');
    if (position) {
        criteria.position = position.trim();
    }

    // Validate desired division (optional string)
    const desiredDivision = searchParams.get('desiredDivision');
    if (desiredDivision) {
        const validDivisions = ['NCAA D1', 'NCAA D2', 'NCAA D3', 'NAIA', 'NJCAA'];
        if (validDivisions.includes(desiredDivision)) {
            criteria.desiredDivision = desiredDivision;
        } else {
            errors.push({
                field: 'desiredDivision',
                message: `Desired division must be one of: ${validDivisions.join(', ')}`
            });
        }
    }

    // Validate GPA min (optional number, 0.0-4.0)
    const gpaMinParam = searchParams.get('gpaMin');
    if (gpaMinParam) {
        const gpaMin = parseFloat(gpaMinParam);
        if (isNaN(gpaMin) || gpaMin < 0.0 || gpaMin > 4.0) {
            errors.push({ field: 'gpaMin', message: 'GPA min must be between 0.0 and 4.0' });
        } else {
            criteria.gpaMin = gpaMin;
        }
    }

    // Validate GPA max (optional number, 0.0-4.0)
    const gpaMaxParam = searchParams.get('gpaMax');
    if (gpaMaxParam) {
        const gpaMax = parseFloat(gpaMaxParam);
        if (isNaN(gpaMax) || gpaMax < 0.0 || gpaMax > 4.0) {
            errors.push({ field: 'gpaMax', message: 'GPA max must be between 0.0 and 4.0' });
        } else {
            criteria.gpaMax = gpaMax;
        }
    }

    // Validate GPA range consistency
    if (criteria.gpaMin !== undefined && criteria.gpaMax !== undefined && criteria.gpaMin > criteria.gpaMax) {
        errors.push({ field: 'gpa', message: 'GPA min cannot be greater than GPA max' });
    }

    // Validate affordable amount (optional number, non-negative)
    const affordableAmountParam = searchParams.get('affordableAmount');
    if (affordableAmountParam) {
        const affordableAmount = parseFloat(affordableAmountParam);
        if (isNaN(affordableAmount) || affordableAmount < 0) {
            errors.push({ field: 'affordableAmount', message: 'Affordable amount must be a non-negative number' });
        } else {
            criteria.affordableAmount = affordableAmount;
        }
    }

    // Validate height min (can be in feet'inches" or inches format)
    const heightMinParam = searchParams.get('heightMin');
    if (heightMinParam) {
        criteria.heightMin = heightMinParam.trim();
    }

    // Validate height max (can be in feet'inches" or inches format)
    const heightMaxParam = searchParams.get('heightMax');
    if (heightMaxParam) {
        criteria.heightMax = heightMaxParam.trim();
    }

    // Validate weight min (optional number, positive)
    const weightMinParam = searchParams.get('weightMin');
    if (weightMinParam) {
        const weightMin = parseInt(weightMinParam, 10);
        if (isNaN(weightMin) || weightMin < 1) {
            errors.push({ field: 'weightMin', message: 'Weight min must be a positive number (pounds)' });
        } else {
            criteria.weightMin = weightMin;
        }
    }

    // Validate weight max (optional number, positive)
    const weightMaxParam = searchParams.get('weightMax');
    if (weightMaxParam) {
        const weightMax = parseInt(weightMaxParam, 10);
        if (isNaN(weightMax) || weightMax < 1) {
            errors.push({ field: 'weightMax', message: 'Weight max must be a positive number (pounds)' });
        } else {
            criteria.weightMax = weightMax;
        }
    }

    // Validate weight range consistency
    if (criteria.weightMin !== undefined && criteria.weightMax !== undefined && criteria.weightMin > criteria.weightMax) {
        errors.push({ field: 'weight', message: 'Weight min cannot be greater than weight max' });
    }

    // Note: We allow searches with no filters to return all athletes
    // The frontend can decide whether to require filters or not

    return {
        isValid: errors.length === 0,
        errors,
        params: {
            criteria,
            page,
            pageSize,
        },
    };
}

/**
 * Handle GET request for athlete search
 * 
 * @param request - Next.js request object
 * @returns JSON response with athletes array and pagination metadata
 */
export async function GET(request: NextRequest) {
    const startTime = Date.now();
    const requestId = generateRequestId();

    // Log incoming request
    logger.apiRequest('GET', '/api/dashboard/athletes/search', { requestId });

    try {
        // Validate query parameters
        const { searchParams } = new URL(request.url);
        const validation = validateQueryParams(searchParams);

        if (!validation.isValid) {
            logger.validationError('Athlete search query validation failed', validation.errors, {
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

            logger.apiResponse('GET', '/api/dashboard/athletes/search', 400, Date.now() - startTime, { requestId });
            return response;
        }

        const { criteria, page, pageSize } = validation.params;

        // Search athletes using the database query function
        logger.dbOperation('searchAthletes', { requestId, criteria, page, pageSize });

        const result = await searchAthletes(criteria, { page, pageSize });

        // Calculate pagination metadata
        const totalPages = Math.ceil(result.totalCount / pageSize);
        const pagination: PaginationMetadata = {
            currentPage: page,
            totalPages,
            totalCount: result.totalCount,
            pageSize,
        };

        // Map athletes to response format
        const athletes: SearchAthlete[] = result.athletes.map(athlete => ({
            id: athlete.id,
            firstName: athlete.firstName,
            lastName: athlete.lastName,
            email: athlete.email,
            sport: athlete.sport,
            position: athlete.position,
            gpa: athlete.gpa,
            heightInches: athlete.heightInches,
            weightLbs: athlete.weightLbs,
            desiredDivision: athlete.desiredDivision,
            affordableAmount: athlete.affordableAmount,
            profileImage: athlete.profileImageUrl,
            videoUrl: athlete.videoUrl,
        }));

        // Log successful search
        logger.info('Athlete search completed successfully', {
            requestId,
            athleteCount: athletes.length,
            totalCount: result.totalCount,
            page,
            totalPages,
            criteria,
            executionTime: formatExecutionTime(startTime),
        });

        // Create successful response
        const response = NextResponse.json(
            {
                success: true,
                data: {
                    athletes,
                    pagination,
                    filters: criteria,
                },
            },
            { status: 200 }
        );

        // Add caching headers (cache for 1 minute)
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');

        logger.apiResponse('GET', '/api/dashboard/athletes/search', 200, Date.now() - startTime, { requestId });
        return response;
    } catch (error) {
        // Catch any unexpected errors
        logger.error('Unexpected error during athlete search', {
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

        logger.apiResponse('GET', '/api/dashboard/athletes/search', 500, Date.now() - startTime, { requestId });
        return response;
    }
}
