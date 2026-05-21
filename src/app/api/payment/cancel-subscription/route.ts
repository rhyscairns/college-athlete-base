import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { isCloudEnvironment } from '@/lib/environment';
import { query } from '@/authentication/db/client';

/**
 * POST /api/payment/cancel-subscription
 *
 * Cancels a player's Stripe subscription at the end of the current billing period
 * and updates subscription_status = 'cancelled' in the database.
 *
 * The player remains visible (is_cab_member = true) until the period ends —
 * the Payment Lambda webhook handler will set is_cab_member = false when
 * Stripe fires the customer.subscription.deleted event.
 *
 * Requirements: 3.9
 */
export async function POST(request: NextRequest) {
    // Only available in cloud environments — no real subscriptions exist locally
    if (!isCloudEnvironment()) {
        return NextResponse.json(
            { success: false, message: 'Subscription cancellation is only available in cloud environments' },
            { status: 403 }
        );
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
        return NextResponse.json(
            { success: false, message: 'Stripe is not configured' },
            { status: 503 }
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

    // Look up the player's Stripe subscription ID
    let players: { id: string; stripe_subscription_id: string | null; subscription_status: string }[];
    try {
        players = await query<{ id: string; stripe_subscription_id: string | null; subscription_status: string }>(
            `SELECT id, stripe_subscription_id, subscription_status FROM players WHERE id = $1`,
            [playerId]
        );
    } catch {
        return NextResponse.json(
            { success: false, message: 'Failed to look up player' },
            { status: 500 }
        );
    }

    if (players.length === 0) {
        return NextResponse.json(
            { success: false, message: 'Player not found' },
            { status: 404 }
        );
    }

    const player = players[0];

    if (!player.stripe_subscription_id) {
        return NextResponse.json(
            { success: false, message: 'Player does not have an active subscription' },
            { status: 422 }
        );
    }

    const stripe = new Stripe(stripeSecretKey);

    try {
        // Cancel at period end — player stays visible until billing period expires
        await stripe.subscriptions.update(player.stripe_subscription_id, {
            cancel_at_period_end: true,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to cancel subscription with Stripe';
        return NextResponse.json(
            { success: false, message },
            { status: 500 }
        );
    }

    // Update local DB status to reflect pending cancellation
    try {
        await query(
            `UPDATE players
             SET subscription_status = 'cancelled',
                 updated_at = NOW()
             WHERE id = $1`,
            [playerId]
        );
    } catch {
        // Stripe cancellation succeeded — log the DB failure but don't surface it as an error.
        // The webhook will reconcile the state when Stripe fires customer.subscription.deleted.
        return NextResponse.json(
            { success: false, message: 'Subscription cancelled with Stripe but failed to update local status' },
            { status: 500 }
        );
    }

    return NextResponse.json(
        { success: true, message: 'Subscription will be cancelled at the end of the current billing period' },
        { status: 200 }
    );
}
