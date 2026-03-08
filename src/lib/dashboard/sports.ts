/**
 * Dashboard sports helper functions
 * Provides utilities for fetching available sports from the database
 */

import { query } from '@/authentication/db/client';

// Cache for sports data
let sportsCache: string[] | null = null;
let sportsCacheTimestamp: number = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get all available sports from the database
 * Results are cached for 5 minutes to improve performance
 * 
 * @returns Promise<string[]> - Array of sport names
 * @throws Error if database query fails
 */
export async function getAvailableSports(): Promise<string[]> {
    const now = Date.now();

    // Return cached data if still valid
    if (sportsCache && (now - sportsCacheTimestamp) < CACHE_DURATION_MS) {
        return sportsCache;
    }

    try {
        const result = await query<{ sport: string }>(
            `SELECT DISTINCT sport 
             FROM players 
             WHERE sport IS NOT NULL 
             ORDER BY sport ASC`
        );

        const sports = result.map(row => row.sport);

        // Update cache
        sportsCache = sports;
        sportsCacheTimestamp = now;

        return sports;
    } catch (error) {
        console.error('Error fetching available sports:', error);
        throw new Error('Failed to fetch available sports');
    }
}

/**
 * Clear the sports cache
 * Useful for testing or when data needs to be refreshed immediately
 */
export function clearSportsCache(): void {
    sportsCache = null;
    sportsCacheTimestamp = 0;
}
