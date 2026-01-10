import { NextRequest, NextResponse } from 'next/server';
import { getCoachByEmail } from '@/authentication/db/coaches';
import { verifyPassword } from '@/authentication/utils/password';
import { generateToken } from '@/authentication/utils/jwt';
import { logger } from '@/lib/logger';

// Constants
const API_ROUTE = '/api/auth/login/coach';
const ERROR_MESSAGE_LOGIN = 'An error occurred during login';
const ERROR_MESSAGE_INVALID_CREDENTIALS = 'Invalid email or password. Please try again.';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

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
 * Create error response with CORS headers
 */
// eslint-disable-next-line max-params
function createErrorResponse(
    request: NextRequest,
    message: string,
    status: number,
    requestId: string,
    startTime: number,
    errors?: Array<{ field: string; message: string }>
): NextResponse {
    const response = NextResponse.json(
        errors ? { success: false, errors } : { success: false, message },
        { status }
    );

    logger.apiResponse('POST', API_ROUTE, status, Date.now() - startTime, { requestId });
    return addCorsHeaders(response, request);
}

/**
 * Set session cookie on response
 */
function setSessionCookie(response: NextResponse, token: string): void {
    const isProduction = process.env.NODE_ENV === 'production';

    response.cookies.set('session', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: SESSION_MAX_AGE,
        path: '/',
    });
}

/**
 * Parse and validate request body
 */
async function parseRequestBody(request: NextRequest, requestId: string, startTime: number): Promise<
    { success: true; body: any } | { success: false; response: NextResponse }
> {
    try {
        const body = await request.json();
        return { success: true, body };
    } catch (error) {
        logger.error('Failed to parse request body', { requestId },
            error instanceof Error ? error : new Error('Unknown parsing error'));

        return {
            success: false,
            response: createErrorResponse(request, 'Invalid JSON in request body', 400, requestId, startTime),
        };
    }
}

/**
 * Authenticate coach credentials
 */
async function authenticateCoach(
    email: string,
    password: string,
    requestId: string,
    request: NextRequest,
    startTime: number
): Promise<{ success: true; coach: any; token: string } | { success: false; response: NextResponse }> {
    // Fetch coach by email
    let coach;
    try {
        logger.dbOperation('getCoachByEmail', { requestId, email });
        coach = await getCoachByEmail(email);
    } catch (error) {
        logger.dbError('getCoachByEmail', error instanceof Error ? error : new Error('Unknown database error'), { requestId });
        return {
            success: false,
            response: createErrorResponse(request, ERROR_MESSAGE_LOGIN, 500, requestId, startTime),
        };
    }

    // Check if coach exists
    if (!coach) {
        logger.securityEvent('Login attempt with non-existent email', { requestId, email });
        return {
            success: false,
            response: createErrorResponse(request, ERROR_MESSAGE_INVALID_CREDENTIALS, 401, requestId, startTime),
        };
    }

    // Verify password
    let isPasswordValid;
    try {
        isPasswordValid = await verifyPassword(password, coach.passwordHash);
    } catch (error) {
        logger.error('Password verification error', { requestId },
            error instanceof Error ? error : new Error('Unknown verification error'));
        return {
            success: false,
            response: createErrorResponse(request, ERROR_MESSAGE_LOGIN, 500, requestId, startTime),
        };
    }

    if (!isPasswordValid) {
        logger.securityEvent('Login attempt with invalid password', { requestId, email, coachId: coach.id });
        return {
            success: false,
            response: createErrorResponse(request, ERROR_MESSAGE_INVALID_CREDENTIALS, 401, requestId, startTime),
        };
    }

    // Generate JWT token
    let token;
    try {
        logger.dbOperation('generateToken', { requestId, coachId: coach.id });
        token = await generateToken(coach.id, coach.email, 'coach');
    } catch (error) {
        logger.error('Token generation error', { requestId, coachId: coach.id },
            error instanceof Error ? error : new Error('Unknown token generation error'));
        return {
            success: false,
            response: createErrorResponse(request, ERROR_MESSAGE_LOGIN, 500, requestId, startTime),
        };
    }

    return { success: true, coach, token };
}

/**
 * Handle POST request for coach login
 */
export async function POST(request: NextRequest) {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    logger.apiRequest('POST', API_ROUTE, { requestId });

    try {
        // Parse request body
        const parseResult = await parseRequestBody(request, requestId, startTime);
        if (!parseResult.success) {
            return parseResult.response;
        }
        const { body } = parseResult;

        // Validate request data
        const validationResult = validateLoginRequest(body);
        if (!validationResult.isValid) {
            logger.validationError('Coach login validation failed', validationResult.errors, {
                requestId,
                email: body.email,
            });
            return createErrorResponse(request, '', 400, requestId, startTime, validationResult.errors);
        }

        // Authenticate coach
        const authResult = await authenticateCoach(body.email, body.password, requestId, request, startTime);
        if (!authResult.success) {
            return authResult.response;
        }
        const { coach, token } = authResult;

        // Log successful login
        const executionTime = Date.now() - startTime;
        logger.info('Coach logged in successfully', {
            requestId,
            coachId: coach.id,
            email: coach.email,
            executionTime: `${executionTime}ms`,
        });

        // Create response with session cookie
        const response = NextResponse.json(
            {
                success: true,
                message: 'Login successful',
                coachId: coach.id,
            },
            { status: 200 }
        );

        setSessionCookie(response, token);

        logger.apiResponse('POST', API_ROUTE, 200, executionTime, { requestId, coachId: coach.id });
        return addCorsHeaders(response, request);
    } catch (error) {
        // Catch any unexpected errors
        const executionTime = Date.now() - startTime;
        logger.error('Unexpected error during login', {
            requestId,
            executionTime: `${executionTime}ms`,
        }, error instanceof Error ? error : new Error('Unknown error'));

        return createErrorResponse(request, ERROR_MESSAGE_LOGIN, 500, requestId, startTime);
    }
}
