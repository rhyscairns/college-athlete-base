/**
 * Centralized logging utility for Next.js application
 * Provides structured logging for server and client-side errors
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: Record<string, unknown>;
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
    environment: string;
    source: 'server' | 'client';
}

class Logger {
    private environment: string;
    private isServer: boolean;

    constructor() {
        this.environment = process.env.NODE_ENV || 'development';
        this.isServer = typeof window === 'undefined';
    }

    private formatLog(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): LogEntry {
        const logEntry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            environment: this.environment,
            source: this.isServer ? 'server' : 'client',
        };

        if (context) {
            logEntry.context = context;
        }

        if (error) {
            logEntry.error = {
                name: error.name,
                message: error.message,
                stack: error.stack,
            };
        }

        return logEntry;
    }

    private output(logEntry: LogEntry): void {
        const logString = JSON.stringify(logEntry);

        // In production, send to logging service
        if (this.environment === 'production') {
            // Send to logging aggregation service (e.g., CloudWatch, Datadog, etc.)
            // This would be implemented based on your logging infrastructure
            this.sendToLoggingService(logEntry);
        }

        // Console output for development and as fallback
        switch (logEntry.level) {
            case 'debug':
                console.debug(logString);
                break;
            case 'info':
                console.info(logString);
                break;
            case 'warn':
                console.warn(logString);
                break;
            case 'error':
                console.error(logString);
                break;
        }
    }

    private sendToLoggingService(logEntry: LogEntry): void {
        // Implement integration with your logging service
        // Examples:
        // - AWS CloudWatch Logs
        // - Datadog
        // - New Relic
        // - Sentry
        // - LogRocket

        // For now, this is a placeholder
        // In a real implementation, you would send the log to your service
        if (this.isServer) {
            // Server-side logging (e.g., to CloudWatch)
            // Example: cloudwatch.putLogEvents(logEntry)
        } else {
            // Client-side logging (e.g., to browser monitoring service)
            // Example: browserMonitoring.log(logEntry)
        }
    }

    debug(message: string, context?: Record<string, unknown>): void {
        const logEntry = this.formatLog('debug', message, context);
        this.output(logEntry);
    }

    info(message: string, context?: Record<string, unknown>): void {
        const logEntry = this.formatLog('info', message, context);
        this.output(logEntry);
    }

    warn(message: string, context?: Record<string, unknown>): void {
        const logEntry = this.formatLog('warn', message, context);
        this.output(logEntry);
    }

    error(message: string, error?: Error, context?: Record<string, unknown>): void {
        const logEntry = this.formatLog('error', message, context, error);
        this.output(logEntry);
    }

    // Specialized method for API errors
    apiError(endpoint: string, error: Error, statusCode?: number, context?: Record<string, unknown>): void {
        this.error(`API Error: ${endpoint}`, error, {
            ...context,
            endpoint,
            statusCode,
        });
    }

    // Specialized method for deployment events
    deployment(event: string, context?: Record<string, unknown>): void {
        this.info(`Deployment Event: ${event}`, {
            ...context,
            eventType: 'deployment',
        });
    }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing
export { Logger };
