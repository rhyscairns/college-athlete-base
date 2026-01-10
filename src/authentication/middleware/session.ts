import { NextRequest } from 'next/server';
import { verifyToken } from '@/authentication/utils/jwt';
import { TokenPayload, SessionValidationResult } from '@/authentication/types';

/**
 * Extract JWT token from request cookies
 * @param request - Next.js request object
 * @returns The JWT token string or null if not found
 */
export function getTokenFromCookie(request: NextRequest): string | null {
    try {
        // Get the session cookie
        const sessionCookie = request.cookies.get('session');

        if (!sessionCookie || !sessionCookie.value) {
            return null;
        }

        return sessionCookie.value;
    } catch (error) {
        // Log error but don't expose details
        console.error('Error extracting token from cookie:', error);
        return null;
    }
}

/**
 * Validate session token from request cookies
 * @param request - Next.js request object
 * @returns Promise resolving to session validation result
 */
export async function validateSession(
    request: NextRequest
): Promise<SessionValidationResult> {
    try {
        // Extract token from cookies
        const token = getTokenFromCookie(request);

        if (!token) {
            return {
                isValid: false,
                error: 'No session token found'
            };
        }

        // Verify and decode the token
        const payload: TokenPayload | null = await verifyToken(token);

        if (!payload) {
            return {
                isValid: false,
                error: 'Invalid or expired token'
            };
        }

        // Return validated session information
        return {
            isValid: true,
            playerId: payload.playerId,
            email: payload.email,
            type: payload.type
        };
    } catch (error) {
        console.error('Session validation error:', error);
        return {
            isValid: false,
            error: 'Session validation failed'
        };
    }
}
