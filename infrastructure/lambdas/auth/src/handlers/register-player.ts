import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { query } from '../db/client';
import { hashPassword } from '../utils/password';
import { validateEmail, validatePassword, validateGPA, validateRequired, normalizeEmail } from '../utils/validation';
import { jsonResponse } from '../index';
import { RegisterPlayerBody } from '../types';

/**
 * Handles POST /auth/register/player.
 *
 * Creates a player record in the environment-specific RDS database.
 * Reuses the same validation and DB logic as the local Next.js route.
 * Requirements: 2.4, 2.8
 */
export async function handleRegisterPlayer(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    let body: RegisterPlayerBody;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return jsonResponse(400, { success: false, message: 'Invalid JSON in request body' });
    }

    // Validate required fields
    const errors: Array<{ field: string; message: string }> = [];

    if (!validateRequired(body.firstName) || (body.firstName!.trim().length < 2 || body.firstName!.trim().length > 50)) {
        errors.push({ field: 'firstName', message: 'First name must be between 2 and 50 characters' });
    }
    if (!validateRequired(body.lastName) || (body.lastName!.trim().length < 2 || body.lastName!.trim().length > 50)) {
        errors.push({ field: 'lastName', message: 'Last name must be between 2 and 50 characters' });
    }
    if (!validateRequired(body.dateOfBirth)) {
        errors.push({ field: 'dateOfBirth', message: 'Date of birth is required' });
    } else {
        const dob = new Date(body.dateOfBirth!);
        const today = new Date();
        if (isNaN(dob.getTime())) {
            errors.push({ field: 'dateOfBirth', message: 'Invalid date format' });
        } else if (dob > new Date(today.getFullYear() - 13, today.getMonth(), today.getDate())) {
            errors.push({ field: 'dateOfBirth', message: 'You must be at least 13 years old to register' });
        }
    }
    if (!validateEmail(body.email || '')) {
        errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }
    if (!validatePassword(body.password || '')) {
        errors.push({ field: 'password', message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' });
    }
    if (!validateRequired(body.sex) || !['male', 'female'].includes((body.sex || '').toLowerCase())) {
        errors.push({ field: 'sex', message: 'Sex must be either "male" or "female"' });
    }
    if (!validateRequired(body.sport)) {
        errors.push({ field: 'sport', message: 'Sport is required' });
    }
    if (body.gpa === undefined || body.gpa === null || body.gpa === '') {
        errors.push({ field: 'gpa', message: 'GPA is required' });
    } else if (!validateGPA(body.gpa)) {
        errors.push({ field: 'gpa', message: 'GPA must be between 0.0 and 4.0' });
    }
    if (!validateRequired(body.country)) {
        errors.push({ field: 'country', message: 'Country is required' });
    }
    if (body.country?.toUpperCase() === 'USA' && !validateRequired(body.state)) {
        errors.push({ field: 'state', message: 'State is required when country is USA' });
    }
    if (body.country?.toUpperCase() !== 'USA' && validateRequired(body.country) && !validateRequired(body.region)) {
        errors.push({ field: 'region', message: 'Region is required when country is not USA' });
    }

    if (errors.length > 0) {
        return jsonResponse(400, { success: false, errors });
    }

    const normalizedEmail = normalizeEmail(body.email!);

    // Check for duplicate email
    try {
        const existing = await query<{ exists: boolean }>(
            'SELECT EXISTS(SELECT 1 FROM players WHERE LOWER(email) = LOWER($1)) as exists',
            [normalizedEmail]
        );
        if (existing[0]?.exists) {
            return jsonResponse(409, { success: false, message: 'Email already registered' });
        }
    } catch (err) {
        console.error('DB error checking email', err);
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

    // Create player record
    let playerId: string;
    try {
        const result = await query<{ id: string }>(
            `INSERT INTO players (
                first_name, last_name, date_of_birth, email, password_hash, sex, sport, position, event,
                gpa, country, state, region, scholarship_amount, test_scores, referral_promo_code,
                secondary_referral_promo_code, tertiary_referral_promo_code, subscription_plan,
                is_cab_member, subscription_status
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
            RETURNING id`,
            [
                body.firstName!.trim(),
                body.lastName!.trim(),
                body.dateOfBirth,
                normalizedEmail,
                passwordHash,
                body.sex!.toLowerCase(),
                body.sport,
                body.position || null,
                body.event || null,
                body.gpa,
                body.country,
                body.state || null,
                body.region || null,
                body.scholarshipAmount || null,
                body.testScores || null,
                body.referralPromoCode || null,
                body.secondaryReferralPromoCode ?? null,
                body.tertiaryReferralPromoCode ?? null,
                body.subscriptionPlan ?? 'standard',
                false,
                'none',
            ]
        );

        if (!result || result.length === 0) {
            throw new Error('No row returned from INSERT');
        }
        playerId = result[0].id;
    } catch (err) {
        console.error('DB error creating player', err);
        if (err instanceof Error && err.message.includes('duplicate key')) {
            return jsonResponse(409, { success: false, message: 'Email already registered' });
        }
        return jsonResponse(500, { success: false, message: 'An error occurred during registration' });
    }

    return jsonResponse(201, {
        success: true,
        message: 'Player registered successfully',
        playerId,
    });
}
