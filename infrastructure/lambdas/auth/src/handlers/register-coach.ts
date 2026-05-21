import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { query } from '../db/client';
import { hashPassword } from '../utils/password';
import { validateEmail, validatePassword, validateRequired, normalizeEmail } from '../utils/validation';
import { jsonResponse } from '../index';
import { RegisterCoachBody } from '../types';

function validateStringLength(value: unknown, min: number, max: number): boolean {
    if (!validateRequired(value as string)) return false;
    const s = String(value).trim();
    return s.length >= min && s.length <= max;
}

/**
 * Handles POST /auth/register/coach.
 *
 * Creates a coach record in the environment-specific RDS database.
 * Requirements: 2.4, 2.8
 */
export async function handleRegisterCoach(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    let body: RegisterCoachBody;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return jsonResponse(400, { success: false, message: 'Invalid JSON in request body' });
    }

    const errors: Array<{ field: string; message: string }> = [];

    if (!validateStringLength(body.firstName, 2, 100)) {
        errors.push({ field: 'firstName', message: 'First name must be between 2 and 100 characters' });
    }
    if (!validateStringLength(body.lastName, 2, 100)) {
        errors.push({ field: 'lastName', message: 'Last name must be between 2 and 100 characters' });
    }
    if (!validateEmail(body.email || '')) {
        errors.push({ field: 'email', message: 'Invalid email address' });
    }
    if (!validatePassword(body.password || '')) {
        errors.push({ field: 'password', message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' });
    }
    if (!validateRequired(body.coachingCategory)) {
        errors.push({ field: 'coachingCategory', message: 'Coaching category is required' });
    }
    if (!body.sports || !Array.isArray(body.sports) || body.sports.length === 0) {
        errors.push({ field: 'sports', message: 'At least one sport is required' });
    }
    if (!validateStringLength(body.university, 2, 255)) {
        errors.push({ field: 'university', message: 'University is required' });
    }

    if (errors.length > 0) {
        return jsonResponse(400, { success: false, errors });
    }

    const normalizedEmail = normalizeEmail(body.email!);

    // Check for duplicate email
    try {
        const existing = await query<{ exists: boolean }>(
            'SELECT EXISTS(SELECT 1 FROM coaches WHERE LOWER(email) = LOWER($1)) as exists',
            [normalizedEmail]
        );
        if (existing[0]?.exists) {
            return jsonResponse(409, { success: false, message: 'Email already registered' });
        }
    } catch (err) {
        console.error('DB error checking coach email', err);
        return jsonResponse(500, { success: false, message: 'An error occurred during registration' });
    }

    // Hash password
    let passwordHash: string;
    try {
        passwordHash = await hashPassword(body.password!);
    } catch (err) {
        console.error('Password hashing error', err);
        return jsonResponse(500, { success: false, message: 'An error occurred during registration' });
    }

    // Create coach record
    let coachId: string;
    try {
        const result = await query<{ id: string }>(
            `INSERT INTO coaches (
                first_name, last_name, email, password_hash,
                sport, coaching_level, current_organization, specializations, country,
                referral_promo_code, secondary_referral_promo_code, tertiary_referral_promo_code
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
            RETURNING id`,
            [
                body.firstName!.trim(),
                body.lastName!.trim(),
                normalizedEmail,
                passwordHash,
                body.sports![0],
                body.coachingCategory,
                body.university,
                body.sports,
                'USA',
                body.referralPromoCode || null,
                body.secondaryReferralPromoCode ?? null,
                body.tertiaryReferralPromoCode ?? null,
            ]
        );

        if (!result || result.length === 0) {
            throw new Error('No row returned from INSERT');
        }
        coachId = result[0].id;
    } catch (err) {
        console.error('DB error creating coach', err);
        if (err instanceof Error && err.message.includes('duplicate key')) {
            return jsonResponse(409, { success: false, message: 'Email already registered' });
        }
        return jsonResponse(500, { success: false, message: 'An error occurred during registration' });
    }

    return jsonResponse(201, {
        success: true,
        message: 'Coach registered successfully',
        coachId,
    });
}
