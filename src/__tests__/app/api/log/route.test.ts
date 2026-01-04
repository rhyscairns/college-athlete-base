/**
 * @jest-environment node
 */
import { POST } from '@/app/api/log/route';
import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

// Mock the logger
jest.mock('@/lib/logger', () => ({
    logger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

describe('/api/log', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const createRequest = (body: unknown) => {
        return new NextRequest('http://localhost:3000/api/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-agent': 'test-agent',
                'x-forwarded-for': '127.0.0.1',
            },
            body: JSON.stringify(body),
        });
    };

    it('logs debug messages', async () => {
        const request = createRequest({
            level: 'debug',
            message: 'Debug message',
            context: { test: true },
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(logger.debug).toHaveBeenCalledWith(
            'Debug message',
            expect.objectContaining({
                test: true,
                clientSide: true,
            })
        );
    });

    it('logs info messages', async () => {
        const request = createRequest({
            level: 'info',
            message: 'Info message',
            context: { userId: '123' },
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(logger.info).toHaveBeenCalledWith(
            'Info message',
            expect.objectContaining({
                userId: '123',
                clientSide: true,
            })
        );
    });

    it('logs warning messages', async () => {
        const request = createRequest({
            level: 'warn',
            message: 'Warning message',
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(logger.warn).toHaveBeenCalledWith(
            'Warning message',
            expect.objectContaining({
                clientSide: true,
            })
        );
    });

    it('logs error messages with error object', async () => {
        const request = createRequest({
            level: 'error',
            message: 'Error message',
            error: {
                name: 'TestError',
                message: 'Test error message',
                stack: 'Error stack trace',
            },
            context: { action: 'test' },
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(logger.error).toHaveBeenCalledWith(
            'Error message',
            expect.any(Error),
            expect.objectContaining({
                action: 'test',
                clientSide: true,
            })
        );
    });

    it('enriches context with client information', async () => {
        const request = createRequest({
            level: 'info',
            message: 'Test message',
            context: { custom: 'data' },
        });

        await POST(request);

        expect(logger.info).toHaveBeenCalledWith(
            'Test message',
            expect.objectContaining({
                custom: 'data',
                userAgent: 'test-agent',
                ip: '127.0.0.1',
                clientSide: true,
            })
        );
    });

    it('rejects invalid log levels', async () => {
        const request = createRequest({
            level: 'invalid',
            message: 'Test message',
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid log level');
        expect(logger.debug).not.toHaveBeenCalled();
        expect(logger.info).not.toHaveBeenCalled();
        expect(logger.warn).not.toHaveBeenCalled();
        expect(logger.error).not.toHaveBeenCalled();
    });

    it('handles malformed requests', async () => {
        const request = new NextRequest('http://localhost:3000/api/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: 'invalid json',
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to process log request');
    });

    it('handles requests without error object', async () => {
        const request = createRequest({
            level: 'error',
            message: 'Error without error object',
            context: { test: true },
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(logger.error).toHaveBeenCalledWith(
            'Error without error object',
            undefined,
            expect.objectContaining({
                test: true,
                clientSide: true,
            })
        );
    });
});
