/**
 * Extracts player ID from the URL path.
 *
 * Supported patterns:
 * - /player/[playerId]/...          e.g. /player/abc123/dashboard
 * - /player/dashboard/[playerId]/... e.g. /player/dashboard/abc123/player-profile/...
 *
 * @param pathname - The URL pathname to parse
 * @returns The extracted player ID, or empty string if not found
 */
export function extractPlayerId(pathname: string): string {
    const pathSegments = pathname.split('/').filter(Boolean);

    if (pathSegments[0] !== 'player') {
        return '';
    }

    // /player/dashboard/[playerId]/...
    if (pathSegments[1] === 'dashboard') {
        return pathSegments[2] ?? '';
    }

    // /player/[playerId]/...
    return pathSegments[1] ?? '';
}
