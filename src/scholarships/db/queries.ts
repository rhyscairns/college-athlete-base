import { query } from '@/authentication/db/client';
import { logger } from '@/lib/logger';
import type { Scholarship, ScholarshipFormData } from '@/scholarships/types';

// Raw DB row shape returned by queries that JOIN players/coaches
interface ScholarshipRow {
    id: string;
    coach_id: string;
    player_id: string;
    status: string;
    school_name: string;
    sport: string;
    scholarship_amount: string;
    required_gpa: string;
    division: string | null;
    start_year: number | null;
    duration_years: number | null;
    notes: string | null;
    counter_amount: string | null;
    counter_gpa: string | null;
    counter_notes: string | null;
    player_first_name?: string;
    player_last_name?: string;
    player_email?: string;
    coach_first_name?: string;
    coach_last_name?: string;
    coach_university?: string;
    created_at: string;
    updated_at: string;
}

function mapRow(row: ScholarshipRow): Scholarship {
    return {
        id: row.id,
        coachId: row.coach_id,
        playerId: row.player_id,
        status: row.status as Scholarship['status'],
        schoolName: row.school_name,
        sport: row.sport,
        scholarshipAmount: parseFloat(row.scholarship_amount),
        requiredGpa: parseFloat(row.required_gpa),
        division: row.division,
        startYear: row.start_year,
        durationYears: row.duration_years,
        notes: row.notes,
        counterAmount: row.counter_amount !== null ? parseFloat(row.counter_amount) : null,
        counterGpa: row.counter_gpa !== null ? parseFloat(row.counter_gpa) : null,
        counterNotes: row.counter_notes,
        playerFirstName: row.player_first_name,
        playerLastName: row.player_last_name,
        playerEmail: row.player_email,
        coachFirstName: row.coach_first_name,
        coachLastName: row.coach_last_name,
        coachUniversity: row.coach_university,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

/**
 * Get all scholarships sent by a coach, joined with player display data.
 */
export async function getScholarshipsByCoach(coachId: string): Promise<Scholarship[]> {
    logger.debug('Getting scholarships by coach', { coachId });

    const rows = await query<ScholarshipRow>(
        `SELECT
            s.*,
            p.first_name  AS player_first_name,
            p.last_name   AS player_last_name,
            p.email       AS player_email
         FROM scholarships s
         JOIN players p ON p.id = s.player_id
         WHERE s.coach_id = $1
         ORDER BY s.created_at DESC`,
        [coachId]
    );

    return rows.map(mapRow);
}

/**
 * Get all scholarship offers received by a player, joined with coach display data.
 */
export async function getScholarshipsByPlayer(playerId: string): Promise<Scholarship[]> {
    logger.debug('Getting scholarships by player', { playerId });

    const rows = await query<ScholarshipRow>(
        `SELECT
            s.*,
            c.first_name          AS coach_first_name,
            c.last_name           AS coach_last_name,
            c.current_organization AS coach_university
         FROM scholarships s
         JOIN coaches c ON c.id = s.coach_id
         WHERE s.player_id = $1
         ORDER BY s.created_at DESC`,
        [playerId]
    );

    return rows.map(mapRow);
}

/**
 * Get a single scholarship by coach + player pair.
 * Returns null if no record exists.
 */
export async function getScholarshipByCoachAndPlayer(
    coachId: string,
    playerId: string
): Promise<Scholarship | null> {
    logger.debug('Getting scholarship by coach and player', { coachId, playerId });

    const rows = await query<ScholarshipRow>(
        `SELECT
            s.*,
            p.first_name          AS player_first_name,
            p.last_name           AS player_last_name,
            p.email               AS player_email,
            c.first_name          AS coach_first_name,
            c.last_name           AS coach_last_name,
            c.current_organization AS coach_university
         FROM scholarships s
         JOIN players p ON p.id = s.player_id
         JOIN coaches c ON c.id = s.coach_id
         WHERE s.coach_id = $1 AND s.player_id = $2`,
        [coachId, playerId]
    );

    return rows.length > 0 ? mapRow(rows[0]) : null;
}

export interface CreateScholarshipData {
    coachId: string;
    playerId: string;
    schoolName: string;
    sport: string;
    scholarshipAmount: number;
    requiredGpa: number;
    division?: string | null;
    startYear?: number | null;
    durationYears?: number | null;
    notes?: string | null;
}

/**
 * Insert a new scholarship record with status 'pending'.
 */
export async function createScholarship(data: CreateScholarshipData): Promise<Scholarship> {
    logger.debug('Creating scholarship', { coachId: data.coachId, playerId: data.playerId });

    const rows = await query<ScholarshipRow>(
        `INSERT INTO scholarships (
            coach_id, player_id, school_name, sport,
            scholarship_amount, required_gpa, division,
            start_year, duration_years, notes
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
            data.coachId,
            data.playerId,
            data.schoolName,
            data.sport,
            data.scholarshipAmount,
            data.requiredGpa,
            data.division ?? null,
            data.startYear ?? null,
            data.durationYears ?? null,
            data.notes ?? null,
        ]
    );

    return mapRow(rows[0]);
}

export interface UpdateScholarshipData {
    schoolName?: string;
    sport?: string;
    scholarshipAmount?: number;
    requiredGpa?: number;
    division?: string | null;
    startYear?: number | null;
    durationYears?: number | null;
    notes?: string | null;
    status?: Scholarship['status'];
    counterAmount?: number | null;
    counterGpa?: number | null;
    counterNotes?: string | null;
}

/**
 * Update an existing scholarship record by ID.
 * Only provided fields are updated; updated_at is refreshed via DB trigger.
 */
export async function updateScholarship(
    id: string,
    data: UpdateScholarshipData
): Promise<Scholarship | null> {
    logger.debug('Updating scholarship', { id });

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const fieldMap: Record<keyof UpdateScholarshipData, string> = {
        schoolName: 'school_name',
        sport: 'sport',
        scholarshipAmount: 'scholarship_amount',
        requiredGpa: 'required_gpa',
        division: 'division',
        startYear: 'start_year',
        durationYears: 'duration_years',
        notes: 'notes',
        status: 'status',
        counterAmount: 'counter_amount',
        counterGpa: 'counter_gpa',
        counterNotes: 'counter_notes',
    };

    for (const [key, column] of Object.entries(fieldMap) as [keyof UpdateScholarshipData, string][]) {
        if (key in data) {
            setClauses.push(`${column} = $${paramIndex}`);
            values.push(data[key] ?? null);
            paramIndex++;
        }
    }

    if (setClauses.length === 0) {
        // Nothing to update — fetch and return current record
        const rows = await query<ScholarshipRow>(
            `SELECT * FROM scholarships WHERE id = $1`,
            [id]
        );
        return rows.length > 0 ? mapRow(rows[0]) : null;
    }

    values.push(id);
    const rows = await query<ScholarshipRow>(
        `UPDATE scholarships
         SET ${setClauses.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING *`,
        values as unknown[]
    );

    return rows.length > 0 ? mapRow(rows[0]) : null;
}
