import { Pool, PoolClient, PoolConfig } from 'pg';
import { logger } from '@/lib/logger';

let pool: Pool | null = null;

/**
 * Get or create a PostgreSQL connection pool
 * Uses environment variables for configuration
 */
export function getPool(): Pool {
    if (!pool) {
        const config: PoolConfig = {
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT || '5432', 10),
            database: process.env.DATABASE_NAME,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,

            // Connection pool optimization
            max: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '20', 10),
            min: parseInt(process.env.DATABASE_MIN_CONNECTIONS || '2', 10), // Keep minimum connections alive
            idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000', 10),
            connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '2000', 10),

            // Performance optimization
            allowExitOnIdle: false, // Keep pool alive for better performance

            // Statement timeout to prevent long-running queries
            statement_timeout: parseInt(process.env.DATABASE_STATEMENT_TIMEOUT || '10000', 10),
        };

        pool = new Pool(config);

        // Log pool creation
        logger.info('Database connection pool created', {
            host: config.host,
            port: config.port,
            database: config.database,
            maxConnections: config.max,
            minConnections: config.min,
            idleTimeout: config.idleTimeoutMillis,
            connectionTimeout: config.connectionTimeoutMillis,
            statementTimeout: config.statement_timeout,
            ssl: config.ssl !== false,
        });

        // Handle unexpected errors on idle clients
        pool.on('error', (err) => {
            logger.error('Unexpected database pool error', {}, err);
        });

        // Log pool events in debug mode
        pool.on('connect', (client) => {
            logger.debug('New database connection established');

            // Set session-level optimizations
            client.query('SET application_name = $1', ['college-athlete-base']).catch(() => { });
        });

        pool.on('remove', () => {
            logger.debug('Database connection removed from pool');
        });

        pool.on('acquire', () => {
            logger.debug('Database connection acquired from pool');
        });
    }

    return pool;
}

/**
 * Execute a query using the connection pool
 * @param text SQL query text
 * @param params Query parameters
 * @returns Query results
 */
export async function query<T = any>(
    text: string,
    params?: any[]
): Promise<T[]> {
    const startTime = Date.now();
    const pool = getPool();

    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - startTime;

        logger.debug('Database query executed', {
            duration: `${duration}ms`,
            rowCount: result.rowCount,
        });

        return result.rows;
    } catch (error) {
        const duration = Date.now() - startTime;
        logger.error('Database query failed', {
            duration: `${duration}ms`,
            query: text.substring(0, 100), // Log first 100 chars of query
        }, error instanceof Error ? error : new Error('Unknown query error'));
        throw error;
    }
}

/**
 * Get a client from the pool for transactions
 * Remember to release the client when done
 */
export async function getClient(): Promise<PoolClient> {
    const pool = getPool();
    return pool.connect();
}

/**
 * Check database connection health
 * @returns true if connection is healthy, false otherwise
 */
export async function checkHealth(): Promise<boolean> {
    try {
        const pool = getPool();
        const result = await pool.query('SELECT 1 as health');
        const isHealthy = result.rows.length > 0 && result.rows[0].health === 1;

        if (isHealthy) {
            logger.debug('Database health check passed');
        } else {
            logger.warn('Database health check returned unexpected result');
        }

        return isHealthy;
    } catch (error) {
        logger.error('Database health check failed', {}, error instanceof Error ? error : new Error('Unknown health check error'));
        return false;
    }
}

/**
 * Get connection pool statistics for monitoring
 * @returns Pool statistics including connection counts
 */
export function getPoolStats(): {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
    maxConnections: number;
} {
    const currentPool = getPool();

    return {
        // @ts-ignore - accessing internal pool properties
        totalCount: currentPool.totalCount || 0,
        // @ts-ignore
        idleCount: currentPool.idleCount || 0,
        // @ts-ignore
        waitingCount: currentPool.waitingCount || 0,
        maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '20', 10),
    };
}

/**
 * Close the connection pool
 * Should be called when shutting down the application
 */
export async function closePool(): Promise<void> {
    if (pool) {
        logger.info('Closing database connection pool');
        await pool.end();
        pool = null;
        logger.info('Database connection pool closed');
    }
}
