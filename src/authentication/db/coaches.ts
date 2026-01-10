/**
 * Coach database operations
 * Handles all database interactions for coach records
 */

import { query } from './client';
import { normalizeEmail } from '../utils/registerValidation';

export interface CoachRecord {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    coachingCategory: string;  // mens or womens
    sports: string[];           // array of sports
    university: string;
}

export interface CoachDatabaseRecord extends CoachRecord {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Check if an email already exists in the coaches database
 * Performs case-insensitive comparison
 * 
 * @param email - The email address to check
 * @returns Promise<boolean> - true if email exists, false otherwise
 * @throws Error if database query fails
 */
export async function checkCoachEmailExists(email: string): Promise<boolean> {
    try {
        const normalizedEmail = normalizeEmail(email);
        const result = await query<{ exists: boolean }>(
            'SELECT EXISTS(SELECT 1 FROM coaches WHERE LOWER(email) = LOWER($1)) as exists',
            [normalizedEmail]
        );
        return result[0]?.exists || false;
    } catch (error) {
        console.error('Error checking coach email existence:', error);
        throw new Error('Failed to check email availability');
    }
}

/**
 * Create a new coach record in the database
 * Uses parameterized queries to prevent SQL injection
 * 
 * @param data - The coach data to insert
 * @returns Promise<string> - The UUID of the created coach
 * @throws Error if database insertion fails
 */
export async function createCoach(data: CoachRecord): Promise<string> {
    try {
        const normalizedEmail = normalizeEmail(data.email);

        const result = await query<{ id: string }>(
            `INSERT INTO coaches (
                first_name, last_name, email, password_hash, 
                sport, coaching_level, current_organization, specializations, country
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id`,
            [
                data.firstName,
                data.lastName,
                normalizedEmail,
                data.passwordHash,
                data.sports[0],         // Primary sport in 'sport' column
                data.coachingCategory,  // Store in coaching_level column
                data.university,        // Store in current_organization column
                data.sports,            // Store all sports in specializations array
                'USA',                  // Default country
            ]
        );

        if (!result || result.length === 0) {
            throw new Error('Failed to create coach record');
        }

        return result[0].id;
    } catch (error) {
        console.error('Error creating coach:', error);

        // Check for unique constraint violation (duplicate email)
        if (error instanceof Error && error.message.includes('duplicate key')) {
            throw new Error('Email already registered');
        }

        throw new Error('Failed to create coach record');
    }
}

/**
 * Get a coach record by email address
 * Performs case-insensitive search
 * Used for future login functionality
 * 
 * @param email - The email address to search for
 * @returns Promise<CoachDatabaseRecord | null> - The coach record or null if not found
 * @throws Error if database query fails
 */
export async function getCoachByEmail(email: string): Promise<CoachDatabaseRecord | null> {
    try {
        const normalizedEmail = normalizeEmail(email);
        const result = await query<any>(
            `SELECT 
                id, first_name, last_name, email, password_hash, sport, coaching_level,
                years_experience, phone, country, state, city,
                current_organization, position_title, certifications, specializations, bio,
                created_at, updated_at
            FROM coaches 
            WHERE LOWER(email) = LOWER($1)`,
            [normalizedEmail]
        );

        if (result.length === 0) {
            return null;
        }

        const row = result[0];
        return {
            id: row.id,
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
            passwordHash: row.password_hash,
            sport: row.sport,
            coachingLevel: row.coaching_level,
            yearsExperience: row.years_experience,
            phone: row.phone,
            country: row.country,
            state: row.state,
            city: row.city,
            currentOrganization: row.current_organization,
            positionTitle: row.position_title,
            certifications: row.certifications,
            specializations: row.specializations,
            bio: row.bio,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    } catch (error) {
        console.error('Error fetching coach by email:', error);
        throw new Error('Failed to fetch coach record');
    }
}
