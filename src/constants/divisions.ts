/**
 * College athletic divisions constants
 */

export const DIVISIONS = [
    'NCAA D1',
    'NCAA D2',
    'NCAA D3',
    'NAIA',
    'NJCAA',
] as const;

export type Division = typeof DIVISIONS[number];

/**
 * Get all available division names
 * @returns Array of all division names
 */
export function getAllDivisions(): readonly string[] {
    return DIVISIONS;
}
