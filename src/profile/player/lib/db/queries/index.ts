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

        // TODO: In future phases, fetch related data from additional tables
        // const videos = await getPlayerVideos(playerId);
        // const achievements = await getPlayerAchievements(playerId);
        // const testimonials = await getPlayerTestimonials(playerId);

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
    const initials = `${player.first_name.charAt(0)}${player.last_name.charAt(0)}`.toUpperCase();

    // Format location string
    const location = player.state
        ? `${player.state}, ${player.country}`
        : player.region
            ? `${player.region}, ${player.country}`
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
    // Using type assertion since we're providing default values for missing fields
    return {
        id: player.id,
        firstName: player.first_name,
        lastName: player.last_name,
        initials,
        classYear: '', // Not in current DB schema - will be empty for now
        position: player.position,
        school: '', // Not in current DB schema - will be empty for now
        location,
        height: '', // Not in current DB schema - will be empty for now
        weight: '', // Not in current DB schema - will be empty for now
        age: 0, // Not in current DB schema - default to 0
        profileImage: '', // Not in current DB schema - empty string for now
        performanceMetrics: [], // Not in current DB schema - empty array for now

        academic: {
            ncaaEligibilityCenter: '', // Not in current DB schema
            ncaaQualifier: false, // Not in current DB schema - default to false
            gpa: parseFloat(player.gpa),
            gpaScale: '4.0 Scale',
            satScore: satScore || 0, // Default to 0 if not available
            satMath: satMath || 0, // Default to 0 if not available
            satReading: satReading || 0, // Default to 0 if not available
            actScore: actScore, // Can be undefined
            classRank: '', // Not in current DB schema
            classRankDetail: '', // Not in current DB schema
            coursework: [],
        },

        videos: [], // Will be populated from separate table in future
        coachTestimonials: [], // Will be populated from separate table in future
        achievements: [], // Will be populated from separate table in future

        contact: {
            email: player.email,
            phone: '', // Not in current DB schema
            parentGuardianName: '', // Not in current DB schema
            parentGuardianPhone: '', // Not in current DB schema
            parentGuardianEmail: '', // Not in current DB schema
            socialMedia: {
                twitter: '', // Not in current DB schema
                instagram: '', // Not in current DB schema
                youtube: '', // Not in current DB schema
                tiktok: '', // Not in current DB schema
            },
            preferredContactMethod: '', // Not in current DB schema
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
        }, // Not in current DB schema - empty values for now

        recruitmentStatus: 'open',
        commitmentStatus: null,
    } as PlayerProfile;
}

/**
 * Placeholder function for fetching player videos
 * TODO: Implement when videos table is created
 *
 * @param playerId - The UUID of the player
 * @returns Promise<Video[]> - Array of player videos
 */
// async function getPlayerVideos(playerId: string): Promise<Video[]> {
//     const rows = await query<any>(
//         `SELECT id, title, description, url, thumbnail, duration, is_featured, created_at
//          FROM player_videos
//          WHERE player_id = $1
//          ORDER BY is_featured DESC, created_at DESC`,
//         [playerId]
//     );
//
//     return rows.map(row => ({
//         id: row.id,
//         title: row.title,
//         description: row.description,
//         url: row.url,
//         thumbnail: row.thumbnail,
//         duration: row.duration,
//         isFeatured: row.is_featured,
//         date: row.created_at,
//     }));
// }

/**
 * Placeholder function for fetching player achievements
 * TODO: Implement when achievements table is created
 *
 * @param playerId - The UUID of the player
 * @returns Promise<Achievement[]> - Array of player achievements
 */
// async function getPlayerAchievements(playerId: string): Promise<Achievement[]> {
//     const rows = await query<any>(
//         `SELECT id, icon, title, description, color, created_at
//          FROM player_achievements
//          WHERE player_id = $1
//          ORDER BY created_at DESC`,
//         [playerId]
//     );
//
//     return rows.map(row => ({
//         id: row.id,
//         icon: row.icon,
//         title: row.title,
//         description: row.description,
//         color: row.color,
//     }));
// }

/**
 * Placeholder function for fetching coach testimonials
 * TODO: Implement when testimonials table is created
 *
 * @param playerId - The UUID of the player
 * @returns Promise<Testimonial[]> - Array of coach testimonials
 */
// async function getPlayerTestimonials(playerId: string): Promise<Testimonial[]> {
//     const rows = await query<any>(
//         `SELECT id, quote, coach_name, coach_title, coach_organization, created_at
//          FROM coach_testimonials
//          WHERE player_id = $1
//          ORDER BY created_at DESC`,
//         [playerId]
//     );
//
//     return rows.map(row => ({
//         id: row.id,
//         quote: row.quote,
//         coachName: row.coach_name,
//         coachTitle: row.coach_title,
//         coachOrganization: row.coach_organization,
//     }));
// }
