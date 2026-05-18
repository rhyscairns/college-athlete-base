import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Clears the HttpOnly session cookie server-side and redirects to /login.
 */
export async function POST() {
    const response = NextResponse.redirect(
        new URL('/login', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
        { status: 303 }
    );

    // Clear the session cookie
    response.cookies.set('session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
    });

    // Prevent the browser from caching this response or the pages before it
    response.headers.set('Cache-Control', 'no-store');

    return response;
}
