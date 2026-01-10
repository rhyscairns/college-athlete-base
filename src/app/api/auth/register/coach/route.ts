/**
 * Coach Registration API Route
 * POST /api/auth/register/coach
 * 
 * Handles coach registration with validation, password hashing, and database storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/authentication/utils/password';
import { checkCoachEmailExists, createCoach } from '@/authentication/db/coaches';
import { logger } from '@/lib/logger';
import { validateEmail, validatePassword, validateRequired } from '@/authentication/utils/validation';

// CORS helper function
function getAllowedOrigin(request: NextRequest): string {
    const origin = request.headers.get('origin');
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');

    if (origin && allowedOrigins.includes(origin)) {
        return origin;
    }

    // Return first allowed origin or wildcard
    return allowedOrigins[0] || '*';
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
    const allowedOrigin = getAllowedOrigin(request);

    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': allowedOrigin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
        },
    });
}

/**
 * Helper function to validate string length
 */
function validateStringLength(value: any, minLength: number, maxLength: number): boolean {
    if (!validateRequired(value)) return false;
    const str = String(value).trim();
    return str.length >= minLength && str.length <= maxLength;
}

/**
 * Handle POST request for coach registration
 */
export async function POST(request: NextRequest) {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
        // Parse request body
        const body = await request.json();

        // Validate required fields
        const errors: Array<{ field: string; message: string }> = [];

        // Personal information
        if (!validateStringLength(body.firstName, 2, 100)) {
            errors.push({ field: 'firstName', message: 'First name must be between 2 and 100 characters' });
        }
        if (!validateStringLength(body.lastName, 2, 100)) {
            errors.push({ field: 'lastName', message: 'Last name must be between 2 and 100 characters' });
        }
        if (!validateEmail(body.email)) {
            errors.push({ field: 'email', message: 'Invalid email address' });
        }
        if (!validatePassword(body.password)) {
            errors.push({
                field: 'password',
                message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
            });
        }

        // Coaching information
        if (!validateRequired(body.coachingCategory)) {
            errors.push({ field: 'coachingCategory', message: 'Coaching category is required' });
        }
        if (!body.sports || !Array.isArray(body.sports) || body.sports.length === 0) {
            errors.push({ field: 'sports', message: 'At least one sport is required' });
        }
        if (!validateStringLength(body.university, 2, 255)) {
            errors.push({ field: 'university', message: 'University is required' });
        }

        // Return validation errors if any
        if (errors.length > 0) {
            const duration = Date.now() - startTime;
            logger.warn('Coach registration validation failed', {
                errors: errors.length,
                duration: `${duration}ms`,
                requestId,
            });

            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation failed',
                    errors,
                },
                {
                    status: 400,
                    headers: {
                        'Access-Control-Allow-Origin': getAllowedOrigin(request),
                    },
                }
            );
        }

        // Check if email already exists
        const emailExists = await checkCoachEmailExists(body.email);
        if (emailExists) {
            const duration = Date.now() - startTime;
            logger.warn('Coach registration failed - email already exists', {
                email: body.email,
                duration: `${duration}ms`,
                requestId,
            });

            return NextResponse.json(
                {
                    success: false,
                    message: 'Email already registered',
                },
                {
                    status: 409,
                    headers: {
                        'Access-Control-Allow-Origin': getAllowedOrigin(request),
                    },
                }
            );
        }

        // Hash password
        const passwordHash = await hashPassword(body.password);

        // Create coach record
        const coachId = await createCoach({
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            passwordHash,
            coachingCategory: body.coachingCategory,
            sports: body.sports,
            university: body.university,
        });

        const duration = Date.now() - startTime;
        logger.info('Coach registered successfully', {
            coachId,
            email: body.email,
            coachingCategory: body.coachingCategory,
            sports: body.sports,
            duration: `${duration}ms`,
            requestId,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Coach registered successfully',
                coachId,
            },
            {
                status: 201,
                headers: {
                    'Access-Control-Allow-Origin': getAllowedOrigin(request),
                },
            }
        );

    } catch (error) {
        const duration = Date.now() - startTime;
        logger.error('Coach registration error', {
            duration: `${duration}ms`,
            requestId,
        }, error instanceof Error ? error : new Error('Unknown error'));

        const response = NextResponse.json(
            {
                success: false,
                message: 'An error occurred during registration',
            },
            {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': getAllowedOrigin(request),
                },
            }
        );

        logger.error('API Response', {
            statusCode: response.status,
            duration: `${duration}ms`,
            requestId,
        });

        return response;
    }
}
