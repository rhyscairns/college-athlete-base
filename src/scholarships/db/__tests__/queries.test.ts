/**
 * Unit tests for scholarship DB query helpers
 * @jest-environment node
 */

import * as dbClient from '@/authentication/db/client';
import {
    getScholarshipsByCoach,
    getScholarshipsByPlayer,
    getScholarshipByCoachAndPlayer,
    createScholarship,
    updateScholarship,
} from '../queries';

jest.mock('@/authentication/db/client');
jest.mock('@/lib/logger');

const mockQuery = dbClient.query as jest.MockedFunction<typeof dbClient.query>;

const COACH_ID = 'coach-uuid-111';
const PLAYER_ID = 'player-uuid-222';
const SCHOLARSHIP_ID = 'scholarship-uuid-333';

const mockRow = {
    id: SCHOLARSHIP_ID,
    coach_id: COACH_ID,
    player_id: PLAYER_ID,
    status: 'pending',
    school_name: 'State University',
    sport: 'Basketball',
    scholarship_amount: '5000.00',
    required_gpa: '3.50',
    division: 'Division I',
    start_year: 2025,
    duration_years: 4,
    notes: 'Full ride',
    counter_amount: null,
    counter_gpa: null,
    counter_notes: null,
    player_first_name: 'Alice',
    player_last_name: 'Smith',
    player_email: 'alice@example.com',
    coach_first_name: 'Bob',
    coach_last_name: 'Jones',
    coach_university: 'State University',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
};

const expectedScholarship = {
    id: SCHOLARSHIP_ID,
    coachId: COACH_ID,
    playerId: PLAYER_ID,
    status: 'pending',
    schoolName: 'State University',
    sport: 'Basketball',
    scholarshipAmount: 5000,
    requiredGpa: 3.5,
    division: 'Division I',
    startYear: 2025,
    durationYears: 4,
    notes: 'Full ride',
    counterAmount: null,
    counterGpa: null,
    counterNotes: null,
    playerFirstName: 'Alice',
    playerLastName: 'Smith',
    playerEmail: 'alice@example.com',
    coachFirstName: 'Bob',
    coachLastName: 'Jones',
    coachUniversity: 'State University',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
};

beforeEach(() => {
    jest.clearAllMocks();
});

// ─── getScholarshipsByCoach ──────────────────────────────────────────────────

describe('getScholarshipsByCoach', () => {
    it('should return mapped scholarships for a coach', async () => {
        mockQuery.mockResolvedValueOnce([mockRow]);

        const result = await getScholarshipsByCoach(COACH_ID);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(expectedScholarship);
    });

    it('should return an empty array when coach has no scholarships', async () => {
        mockQuery.mockResolvedValueOnce([]);

        const result = await getScholarshipsByCoach(COACH_ID);

        expect(result).toEqual([]);
    });

    it('should query by coach_id', async () => {
        mockQuery.mockResolvedValueOnce([]);

        await getScholarshipsByCoach(COACH_ID);

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('WHERE s.coach_id = $1'),
            [COACH_ID]
        );
    });

    it('should JOIN players table', async () => {
        mockQuery.mockResolvedValueOnce([]);

        await getScholarshipsByCoach(COACH_ID);

        const sql = (mockQuery.mock.calls[0][0] as string).toLowerCase();
        expect(sql).toContain('join players');
    });

    it('should propagate database errors', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        await expect(getScholarshipsByCoach(COACH_ID)).rejects.toThrow('DB error');
    });

    it('should parse decimal fields as floats', async () => {
        mockQuery.mockResolvedValueOnce([{ ...mockRow, scholarship_amount: '12500.99', required_gpa: '3.75' }]);

        const result = await getScholarshipsByCoach(COACH_ID);

        expect(result[0].scholarshipAmount).toBe(12500.99);
        expect(result[0].requiredGpa).toBe(3.75);
    });
});

// ─── getScholarshipsByPlayer ─────────────────────────────────────────────────

describe('getScholarshipsByPlayer', () => {
    it('should return mapped scholarships for a player', async () => {
        mockQuery.mockResolvedValueOnce([mockRow]);

        const result = await getScholarshipsByPlayer(PLAYER_ID);

        expect(result).toHaveLength(1);
        expect(result[0].playerId).toBe(PLAYER_ID);
    });

    it('should return an empty array when player has no offers', async () => {
        mockQuery.mockResolvedValueOnce([]);

        const result = await getScholarshipsByPlayer(PLAYER_ID);

        expect(result).toEqual([]);
    });

    it('should query by player_id', async () => {
        mockQuery.mockResolvedValueOnce([]);

        await getScholarshipsByPlayer(PLAYER_ID);

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('WHERE s.player_id = $1'),
            [PLAYER_ID]
        );
    });

    it('should JOIN coaches table', async () => {
        mockQuery.mockResolvedValueOnce([]);

        await getScholarshipsByPlayer(PLAYER_ID);

        const sql = (mockQuery.mock.calls[0][0] as string).toLowerCase();
        expect(sql).toContain('join coaches');
    });

    it('should propagate database errors', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        await expect(getScholarshipsByPlayer(PLAYER_ID)).rejects.toThrow('DB error');
    });
});

// ─── getScholarshipByCoachAndPlayer ─────────────────────────────────────────

describe('getScholarshipByCoachAndPlayer', () => {
    it('should return a scholarship when found', async () => {
        mockQuery.mockResolvedValueOnce([mockRow]);

        const result = await getScholarshipByCoachAndPlayer(COACH_ID, PLAYER_ID);

        expect(result).toEqual(expectedScholarship);
    });

    it('should return null when no scholarship exists', async () => {
        mockQuery.mockResolvedValueOnce([]);

        const result = await getScholarshipByCoachAndPlayer(COACH_ID, PLAYER_ID);

        expect(result).toBeNull();
    });

    it('should query with both coach_id and player_id', async () => {
        mockQuery.mockResolvedValueOnce([mockRow]);

        await getScholarshipByCoachAndPlayer(COACH_ID, PLAYER_ID);

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('WHERE s.coach_id = $1 AND s.player_id = $2'),
            [COACH_ID, PLAYER_ID]
        );
    });

    it('should JOIN both players and coaches tables', async () => {
        mockQuery.mockResolvedValueOnce([]);

        await getScholarshipByCoachAndPlayer(COACH_ID, PLAYER_ID);

        const sql = (mockQuery.mock.calls[0][0] as string).toLowerCase();
        expect(sql).toContain('join players');
        expect(sql).toContain('join coaches');
    });

    it('should propagate database errors', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        await expect(getScholarshipByCoachAndPlayer(COACH_ID, PLAYER_ID)).rejects.toThrow('DB error');
    });
});

// ─── createScholarship ───────────────────────────────────────────────────────

describe('createScholarship', () => {
    const createData = {
        coachId: COACH_ID,
        playerId: PLAYER_ID,
        schoolName: 'State University',
        sport: 'Basketball',
        scholarshipAmount: 5000,
        requiredGpa: 3.5,
        division: 'Division I',
        startYear: 2025,
        durationYears: 4,
        notes: 'Full ride',
    };

    it('should insert and return the mapped scholarship', async () => {
        mockQuery.mockResolvedValueOnce([mockRow]);

        const result = await createScholarship(createData);

        expect(result).toEqual(expectedScholarship);
    });

    it('should call INSERT INTO scholarships', async () => {
        mockQuery.mockResolvedValueOnce([mockRow]);

        await createScholarship(createData);

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO scholarships'),
            expect.any(Array)
        );
    });

    it('should pass all required fields as parameters', async () => {
        mockQuery.mockResolvedValueOnce([mockRow]);

        await createScholarship(createData);

        expect(mockQuery).toHaveBeenCalledWith(
            expect.any(String),
            [COACH_ID, PLAYER_ID, 'State University', 'Basketball', 5000, 3.5, 'Division I', 2025, 4, 'Full ride']
        );
    });

    it('should use null for optional fields when not provided', async () => {
        mockQuery.mockResolvedValueOnce([{ ...mockRow, division: null, start_year: null, duration_years: null, notes: null }]);

        await createScholarship({ coachId: COACH_ID, playerId: PLAYER_ID, schoolName: 'U', sport: 'Soccer', scholarshipAmount: 1000, requiredGpa: 3.0 });

        expect(mockQuery).toHaveBeenCalledWith(
            expect.any(String),
            [COACH_ID, PLAYER_ID, 'U', 'Soccer', 1000, 3.0, null, null, null, null]
        );
    });

    it('should propagate database errors', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        await expect(createScholarship(createData)).rejects.toThrow('DB error');
    });
});

// ─── updateScholarship ───────────────────────────────────────────────────────

describe('updateScholarship', () => {
    it('should update provided fields and return the updated scholarship', async () => {
        mockQuery.mockResolvedValueOnce([{ ...mockRow, status: 'accepted' }]);

        const result = await updateScholarship(SCHOLARSHIP_ID, { status: 'accepted' });

        expect(result?.status).toBe('accepted');
    });

    it('should call UPDATE scholarships with the correct id', async () => {
        mockQuery.mockResolvedValueOnce([mockRow]);

        await updateScholarship(SCHOLARSHIP_ID, { notes: 'Updated notes' });

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE scholarships'),
            expect.arrayContaining([SCHOLARSHIP_ID])
        );
    });

    it('should return null when scholarship is not found', async () => {
        mockQuery.mockResolvedValueOnce([]);

        const result = await updateScholarship('nonexistent-id', { status: 'rejected' });

        expect(result).toBeNull();
    });

    it('should handle counter offer fields', async () => {
        const counterRow = { ...mockRow, status: 'countered', counter_amount: '4500.00', counter_gpa: '3.25', counter_notes: 'Please increase' };
        mockQuery.mockResolvedValueOnce([counterRow]);

        const result = await updateScholarship(SCHOLARSHIP_ID, {
            status: 'countered',
            counterAmount: 4500,
            counterGpa: 3.25,
            counterNotes: 'Please increase',
        });

        expect(result?.status).toBe('countered');
        expect(result?.counterAmount).toBe(4500);
        expect(result?.counterGpa).toBe(3.25);
        expect(result?.counterNotes).toBe('Please increase');
    });

    it('should fetch current record when no fields are provided', async () => {
        mockQuery.mockResolvedValueOnce([mockRow]);

        const result = await updateScholarship(SCHOLARSHIP_ID, {});

        expect(result).toEqual(expectedScholarship);
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('SELECT * FROM scholarships WHERE id = $1'),
            [SCHOLARSHIP_ID]
        );
    });

    it('should propagate database errors', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        await expect(updateScholarship(SCHOLARSHIP_ID, { status: 'accepted' })).rejects.toThrow('DB error');
    });
});
