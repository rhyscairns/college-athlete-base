import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { handleStripeWebhook } from '../handlers/stripe-webhook';
import * as updateSubscriptionModule from '../db/update-subscription';

// Mock the DB module
jest.mock('../db/update-subscription');
const mockUpdatePlayerSubscription = updateSubscriptionModule.updatePlayerSubscription as jest.MockedFunction<
    typeof updateSubscriptionModule.updatePlayerSubscription
>;

// Mock Stripe
jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        webhooks: {
            constructEvent: mockConstructEvent,
        },
    }));
});

const mockConstructEvent = jest.fn();

const WEBHOOK_SECRET = 'whsec_test_secret';
const STRIPE_SECRET_KEY = 'sk_test_key';

function makeEvent(body: object, signature = 'valid-sig'): APIGatewayProxyEventV2 {
    return {
        body: JSON.stringify(body),
        headers: { 'stripe-signature': signature },
        rawPath: '/webhooks/stripe',
        requestContext: { http: { method: 'POST' } },
    } as unknown as APIGatewayProxyEventV2;
}

function makeSubscription(overrides: object = {}): object {
    return {
        id: 'sub_123',
        customer: 'cus_abc',
        current_period_end: 1800000000,
        status: 'active',
        ...overrides,
    };
}

function makeInvoice(overrides: object = {}): object {
    return {
        id: 'in_123',
        customer: 'cus_abc',
        subscription: 'sub_123',
        period_end: 1800000000,
        ...overrides,
    };
}

beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
    process.env.STRIPE_SECRET_KEY = STRIPE_SECRET_KEY;
    mockUpdatePlayerSubscription.mockResolvedValue(undefined);
});

afterEach(() => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_SECRET_KEY;
});

describe('handleStripeWebhook', () => {
    describe('signature verification', () => {
        it('returns 400 when Stripe-Signature header is missing', async () => {
            const event = {
                body: '{}',
                headers: {},
                rawPath: '/webhooks/stripe',
                requestContext: { http: { method: 'POST' } },
            } as unknown as APIGatewayProxyEventV2;

            const result = await handleStripeWebhook(event);
            expect(result.statusCode).toBe(400);
            expect(JSON.parse(result.body as string).message).toMatch(/Missing Stripe-Signature/);
        });

        it('returns 400 when signature verification fails', async () => {
            mockConstructEvent.mockImplementation(() => {
                throw new Error('Signature mismatch');
            });

            const result = await handleStripeWebhook(makeEvent({}));
            expect(result.statusCode).toBe(400);
            expect(JSON.parse(result.body as string).message).toMatch(/Invalid webhook signature/);
        });

        it('returns 500 when STRIPE_WEBHOOK_SECRET is not set', async () => {
            delete process.env.STRIPE_WEBHOOK_SECRET;
            const result = await handleStripeWebhook(makeEvent({}));
            expect(result.statusCode).toBe(500);
        });

        it('returns 500 when STRIPE_SECRET_KEY is not set', async () => {
            delete process.env.STRIPE_SECRET_KEY;
            const result = await handleStripeWebhook(makeEvent({}));
            expect(result.statusCode).toBe(500);
        });
    });

    describe('customer.subscription.created', () => {
        it('sets is_cab_member=true and subscription_status=active', async () => {
            const subscription = makeSubscription();
            mockConstructEvent.mockReturnValue({
                type: 'customer.subscription.created',
                id: 'evt_1',
                data: { object: subscription },
            });

            const result = await handleStripeWebhook(makeEvent(subscription));

            expect(result.statusCode).toBe(200);
            expect(mockUpdatePlayerSubscription).toHaveBeenCalledWith(
                expect.objectContaining({
                    stripeCustomerId: 'cus_abc',
                    isCABMember: true,
                    subscriptionStatus: 'active',
                    stripeSubscriptionId: 'sub_123',
                })
            );
        });
    });

    describe('invoice.payment_succeeded', () => {
        it('sets is_cab_member=true and subscription_status=active', async () => {
            const invoice = makeInvoice();
            mockConstructEvent.mockReturnValue({
                type: 'invoice.payment_succeeded',
                id: 'evt_2',
                data: { object: invoice },
            });

            const result = await handleStripeWebhook(makeEvent(invoice));

            expect(result.statusCode).toBe(200);
            expect(mockUpdatePlayerSubscription).toHaveBeenCalledWith(
                expect.objectContaining({
                    stripeCustomerId: 'cus_abc',
                    isCABMember: true,
                    subscriptionStatus: 'active',
                })
            );
        });

        it('skips update when invoice has no subscription', async () => {
            const invoice = makeInvoice({ subscription: null });
            mockConstructEvent.mockReturnValue({
                type: 'invoice.payment_succeeded',
                id: 'evt_3',
                data: { object: invoice },
            });

            await handleStripeWebhook(makeEvent(invoice));
            expect(mockUpdatePlayerSubscription).not.toHaveBeenCalled();
        });
    });

    describe('customer.subscription.deleted', () => {
        it('sets is_cab_member=false and subscription_status=cancelled', async () => {
            const subscription = makeSubscription();
            mockConstructEvent.mockReturnValue({
                type: 'customer.subscription.deleted',
                id: 'evt_4',
                data: { object: subscription },
            });

            const result = await handleStripeWebhook(makeEvent(subscription));

            expect(result.statusCode).toBe(200);
            expect(mockUpdatePlayerSubscription).toHaveBeenCalledWith(
                expect.objectContaining({
                    stripeCustomerId: 'cus_abc',
                    isCABMember: false,
                    subscriptionStatus: 'cancelled',
                })
            );
        });
    });

    describe('customer.subscription.paused', () => {
        it('sets is_cab_member=false and subscription_status=paused', async () => {
            const subscription = makeSubscription();
            mockConstructEvent.mockReturnValue({
                type: 'customer.subscription.paused',
                id: 'evt_5',
                data: { object: subscription },
            });

            const result = await handleStripeWebhook(makeEvent(subscription));

            expect(result.statusCode).toBe(200);
            expect(mockUpdatePlayerSubscription).toHaveBeenCalledWith(
                expect.objectContaining({
                    stripeCustomerId: 'cus_abc',
                    isCABMember: false,
                    subscriptionStatus: 'paused',
                })
            );
        });
    });

    describe('invoice.payment_failed', () => {
        it('sets is_cab_member=false and subscription_status=past_due', async () => {
            const invoice = makeInvoice();
            mockConstructEvent.mockReturnValue({
                type: 'invoice.payment_failed',
                id: 'evt_6',
                data: { object: invoice },
            });

            const result = await handleStripeWebhook(makeEvent(invoice));

            expect(result.statusCode).toBe(200);
            expect(mockUpdatePlayerSubscription).toHaveBeenCalledWith(
                expect.objectContaining({
                    stripeCustomerId: 'cus_abc',
                    isCABMember: false,
                    subscriptionStatus: 'past_due',
                })
            );
        });

        it('skips update when invoice has no subscription', async () => {
            const invoice = makeInvoice({ subscription: null });
            mockConstructEvent.mockReturnValue({
                type: 'invoice.payment_failed',
                id: 'evt_7',
                data: { object: invoice },
            });

            await handleStripeWebhook(makeEvent(invoice));
            expect(mockUpdatePlayerSubscription).not.toHaveBeenCalled();
        });
    });

    describe('unhandled event types', () => {
        it('returns 200 without calling updatePlayerSubscription', async () => {
            mockConstructEvent.mockReturnValue({
                type: 'customer.created',
                id: 'evt_8',
                data: { object: {} },
            });

            const result = await handleStripeWebhook(makeEvent({}));
            expect(result.statusCode).toBe(200);
            expect(mockUpdatePlayerSubscription).not.toHaveBeenCalled();
        });
    });

    describe('DB failure', () => {
        it('returns 500 so Stripe retries the event', async () => {
            const subscription = makeSubscription();
            mockConstructEvent.mockReturnValue({
                type: 'customer.subscription.created',
                id: 'evt_9',
                data: { object: subscription },
            });
            mockUpdatePlayerSubscription.mockRejectedValue(new Error('DB connection failed'));

            const result = await handleStripeWebhook(makeEvent(subscription));
            expect(result.statusCode).toBe(500);
        });
    });
});
