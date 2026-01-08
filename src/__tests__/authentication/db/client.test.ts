import { PoolClient } from 'pg';

// Create mock pool instance that will be reused
const mockPool = {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
};

// Mock the logger
jest.mock('@/lib/logger', () => ({
    logger: {
        info: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

// Mock the pg module before importing the client
jest.mock('pg', () => {
    return {
        Pool: jest.fn(() => mockPool),
    };
});

// Import after mocking
import { Pool } from 'pg';
import { getPool, query, getClient, checkHealth, closePool } from '@/authentication/db/client';
import { logger } from '@/lib/logger';

describe('Database Client', () => {
    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        // Set up environment variables
        process.env.DATABASE_HOST = 'localhost';
        process.env.DATABASE_PORT = '5432';
        process.env.DATABASE_NAME = 'test_db';
        process.env.DATABASE_USER = 'test_user';
        process.env.DATABASE_PASSWORD = 'test_password';
        process.env.DATABASE_SSL = 'false';
        process.env.DATABASE_MAX_CONNECTIONS = '20';
    });

    afterEach(async () => {
        // Clean up environment variables
        delete process.env.DATABASE_HOST;
        delete process.env.DATABASE_PORT;
        delete process.env.DATABASE_NAME;
        delete process.env.DATABASE_USER;
        delete process.env.DATABASE_PASSWORD;
        delete process.env.DATABASE_SSL;
        delete process.env.DATABASE_MAX_CONNECTIONS;

        // Close pool to reset singleton
        await closePool();
    });

    describe('getPool', () => {
        it('should create a pool with correct configuration', () => {
            const pool = getPool();

            expect(Pool).toHaveBeenCalledWith({
                host: 'localhost',
                port: 5432,
                database: 'test_db',
                user: 'test_user',
                password: 'test_password',
                ssl: false,
                max: 20,
                min: 2,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
                allowExitOnIdle: false,
                statement_timeout: 10000,
            });

            expect(pool).toBeDefined();
        });

        it('should use SSL when DATABASE_SSL is true', () => {
            process.env.DATABASE_SSL = 'true';

            getPool();

            expect(Pool).toHaveBeenCalledWith(
                expect.objectContaining({
                    ssl: { rejectUnauthorized: false },
                })
            );
        });

        it('should use default values for optional configuration', () => {
            delete process.env.DATABASE_PORT;
            delete process.env.DATABASE_MAX_CONNECTIONS;

            getPool();

            expect(Pool).toHaveBeenCalledWith(
                expect.objectContaining({
                    port: 5432,
                    max: 20,
                })
            );
        });

        it('should return the same pool instance on subsequent calls', async () => {
            const pool1 = getPool();
            const pool2 = getPool();

            expect(pool1).toBe(pool2);
            expect(Pool).toHaveBeenCalledTimes(1);
        });

        it('should register error handler on pool', () => {
            const pool = getPool();

            expect(mockPool.on).toHaveBeenCalledWith('error', expect.any(Function));
        });
    });

    describe('query', () => {
        it('should execute a query and return rows', async () => {
            const mockRows = [{ id: 1, name: 'Test' }];
            mockPool.query.mockResolvedValue({ rows: mockRows });

            const result = await query('SELECT * FROM users');

            expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users', undefined);
            expect(result).toEqual(mockRows);
        });

        it('should execute a query with parameters', async () => {
            const mockRows = [{ id: 1, email: 'test@example.com' }];
            mockPool.query.mockResolvedValue({ rows: mockRows });

            const result = await query('SELECT * FROM users WHERE email = $1', ['test@example.com']);

            expect(mockPool.query).toHaveBeenCalledWith(
                'SELECT * FROM users WHERE email = $1',
                ['test@example.com']
            );
            expect(result).toEqual(mockRows);
        });

        it('should throw error when query fails', async () => {
            const error = new Error('Query failed');
            mockPool.query.mockRejectedValue(error);

            await expect(query('SELECT * FROM users')).rejects.toThrow('Query failed');
        });
    });

    describe('getClient', () => {
        it('should return a client from the pool', async () => {
            const mockClient = { release: jest.fn() } as unknown as PoolClient;
            mockPool.connect.mockResolvedValue(mockClient);

            const client = await getClient();

            expect(mockPool.connect).toHaveBeenCalled();
            expect(client).toBe(mockClient);
        });

        it('should throw error when connection fails', async () => {
            const error = new Error('Connection failed');
            mockPool.connect.mockRejectedValue(error);

            await expect(getClient()).rejects.toThrow('Connection failed');
        });
    });

    describe('checkHealth', () => {
        it('should return true when database is healthy', async () => {
            mockPool.query.mockResolvedValue({ rows: [{ health: 1 }] });

            const isHealthy = await checkHealth();

            expect(mockPool.query).toHaveBeenCalledWith('SELECT 1 as health');
            expect(isHealthy).toBe(true);
        });

        it('should return false when query fails', async () => {
            mockPool.query.mockRejectedValue(new Error('Connection error'));

            const isHealthy = await checkHealth();

            expect(isHealthy).toBe(false);
        });

        it('should return false when query returns no rows', async () => {
            mockPool.query.mockResolvedValue({ rows: [] });

            const isHealthy = await checkHealth();

            expect(isHealthy).toBe(false);
        });

        it('should log error when health check fails', async () => {
            const error = new Error('Connection error');
            mockPool.query.mockRejectedValue(error);

            await checkHealth();

            expect(logger.error).toHaveBeenCalledWith(
                'Database health check failed',
                {},
                error
            );
        });
    });

    describe('closePool', () => {
        it('should close the pool', async () => {
            mockPool.end.mockResolvedValue(undefined);

            getPool(); // Create the pool
            await closePool();

            expect(mockPool.end).toHaveBeenCalled();
        });

        it('should handle closing when pool is null', async () => {
            // Should not throw
            await expect(closePool()).resolves.toBeUndefined();
        });

        it('should allow creating a new pool after closing', async () => {
            mockPool.end.mockResolvedValue(undefined);

            getPool(); // Create first pool
            await closePool();

            jest.clearAllMocks();

            getPool(); // Create second pool

            expect(Pool).toHaveBeenCalledTimes(1);
        });
    });

    describe('Error Handling', () => {
        it('should handle pool error event', () => {
            getPool();

            // Get the error handler that was registered
            const errorHandler = mockPool.on.mock.calls.find(
                (call: any[]) => call[0] === 'error'
            )?.[1];

            expect(errorHandler).toBeDefined();

            // Simulate an error
            const error = new Error('Unexpected pool error');
            errorHandler(error);

            expect(logger.error).toHaveBeenCalledWith(
                'Unexpected database pool error',
                {},
                error
            );
        });
    });

    describe('Environment Configuration', () => {
        it('should handle missing environment variables gracefully', () => {
            delete process.env.DATABASE_HOST;
            delete process.env.DATABASE_NAME;

            getPool();

            expect(Pool).toHaveBeenCalledWith(
                expect.objectContaining({
                    host: undefined,
                    database: undefined,
                })
            );
        });

        it('should parse numeric environment variables correctly', () => {
            process.env.DATABASE_PORT = '3306';
            process.env.DATABASE_MAX_CONNECTIONS = '50';

            getPool();

            expect(Pool).toHaveBeenCalledWith(
                expect.objectContaining({
                    port: 3306,
                    max: 50,
                })
            );
        });

        it('should handle invalid numeric values with defaults', () => {
            process.env.DATABASE_PORT = 'invalid';
            process.env.DATABASE_MAX_CONNECTIONS = 'invalid';

            getPool();

            expect(Pool).toHaveBeenCalledWith(
                expect.objectContaining({
                    port: NaN, // parseInt returns NaN for invalid strings
                    max: NaN,
                })
            );
        });
    });
});
