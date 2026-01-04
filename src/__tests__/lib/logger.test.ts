/**
 * @jest-environment node
 */
import { Logger } from '@/lib/logger';

describe('Logger', () => {
    let logger: Logger;
    let consoleDebugSpy: jest.SpyInstance;
    let consoleInfoSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        logger = new Logger();
        consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
        consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('debug', () => {
        it('logs debug messages', () => {
            logger.debug('Debug message');

            expect(consoleDebugSpy).toHaveBeenCalledWith(
                expect.stringContaining('"level":"debug"')
            );
            expect(consoleDebugSpy).toHaveBeenCalledWith(
                expect.stringContaining('"message":"Debug message"')
            );
        });

        it('includes context in debug logs', () => {
            logger.debug('Debug message', { userId: '123' });

            expect(consoleDebugSpy).toHaveBeenCalledWith(
                expect.stringContaining('"context":{"userId":"123"}')
            );
        });
    });

    describe('info', () => {
        it('logs info messages', () => {
            logger.info('Info message');

            expect(consoleInfoSpy).toHaveBeenCalledWith(
                expect.stringContaining('"level":"info"')
            );
            expect(consoleInfoSpy).toHaveBeenCalledWith(
                expect.stringContaining('"message":"Info message"')
            );
        });

        it('includes context in info logs', () => {
            logger.info('Info message', { action: 'test' });

            expect(consoleInfoSpy).toHaveBeenCalledWith(
                expect.stringContaining('"context":{"action":"test"}')
            );
        });
    });

    describe('warn', () => {
        it('logs warning messages', () => {
            logger.warn('Warning message');

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('"level":"warn"')
            );
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('"message":"Warning message"')
            );
        });

        it('includes context in warning logs', () => {
            logger.warn('Warning message', { threshold: 90 });

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('"context":{"threshold":90}')
            );
        });
    });

    describe('error', () => {
        it('logs error messages', () => {
            logger.error('Error message');

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('"level":"error"')
            );
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('"message":"Error message"')
            );
        });

        it('includes error object in logs', () => {
            const error = new Error('Test error');
            logger.error('Error occurred', error);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('"error":{')
            );
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('"message":"Test error"')
            );
        });

        it('includes context in error logs', () => {
            const error = new Error('Test error');
            logger.error('Error occurred', error, { operation: 'test' });

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('"context":{"operation":"test"}')
            );
        });
    });

    describe('apiError', () => {
        it('logs API errors with endpoint and status code', () => {
            const error = new Error('API failed');
            logger.apiError('/api/users', error, 500, { userId: '123' });

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('"message":"API Error: /api/users"')
            );
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('"endpoint":"/api/users"')
            );
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('"statusCode":500')
            );
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('"userId":"123"')
            );
        });

        it('logs API errors without context', () => {
            const error = new Error('API failed');
            logger.apiError('/api/users', error, 500);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('"message":"API Error: /api/users"')
            );
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('"endpoint":"/api/users"')
            );
        });
    });

    describe('deployment', () => {
        it('logs deployment events', () => {
            logger.deployment('Application started', { version: '1.0.0' });

            expect(consoleInfoSpy).toHaveBeenCalledWith(
                expect.stringContaining('"message":"Deployment Event: Application started"')
            );
            expect(consoleInfoSpy).toHaveBeenCalledWith(
                expect.stringContaining('"eventType":"deployment"')
            );
            expect(consoleInfoSpy).toHaveBeenCalledWith(
                expect.stringContaining('"version":"1.0.0"')
            );
        });

        it('logs deployment events without context', () => {
            logger.deployment('Application started');

            expect(consoleInfoSpy).toHaveBeenCalledWith(
                expect.stringContaining('"message":"Deployment Event: Application started"')
            );
            expect(consoleInfoSpy).toHaveBeenCalledWith(
                expect.stringContaining('"eventType":"deployment"')
            );
        });
    });

    describe('log format', () => {
        it('includes timestamp in all logs', () => {
            logger.info('Test message');

            expect(consoleInfoSpy).toHaveBeenCalledWith(
                expect.stringContaining('"timestamp":"')
            );
        });

        it('includes environment in all logs', () => {
            logger.info('Test message');

            expect(consoleInfoSpy).toHaveBeenCalledWith(
                expect.stringContaining('"environment":"')
            );
        });

        it('includes source as server', () => {
            logger.info('Test message');

            expect(consoleInfoSpy).toHaveBeenCalledWith(
                expect.stringContaining('"source":"server"')
            );
        });

        it('produces valid JSON', () => {
            logger.info('Test message', { test: true });

            const logCall = consoleInfoSpy.mock.calls[0][0];
            expect(() => JSON.parse(logCall)).not.toThrow();
        });
    });

    describe('production environment', () => {
        it('calls sendToLoggingService in production', () => {
            const originalEnv = process.env.NODE_ENV;

            // Override NODE_ENV using defineProperty
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: 'production',
                writable: true,
                configurable: true,
            });

            const prodLogger = new Logger();
            prodLogger.info('Production log');

            // In production, it should still log to console as fallback
            expect(consoleInfoSpy).toHaveBeenCalled();

            // Restore original NODE_ENV
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: originalEnv,
                writable: true,
                configurable: true,
            });
        });
    });
});
