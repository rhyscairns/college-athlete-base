import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { query } from '../db/client';
import { verifyPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { validateEmail, normalizeEmail } from '../utils/validation';
import { jsonResponse } from '../index';
import { LoginBody, UserRow } from '../types';

/**
 * Handles POST /auth/login/player and POST /auth/login/coach.
 *
 * Validates credentials against the environment-specific RDS database,
 * then returns a signed JWT consistent with the existing auth contract.
 * Requirements: 2.3, 2.8
 */
export async function handleLogin(
    event: APIGatewayProxyEventV2,
    role: 'player' | 'coach'
): Promise<APIGatewayProxyStructuredResultV2> {
    let body: LoginBody;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return jsonResponse(400, { success: false, message: 'Invalid JSON in request body' });
    }

    // Validate inputs
    const errors: Array<{ field: string; message: string }> = [];
    if (!body.email || !validateEmail(body.email)) {
        errors.push({ field: 'email', message: 'Valid email is required' });
    }
    if (!body.password || body.password.length < 8) {
        errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }
    if (errors.length > 0) {
        return jsonResponse(400, { success: false, errors });
    }

    const normalizedEmail = normalizeEmail(body.email!);
    const table = role === 'player' ? 'players' : 'coaches';

    // Fetch user record
    let rows: UserRow[];
    try {
        rows = await query<UserRow>(
            `SELECT id, email, password_hash FROM ${table} WHERE LOWER(email) = LOWER($1)`,
            [normalizedEmail]
        );
    } catch (err) {
        console.error(`DB error fetching ${role}`, err);
        return jsonResponse(500, { success: false, message: 'An error occurred during login' });
    }

    if (rows.length === 0) {
        return jsonResponse(401, { success: false, message: 'Invalid email or password. Please try again.' });
    }

    const user = rows[0];

    // Verify password
    let isValid: boolean;
    try {
        isValid = await verifyPassword(body.password!, user.password_hash);
    } catch (err) {
        console.error('Password verification error', err);
        return jsonResponse(500, { success: false, message: 'An error occurred during login' });
    }

    if (!isValid) {
        return jsonResponse(401, { success: false, message: 'Invalid email or password. Please try again.' });
    }

    // Generate JWT
    let token: string;
    try {
        token = await generateToken(user.id, user.email, role);
    } catch (err) {
        console.error('Token generation error', err);
        return jsonResponse(500, { success: false, message: 'An error occurred during login' });
    }

    const idKey = role === 'player' ? 'playerId' : 'coachId';
    return jsonResponse(200, {
        success: true,
        message: 'Login successful',
        [idKey]: user.id,
        token,
    });
}
