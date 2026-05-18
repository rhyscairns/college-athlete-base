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
    highlight_video_url: string | null;
    video_title: string | null;
    video_description: string | null;
    video_thumbnail_url: string | null;
    recruitment_status: string | null;
    has_accepted_offer: boolean;
    created_at: Date;
    updated_at: Date;
    // Physical / class info
    height_feet: number | null;
    height_inches: number | null;
    weight_lbs: number | null;
    grad_year: number | null;
    high_school: string | null;
    // Extended JSON data
    profile_extended: Record<string, unknown> | null;
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
                p.id, p.first_name, p.last_name, p.email, p.sex, p.sport, p.position,
                p.gpa, p.country, p.state, p.region, p.scholarship_amount, p.test_scores,
                p.date_of_birth,
                EXTRACT(YEAR FROM AGE(p.date_of_birth))::INTEGER as age,
                p.profile_image_url,
                p.highlight_video_url, p.video_title, p.video_description, p.video_thumbnail_url,
                p.height_feet, p.height_inches, p.weight_lbs, p.grad_year, p.high_school,
                p.profile_extended,
                p.created_at, p.updated_at,
                EXISTS (
                    SELECT 1 FROM scholarships s
                    WHERE s.player_id = p.id AND s.status = 'accepted'
                ) AS has_accepted_offer
            FROM players p
            WHERE p.id = $1`,
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

    // Parse extended profile data
    const ext = player.profile_extended ?? {};
    const extContact = (ext.contact ?? {}) as Record<string, unknown>;
    const extStats = (ext.stats ?? {}) as Record<string, string | number>;
    const extAchievements = (ext.achievements ?? []) as PlayerProfile['achievements'];
    const extTestimonials = (ext.coachTestimonials ?? []) as PlayerProfile['coachTestimonials'];
    const extAcademic = (ext.academic ?? {}) as Record<string, unknown>;

    // Build height string from feet/inches columns
    const heightStr = (player.height_feet != null && player.height_inches != null)
        ? `${player.height_feet}'${player.height_inches}"`
        : '';

    // Build weight string from lbs column
    const weightStr = player.weight_lbs != null ? `${player.weight_lbs} lbs` : '';

    // Transform to PlayerProfile structure
    return {
        id: player.id,
        firstName: player.first_name,
        lastName: player.last_name,
        initials: initials.toUpperCase(),
        classYear: player.grad_year ? String(player.grad_year) : '',
        position: player.position,
        school: player.high_school ?? '',
        location,
        height: heightStr,
        weight: weightStr,
        age: player.age || undefined,
        dateOfBirth: player.date_of_birth || undefined,
        profileImage: player.profile_image_url || '',
        performanceMetrics: [],

        academic: {
            ncaaEligibilityCenter: (extAcademic.ncaaEligibilityCenter as string) ?? '',
            ncaaQualifier: (extAcademic.ncaaQualifier as boolean) ?? false,
            gpa: parseFloat(player.gpa),
            gpaScale: (extAcademic.gpaScale as string) ?? '4.0 Scale',
            satScore: satScore || 0,
            satMath: satMath || 0,
            satReading: satReading || 0,
            actScore: actScore,
            classRank: (extAcademic.classRank as string) ?? '',
            classRankDetail: (extAcademic.classRankDetail as string) ?? '',
            coursework: (extAcademic.coursework as string[]) ?? [],
        },

        videos: player.highlight_video_url ? [{
            id: '1',
            url: player.highlight_video_url,
            title: player.video_title || 'Highlight Video',
            description: player.video_description || '',
            thumbnail: player.video_thumbnail_url || '',
            duration: '',
            isFeatured: true,
        }] : [],
        coachTestimonials: extTestimonials,
        achievements: extAchievements,

        contact: {
            email: player.email,
            phone: (extContact.phone as string) ?? '',
            parentGuardianName: (extContact.parentGuardianName as string) ?? '',
            parentGuardianPhone: (extContact.parentGuardianPhone as string) ?? '',
            parentGuardianEmail: (extContact.parentGuardianEmail as string) ?? '',
            socialMedia: {
                twitter: ((extContact.socialMedia as Record<string, string>)?.twitter) ?? '',
                instagram: ((extContact.socialMedia as Record<string, string>)?.instagram) ?? '',
                youtube: ((extContact.socialMedia as Record<string, string>)?.youtube) ?? '',
                tiktok: ((extContact.socialMedia as Record<string, string>)?.tiktok) ?? '',
            },
            preferredContactMethod: (extContact.preferredContactMethod as string) ?? '',
            headCoach: {
                name: ((extContact.headCoach as Record<string, string>)?.name) ?? '',
                email: ((extContact.headCoach as Record<string, string>)?.email) ?? '',
                phone: ((extContact.headCoach as Record<string, string>)?.phone) ?? '',
            },
        },

        stats: Object.keys(extStats).length > 0 ? extStats : {
            'Receiving Yards': '',
            'Touchdowns': '',
            'Receptions': '',
            'Yards Per Catch': '',
            'Longest Reception': '',
        },

        recruitmentStatus: player.recruitment_status ?? 'open',
        commitmentStatus: null,
        hasAcceptedOffer: player.has_accepted_offer === true,
    };
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

        const updateFields: string[] = [];
        const values: unknown[] = [];
        let paramIndex = 1;

        // --- Dedicated columns ---
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

        // Height: stored as feet + inches columns
        if (updates.height !== undefined) {
            const match = updates.height.match(/^(\d+)'(\d+)"/);
            if (match) {
                updateFields.push('height_feet = $' + paramIndex++);
                values.push(parseInt(match[1], 10));
                updateFields.push('height_inches = $' + paramIndex++);
                values.push(parseInt(match[2], 10));
            }
        }

        // Weight: stored as weight_lbs column
        if (updates.weight !== undefined) {
            const lbs = parseInt(updates.weight, 10);
            if (!isNaN(lbs)) {
                updateFields.push('weight_lbs = $' + paramIndex++);
                values.push(lbs);
            }
        }

        // Class year: stored as grad_year column
        if (updates.classYear !== undefined) {
            const yr = parseInt(updates.classYear, 10);
            updateFields.push('grad_year = $' + paramIndex++);
            values.push(isNaN(yr) ? null : yr);
        }

        // School: stored as high_school column
        if (updates.school !== undefined) {
            updateFields.push('high_school = $' + paramIndex++);
            values.push(updates.school || null);
        }

        // Videos: persist featured video to dedicated columns
        if (updates.videos !== undefined) {
            const featured = updates.videos.find(v => v.isFeatured) ?? updates.videos[0] ?? null;
            updateFields.push(`highlight_video_url = $${paramIndex++}`);
            values.push(featured?.url || null);
            updateFields.push(`video_title = $${paramIndex++}`);
            values.push(featured?.title || null);
            updateFields.push(`video_description = $${paramIndex++}`);
            values.push(featured?.description || null);
            updateFields.push(`video_thumbnail_url = $${paramIndex++}`);
            values.push(featured?.thumbnail || null);
        }

        // Test scores: stored as JSON string in test_scores column
        if (updates.academic) {
            const { satScore, satMath, satReading, actScore } = updates.academic;
            if (satScore !== undefined || satMath !== undefined || satReading !== undefined || actScore !== undefined) {
                updateFields.push('test_scores = $' + paramIndex++);
                values.push(JSON.stringify({ satScore, satMath, satReading, actScore }));
            }
        }

        // --- profile_extended JSONB: merge incoming data with existing ---
        // Collect all fields that go into the JSON column
        const extUpdates: Record<string, unknown> = {};

        if (updates.contact !== undefined) {
            extUpdates.contact = updates.contact;
        }
        if (updates.stats !== undefined) {
            extUpdates.stats = updates.stats;
        }
        if (updates.achievements !== undefined) {
            extUpdates.achievements = updates.achievements;
        }
        if (updates.coachTestimonials !== undefined) {
            extUpdates.coachTestimonials = updates.coachTestimonials;
        }
        if (updates.academic !== undefined) {
            // Store the non-score academic fields in extended data
            const { gpa: _gpa, satScore: _sat, satMath: _satM, satReading: _satR, actScore: _act, ...restAcademic } = updates.academic;
            if (Object.keys(restAcademic).length > 0) {
                extUpdates.academic = restAcademic;
            }
        }

        if (Object.keys(extUpdates).length > 0) {
            // Use jsonb_strip_nulls + || operator to merge into existing data
            updateFields.push(`profile_extended = COALESCE(profile_extended, '{}'::jsonb) || $${paramIndex++}::jsonb`);
            values.push(JSON.stringify(extUpdates));
        }

        if (updateFields.length === 0) {
            logger.debug('No fields to update', { playerId });
            return true;
        }

        updateFields.push('updated_at = NOW()');
        values.push(playerId);

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
