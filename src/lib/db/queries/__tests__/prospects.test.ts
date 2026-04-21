/**
 * Unit tests for prospects DB query module
 * @jest-environment node
 */

import * as dbClient from '@/authentication/db/client';
import {
    addProspect,
    removeProspect,
    getProspectPlayerIds,
    getProspectsWithPlayerData,
} from '../prospects';

jest.mock('@/authentication/db/client');
jest.mock('@/lib/logger');

const mockQuery = dbClient.query as jest.MockedFunction<typeof dbClient.query>;

const COACH_ID = 'coach-uuid-111';
const PLAYER_ID = 'player-uuid-222';

describe('prospects DB queries', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ─── addProspect ────────────────────────────────────────────────────────────

    describe('addProspect', () => {
        const mockRow = {
            id: 'prospect-uuid-1',
            coach_id: COACH_ID,
            player_id: PLAYER_ID,
            created_at: new Date('2024-01-01T00:00:00Z'),
        };

        it('should insert a row and return a mapped ProspectRow', async () => {
            mockQuery.mockResolvedValueOnce([mockRow]);

            const result = await addProspect(COACH_ID, PLAYER_ID);

            expect(result).toEqual({
                id: 'prospect-uuid-1',
                coachId: COACH_ID,
                playerId: PLAYER_ID,
                createdAt: mockRow.created_at,
            });
        });

        it('should call query with correct SQL and parameters', async () => {
            mockQuery.mockResolvedValueOnce([mockRow]);

            await addProspect(COACH_ID, PLAYER_ID);

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO coach_prospects'),
                [COACH_ID, PLAYER_ID]
            );
        });

        it('should throw on duplicate insert (unique constraint violation)', async () => {
            const duplicateError = new Error(
                'duplicate key value violates unique constraint "coach_prospects_coach_id_player_id_key"'
            );
            mockQuery.mockRejectedValueOnce(duplicateError);

            await expect(addProspect(COACH_ID, PLAYER_ID)).rejects.toThrow(
                'duplicate key value violates unique constraint'
            );
        });

        it('should propagate unexpected database errors', async () => {
            mockQuery.mockRejectedValueOnce(new Error('connection refused'));

            await expect(addProspect(COACH_ID, PLAYER_ID)).rejects.toThrow('connection refused');
        });
    });

    // ─── removeProspect ─────────────────────────────────────────────────────────

    describe('removeProspect', () => {
        it('should return true when a row is deleted', async () => {
            mockQuery.mockResolvedValueOnce([{ id: 'prospect-uuid-1' }]);

            const result = await removeProspect(COACH_ID, PLAYER_ID);

            expect(result).toBe(true);
        });

        it('should return false when no row is found (non-existent entry)', async () => {
            mockQuery.mockResolvedValueOnce([]);

            const result = await removeProspect(COACH_ID, PLAYER_ID);

            expect(result).toBe(false);
        });

        it('should call query with correct SQL and parameters', async () => {
            mockQuery.mockResolvedValueOnce([{ id: 'prospect-uuid-1' }]);

            await removeProspect(COACH_ID, PLAYER_ID);

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM coach_prospects'),
                [COACH_ID, PLAYER_ID]
            );
        });

        it('should propagate database errors', async () => {
            mockQuery.mockRejectedValueOnce(new Error('DB error'));

            await expect(removeProspect(COACH_ID, PLAYER_ID)).rejects.toThrow('DB error');
        });
    });

    // ─── getProspectPlayerIds ────────────────────────────────────────────────────

    describe('getProspectPlayerIds', () => {
        it('should return an array of player ID strings', async () => {
            mockQuery.mockResolvedValueOnce([
                { player_id: 'player-1' },
                { player_id: 'player-2' },
            ]);

            const result = await getProspectPlayerIds(COACH_ID);

            expect(result).toEqual(['player-1', 'player-2']);
        });

        it('should return an empty array when the coach has no prospects', async () => {
            mockQuery.mockResolvedValueOnce([]);

            const result = await getProspectPlayerIds(COACH_ID);

            expect(result).toEqual([]);
        });

        it('should query by coach_id', async () => {
            mockQuery.mockResolvedValueOnce([]);

            await getProspectPlayerIds(COACH_ID);

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('WHERE coach_id = $1'),
                [COACH_ID]
            );
        });

        it('should propagate database errors', async () => {
            mockQuery.mockRejectedValueOnce(new Error('DB error'));

            await expect(getProspectPlayerIds(COACH_ID)).rejects.toThrow('DB error');
        });
    });

    // ─── getProspectsWithPlayerData ──────────────────────────────────────────────

    describe('getProspectsWithPlayerData', () => {
        const mockDbRow = {
            player_id: PLAYER_ID,
            first_name: 'Alice',
            last_name: 'Smith',
            sport: 'Soccer',
            position: 'Forward',
            gpa: '3.75',
            high_school: 'Lincoln High',
            scholarship_amount: '5000.00',
            highlight_video_url: 'https://youtube.com/watch?v=abc',
            video_title: 'Highlights 2024',
            profile_image_url: '/images/alice.jpg',
        };

        it('should return mapped ProspectPlayerData array', async () => {
            mockQuery.mockResolvedValueOnce([mockDbRow]);

            const result = await getProspectsWithPlayerData(COACH_ID);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                playerId: PLAYER_ID,
                firstName: 'Alice',
                lastName: 'Smith',
                sport: 'Soccer',
                position: 'Forward',
                gpa: 3.75,
                highSchool: 'Lincoln High',
                scholarshipAmount: 5000,
                videoUrl: 'https://youtube.com/watch?v=abc',
                videoTitle: 'Highlights 2024',
                profileImage: '/images/alice.jpg',
            });
        });

        it('should return null for fields with no data', async () => {
            const nullRow = {
                ...mockDbRow,
                sport: null,
                position: null,
                gpa: null,
                high_school: null,
                scholarship_amount: null,
                highlight_video_url: null,
                video_title: null,
                profile_image_url: null,
            };
            mockQuery.mockResolvedValueOnce([nullRow]);

            const result = await getProspectsWithPlayerData(COACH_ID);

            expect(result[0]).toMatchObject({
                sport: null,
                position: null,
                gpa: null,
                highSchool: null,
                scholarshipAmount: null,
                videoUrl: null,
                videoTitle: null,
                profileImage: null,
            });
        });

        it('should parse gpa and scholarshipAmount as floats', async () => {
            mockQuery.mockResolvedValueOnce([{ ...mockDbRow, gpa: '3.50', scholarship_amount: '12500.99' }]);

            const result = await getProspectsWithPlayerData(COACH_ID);

            expect(result[0].gpa).toBe(3.5);
            expect(result[0].scholarshipAmount).toBe(12500.99);
        });

        it('should return an empty array when the coach has no prospects', async () => {
            mockQuery.mockResolvedValueOnce([]);

            const result = await getProspectsWithPlayerData(COACH_ID);

            expect(result).toEqual([]);
        });

        it('should query by coach_id', async () => {
            mockQuery.mockResolvedValueOnce([]);

            await getProspectsWithPlayerData(COACH_ID);

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('WHERE cp.coach_id = $1'),
                [COACH_ID]
            );
        });

        it('should JOIN coach_prospects with players', async () => {
            mockQuery.mockResolvedValueOnce([]);

            await getProspectsWithPlayerData(COACH_ID);

            const sql = (mockQuery.mock.calls[0][0] as string).toLowerCase();
            expect(sql).toContain('join players');
        });

        it('should propagate database errors', async () => {
            mockQuery.mockRejectedValueOnce(new Error('DB error'));

            await expect(getProspectsWithPlayerData(COACH_ID)).rejects.toThrow('DB error');
        });
    });
});
