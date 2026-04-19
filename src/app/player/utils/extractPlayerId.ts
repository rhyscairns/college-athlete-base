/**
 * Extracts player ID from the URL path.
 *
 * Supported pattern:
 * - /player/[playerId]/...
 *
 * @param pathname - The URL pathname to parse
 * @returns The extracted player ID, or empty string if not found
 *
 * @example
 * ```ts
 * extractPlayerId('/player/player-123/dashboard') // 'player-123'
 * extractPlayerId('/other/path') // ''
 * ```
 */
export function extractPlayerId(pathname: string): string {
    const pathSegments = pathname.split('/').filter(Boolean);

    if (pathSegments[0] !== 'player') {
        return '';
    }

    return pathSegments[1] ?? '';
}
