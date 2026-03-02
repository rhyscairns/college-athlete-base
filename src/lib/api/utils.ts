/**
 * Shared API utilities for route handlers
 */

/**
 * Validate UUID format
 * 
 * @param uuid - String to validate as UUID
 * @returns True if valid UUID format, false otherwise
 */
export function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

/**
 * Generate a unique request ID for logging and tracing
 * 
 * @returns UUID string for request tracking
 */
export function generateRequestId(): string {
    return crypto.randomUUID();
}

/**
 * Calculate execution time from start timestamp
 * 
 * @param startTime - Start time in milliseconds
 * @returns Execution time in milliseconds
 */
export function getExecutionTime(startTime: number): number {
    return Date.now() - startTime;
}

/**
 * Format execution time as string with 'ms' suffix
 * 
 * @param startTime - Start time in milliseconds
 * @returns Formatted execution time string (e.g., "123ms")
 */
export function formatExecutionTime(startTime: number): string {
    return `${getExecutionTime(startTime)}ms`;
}
