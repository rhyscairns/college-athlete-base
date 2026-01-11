/**
 * @jest-environment node
 */
import { GET } from '@/app/api/health/route';

describe('/api/health', () => {
    // Ensure process methods are available before tests
    beforeAll(() => {
        // Mock process methods if they don't exist (shouldn't happen, but defensive)
        if (typeof process.uptime !== 'function') {
            process.uptime = jest.fn(() => 0) as any;
        }
        if (typeof process.memoryUsage !== 'function') {
            process.memoryUsage = jest.fn(() => ({
                rss: 100 * 1024 * 1024,
                heapTotal: 100 * 1024 * 1024,
                heapUsed: 50 * 1024 * 1024,
                external: 0,
                arrayBuffers: 0,
            })) as any;
        }
    });

    it('returns 200 status', async () => {
        const response = await GET();

        expect(response.status).toBe(200);
    });

    it('returns correct health check data', async () => {
        const response = await GET();
        const data = await response.json();

        expect(data).toHaveProperty('status');
        expect(['ok', 'degraded', 'error']).toContain(data.status);
        expect(data).toHaveProperty('timestamp');
    });

    it('includes timestamp in response', async () => {
        const response = await GET();
        const data = await response.json();

        expect(data.timestamp).toBeDefined();
        expect(typeof data.timestamp).toBe('string');
    });

    it('includes uptime in response', async () => {
        const response = await GET();
        const data = await response.json();

        expect(data).toHaveProperty('uptime');
        expect(typeof data.uptime).toBe('number');
        expect(data.uptime).toBeGreaterThanOrEqual(0);
    });

    it('includes version and environment', async () => {
        const response = await GET();
        const data = await response.json();

        expect(data).toHaveProperty('version');
        expect(data).toHaveProperty('environment');
        expect(typeof data.version).toBe('string');
        expect(typeof data.environment).toBe('string');
    });

    it('includes health checks', async () => {
        const response = await GET();
        const data = await response.json();

        expect(data).toHaveProperty('checks');
        expect(data.checks).toHaveProperty('server');
        expect(data.checks).toHaveProperty('memory');

        expect(data.checks.server).toHaveProperty('status');
        expect(data.checks.server).toHaveProperty('message');

        expect(data.checks.memory).toHaveProperty('status');
        expect(data.checks.memory).toHaveProperty('usage');
        expect(data.checks.memory).toHaveProperty('limit');
        expect(data.checks.memory).toHaveProperty('percentage');
    });

    it('memory check has valid values', async () => {
        const response = await GET();
        const data = await response.json();

        const { memory } = data.checks;
        expect(memory.usage).toBeGreaterThan(0);
        expect(memory.limit).toBeGreaterThan(0);
        expect(memory.percentage).toBeGreaterThanOrEqual(0);
        expect(memory.percentage).toBeLessThanOrEqual(100);
        expect(['ok', 'warning', 'error']).toContain(memory.status);
    });

    it('returns 503 status when health check fails', async () => {
        // Mock process.uptime to throw an error
        const originalUptime = process.uptime;
        process.uptime = jest.fn(() => {
            throw new Error('Process error');
        }) as any;

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(503);
        expect(data.status).toBe('error');
        expect(data).toHaveProperty('error');

        // Restore original function
        process.uptime = originalUptime;
    });

    it('handles non-Error exceptions', async () => {
        // Mock process.uptime to throw a non-Error
        const originalUptime = process.uptime;
        process.uptime = jest.fn(() => {
            throw 'String error';
        }) as any;

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(503);
        expect(data.status).toBe('error');
        expect(data.error).toBe('Unknown error');

        // Restore original function
        process.uptime = originalUptime;
    });

    it('returns degraded status when memory usage is high', async () => {
        // Mock memoryUsage to return high memory usage (76-90%)
        const originalMemoryUsage = process.memoryUsage;
        process.memoryUsage = jest.fn(() => ({
            rss: 100 * 1024 * 1024,
            heapTotal: 100 * 1024 * 1024,
            heapUsed: 80 * 1024 * 1024, // 80% usage
            external: 0,
            arrayBuffers: 0,
        })) as any;

        const response = await GET();
        const data = await response.json();

        expect(data.status).toBe('degraded');
        expect(data.checks.memory.status).toBe('warning');
        expect(response.status).toBe(200);

        // Restore original function
        process.memoryUsage = originalMemoryUsage;
    });

    it('returns error status when memory usage is critical', async () => {
        // Mock memoryUsage to return critical memory usage (>90%)
        const originalMemoryUsage = process.memoryUsage;
        process.memoryUsage = jest.fn(() => ({
            rss: 100 * 1024 * 1024,
            heapTotal: 100 * 1024 * 1024,
            heapUsed: 95 * 1024 * 1024, // 95% usage
            external: 0,
            arrayBuffers: 0,
        })) as any;

        const response = await GET();
        const data = await response.json();

        expect(data.status).toBe('error');
        expect(data.checks.memory.status).toBe('error');
        expect(response.status).toBe(503);

        // Restore original function
        process.memoryUsage = originalMemoryUsage;
    });
});
