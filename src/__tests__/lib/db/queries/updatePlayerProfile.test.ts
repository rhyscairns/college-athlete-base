/**
 * @jest-environment node
 * 
 * Unit tests for updatePlayerProfile database function
 */

import { updatePlayerProfile } from '@/profile/player/lib/db/queries';
import { query } from '@/authentication/db/client';
import { logger } from '@/lib/logger';

// Mock dependencies
jest.mock('@/authentication/db/client');
jest.mock('@/lib/logger');

const mockQuery = query as jest.MockedFunction<typeof query>;

describe('updatePlayerProfile', () => {
    const testPlayerId = '123e4567-e89b-12d3-a456-426614174000';

    beforeEach(() => {
        jest.clearAllMocks();
        mockQuery.mockResolvedValue([]);
    });

    it('should update sport field', async () => {
        const updates = { sport: 'Soccer' };

        await updatePlayerProfile(testPlayerId, updates);

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE players'),
            expect.arrayContaining(['Soccer', testPlayerId])
        );
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('sport = $1'),
            expect.any(Array)
        );
    });

    it('should update position field', async () => {
        const updates = { position: 'Forward' };

        await updatePlayerProfile(testPlayerId, updates);

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE players'),
            expect.arrayContaining(['Forward', testPlayerId])
        );
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('position = $1'),
            expect.any(Array)
        );
    });

    it('should update both sport and position', async () => {
        const updates = {
            sport: 'Soccer',
            position: 'Goalkeeper',
        };

        await updatePlayerProfile(testPlayerId, updates);

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE players'),
            expect.arrayContaining(['Soccer', 'Goalkeeper', testPlayerId])
        );
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringMatching(/sport = \$1.*position = \$2/),
            expect.any(Array)
        );
    });

    it('should handle empty string for sport', async () => {
        const updates = { sport: '' };

        await updatePlayerProfile(testPlayerId, updates);

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE players'),
            expect.arrayContaining(['', testPlayerId])
        );
    });

    it('should handle empty string for position', async () => {
        const updates = { position: '' };

        await updatePlayerProfile(testPlayerId, updates);

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE players'),
            expect.arrayContaining(['', testPlayerId])
        );
    });

    it('should handle undefined sport and position', async () => {
        const updates = {
            firstName: 'John',
            sport: undefined,
            position: undefined,
        };

        await updatePlayerProfile(testPlayerId, updates);

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('first_name = $1'),
            expect.arrayContaining(['John', testPlayerId])
        );
        expect(mockQuery).toHaveBeenCalledWith(
            expect.not.stringContaining('sport'),
            expect.any(Array)
        );
        expect(mockQuery).toHaveBeenCalledWith(
            expect.not.stringContaining('position'),
            expect.any(Array)
        );
    });

    it('should update firstName and lastName', async () => {
        const updates = {
            firstName: 'John',
            lastName: 'Doe',
        };

        await updatePlayerProfile(testPlayerId, updates);

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('first_name = $1'),
            expect.arrayContaining(['John', 'Doe', testPlayerId])
        );
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('last_name = $2'),
            expect.any(Array)
        );
    });

    it('should update GPA from academic object', async () => {
        const updates = {
            academic: {
                gpa: 3.8,
                gpaScale: '4.0 Scale',
                coursework: [],
            },
        };

        await updatePlayerProfile(testPlayerId, updates);

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('gpa = $1'),
            expect.arrayContaining(['3.8', testPlayerId])
        );
    });

    it('should update test scores as JSON', async () => {
        const updates = {
            academic: {
                gpa: 3.5,
                gpaScale: '4.0 Scale',
                satScore: 1400,
                satMath: 700,
                satReading: 700,
                actScore: 32,
                coursework: [],
            },
        };

        await updatePlayerProfile(testPlayerId, updates);

        const expectedTestScores = JSON.stringify({
            satScore: 1400,
            satMath: 700,
            satReading: 700,
            actScore: 32,
        });

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('test_scores = $'),
            expect.arrayContaining([expectedTestScores, testPlayerId])
        );
    });

    it('should include updated_at timestamp', async () => {
        const updates = { sport: 'Soccer' };

        await updatePlayerProfile(testPlayerId, updates);

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('updated_at = NOW()'),
            expect.any(Array)
        );
    });

    it('should return true on successful update', async () => {
        const updates = { sport: 'Soccer' };

        const result = await updatePlayerProfile(testPlayerId, updates);

        expect(result).toBe(true);
    });

    it('should return true when no fields to update', async () => {
        const updates = {};

        const result = await updatePlayerProfile(testPlayerId, updates);

        expect(result).toBe(true);
        expect(mockQuery).not.toHaveBeenCalled();
    });

    it('should throw error on database failure', async () => {
        mockQuery.mockRejectedValue(new Error('Database error'));

        const updates = { sport: 'Soccer' };

        await expect(updatePlayerProfile(testPlayerId, updates)).rejects.toThrow(
            'Failed to update player profile'
        );
    });

    it('should log debug messages', async () => {
        const updates = { sport: 'Soccer', position: 'Forward' };

        await updatePlayerProfile(testPlayerId, updates);

        expect(logger.debug).toHaveBeenCalledWith(
            'Updating player profile',
            expect.objectContaining({ playerId: testPlayerId })
        );
        expect(logger.debug).toHaveBeenCalledWith(
            'Player profile updated successfully',
            expect.any(Object)
        );
    });

    it('should log error on failure', async () => {
        mockQuery.mockRejectedValue(new Error('Database error'));

        const updates = { sport: 'Soccer' };

        try {
            await updatePlayerProfile(testPlayerId, updates);
        } catch (error) {
            // Expected error
        }

        expect(logger.error).toHaveBeenCalledWith(
            'Failed to update player profile',
            expect.any(Object),
            expect.any(Error)
        );
    });

    it('should handle multiple fields in correct order', async () => {
        const updates = {
            firstName: 'John',
            lastName: 'Doe',
            sport: 'Soccer',
            position: 'Forward',
            academic: {
                gpa: 3.5,
                gpaScale: '4.0 Scale',
                coursework: [],
            },
        };

        await updatePlayerProfile(testPlayerId, updates);

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringMatching(/first_name = \$1.*last_name = \$2.*sport = \$3.*position = \$4.*gpa = \$5/),
            expect.arrayContaining(['John', 'Doe', 'Soccer', 'Forward', '3.5', testPlayerId])
        );
    });
});
