import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { isCloudEnvironment } from '@/lib/environment';
import { query } from '@/authentication/db/client';

/**
 * POST /api/payment/create-checkout-session
 *
 * Cloud-only endpoint that creates a Stripe Checkout Session for a player
 * to set up a monthly ($6.99) or annual ($70.00) subscription.
 *
 * Returns 403 in local environments — use /api/payment/simulate instead.
 * Requirements: 3.2, 3.3, 3.4
 */
export async function POST(request: NextRequest) {
    // Only available in cloud environments
    if (!isCloudEnvironment()) {
        return NextResponse.json(
            { success: false, message: 'Stripe Checkout is only available in cloud environments. Use /api/payment/simulate locally.' },
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

    let body: { playerId?: unknown; priceType?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { success: false, message: 'Invalid JSON in request body' },
            { status: 400 }
        );
    }

    const { playerId, priceType } = body;

    if (!playerId || typeof playerId !== 'string') {
        return NextResponse.json(
            { success: false, message: 'playerId is required' },
            { status: 400 }
        );
    }

    if (priceType !== 'monthly' && priceType !== 'annual') {
        return NextResponse.json(
            { success: false, message: 'priceType must be "monthly" or "annual"' },
            { status: 400 }
        );
    }

    const priceId =
        priceType === 'monthly'
            ? process.env.STRIPE_MONTHLY_PRICE_ID
            : process.env.STRIPE_ANNUAL_PRICE_ID;

    if (!priceId) {
        return NextResponse.json(
            { success: false, message: `Stripe price ID for "${priceType}" is not configured` },
            { status: 503 }
        );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
        return NextResponse.json(
            { success: false, message: 'NEXT_PUBLIC_APP_URL is not configured' },
            { status: 503 }
        );
    }

    // Look up the player to get or create a Stripe customer ID
    let players: { id: string; stripe_customer_id: string | null; email: string }[];
    try {
        players = await query<{ id: string; stripe_customer_id: string | null; email: string }>(
            `SELECT id, stripe_customer_id, email FROM players WHERE id = $1`,
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
    const stripe = new Stripe(stripeSecretKey);

    try {
        // Reuse existing Stripe customer if one exists, otherwise Checkout will create one
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            mode: 'subscription',
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${appUrl}/player/dashboard?subscription=success`,
            cancel_url: `${appUrl}/player/dashboard?subscription=cancelled`,
            metadata: { playerId },
            payment_method_collection: 'always',
        };

        if (player.stripe_customer_id) {
            sessionParams.customer = player.stripe_customer_id;
        } else if (player.email) {
            sessionParams.customer_email = player.email;
        }

        const session = await stripe.checkout.sessions.create(sessionParams);

        return NextResponse.json(
            { success: true, url: session.url },
            { status: 200 }
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create Stripe Checkout session';
        return NextResponse.json(
            { success: false, message },
            { status: 500 }
        );
    }
}
