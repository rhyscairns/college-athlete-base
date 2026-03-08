/**
 * Dashboard positions helper functions
 * Provides utilities for fetching available positions by sport from the database
 */

import { query } from '@/authentication/db/client';

/**
 * Get all available positions for a specific sport
 * 
 * @param sport - The sport to filter positions by
 * @returns Promise<string[]> - Array of position names for the specified sport
 * @throws Error if database query fails
 */
export async function getPositionsBySport(sport: string): Promise<string[]> {
    try {
        // If sport is "All Sports" or empty, return all positions
        if (!sport || sport === 'All Sports') {
            const result = await query<{ position: string }>(
                `SELECT DISTINCT position 
                 FROM players 
                 WHERE position IS NOT NULL 
                 ORDER BY position ASC`
            );

            return result.map(row => row.position);
        }

        // Otherwise, filter by specific sport
        const result = await query<{ position: string }>(
            `SELECT DISTINCT position 
             FROM players 
             WHERE sport = $1 AND position IS NOT NULL 
             ORDER BY position ASC`,
            [sport]
        );

        return result.map(row => row.position);
    } catch (error) {
        console.error('Error fetching positions by sport:', error);
        throw new Error('Failed to fetch positions');
    }
}
