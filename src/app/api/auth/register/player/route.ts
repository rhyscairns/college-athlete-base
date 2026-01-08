import { NextRequest, NextResponse } from 'next/server';
import { validatePlayerRegistration } from '@/authentication/utils/registerValidation';
import { checkEmailExists, createPlayer } from '@/authentication/db/players';
import { hashPassword } from '@/authentication/utils/password';
import { logger } from '@/lib/logger';

/**
 * Get allowed origin for CORS
 */
function getAllowedOrigin(request: NextRequest): string {
    const origin = request.headers.get('origin');
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

    if (origin && allowedOrigins.includes(origin)) {
        return origin;
    }

    // Return first allowed origin or wildcard
    return allowedOrigins[0] || '*';
}

/**
 * Add CORS headers to response
 */
function addCorsHeaders(response: NextResponse, request: NextRequest): NextResponse {
    response.headers.set('Access-Control-Allow-Origin', getAllowedOrigin(request));
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
    const response = new NextResponse(null, { status: 200 });
    return addCorsHeaders(response, request);
}

/**
 * Handle POST request for player registration
 */
export async function POST(request: NextRequest) {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    // Log incoming request
    logger.apiRequest('POST', '/api/auth/register/player', { requestId });

    try {
        // Parse request body
        let body;
        try {
            body = await request.json();
        } catch (error) {
            logger.error('Failed to parse request body', {
                requestId,
            }, error instanceof Error ? error : new Error('Unknown parsing error'));

            const response = NextResponse.json(
                {
                    success: false,
                    message: 'Invalid JSON in request body',
                },
                { status: 400 }
            );

            logger.apiResponse('POST', '/api/auth/register/player', 400, Date.now() - startTime, { requestId });
            return addCorsHeaders(response, request);
        }

        // Validate request data
        const validationResult = validatePlayerRegistration(body);
        if (!validationResult.isValid) {
            logger.validationError('Player registration validation failed', validationResult.errors, {
                requestId,
                email: body.email, // Safe to log email for validation errors
            });

            const response = NextResponse.json(
                {
                    success: false,
                    errors: validationResult.errors,
                },
                { status: 400 }
            );

            logger.apiResponse('POST', '/api/auth/register/player', 400, Date.now() - startTime, { requestId });
            return addCorsHeaders(response, request);
        }

        // Check for duplicate email
        let emailExists;
        try {
            logger.dbOperation('checkEmailExists', { requestId, email: body.email });
            emailExists = await checkEmailExists(body.email);
        } catch (error) {
            logger.dbError('checkEmailExists', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
            });

            const response = NextResponse.json(
                {
                    success: false,
                    message: 'An error occurred during registration',
                },
                { status: 500 }
            );

            logger.apiResponse('POST', '/api/auth/register/player', 500, Date.now() - startTime, { requestId });
            return addCorsHeaders(response, request);
        }

        if (emailExists) {
            logger.securityEvent('Duplicate email registration attempt', {
                requestId,
                email: body.email,
            });

            const response = NextResponse.json(
                {
                    success: false,
                    message: 'Email already registered',
                },
                { status: 409 }
            );

            logger.apiResponse('POST', '/api/auth/register/player', 409, Date.now() - startTime, { requestId });
            return addCorsHeaders(response, request);
        }

        // Hash password
        let passwordHash;
        try {
            logger.dbOperation('hashPassword', { requestId });
            passwordHash = await hashPassword(body.password);
        } catch (error) {
            logger.error('Password hashing error', {
                requestId,
            }, error instanceof Error ? error : new Error('Unknown hashing error'));

            const response = NextResponse.json(
                {
                    success: false,
                    message: 'An error occurred during registration',
                },
                { status: 500 }
            );

            logger.apiResponse('POST', '/api/auth/register/player', 500, Date.now() - startTime, { requestId });
            return addCorsHeaders(response, request);
        }

        // Create player record
        let playerId;
        try {
            logger.dbOperation('createPlayer', {
                requestId,
                email: body.email,
                sport: body.sport,
                country: body.country,
            });

            playerId = await createPlayer({
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                passwordHash,
                sex: body.sex,
                sport: body.sport,
                position: body.position,
                gpa: body.gpa,
                country: body.country,
                state: body.state,
                region: body.region,
                scholarshipAmount: body.scholarshipAmount,
                testScores: body.testScores,
            });
        } catch (error) {
            logger.dbError('createPlayer', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
            });

            const response = NextResponse.json(
                {
                    success: false,
                    message: 'An error occurred during registration',
                },
                { status: 500 }
            );

            logger.apiResponse('POST', '/api/auth/register/player', 500, Date.now() - startTime, { requestId });
            return addCorsHeaders(response, request);
        }

        // Log successful registration (without sensitive data)
        const executionTime = Date.now() - startTime;
        logger.info('Player registered successfully', {
            requestId,
            playerId,
            email: body.email,
            sport: body.sport,
            country: body.country,
            executionTime: `${executionTime}ms`,
        });

        const response = NextResponse.json(
            {
                success: true,
                message: 'Player registered successfully',
                playerId,
            },
            { status: 201 }
        );

        logger.apiResponse('POST', '/api/auth/register/player', 201, executionTime, { requestId, playerId });
        return addCorsHeaders(response, request);
    } catch (error) {
        // Catch any unexpected errors
        const executionTime = Date.now() - startTime;
        logger.error('Unexpected error during registration', {
            requestId,
            executionTime: `${executionTime}ms`,
        }, error instanceof Error ? error : new Error('Unknown error'));

        const response = NextResponse.json(
            {
                success: false,
                message: 'An error occurred during registration',
            },
            { status: 500 }
        );

        logger.apiResponse('POST', '/api/auth/register/player', 500, executionTime, { requestId });
        return addCorsHeaders(response, request);
    }
}
