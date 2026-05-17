import { query } from '@/authentication/db/client';
import { SearchCriteria, PlayerProfile } from '@/dashboard/coach/types';
import { logger } from '@/lib/logger';

/**
 * Interface for search results with pagination
 */
export interface SearchAthletesResult {
    athletes: PlayerProfile[];
    totalCount: number;
}

/**
 * Interface for pagination parameters
 */
export interface PaginationParams {
    page: number;
    pageSize: number;
}

/**
 * Search for athletes based on provided criteria
 * 
 * @param criteria - Search criteria including sport, position, GPA, etc.
 * @param pagination - Pagination parameters (page and pageSize)
 * @returns Promise with athletes array and total count
 */
export async function searchAthletes(
    criteria: SearchCriteria,
    pagination: PaginationParams = { page: 1, pageSize: 20 }
): Promise<SearchAthletesResult> {
    const { page, pageSize } = pagination;

    // Validate pagination parameters (outside try-catch for proper error propagation)
    if (page < 1 || pageSize < 1 || pageSize > 100) {
        throw new Error('Invalid pagination parameters');
    }

    try {
        // Build the WHERE clause dynamically based on provided criteria
        const conditions: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        // Sport filter
        if (criteria.sport) {
            conditions.push('p.sport = $' + paramIndex);
            params.push(criteria.sport);
            paramIndex++;
        }

        // Position filter
        if (criteria.position) {
            conditions.push('p.position = $' + paramIndex);
            params.push(criteria.position);
            paramIndex++;
        }

        // Desired division filter
        if (criteria.desiredDivision) {
            conditions.push('p.desired_division = $' + paramIndex);
            params.push(criteria.desiredDivision);
            paramIndex++;
        }

        // GPA minimum filter
        if (criteria.gpaMin !== undefined && criteria.gpaMin !== null) {
            conditions.push('p.gpa >= $' + paramIndex);
            params.push(criteria.gpaMin);
            paramIndex++;
        }

        // GPA maximum filter
        if (criteria.gpaMax !== undefined && criteria.gpaMax !== null) {
            conditions.push('p.gpa <= $' + paramIndex);
            params.push(criteria.gpaMax);
            paramIndex++;
        }

        // Affordable amount filter
        if (criteria.affordableAmount !== undefined && criteria.affordableAmount !== null) {
            conditions.push('p.affordable_amount >= $' + paramIndex);
            params.push(criteria.affordableAmount);
            paramIndex++;
        }

        // Height minimum filter (convert to inches if needed)
        if (criteria.heightMin) {
            const heightMinInches = parseHeightToInches(criteria.heightMin);
            conditions.push('p.height_inches >= $' + paramIndex);
            params.push(heightMinInches);
            paramIndex++;
        }

        // Height maximum filter (convert to inches if needed)
        if (criteria.heightMax) {
            const heightMaxInches = parseHeightToInches(criteria.heightMax);
            conditions.push('p.height_inches <= $' + paramIndex);
            params.push(heightMaxInches);
            paramIndex++;
        }

        // Weight minimum filter
        if (criteria.weightMin !== undefined && criteria.weightMin !== null) {
            conditions.push('p.weight_lbs >= $' + paramIndex);
            params.push(criteria.weightMin);
            paramIndex++;
        }

        // Weight maximum filter
        if (criteria.weightMax !== undefined && criteria.weightMax !== null) {
            conditions.push('p.weight_lbs <= $' + paramIndex);
            params.push(criteria.weightMax);
            paramIndex++;
        }

        // Country / location filter
        if (criteria.country === 'international') {
            conditions.push("p.country != 'USA'");
        } else if (criteria.country && criteria.country !== 'USA') {
            // Specific non-USA country
            conditions.push('p.country = $' + paramIndex);
            params.push(criteria.country);
            paramIndex++;
        } else {
            // USA (explicit or default) — always restrict to USA when a state is given
            if (criteria.country === 'USA' || criteria.state) {
                conditions.push("p.country = 'USA'");
            }
            if (criteria.state) {
                conditions.push('p.state = $' + paramIndex);
                params.push(criteria.state);
                paramIndex++;
            }
        }

        // Build WHERE clause
        const whereClause = conditions.length > 0
            ? 'WHERE ' + conditions.join(' AND ')
            : '';

        // Calculate offset for pagination
        const offset = (page - 1) * pageSize;

        // Build the main query
        const limitParam = paramIndex;
        const offsetParam = paramIndex + 1;
        const athletesQuery = `
            SELECT 
                p.id,
                p.first_name,
                p.last_name,
                p.email,
                p.sport,
                p.position,
                p.desired_division,
                p.gpa,
                p.height_inches,
                p.weight_lbs,
                p.affordable_amount,
                p.profile_image_url,
                p.video_thumbnail_url,
                p.highlight_video_url as video_url,
                p.country,
                p.state
            FROM players p
            ${whereClause}
            ORDER BY p.gpa DESC, p.last_name ASC
            LIMIT $${limitParam} OFFSET $${offsetParam}
        `;

        // Build the count query
        const countQuery = `
            SELECT COUNT(*) as total
            FROM players p
            ${whereClause}
        `;

        // Add pagination parameters
        const queryParams = [...params, pageSize, offset];

        // Execute both queries
        logger.debug('Executing athlete search query', {
            criteria,
            pagination,
            conditionsCount: conditions.length,
        });

        let athletesResult;
        let countResult;

        try {
            [athletesResult, countResult] = await Promise.all([
                query<any>(athletesQuery, queryParams),
                query<{ total: string }>(countQuery, params),
            ]);

            logger.debug('Queries executed successfully', {
                athletesCount: athletesResult.length,
                countResultLength: countResult.length,
            });
        } catch (queryError) {
            logger.error('Query execution failed', {
                criteria,
                pagination,
                error: queryError instanceof Error ? queryError.message : 'Unknown query error',
            }, queryError instanceof Error ? queryError : new Error('Unknown query error'));
            throw queryError;
        }

        // Map database results to PlayerProfile interface
        try {
            const athletes: PlayerProfile[] = athletesResult.map((row) => ({
                id: row.id,
                firstName: row.first_name,
                lastName: row.last_name,
                email: row.email,
                sport: row.sport,
                position: row.position,
                desiredDivision: row.desired_division,
                gpa: parseFloat(row.gpa),
                heightInches: row.height_inches || 0,
                weightLbs: row.weight_lbs || 0,
                affordableAmount: row.affordable_amount ? parseFloat(row.affordable_amount) : undefined,
                profileImageUrl: row.profile_image_url,
                videoThumbnailUrl: row.video_thumbnail_url || undefined,
                videoUrl: row.video_url,
            }));

            const totalCount = parseInt(countResult[0]?.total || '0', 10);

            logger.info('Athlete search completed', {
                resultsCount: athletes.length,
                totalCount,
                page,
                pageSize,
            });

            return {
                athletes,
                totalCount,
            };
        } catch (mappingError) {
            logger.error('Result mapping failed', {
                criteria,
                pagination,
                athletesResultSample: athletesResult[0],
                countResultSample: countResult[0],
                error: mappingError instanceof Error ? mappingError.message : 'Unknown mapping error',
            }, mappingError instanceof Error ? mappingError : new Error('Unknown mapping error'));
            throw mappingError;
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;

        logger.error('Failed to search athletes', {
            criteria,
            pagination,
            errorMessage,
            errorStack
        }, error instanceof Error ? error : new Error('Unknown error'));

        throw new Error('Failed to search athletes. Please try again later.');
    }
}

/**
 * Parse height string to inches
 * Supports formats: "5'10"" or "70"
 * 
 * @param height - Height string in feet'inches" or inches format
 * @returns Height in inches
 */
function parseHeightToInches(height: string): number {
    // If already in inches format (just a number)
    if (/^\d+$/.test(height)) {
        return parseInt(height, 10);
    }

    // Parse feet'inches" format
    const match = height.match(/^(\d+)'(\d+)"?$/);
    if (match) {
        const feet = parseInt(match[1], 10);
        const inches = parseInt(match[2], 10);
        return feet * 12 + inches;
    }

    // If format is invalid, throw error
    throw new Error(`Invalid height format: ${height}`);
}
