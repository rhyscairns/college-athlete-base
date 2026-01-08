import { Logger, LogLevel } from '@/lib/logger';

describe('Logger', () => {
    let logger: Logger;
    let consoleLogSpy: jest.SpyInstance;
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        // Save and set environment before creating logger
        originalEnv = { ...process.env };
        (process.env as any).NODE_ENV = 'test';
        process.env.LOG_LEVEL = 'debug';

        // Create a new logger instance AFTER setting env vars
        logger = new Logger();

        // Spy on console.log
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        // Restore original environment
        process.env = originalEnv;
    });

    describe('Log Levels', () => {
        it('should log debug messages', () => {
            logger.debug('Test debug message', { key: 'value' });
            expect(consoleLogSpy).toHaveBeenCalled();
        });

        it('should log info messages', () => {
            logger.info('Test info message', { key: 'value' });
            expect(consoleLogSpy).toHaveBeenCalled();
        });

        it('should log warn messages', () => {
            logger.warn('Test warn message', { key: 'value' });
            expect(consoleLogSpy).toHaveBeenCalled();
        });

        it('should log error messages', () => {
            const error = new Error('Test error');
            logger.error('Test error message', { key: 'value' }, error);
            expect(consoleLogSpy).toHaveBeenCalled();
        });
    });

    describe('Log Level Filtering', () => {
        it('should not log debug when level is info', () => {
            process.env.LOG_LEVEL = 'info';
            const infoLogger = new Logger();

            infoLogger.debug('Should not appear');
            expect(consoleLogSpy).not.toHaveBeenCalled();

            infoLogger.info('Should appear');
            expect(consoleLogSpy).toHaveBeenCalled();
        });

        it('should only log errors when level is error', () => {
            process.env.LOG_LEVEL = 'error';
            const errorLogger = new Logger();

            consoleLogSpy.mockClear();

            errorLogger.debug('Should not appear');
            errorLogger.info('Should not appear');
            errorLogger.warn('Should not appear');
            expect(consoleLogSpy).not.toHaveBeenCalled();

            errorLogger.error('Should appear');
            expect(consoleLogSpy).toHaveBeenCalled();
        });
    });

    describe('Context Logging', () => {
        it('should include context in log output', () => {
            logger.info('Test message', { userId: '123', action: 'login' });

            const logCall = consoleLogSpy.mock.calls[0][0];
            expect(logCall).toContain('userId');
            expect(logCall).toContain('123');
        });

        it('should handle empty context', () => {
            logger.info('Test message');
            expect(consoleLogSpy).toHaveBeenCalled();
        });

        it('should handle complex context objects', () => {
            logger.info('Test message', {
                user: { id: '123', name: 'Test' },
                metadata: { timestamp: Date.now() },
            });
            expect(consoleLogSpy).toHaveBeenCalled();
        });
    });

    describe('Error Logging', () => {
        it('should include error details', () => {
            const error = new Error('Test error');
            error.stack = 'Error stack trace';

            logger.error('Error occurred', {}, error);

            const logCall = consoleLogSpy.mock.calls[0][0];
            expect(logCall).toContain('Test error');
        });

        it('should handle errors without stack traces', () => {
            const error = new Error('Test error');
            delete error.stack;

            logger.error('Error occurred', {}, error);
            expect(consoleLogSpy).toHaveBeenCalled();
        });
    });

    describe('Specialized Logging Methods', () => {
        it('should log API requests', () => {
            logger.apiRequest('POST', '/api/test', { requestId: '123' });

            const logCall = consoleLogSpy.mock.calls[0][0];
            expect(logCall).toContain('POST');
            expect(logCall).toContain('/api/test');
        });

        it('should log API responses with status codes', () => {
            logger.apiResponse('POST', '/api/test', 200, 150, { requestId: '123' });

            const logCall = consoleLogSpy.mock.calls[0][0];
            expect(logCall).toContain('200');
            expect(logCall).toContain('150ms');
        });

        it('should log database operations', () => {
            logger.dbOperation('SELECT', { table: 'users' });

            const logCall = consoleLogSpy.mock.calls[0][0];
            expect(logCall).toContain('SELECT');
        });

        it('should log database errors', () => {
            const error = new Error('Connection failed');
            logger.dbError('SELECT', error, { table: 'users' });

            expect(consoleLogSpy).toHaveBeenCalled();
        });

        it('should log validation errors', () => {
            const errors = [
                { field: 'email', message: 'Invalid email' },
                { field: 'password', message: 'Too short' },
            ];

            logger.validationError('Validation failed', errors);

            const logCall = consoleLogSpy.mock.calls[0][0];
            expect(logCall).toContain('Validation failed');
        });

        it('should log security events', () => {
            logger.securityEvent('Failed login attempt', { email: 'test@example.com' });

            const logCall = consoleLogSpy.mock.calls[0][0];
            expect(logCall).toContain('Failed login attempt');
        });
    });

    describe('Production Format', () => {
        it('should use JSON format in production', () => {
            (process.env as any).NODE_ENV = 'production';
            const prodLogger = new Logger();

            prodLogger.info('Test message', { key: 'value' });

            const logCall = consoleLogSpy.mock.calls[0][0];

            // Should be valid JSON
            expect(() => JSON.parse(logCall)).not.toThrow();

            const parsed = JSON.parse(logCall);
            expect(parsed.level).toBe('info');
            expect(parsed.message).toBe('Test message');
            expect(parsed.context).toEqual({ key: 'value' });
            expect(parsed.timestamp).toBeDefined();
        });

        it('should include error details in JSON format', () => {
            (process.env as any).NODE_ENV = 'production';
            const prodLogger = new Logger();

            const error = new Error('Test error');
            prodLogger.error('Error occurred', { key: 'value' }, error);

            const logCall = consoleLogSpy.mock.calls[0][0];
            const parsed = JSON.parse(logCall);

            expect(parsed.error).toBeDefined();
            expect(parsed.error.message).toBe('Test error');
            expect(parsed.error.name).toBe('Error');
        });
    });

    describe('Development Format', () => {
        it('should use colored format in development', () => {
            (process.env as any).NODE_ENV = 'development';
            const devLogger = new Logger();

            devLogger.info('Test message');

            const logCall = consoleLogSpy.mock.calls[0][0];

            // Should contain ANSI color codes
            expect(logCall).toContain('\x1b[');
        });
    });
});
