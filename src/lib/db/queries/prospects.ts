import { query } from '@/authentication/db/client';
import { logger } from '@/lib/logger';
import type { ProspectPlayerData } from '@/prospects/types';

export type { ProspectPlayerData };

export interface ProspectRow {
    id: string;
    coachId: string;
    playerId: string;
    createdAt: Date;
}

/**
 * Add a player to a coach's prospects list.
 * Throws a conflict error if the entry already exists.
 */
export async function addProspect(coachId: string, playerId: string): Promise<ProspectRow> {
    logger.debug('Adding prospect', { coachId, playerId });

    const rows = await query<{
        id: string;
        coach_id: string;
        player_id: string;
        created_at: Date;
    }>(
        `INSERT INTO coach_prospects (coach_id, player_id)
     VALUES ($1, $2)
     RETURNING id, coach_id, player_id, created_at`,
        [coachId, playerId]
    );

    const row = rows[0];
    return {
        id: row.id,
        coachId: row.coach_id,
        playerId: row.player_id,
        createdAt: row.created_at,
    };
}

/**
 * Remove a player from a coach's prospects list.
 * Returns true if a row was deleted, false if it didn't exist.
 */
export async function removeProspect(coachId: string, playerId: string): Promise<boolean> {
    logger.debug('Removing prospect', { coachId, playerId });

    const rows = await query<{ id: string }>(
        `DELETE FROM coach_prospects
     WHERE coach_id = $1 AND player_id = $2
     RETURNING id`,
        [coachId, playerId]
    );

    return rows.length > 0;
}

/**
 * Get all player IDs that a coach has favorited.
 */
export async function getProspectPlayerIds(coachId: string): Promise<string[]> {
    logger.debug('Getting prospect player IDs', { coachId });

    const rows = await query<{ player_id: string }>(
        `SELECT player_id FROM coach_prospects WHERE coach_id = $1`,
        [coachId]
    );

    return rows.map((r) => r.player_id);
}

/**
 * Get all favorited players for a coach with their profile data.
 * JOINs coach_prospects with players to return enriched player info.
 */
export async function getProspectsWithPlayerData(coachId: string): Promise<ProspectPlayerData[]> {
    logger.debug('Getting prospects with player data', { coachId });

    const rows = await query<{
        player_id: string;
        first_name: string;
        last_name: string;
        sport: string | null;
        position: string | null;
        gpa: string | null;
        high_school: string | null;
        scholarship_amount: string | null;
        highlight_video_url: string | null;
        video_title: string | null;
        profile_image_url: string | null;
    }>(
        `SELECT
       p.id            AS player_id,
       p.first_name,
       p.last_name,
       p.sport,
       p.position,
       p.gpa,
       p.high_school,
       p.scholarship_amount,
       p.highlight_video_url,
       p.video_title,
       p.profile_image_url
     FROM coach_prospects cp
     JOIN players p ON p.id = cp.player_id
     WHERE cp.coach_id = $1
     ORDER BY cp.created_at DESC`,
        [coachId]
    );

    return rows.map((row) => ({
        playerId: row.player_id,
        firstName: row.first_name,
        lastName: row.last_name,
        sport: row.sport ?? null,
        position: row.position ?? null,
        gpa: row.gpa !== null ? parseFloat(row.gpa) : null,
        highSchool: row.high_school ?? null,
        scholarshipAmount: row.scholarship_amount != null ? parseFloat(row.scholarship_amount) : null,
        videoUrl: row.highlight_video_url ?? null,
        videoTitle: row.video_title ?? null,
        profileImage: row.profile_image_url ?? null,
    }));
}
