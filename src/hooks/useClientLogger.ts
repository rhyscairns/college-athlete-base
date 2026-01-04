'use client';

import { useCallback } from 'react';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
    context?: Record<string, unknown>;
    error?: Error;
}

/**
 * Hook for client-side logging that sends logs to the server
 * Provides a consistent logging interface for client components
 */
export function useClientLogger() {
    const sendLog = useCallback(async (level: LogLevel, message: string, options?: LogOptions) => {
        try {
            const logData = {
                level,
                message,
                context: options?.context,
                error: options?.error ? {
                    name: options.error.name,
                    message: options.error.message,
                    stack: options.error.stack,
                } : undefined,
            };

            // Send to server logging endpoint
            await fetch('/api/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logData),
            });

            // Also log to console in development
            if (process.env.NODE_ENV === 'development') {
                console[level](message, options);
            }
        } catch (error) {
            // Fallback to console if server logging fails
            console.error('Failed to send log to server:', error);
            console[level](message, options);
        }
    }, []);

    const debug = useCallback((message: string, context?: Record<string, unknown>) => {
        return sendLog('debug', message, { context });
    }, [sendLog]);

    const info = useCallback((message: string, context?: Record<string, unknown>) => {
        return sendLog('info', message, { context });
    }, [sendLog]);

    const warn = useCallback((message: string, context?: Record<string, unknown>) => {
        return sendLog('warn', message, { context });
    }, [sendLog]);

    const error = useCallback((message: string, error?: Error, context?: Record<string, unknown>) => {
        return sendLog('error', message, { context, error });
    }, [sendLog]);

    return {
        debug,
        info,
        warn,
        error,
    };
}
