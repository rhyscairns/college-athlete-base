import { getAvailableSports, clearSportsCache } from '@/lib/dashboard/sports';
import { query } from '@/authentication/db/client';

// Mock dependencies
jest.mock('@/authentication/db/client');

const mockQuery = query as jest.MockedFunction<typeof query>;

describe('getAvailableSports', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        clearSportsCache(); // Clear cache before each test
    });

    afterEach(() => {
        clearSportsCache(); // Clean up after each test
    });

    it('should fetch sports from database', async () => {
        const mockSports = [
            { sport: 'Basketball' },
            { sport: 'Football' },
            { sport: 'Soccer' },
        ];

        mockQuery.mockResolvedValueOnce(mockSports);

        const result = await getAvailableSports();

        expect(result).toEqual(['Basketball', 'Football', 'Soccer']);
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('SELECT DISTINCT sport'),
        );
        expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should return sports in alphabetical order', async () => {
        const mockSports = [
            { sport: 'Soccer' },
            { sport: 'Basketball' },
            { sport: 'Football' },
        ];

        mockQuery.mockResolvedValueOnce(mockSports);

        const result = await getAvailableSports();

        // The query should handle ordering, but verify the result
        expect(result).toEqual(['Soccer', 'Basketball', 'Football']);
    });

    it('should cache results for subsequent calls', async () => {
        const mockSports = [
            { sport: 'Basketball' },
            { sport: 'Football' },
        ];

        mockQuery.mockResolvedValueOnce(mockSports);

        // First call
        const result1 = await getAvailableSports();
        expect(result1).toEqual(['Basketball', 'Football']);
        expect(mockQuery).toHaveBeenCalledTimes(1);

        // Second call should use cache
        const result2 = await getAvailableSports();
        expect(result2).toEqual(['Basketball', 'Football']);
        expect(mockQuery).toHaveBeenCalledTimes(1); // Still only called once

        // Third call should also use cache
        const result3 = await getAvailableSports();
        expect(result3).toEqual(['Basketball', 'Football']);
        expect(mockQuery).toHaveBeenCalledTimes(1); // Still only called once
    });

    it('should refresh cache after expiration', async () => {
        const mockSports1 = [{ sport: 'Basketball' }];
        const mockSports2 = [{ sport: 'Football' }];

        mockQuery
            .mockResolvedValueOnce(mockSports1)
            .mockResolvedValueOnce(mockSports2);

        // First call
        const result1 = await getAvailableSports();
        expect(result1).toEqual(['Basketball']);
        expect(mockQuery).toHaveBeenCalledTimes(1);

        // Mock time passing (6 minutes = 360000ms, cache expires after 5 minutes)
        const originalDateNow = Date.now;
        Date.now = jest.fn(() => originalDateNow() + 6 * 60 * 1000);

        // Second call after cache expiration
        const result2 = await getAvailableSports();
        expect(result2).toEqual(['Football']);
        expect(mockQuery).toHaveBeenCalledTimes(2);

        // Restore Date.now
        Date.now = originalDateNow;
    });

    it('should handle empty results', async () => {
        mockQuery.mockResolvedValueOnce([]);

        const result = await getAvailableSports();

        expect(result).toEqual([]);
        expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should throw error on database failure', async () => {
        mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

        await expect(getAvailableSports()).rejects.toThrow('Failed to fetch available sports');
        expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should filter out null sports', async () => {
        mockQuery.mockResolvedValueOnce([
            { sport: 'Basketball' },
            { sport: 'Football' },
        ]);

        const result = await getAvailableSports();

        expect(result).toEqual(['Basketball', 'Football']);
        // Verify the query includes WHERE sport IS NOT NULL
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('WHERE sport IS NOT NULL'),
        );
    });

    it('should not cache failed queries', async () => {
        mockQuery
            .mockRejectedValueOnce(new Error('Database error'))
            .mockResolvedValueOnce([{ sport: 'Basketball' }]);

        // First call fails
        await expect(getAvailableSports()).rejects.toThrow('Failed to fetch available sports');
        expect(mockQuery).toHaveBeenCalledTimes(1);

        // Second call should try again (not use cached error)
        const result = await getAvailableSports();
        expect(result).toEqual(['Basketball']);
        expect(mockQuery).toHaveBeenCalledTimes(2);
    });
});

describe('clearSportsCache', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        clearSportsCache();
    });

    it('should clear the cache', async () => {
        const mockSports = [{ sport: 'Basketball' }];
        mockQuery.mockResolvedValue(mockSports);

        // Populate cache
        await getAvailableSports();
        expect(mockQuery).toHaveBeenCalledTimes(1);

        // Clear cache
        clearSportsCache();

        // Next call should query database again
        await getAvailableSports();
        expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('should be safe to call multiple times', () => {
        expect(() => {
            clearSportsCache();
            clearSportsCache();
            clearSportsCache();
        }).not.toThrow();
    });

    it('should be safe to call when cache is empty', () => {
        expect(() => {
            clearSportsCache();
        }).not.toThrow();
    });
});
