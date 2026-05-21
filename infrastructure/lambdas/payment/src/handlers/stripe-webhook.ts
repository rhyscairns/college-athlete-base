import Stripe from 'stripe';
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { updatePlayerSubscription } from '../db/update-subscription';
import { jsonResponse } from '../index';

/**
 * Handles POST /webhooks/stripe
 *
 * Verifies the Stripe-Signature header, then routes to the appropriate
 * event handler to update player subscription state in the database.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export async function handleStripeWebhook(
    event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET is not configured');
        return jsonResponse(500, { success: false, message: 'Webhook secret not configured' });
    }

    const signature = event.headers['stripe-signature'];
    if (!signature) {
        return jsonResponse(400, { success: false, message: 'Missing Stripe-Signature header' });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
        console.error('STRIPE_SECRET_KEY is not configured');
        return jsonResponse(500, { success: false, message: 'Stripe secret key not configured' });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-02-24.acacia' });

    let stripeEvent: Stripe.Event;
    try {
        // event.body is the raw request body — required for signature verification
        stripeEvent = stripe.webhooks.constructEvent(
            event.body ?? '',
            signature,
            webhookSecret
        );
    } catch (err) {
        console.warn('Stripe signature verification failed', err);
        // Return 400 — Stripe will NOT retry on 4xx
        return jsonResponse(400, { success: false, message: 'Invalid webhook signature' });
    }

    try {
        await routeStripeEvent(stripeEvent);
    } catch (err) {
        console.error(`Failed to process Stripe event ${stripeEvent.type} (${stripeEvent.id})`, err);
        // Return 500 so Stripe retries the delivery (Requirement 4.4)
        return jsonResponse(500, { success: false, message: 'Failed to process webhook event' });
    }

    return jsonResponse(200, { success: true, received: true });
}

/**
 * Routes a verified Stripe event to the appropriate handler.
 */
async function routeStripeEvent(event: Stripe.Event): Promise<void> {
    console.info(`Processing Stripe event: ${event.type} (${event.id})`);

    switch (event.type) {
        case 'customer.subscription.created':
            await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
            break;

        case 'invoice.payment_succeeded':
            await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
            break;

        case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
            break;

        case 'customer.subscription.paused':
            await handleSubscriptionPaused(event.data.object as Stripe.Subscription);
            break;

        case 'invoice.payment_failed':
            await handlePaymentFailed(event.data.object as Stripe.Invoice);
            break;

        default:
            // Unhandled event types are silently ignored — return 200 to Stripe
            console.info(`Unhandled Stripe event type: ${event.type}`);
    }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    const customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

    await updatePlayerSubscription({
        stripeCustomerId: customerId,
        isCABMember: true,
        subscriptionStatus: 'active',
        subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000),
        stripeSubscriptionId: subscription.id,
    });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const customerId = typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer?.id;

    if (!customerId) {
        console.warn('invoice.payment_succeeded event has no customer ID — skipping');
        return;
    }

    // Only update subscription state for subscription invoices
    if (!invoice.subscription) {
        return;
    }

    const subscriptionId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription.id;

    await updatePlayerSubscription({
        stripeCustomerId: customerId,
        isCABMember: true,
        subscriptionStatus: 'active',
        subscriptionPeriodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
        stripeSubscriptionId: subscriptionId,
    });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

    await updatePlayerSubscription({
        stripeCustomerId: customerId,
        isCABMember: false,
        subscriptionStatus: 'cancelled',
        subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000),
        stripeSubscriptionId: subscription.id,
    });
}

async function handleSubscriptionPaused(subscription: Stripe.Subscription): Promise<void> {
    const customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

    await updatePlayerSubscription({
        stripeCustomerId: customerId,
        isCABMember: false,
        subscriptionStatus: 'paused',
        subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000),
        stripeSubscriptionId: subscription.id,
    });
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer?.id;

    if (!customerId) {
        console.warn('invoice.payment_failed event has no customer ID — skipping');
        return;
    }

    if (!invoice.subscription) {
        return;
    }

    const subscriptionId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription.id;

    await updatePlayerSubscription({
        stripeCustomerId: customerId,
        isCABMember: false,
        subscriptionStatus: 'past_due',
        subscriptionPeriodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
        stripeSubscriptionId: subscriptionId,
    });

    // TODO: queue email notification to player (Requirement 3.7)
    console.info(`Payment failed for customer ${customerId} — profile visibility revoked`);
}
