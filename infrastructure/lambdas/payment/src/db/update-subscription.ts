import { query } from './client';

export interface SubscriptionUpdate {
    stripeCustomerId: string;
    isCABMember: boolean;
    subscriptionStatus: 'active' | 'past_due' | 'cancelled' | 'trialing' | 'paused' | 'none';
    subscriptionPeriodEnd?: Date | null;
    stripeSubscriptionId?: string | null;
}

/**
 * Idempotently updates a player's subscription state in the database.
 *
 * Looks up the player by their Stripe customer ID and only writes if the
 * desired state differs from the current state, preventing duplicate updates
 * from Stripe retries.
 *
 * Requirements: 4.2, 4.3
 */
export async function updatePlayerSubscription(update: SubscriptionUpdate): Promise<void> {
    const { stripeCustomerId, isCABMember, subscriptionStatus, subscriptionPeriodEnd, stripeSubscriptionId } = update;

    // Fetch current state to check idempotency
    type PlayerRow = {
        id: string;
        is_cab_member: boolean;
        subscription_status: string;
    };

    const rows = await query<PlayerRow>(
        `SELECT id, is_cab_member, subscription_status
         FROM players
         WHERE stripe_customer_id = $1`,
        [stripeCustomerId]
    );

    if (rows.length === 0) {
        console.warn(`No player found for stripe_customer_id=${stripeCustomerId} — skipping update`);
        return;
    }

    const player = rows[0];

    // Idempotency check: skip if state already matches
    if (
        player.is_cab_member === isCABMember &&
        player.subscription_status === subscriptionStatus
    ) {
        console.info(`Player ${player.id} already in desired state (${subscriptionStatus}) — skipping`);
        return;
    }

    const params: unknown[] = [
        isCABMember,
        subscriptionStatus,
        subscriptionPeriodEnd ?? null,
        stripeCustomerId,
    ];

    let sql = `
        UPDATE players
        SET
            is_cab_member = $1,
            subscription_status = $2,
            subscription_period_end = $3
    `;

    if (stripeSubscriptionId !== undefined) {
        sql += `, stripe_subscription_id = $5`;
        params.push(stripeSubscriptionId);
    }

    sql += ` WHERE stripe_customer_id = $4`;

    await query(sql, params);

    console.info(
        `Updated player ${player.id}: is_cab_member=${isCABMember}, subscription_status=${subscriptionStatus}`
    );
}
