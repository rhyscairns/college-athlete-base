import { NextRequest, NextResponse } from 'next/server';
import { isCloudEnvironment } from '@/lib/environment';
import { query } from '@/authentication/db/client';

/**
 * POST /api/payment/simulate
 *
 * Local-only endpoint that simulates a successful Stripe payment by setting
 * is_cab_member = true and subscription_status = 'active' for the given player.
 *
 * Returns 403 in cloud environments (development / production).
 * Requirements: 3.13
 */
export async function POST(request: NextRequest) {
    // Block in cloud environments — Stripe handles real payments there
    if (isCloudEnvironment()) {
        return NextResponse.json(
            { success: false, message: 'Payment simulation is only available in local development' },
            { status: 403 }
        );
    }

    let body: { playerId?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { success: false, message: 'Invalid JSON in request body' },
            { status: 400 }
        );
    }

    const { playerId } = body;

    if (!playerId || typeof playerId !== 'string') {
        return NextResponse.json(
            { success: false, message: 'playerId is required' },
            { status: 400 }
        );
    }

    try {
        const result = await query<{ id: string }>(
            `UPDATE players
             SET is_cab_member = true,
                 subscription_status = 'active',
                 updated_at = NOW()
             WHERE id = $1
             RETURNING id`,
            [playerId]
        );

        if (result.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Player not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Payment simulated — player is now a CAB member' },
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { success: false, message: 'Failed to update player subscription status' },
            { status: 500 }
        );
    }
}
