/**
 * Simple in-memory cache for filter results
 * Uses LRU (Least Recently Used) eviction strategy
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

class FilterCache<T> {
    private cache: Map<string, CacheEntry<T>>;
    private maxSize: number;
    private ttl: number; // Time to live in milliseconds

    constructor(maxSize: number = 50, ttl: number = 5 * 60 * 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl;
    }

    /**
     * Generate a cache key from filter parameters
     */
    private generateKey(params: Record<string, any>): string {
        return JSON.stringify(params);
    }

    /**
     * Get cached data if it exists and is not expired
     */
    get(params: Record<string, any>): T | null {
        const key = this.generateKey(params);
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if entry has expired
        const now = Date.now();
        if (now - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }

        // Move to end (most recently used)
        this.cache.delete(key);
        this.cache.set(key, entry);

        return entry.data;
    }

    /**
     * Set cached data
     */
    set(params: Record<string, any>, data: T): void {
        const key = this.generateKey(params);

        // If cache is full, remove oldest entry (first in map)
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }

    /**
     * Clear all cached data
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache size
     */
    size(): number {
        return this.cache.size;
    }
}

// Export singleton instance for player filter results
export const playerFilterCache = new FilterCache<any>(50, 5 * 60 * 1000);
