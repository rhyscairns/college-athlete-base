import { NextRequest, NextResponse } from 'next/server';
import { getPlayerByEmail } from '@/authentication/db/players';
import { verifyPassword } from '@/authentication/utils/password';
import { generateToken } from '@/authentication/utils/jwt';
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
    response.headers.set('Access-Control-Allow-Credentials', 'true');
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
 * Validate login request body
 */
function validateLoginRequest(body: any): { isValid: boolean; errors: Array<{ field: string; message: string }> } {
    const errors: Array<{ field: string; message: string }> = [];

    // Validate email
    if (!body.email || typeof body.email !== 'string') {
        errors.push({ field: 'email', message: 'Email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        errors.push({ field: 'email', message: 'Invalid email format' });
    }

    // Validate password
    if (!body.password || typeof body.password !== 'string') {
        errors.push({ field: 'password', message: 'Password is required' });
    } else if (body.password.length < 8) {
        errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Handle POST request for player login
 */
export async function POST(request: NextRequest) {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    // Log incoming request
    logger.apiRequest('POST', '/api/auth/login/player', { requestId });

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

            logger.apiResponse('POST', '/api/auth/login/player', 400, Date.now() - startTime, { requestId });
            return addCorsHeaders(response, request);
        }

        // Validate request data
        const validationResult = validateLoginRequest(body);
        if (!validationResult.isValid) {
            logger.validationError('Player login validation failed', validationResult.errors, {
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

            logger.apiResponse('POST', '/api/auth/login/player', 400, Date.now() - startTime, { requestId });
            return addCorsHeaders(response, request);
        }

        // Fetch player by email
        let player;
        try {
            logger.dbOperation('getPlayerByEmail', { requestId, email: body.email });
            player = await getPlayerByEmail(body.email);
        } catch (error) {
            logger.dbError('getPlayerByEmail', error instanceof Error ? error : new Error('Unknown database error'), {
                requestId,
            });

            const response = NextResponse.json(
                {
                    success: false,
                    message: 'An error occurred during login',
                },
                { status: 500 }
            );

            logger.apiResponse('POST', '/api/auth/login/player', 500, Date.now() - startTime, { requestId });
            return addCorsHeaders(response, request);
        }

        // Check if player exists and verify password
        // Use same error message for both cases to prevent email enumeration
        if (!player) {
            logger.securityEvent('Login attempt with non-existent email', {
                requestId,
                email: body.email,
            });

            const response = NextResponse.json(
                {
                    success: false,
                    message: 'Invalid email or password. Please try again.',
                },
                { status: 401 }
            );

            logger.apiResponse('POST', '/api/auth/login/player', 401, Date.now() - startTime, { requestId });
            return addCorsHeaders(response, request);
        }

        // Verify password
        let isPasswordValid;
        try {
            isPasswordValid = await verifyPassword(body.password, player.passwordHash);
        } catch (error) {
            logger.error('Password verification error', {
                requestId,
            }, error instanceof Error ? error : new Error('Unknown verification error'));

            const response = NextResponse.json(
                {
                    success: false,
                    message: 'An error occurred during login',
                },
                { status: 500 }
            );

            logger.apiResponse('POST', '/api/auth/login/player', 500, Date.now() - startTime, { requestId });
            return addCorsHeaders(response, request);
        }

        if (!isPasswordValid) {
            logger.securityEvent('Login attempt with invalid password', {
                requestId,
                email: body.email,
                playerId: player.id,
            });

            const response = NextResponse.json(
                {
                    success: false,
                    message: 'Invalid email or password. Please try again.',
                },
                { status: 401 }
            );

            logger.apiResponse('POST', '/api/auth/login/player', 401, Date.now() - startTime, { requestId });
            return addCorsHeaders(response, request);
        }

        // Generate JWT token
        let token;
        try {
            logger.dbOperation('generateToken', { requestId, playerId: player.id });
            token = await generateToken(player.id, player.email, 'player');
        } catch (error) {
            logger.error('Token generation error', {
                requestId,
                playerId: player.id,
            }, error instanceof Error ? error : new Error('Unknown token generation error'));

            const response = NextResponse.json(
                {
                    success: false,
                    message: 'An error occurred during login',
                },
                { status: 500 }
            );

            logger.apiResponse('POST', '/api/auth/login/player', 500, Date.now() - startTime, { requestId });
            return addCorsHeaders(response, request);
        }

        // Log successful login
        const executionTime = Date.now() - startTime;
        logger.info('Player logged in successfully', {
            requestId,
            playerId: player.id,
            email: player.email,
            executionTime: `${executionTime}ms`,
        });

        // Create response with session cookie
        const response = NextResponse.json(
            {
                success: true,
                message: 'Login successful',
                playerId: player.id,
            },
            { status: 200 }
        );

        // Set HTTP-only cookie with session token
        const isProduction = process.env.NODE_ENV === 'production';
        const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds

        response.cookies.set('session', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge,
            path: '/',
        });

        logger.apiResponse('POST', '/api/auth/login/player', 200, executionTime, { requestId, playerId: player.id });
        return addCorsHeaders(response, request);
    } catch (error) {
        // Catch any unexpected errors
        const executionTime = Date.now() - startTime;
        logger.error('Unexpected error during login', {
            requestId,
            executionTime: `${executionTime}ms`,
        }, error instanceof Error ? error : new Error('Unknown error'));

        const response = NextResponse.json(
            {
                success: false,
                message: 'An error occurred during login',
            },
            { status: 500 }
        );

        logger.apiResponse('POST', '/api/auth/login/player', 500, executionTime, { requestId });
        return addCorsHeaders(response, request);
    }
}
