/**
 * Structured logging utility for the application
 * Provides consistent log formatting and levels
 */

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

export interface LogContext {
    [key: string]: any;
}

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: LogContext;
    error?: {
        message: string;
        stack?: string;
        name?: string;
    };
}

class Logger {
    private minLevel: LogLevel;

    constructor() {
        // Set minimum log level based on environment
        const envLevel = process.env.LOG_LEVEL?.toLowerCase();
        this.minLevel = this.parseLogLevel(envLevel) || LogLevel.INFO;
    }

    private parseLogLevel(level?: string): LogLevel | null {
        switch (level) {
            case 'debug':
                return LogLevel.DEBUG;
            case 'info':
                return LogLevel.INFO;
            case 'warn':
                return LogLevel.WARN;
            case 'error':
                return LogLevel.ERROR;
            default:
                return null;
        }
    }

    private shouldLog(level: LogLevel): boolean {
        const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        const minIndex = levels.indexOf(this.minLevel);
        const currentIndex = levels.indexOf(level);
        return currentIndex >= minIndex;
    }

    private formatLog(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
        };

        if (context && Object.keys(context).length > 0) {
            entry.context = context;
        }

        if (error) {
            entry.error = {
                message: error.message,
                name: error.name,
                stack: error.stack,
            };
        }

        return entry;
    }

    private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
        if (!this.shouldLog(level)) {
            return;
        }

        const entry = this.formatLog(level, message, context, error);

        // In production/CloudWatch, use JSON format
        // In development, use more readable format
        if (process.env.NODE_ENV === 'production' || process.env.ENVIRONMENT === 'production') {
            console.log(JSON.stringify(entry));
        } else {
            // Pretty print for local development
            const timestamp = new Date().toLocaleTimeString();
            const levelColor = this.getLevelColor(level);
            const contextStr = context ? ` ${JSON.stringify(context)}` : '';
            const errorStr = error ? `\n  Error: ${error.message}\n  ${error.stack}` : '';

            console.log(`[${timestamp}] ${levelColor}${level.toUpperCase()}\x1b[0m: ${message}${contextStr}${errorStr}`);
        }
    }

    private getLevelColor(level: LogLevel): string {
        switch (level) {
            case LogLevel.DEBUG:
                return '\x1b[36m'; // Cyan
            case LogLevel.INFO:
                return '\x1b[32m'; // Green
            case LogLevel.WARN:
                return '\x1b[33m'; // Yellow
            case LogLevel.ERROR:
                return '\x1b[31m'; // Red
            default:
                return '';
        }
    }

    debug(message: string, context?: LogContext): void {
        this.log(LogLevel.DEBUG, message, context);
    }

    info(message: string, context?: LogContext): void {
        this.log(LogLevel.INFO, message, context);
    }

    warn(message: string, context?: LogContext, error?: Error): void {
        this.log(LogLevel.WARN, message, context, error);
    }

    error(message: string, context?: LogContext, error?: Error): void {
        this.log(LogLevel.ERROR, message, context, error);
    }

    /**
     * Log API request start
     */
    apiRequest(method: string, path: string, context?: LogContext): void {
        this.info(`API Request: ${method} ${path}`, context);
    }

    /**
     * Log API response
     */
    apiResponse(method: string, path: string, statusCode: number, duration: number, context?: LogContext): void {
        const level = statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
        this.log(level, `API Response: ${method} ${path}`, {
            statusCode,
            duration: `${duration}ms`,
            ...context,
        });
    }

    /**
     * Log database operation
     */
    dbOperation(operation: string, context?: LogContext): void {
        this.debug(`Database: ${operation}`, context);
    }

    /**
     * Log database error
     */
    dbError(operation: string, error: Error, context?: LogContext): void {
        this.error(`Database Error: ${operation}`, context, error);
    }

    /**
     * Log validation failure
     */
    validationError(message: string, errors: any[], context?: LogContext): void {
        this.warn(message, {
            errors,
            ...context,
        });
    }

    /**
     * Log security event (e.g., duplicate email attempt)
     */
    securityEvent(event: string, context?: LogContext): void {
        this.warn(`Security Event: ${event}`, context);
    }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing
export { Logger };
