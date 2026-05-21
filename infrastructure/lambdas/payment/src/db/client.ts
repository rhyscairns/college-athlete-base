import { Pool } from 'pg';

let pool: Pool | null = null;

/**
 * Returns a singleton PostgreSQL connection pool.
 * Reads connection config from environment variables injected by Secrets Manager.
 */
export function getPool(): Pool {
    if (!pool) {
        pool = new Pool({
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT || '5432', 10),
            database: process.env.DATABASE_NAME,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
            max: 5, // Lambda: keep pool small
            idleTimeoutMillis: 10000,
            connectionTimeoutMillis: 3000,
        });

        pool.on('error', (err) => {
            console.error('Unexpected DB pool error', err);
        });
    }

    return pool;
}

export async function query<T = Record<string, unknown>>(
    text: string,
    params?: unknown[]
): Promise<T[]> {
    const result = await getPool().query(text, params);
    return result.rows as T[];
}
