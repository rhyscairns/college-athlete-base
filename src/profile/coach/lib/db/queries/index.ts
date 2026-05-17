/**
 * Database query utilities for coach profile data
 * Handles fetching and updating coach profile data from the database
 */

import { query } from '@/authentication/db/client';
import { logger } from '@/lib/logger';
import type { CoachProfile } from '../../../types';

const coachNotFound = 'Coach not found'
/**
 * Database row type for coach profile query
 */
interface CoachProfileRow {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    current_organization: string | null;
    position_title: string | null;
    sport: string | null;
    years_experience: number | null;
    profile_image_url: string | null;
    team_website_url: string | null;
    university_logo_url: string | null;
    conference: string | null;
    division: string | null;
    team_name: string | null;
    office_location: string | null;
    office_hours: string | null;
    scholarship_budget: string | null;
    annual_cost_per_player: string | null;
    achievements: any | null;
    created_at: Date;
    updated_at: Date;
}

/**
 * Fetch coach profile by ID from the database
 *
 * @param coachId - The UUID of the coach
 * @returns Promise<CoachProfile | null> - The coach profile data or null if not found
 * @throws Error if database query fails
 */
export async function getCoachProfileById(coachId: string): Promise<CoachProfile | null> {
    try {
        logger.debug('Fetching coach profile', { coachId });

        const coachRows = await query<CoachProfileRow>(
            `SELECT 
                id, first_name, last_name, email, phone,
                current_organization, position_title, sport, years_experience,
                profile_image_url, team_website_url,
                university_logo_url, conference, division, team_name,
                office_location, office_hours, achievements,
                scholarship_budget, annual_cost_per_player,
                created_at, updated_at
            FROM coaches 
            WHERE id = $1`,
            [coachId]
        );

        if (coachRows.length === 0) {
            logger.debug(coachNotFound, { coachId });
            return null;
        }

        const coach = coachRows[0];

        // Transform database result to CoachProfile structure
        const profileData = transformCoachData(coach);

        logger.debug('Coach profile fetched successfully', { coachId });
        return profileData;
    } catch (error) {
        logger.error('Failed to fetch coach profile', { coachId }, error instanceof Error ? error : new Error('Unknown error'));
        throw new Error('Failed to fetch coach profile');
    }
}

/**
 * Update coach profile in the database
 * Only updates provided fields, leaving others unchanged
 *
 * @param coachId - The UUID of the coach
 * @param updates - Partial coach profile data to update
 * @returns Promise<CoachProfile> - The updated coach profile data
 * @throws Error if database update fails or coach not found
 */
export async function updateCoachProfile(
    coachId: string,
    updates: Partial<Omit<CoachProfile, 'id' | 'initials' | 'createdAt' | 'updatedAt'>>
): Promise<CoachProfile> {
    try {
        logger.debug('Updating coach profile', { coachId, updates });

        // Build dynamic UPDATE query based on provided fields
        const updateFields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        // Map CoachProfile fields to database columns
        const fieldMapping: Record<string, string> = {
            firstName: 'first_name',
            lastName: 'last_name',
            email: 'email',
            phone: 'phone',
            university: 'current_organization',
            position: 'position_title',
            sport: 'sport',
            yearsExperience: 'years_experience',
            profileImage: 'profile_image_url',
            teamWebsiteUrl: 'team_website_url',
            universityLogoUrl: 'university_logo_url',
            conference: 'conference',
            division: 'division',
            teamName: 'team_name',
            officeLocation: 'office_location',
            officeHours: 'office_hours',
            scholarshipBudget: 'scholarship_budget',
            annualCostPerPlayer: 'annual_cost_per_player',
            achievements: 'achievements',
        };

        // Build SET clause dynamically
        for (const [key, value] of Object.entries(updates)) {
            const dbColumn = fieldMapping[key];
            if (dbColumn) {
                // Special handling for JSONB achievements field
                if (key === 'achievements') {
                    updateFields.push(`${dbColumn} = $${paramIndex}::jsonb`);
                    values.push(value === undefined ? null : JSON.stringify(value));
                } else {
                    updateFields.push(`${dbColumn} = $${paramIndex}`);
                    values.push(value === undefined ? null : value);
                }
                paramIndex++;
            }
        }

        // If no fields to update, just fetch and return current data
        if (updateFields.length === 0) {
            logger.debug('No fields to update, returning current profile', { coachId });
            const currentProfile = await getCoachProfileById(coachId);
            if (!currentProfile) {
                throw new Error(coachNotFound);
            }
            return currentProfile;
        }

        // Always update the updated_at timestamp
        updateFields.push(`updated_at = NOW()`);

        // Add coachId as the last parameter
        values.push(coachId);

        const updateQuery = `
            UPDATE coaches 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING 
                id, first_name, last_name, email, phone,
                current_organization, position_title, sport, years_experience,
                profile_image_url, team_website_url,
                university_logo_url, conference, division, team_name,
                office_location, office_hours, achievements,
                scholarship_budget, annual_cost_per_player,
                created_at, updated_at
        `;

        const result = await query<CoachProfileRow>(updateQuery, values);

        if (result.length === 0) {
            logger.error('Coach not found for update', { coachId });
            throw new Error(coachNotFound);
        }

        const updatedCoach = transformCoachData(result[0]);

        logger.debug('Coach profile updated successfully', { coachId });
        return updatedCoach;
    } catch (error) {
        logger.error('Failed to update coach profile', { coachId }, error instanceof Error ? error : new Error('Unknown error'));

        // Re-throw specific error messages
        if (error instanceof Error && error.message === coachNotFound) {
            throw error;
        }

        throw new Error('Failed to update coach profile');
    }
}

/**
 * Transform database coach row to CoachProfile structure
 *
 * @param coach - The database coach row
 * @returns CoachProfile - The transformed coach profile data
 */
function transformCoachData(coach: CoachProfileRow): CoachProfile {
    // Generate initials from first and last name
    const initials = `${coach.first_name.charAt(0)}${coach.last_name.charAt(0)}`.toUpperCase();

    // Parse achievements from JSONB
    let achievements;
    if (coach.achievements) {
        try {
            achievements = typeof coach.achievements === 'string'
                ? JSON.parse(coach.achievements)
                : coach.achievements;
        } catch (error) {
            logger.error('Failed to parse achievements JSON', {}, error instanceof Error ? error : new Error('Unknown error'));
            achievements = [];
        }
    }

    return {
        id: coach.id,
        firstName: coach.first_name,
        lastName: coach.last_name,
        initials,
        email: coach.email,
        phone: coach.phone || undefined,
        university: coach.current_organization || undefined,
        position: coach.position_title || undefined,
        sport: coach.sport || undefined,
        yearsExperience: coach.years_experience || undefined,
        profileImage: coach.profile_image_url || undefined,
        teamWebsiteUrl: coach.team_website_url || undefined,
        universityLogoUrl: coach.university_logo_url || undefined,
        conference: coach.conference || undefined,
        division: coach.division || undefined,
        teamName: coach.team_name || undefined,
        officeLocation: coach.office_location || undefined,
        officeHours: coach.office_hours || undefined,
        scholarshipBudget: coach.scholarship_budget ? parseFloat(coach.scholarship_budget) : undefined,
        annualCostPerPlayer: coach.annual_cost_per_player ? parseFloat(coach.annual_cost_per_player) : undefined,
        achievements: achievements || undefined,
        createdAt: new Date(coach.created_at),
        updatedAt: new Date(coach.updated_at),
    };
}
