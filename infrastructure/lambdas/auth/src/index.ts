import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { handleLogin } from './handlers/login';
import { handleRegisterPlayer } from './handlers/register-player';
import { handleRegisterCoach } from './handlers/register-coach';

/**
 * Auth Lambda entry point.
 *
 * Routes incoming API Gateway HTTP API events to the appropriate handler
 * based on the request path and method.
 *
 * Routes:
 *   POST /auth/login/player
 *   POST /auth/login/coach
 *   POST /auth/register/player
 *   POST /auth/register/coach
 */
export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    const { rawPath, requestContext } = event;
    const method = requestContext.http.method.toUpperCase();

    // CORS preflight
    if (method === 'OPTIONS') {
        return corsResponse(200, '');
    }

    if (method !== 'POST') {
        return jsonResponse(405, { success: false, message: 'Method not allowed' });
    }

    try {
        switch (rawPath) {
            case '/auth/login/player':
                return await handleLogin(event, 'player');
            case '/auth/login/coach':
                return await handleLogin(event, 'coach');
            case '/auth/register/player':
                return await handleRegisterPlayer(event);
            case '/auth/register/coach':
                return await handleRegisterCoach(event);
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
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(),
        },
        body: JSON.stringify(body),
    };
}

function corsResponse(statusCode: number, body: string): APIGatewayProxyStructuredResultV2 {
    return {
        statusCode,
        headers: corsHeaders(),
        body,
    };
}

function corsHeaders(): Record<string, string> {
    const allowedOrigins = process.env.ALLOWED_ORIGINS || '';
    return {
        'Access-Control-Allow-Origin': allowedOrigins.split(',')[0] || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true',
    };
}
