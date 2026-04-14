/**
 * Database query utilities for player profile data
 * Handles fetching and transforming player profile data from the database
 */

import { query } from '@/authentication/db/client';
import { logger } from '@/lib/logger';
import type { PlayerProfile } from '../../../types';

/**
 * Database row type for player profile query
 */
interface PlayerProfileRow {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    sex: string;
    sport: string;
    position: string;
    gpa: string;
    country: string;
    state: string | null;
    region: string | null;
    scholarship_amount: string | null;
    test_scores: string | null;
    date_of_birth: string | null;
    age: number | null;
    profile_image_url: string | null;
    academic_standing: string | null;
    recruitment_status: string | null;
    created_at: Date;
    updated_at: Date;
}

/**
 * Fetch player profile by ID from the database
 *
 * @param playerId - The UUID of the player
 * @returns Promise<PlayerProfile | null> - The player profile data or null if not found
 * @throws Error if database query fails
 */
export async function getPlayerProfileById(playerId: string): Promise<PlayerProfile | null> {
    try {
        logger.debug('Fetching player profile', { playerId });

        // Fetch basic player data
        const playerRows = await query<PlayerProfileRow>(
            `SELECT 
                id, first_name, last_name, email, sex, sport, position,
                gpa, country, state, region, scholarship_amount, test_scores,
                date_of_birth,
                CASE 
                    WHEN date_of_birth IS NOT NULL 
                    THEN EXTRACT(YEAR FROM AGE(date_of_birth))::INTEGER
                    ELSE age
                END as age,
                profile_image_url, academic_standing, recruitment_status,
                created_at, updated_at
            FROM players 
            WHERE id = $1`,
            [playerId]
        );

        if (playerRows.length === 0) {
            logger.debug('Player not found', { playerId });
            return null;
        }

        const player = playerRows[0];

        // Transform database result to PlayerProfile structure
        const profileData = transformPlayerData(player);

        logger.debug('Player profile fetched successfully', { playerId });
        return profileData;
    } catch (error) {
        logger.error('Failed to fetch player profile', { playerId }, error instanceof Error ? error : new Error('Unknown error'));
        throw new Error('Failed to fetch player profile');
    }
}

/**
 * Transform database player row to PlayerProfile structure
 *
 * @param player - The database player row
 * @returns PlayerProfile - The transformed player profile data
 */
function transformPlayerData(player: PlayerProfileRow): PlayerProfile {
    // Generate initials from first and last name
    const initials = player.first_name.charAt(0) + player.last_name.charAt(0);

    // Format location string
    const location = player.state
        ? player.state + ', ' + player.country
        : player.region
            ? player.region + ', ' + player.country
            : player.country;

    // Parse test scores if available (stored as JSON string)
    let satScore: number | undefined;
    let satMath: number | undefined;
    let satReading: number | undefined;
    let actScore: number | undefined;

    if (player.test_scores) {
        try {
            const scores = JSON.parse(player.test_scores);
            satScore = scores.satScore;
            satMath = scores.satMath;
            satReading = scores.satReading;
            actScore = scores.actScore;
        } catch (error) {
            logger.warn('Failed to parse test scores', { playerId: player.id }, error instanceof Error ? error : new Error('Parse error'));
        }
    }

    // Transform to PlayerProfile structure
    return {
        id: player.id,
        firstName: player.first_name,
        lastName: player.last_name,
        initials: initials.toUpperCase(),
        classYear: '',
        position: player.position,
        school: '',
        location,
        height: '',
        weight: '',
        age: player.age || undefined,
        dateOfBirth: player.date_of_birth || undefined,
        profileImage: player.profile_image_url || '',
        performanceMetrics: [],

        academic: {
            ncaaEligibilityCenter: '',
            ncaaQualifier: false,
            gpa: parseFloat(player.gpa),
            gpaScale: '4.0 Scale',
            satScore: satScore || 0,
            satMath: satMath || 0,
            satReading: satReading || 0,
            actScore: actScore,
            classRank: '',
            classRankDetail: '',
            coursework: [],
        },

        videos: [],
        coachTestimonials: [],
        achievements: [],

        contact: {
            email: player.email,
            phone: '',
            parentGuardianName: '',
            parentGuardianPhone: '',
            parentGuardianEmail: '',
            socialMedia: {
                twitter: '',
                instagram: '',
                youtube: '',
                tiktok: '',
            },
            preferredContactMethod: '',
            headCoach: {
                name: '',
                email: '',
                phone: '',
            },
        },

        stats: {
            'Receiving Yards': '',
            'Touchdowns': '',
            'Receptions': '',
            'Yards Per Catch': '',
            'Longest Reception': '',
        },

        recruitmentStatus: player.recruitment_status || 'open',
        commitmentStatus: null,
    } as PlayerProfile;
}

/**
 * Update player profile data in the database
 *
 * @param playerId - The UUID of the player
 * @param updates - Partial player profile data to update
 * @returns Promise<boolean> - True if update was successful
 * @throws Error if database update fails
 */
export async function updatePlayerProfile(
    playerId: string,
    updates: Partial<PlayerProfile>
): Promise<boolean> {
    try {
        logger.debug('Updating player profile', { playerId, updates });

        // Build dynamic UPDATE query based on provided fields
        const updateFields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        // Map PlayerProfile fields to database columns
        if (updates.firstName !== undefined) {
            updateFields.push('first_name = $' + paramIndex++);
            values.push(updates.firstName);
        }
        if (updates.lastName !== undefined) {
            updateFields.push('last_name = $' + paramIndex++);
            values.push(updates.lastName);
        }
        if (updates.sport !== undefined) {
            updateFields.push('sport = $' + paramIndex++);
            values.push(updates.sport || '');
        }
        if (updates.position !== undefined) {
            updateFields.push('position = $' + paramIndex++);
            values.push(updates.position || '');
        }
        if (updates.dateOfBirth !== undefined) {
            updateFields.push('date_of_birth = $' + paramIndex++);
            values.push(updates.dateOfBirth);
        }
        if (updates.age !== undefined) {
            updateFields.push('age = $' + paramIndex++);
            // Ensure age is a valid number or null
            const ageValue = updates.age === 0 ? null : updates.age;
            values.push(ageValue);
        }
        if (updates.profileImage !== undefined) {
            updateFields.push('profile_image_url = $' + paramIndex++);
            values.push(updates.profileImage);
        }
        if (updates.recruitmentStatus !== undefined) {
            updateFields.push('recruitment_status = $' + paramIndex++);
            values.push(updates.recruitmentStatus);
        }
        if (updates.academic?.gpa !== undefined) {
            updateFields.push('gpa = $' + paramIndex++);
            values.push(updates.academic.gpa.toString());
        }

        // Handle test scores (stored as JSON)
        if (updates.academic) {
            const { satScore, satMath, satReading, actScore } = updates.academic;
            if (satScore !== undefined || satMath !== undefined || satReading !== undefined || actScore !== undefined) {
                const testScores = {
                    satScore,
                    satMath,
                    satReading,
                    actScore,
                };
                updateFields.push('test_scores = $' + paramIndex++);
                values.push(JSON.stringify(testScores));
            }
        }

        // If no fields to update, return early
        if (updateFields.length === 0) {
            logger.debug('No fields to update', { playerId });
            return true;
        }

        // Add updated_at timestamp
        updateFields.push('updated_at = NOW()');

        // Add playerId as the last parameter
        values.push(playerId);

        // Build and execute UPDATE query
        const updateQuery = 'UPDATE players SET ' + updateFields.join(', ') + ' WHERE id = $' + paramIndex;

        logger.debug('Executing update query', { playerId, updateQuery, values });

        const result = await query(updateQuery, values);

        logger.debug('Player profile updated successfully', { playerId, rowCount: result.length });
        return true;
    } catch (error) {
        logger.error('Failed to update player profile', { playerId, error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined }, error instanceof Error ? error : new Error('Unknown error'));
        throw error;
    }
}
