import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { handleStripeWebhook } from './handlers/stripe-webhook';

/**
 * Payment Lambda entry point.
 *
 * Routes incoming API Gateway HTTP API events to the Stripe webhook handler.
 *
 * Routes:
 *   POST /webhooks/stripe
 */
export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    const { rawPath, requestContext } = event;
    const method = requestContext.http.method.toUpperCase();

    if (method !== 'POST') {
        return jsonResponse(405, { success: false, message: 'Method not allowed' });
    }

    try {
        switch (rawPath) {
            case '/webhooks/stripe':
                return await handleStripeWebhook(event);
            default:
                return jsonResponse(404, { success: false, message: 'Not found' });
        }
    } catch (error) {
        console.error('Unhandled Lambda error', error);
        return jsonResponse(500, { success: false, message: 'Internal server error' });
    }
}

export function jsonResponse(statusCode: number, body: unknown): APIGatewayProxyStructuredResultV2 {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    };
}
