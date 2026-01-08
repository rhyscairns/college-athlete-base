/**
 * Player database operations
 * Handles all database interactions for player records
 */

import { query } from './client';
import { normalizeEmail } from '../utils/registerValidation';
import { PlayerRecord, PlayerDatabaseRecord } from '../types';

/**
 * Check if an email already exists in the database
 * Performs case-insensitive comparison
 * 
 * @param email - The email address to check
 * @returns Promise<boolean> - true if email exists, false otherwise
 * @throws Error if database query fails
 */
export async function checkEmailExists(email: string): Promise<boolean> {
    try {
        const normalizedEmail = normalizeEmail(email);
        const result = await query<{ exists: boolean }>(
            'SELECT EXISTS(SELECT 1 FROM players WHERE LOWER(email) = LOWER($1)) as exists',
            [normalizedEmail]
        );
        return result[0]?.exists || false;
    } catch (error) {
        console.error('Error checking email existence:', error);
        throw new Error('Failed to check email availability');
    }
}

/**
 * Create a new player record in the database
 * Uses parameterized queries to prevent SQL injection
 * 
 * @param data - The player data to insert
 * @returns Promise<string> - The UUID of the created player
 * @throws Error if database insertion fails
 */
export async function createPlayer(data: PlayerRecord): Promise<string> {
    try {
        const normalizedEmail = normalizeEmail(data.email);

        const result = await query<{ id: string }>(
            `INSERT INTO players (
                first_name, last_name, email, password_hash, sex, sport, position,
                gpa, country, state, region, scholarship_amount, test_scores
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id`,
            [
                data.firstName,
                data.lastName,
                normalizedEmail,
                data.passwordHash,
                data.sex,
                data.sport,
                data.position,
                data.gpa,
                data.country,
                data.state || null,
                data.region || null,
                data.scholarshipAmount || null,
                data.testScores || null,
            ]
        );

        if (!result || result.length === 0) {
            throw new Error('Failed to create player record');
        }

        return result[0].id;
    } catch (error) {
        console.error('Error creating player:', error);

        // Check for unique constraint violation (duplicate email)
        if (error instanceof Error && error.message.includes('duplicate key')) {
            throw new Error('Email already registered');
        }

        throw new Error('Failed to create player record');
    }
}

/**
 * Get a player record by email address
 * Performs case-insensitive search
 * Used for future login functionality
 * 
 * @param email - The email address to search for
 * @returns Promise<PlayerDatabaseRecord | null> - The player record or null if not found
 * @throws Error if database query fails
 */
export async function getPlayerByEmail(email: string): Promise<PlayerDatabaseRecord | null> {
    try {
        const normalizedEmail = normalizeEmail(email);
        const result = await query<any>(
            `SELECT 
                id, first_name, last_name, email, password_hash, sex, sport, position,
                gpa, country, state, region, scholarship_amount, test_scores,
                created_at, updated_at
            FROM players 
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
            sex: row.sex,
            sport: row.sport,
            position: row.position,
            gpa: parseFloat(row.gpa),
            country: row.country,
            state: row.state,
            region: row.region,
            scholarshipAmount: row.scholarship_amount ? parseFloat(row.scholarship_amount) : undefined,
            testScores: row.test_scores,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    } catch (error) {
        console.error('Error fetching player by email:', error);
        throw new Error('Failed to fetch player record');
    }
}
