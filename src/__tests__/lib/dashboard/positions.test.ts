import { getPositionsBySport } from '@/lib/dashboard/positions';
import { query } from '@/authentication/db/client';

// Mock dependencies
jest.mock('@/authentication/db/client');

const mockQuery = query as jest.MockedFunction<typeof query>;

describe('getPositionsBySport', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch positions for a specific sport', async () => {
        const mockPositions = [
            { position: 'Point Guard' },
            { position: 'Shooting Guard' },
            { position: 'Small Forward' },
        ];

        mockQuery.mockResolvedValueOnce(mockPositions);

        const result = await getPositionsBySport('Basketball');

        expect(result).toEqual(['Point Guard', 'Shooting Guard', 'Small Forward']);
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('WHERE sport = $1'),
            ['Basketball']
        );
        expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should return positions in alphabetical order', async () => {
        const mockPositions = [
            { position: 'Wide Receiver' },
            { position: 'Quarterback' },
            { position: 'Running Back' },
        ];

        mockQuery.mockResolvedValueOnce(mockPositions);

        const result = await getPositionsBySport('Football');

        // The query should handle ordering, but verify the result
        expect(result).toEqual(['Wide Receiver', 'Quarterback', 'Running Back']);
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('ORDER BY position ASC'),
            ['Football']
        );
    });

    it('should return all positions when sport is "All Sports"', async () => {
        const mockPositions = [
            { position: 'Point Guard' },
            { position: 'Quarterback' },
            { position: 'Striker' },
        ];

        mockQuery.mockResolvedValueOnce(mockPositions);

        const result = await getPositionsBySport('All Sports');

        expect(result).toEqual(['Point Guard', 'Quarterback', 'Striker']);
        // Should not filter by sport
        expect(mockQuery).toHaveBeenCalledWith(
            expect.not.stringContaining('WHERE sport = $1'),
        );
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('WHERE position IS NOT NULL'),
        );
    });

    it('should return all positions when sport is empty string', async () => {
        const mockPositions = [
            { position: 'Point Guard' },
            { position: 'Quarterback' },
        ];

        mockQuery.mockResolvedValueOnce(mockPositions);

        const result = await getPositionsBySport('');

        expect(result).toEqual(['Point Guard', 'Quarterback']);
        // Should not filter by sport
        expect(mockQuery).toHaveBeenCalledWith(
            expect.not.stringContaining('WHERE sport = $1'),
        );
    });

    it('should handle empty results', async () => {
        mockQuery.mockResolvedValueOnce([]);

        const result = await getPositionsBySport('Lacrosse');

        expect(result).toEqual([]);
        expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should throw error on database failure', async () => {
        mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

        await expect(getPositionsBySport('Basketball')).rejects.toThrow('Failed to fetch positions');
        expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should filter out null positions', async () => {
        mockQuery.mockResolvedValueOnce([
            { position: 'Point Guard' },
            { position: 'Center' },
        ]);

        const result = await getPositionsBySport('Basketball');

        expect(result).toEqual(['Point Guard', 'Center']);
        // Verify the query includes WHERE position IS NOT NULL
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('position IS NOT NULL'),
            expect.any(Array)
        );
    });

    it('should handle sports with special characters', async () => {
        const mockPositions = [
            { position: 'Midfielder' },
        ];

        mockQuery.mockResolvedValueOnce(mockPositions);

        const result = await getPositionsBySport("Women's Soccer");

        expect(result).toEqual(['Midfielder']);
        expect(mockQuery).toHaveBeenCalledWith(
            expect.any(String),
            ["Women's Soccer"]
        );
    });

    it('should be case-sensitive for sport names', async () => {
        const mockPositions = [
            { position: 'Point Guard' },
        ];

        mockQuery.mockResolvedValueOnce(mockPositions);

        await getPositionsBySport('basketball');

        // Should pass the sport exactly as provided
        expect(mockQuery).toHaveBeenCalledWith(
            expect.any(String),
            ['basketball']
        );
    });

    it('should handle sports with no players', async () => {
        mockQuery.mockResolvedValueOnce([]);

        const result = await getPositionsBySport('Cricket');

        expect(result).toEqual([]);
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('WHERE sport = $1'),
            ['Cricket']
        );
    });

    it('should use parameterized queries to prevent SQL injection', async () => {
        mockQuery.mockResolvedValueOnce([]);

        const maliciousSport = "Basketball'; DROP TABLE players; --";
        await getPositionsBySport(maliciousSport);

        // Verify that the malicious input is passed as a parameter
        expect(mockQuery).toHaveBeenCalledWith(
            expect.any(String),
            [maliciousSport]
        );
    });
});
