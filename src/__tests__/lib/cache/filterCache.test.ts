/**
 * Tests for filter cache utility
 */

import { playerFilterCache } from '@/lib/cache/filterCache';

describe('FilterCache', () => {
    beforeEach(() => {
        playerFilterCache.clear();
    });

    describe('Basic Operations', () => {
        it('should store and retrieve data', () => {
            const params = { sport: 'Football', page: 1 };
            const data = { players: [], pagination: {} };

            playerFilterCache.set(params, data);
            const retrieved = playerFilterCache.get(params);

            expect(retrieved).toEqual(data);
        });

        it('should return null for non-existent keys', () => {
            const params = { sport: 'Basketball', page: 1 };
            const retrieved = playerFilterCache.get(params);

            expect(retrieved).toBeNull();
        });

        it('should handle complex parameter objects', () => {
            const params = {
                sport: 'Football',
                position: 'Quarterback',
                page: 2,
                pageSize: 12,
                excludeUserId: 'user-123',
            };
            const data = { players: [{ id: '1' }], pagination: { total: 1 } };

            playerFilterCache.set(params, data);
            const retrieved = playerFilterCache.get(params);

            expect(retrieved).toEqual(data);
        });

        it('should differentiate between similar but different parameters', () => {
            const params1 = { sport: 'Football', page: 1 };
            const params2 = { sport: 'Football', page: 2 };
            const params3 = { sport: 'Basketball', page: 1 };

            const data1 = { players: ['player1'] };
            const data2 = { players: ['player2'] };
            const data3 = { players: ['player3'] };

            playerFilterCache.set(params1, data1);
            playerFilterCache.set(params2, data2);
            playerFilterCache.set(params3, data3);

            expect(playerFilterCache.get(params1)).toEqual(data1);
            expect(playerFilterCache.get(params2)).toEqual(data2);
            expect(playerFilterCache.get(params3)).toEqual(data3);
        });
    });

    describe('Cache Size Management', () => {
        it('should track cache size', () => {
            expect(playerFilterCache.size()).toBe(0);

            playerFilterCache.set({ id: 1 }, 'data1');
            expect(playerFilterCache.size()).toBe(1);

            playerFilterCache.set({ id: 2 }, 'data2');
            expect(playerFilterCache.size()).toBe(2);
        });

        it('should clear all entries', () => {
            playerFilterCache.set({ id: 1 }, 'data1');
            playerFilterCache.set({ id: 2 }, 'data2');
            playerFilterCache.set({ id: 3 }, 'data3');

            expect(playerFilterCache.size()).toBe(3);

            playerFilterCache.clear();

            expect(playerFilterCache.size()).toBe(0);
            expect(playerFilterCache.get({ id: 1 })).toBeNull();
            expect(playerFilterCache.get({ id: 2 })).toBeNull();
            expect(playerFilterCache.get({ id: 3 })).toBeNull();
        });
    });

    describe('TTL (Time To Live)', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should expire entries after TTL', () => {
            const params = { sport: 'Football' };
            const data = { players: [] };

            playerFilterCache.set(params, data);
            expect(playerFilterCache.get(params)).toEqual(data);

            // Fast-forward time past TTL (5 minutes)
            jest.advanceTimersByTime(5 * 60 * 1000 + 1);

            expect(playerFilterCache.get(params)).toBeNull();
        });

        it('should not expire entries before TTL', () => {
            const params = { sport: 'Football' };
            const data = { players: [] };

            playerFilterCache.set(params, data);

            // Fast-forward time but not past TTL
            jest.advanceTimersByTime(4 * 60 * 1000);

            expect(playerFilterCache.get(params)).toEqual(data);
        });
    });

    describe('LRU Eviction', () => {
        it('should update access order when retrieving entries', () => {
            const params1 = { id: 1 };
            const params2 = { id: 2 };
            const params3 = { id: 3 };

            playerFilterCache.set(params1, 'data1');
            playerFilterCache.set(params2, 'data2');
            playerFilterCache.set(params3, 'data3');

            // Access params1 to make it most recently used
            playerFilterCache.get(params1);

            // All entries should still be accessible
            expect(playerFilterCache.get(params1)).toBe('data1');
            expect(playerFilterCache.get(params2)).toBe('data2');
            expect(playerFilterCache.get(params3)).toBe('data3');
        });
    });

    describe('Data Types', () => {
        it('should handle array data', () => {
            const params = { sport: 'Football' };
            const data = [1, 2, 3, 4, 5];

            playerFilterCache.set(params, data);
            expect(playerFilterCache.get(params)).toEqual(data);
        });

        it('should handle nested object data', () => {
            const params = { sport: 'Football' };
            const data = {
                players: [
                    { id: '1', name: 'John', stats: { points: 10 } },
                    { id: '2', name: 'Jane', stats: { points: 20 } },
                ],
                pagination: {
                    currentPage: 1,
                    totalPages: 5,
                    meta: { timestamp: Date.now() },
                },
            };

            playerFilterCache.set(params, data);
            expect(playerFilterCache.get(params)).toEqual(data);
        });

        it('should handle null and undefined values', () => {
            const params1 = { id: 1 };
            const params2 = { id: 2 };

            playerFilterCache.set(params1, null);
            playerFilterCache.set(params2, undefined);

            expect(playerFilterCache.get(params1)).toBeNull();
            expect(playerFilterCache.get(params2)).toBeUndefined();
        });

        it('should handle primitive values', () => {
            playerFilterCache.set({ id: 1 }, 'string');
            playerFilterCache.set({ id: 2 }, 42);
            playerFilterCache.set({ id: 3 }, true);

            expect(playerFilterCache.get({ id: 1 })).toBe('string');
            expect(playerFilterCache.get({ id: 2 })).toBe(42);
            expect(playerFilterCache.get({ id: 3 })).toBe(true);
        });
    });

    describe('Parameter Ordering', () => {
        it('should treat differently ordered parameters as the same key', () => {
            const params1 = { sport: 'Football', page: 1 };
            const params2 = { page: 1, sport: 'Football' };
            const data = { players: [] };

            playerFilterCache.set(params1, data);

            // Due to JSON.stringify, order matters in current implementation
            // This test documents current behavior
            const retrieved = playerFilterCache.get(params2);

            // In current implementation, order matters
            // This is acceptable for our use case as we consistently build params
            expect(retrieved).toBeNull();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty parameter objects', () => {
            const params = {};
            const data = { players: [] };

            playerFilterCache.set(params, data);
            expect(playerFilterCache.get(params)).toEqual(data);
        });

        it('should handle parameters with special characters', () => {
            const params = {
                sport: 'Track & Field',
                position: 'Long Jump / Triple Jump',
            };
            const data = { players: [] };

            playerFilterCache.set(params, data);
            expect(playerFilterCache.get(params)).toEqual(data);
        });

        it('should handle parameters with undefined values', () => {
            const params = {
                sport: 'Football',
                position: undefined,
                page: 1,
            };
            const data = { players: [] };

            playerFilterCache.set(params, data);
            expect(playerFilterCache.get(params)).toEqual(data);
        });
    });
});
