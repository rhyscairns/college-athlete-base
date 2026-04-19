/**
 * Extracts player ID from various URL path patterns
 * 
 * Supported patterns:
 * - /player/[playerId]/dashboard
 * - /player/[playerId]/profile
 * - /player/dashboard/[playerId]/...
 * 
 * @param pathname - The URL pathname to parse
 * @returns The extracted player ID, or empty string if not found
 * 
 * @example
 * ```ts
 * extractPlayerId('/player/player-123/dashboard') // 'player-123'
 * extractPlayerId('/player/dashboard/player-456/profile') // 'player-456'
 * extractPlayerId('/other/path') // ''
 * ```
 */
export function extractPlayerId(pathname: string): string {
    const pathSegments = pathname.split('/').filter(Boolean);

    // Validate that path starts with 'player'
    if (pathSegments[0] !== 'player') {
        return '';
    }

    // Pattern 1: /player/[playerId]/dashboard or /player/[playerId]/profile
    if (pathSegments[1] && pathSegments[1] !== 'dashboard') {
        return pathSegments[1];
    }

    // Pattern 2: /player/dashboard/[playerId]/...
    if (pathSegments[1] === 'dashboard' && pathSegments[2]) {
        return pathSegments[2];
    }

    return '';
}
