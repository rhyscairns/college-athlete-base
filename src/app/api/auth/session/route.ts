import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/authentication/utils/jwt';

/**
 * GET /api/auth/session
 * Lightweight endpoint to check if the current session cookie is valid.
 * Used by the bfcache pageshow listener to detect post-logout back-navigation.
 */
export async function GET() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = await verifyToken(sessionCookie.value);
    if (!payload) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true }, {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
    });
}
