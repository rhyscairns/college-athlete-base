/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { useClientLogger } from '@/hooks/useClientLogger';

// Mock fetch
global.fetch = jest.fn();

describe('useClientLogger', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('sends debug logs to server', async () => {
        const { result } = renderHook(() => useClientLogger());

        await result.current.debug('Debug message', { test: true });

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    level: 'debug',
                    message: 'Debug message',
                    context: { test: true },
                    error: undefined,
                }),
            });
        });
    });

    it('sends info logs to server', async () => {
        const { result } = renderHook(() => useClientLogger());

        await result.current.info('Info message', { userId: '123' });

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    level: 'info',
                    message: 'Info message',
                    context: { userId: '123' },
                    error: undefined,
                }),
            });
        });
    });

    it('sends warning logs to server', async () => {
        const { result } = renderHook(() => useClientLogger());

        await result.current.warn('Warning message', { threshold: 90 });

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    level: 'warn',
                    message: 'Warning message',
                    context: { threshold: 90 },
                    error: undefined,
                }),
            });
        });
    });

    it('sends error logs with error object to server', async () => {
        const { result } = renderHook(() => useClientLogger());
        const error = new Error('Test error');

        await result.current.error('Error message', error, { action: 'test' });

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: expect.stringContaining('"level":"error"'),
            });
        });

        const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
        const body = JSON.parse(fetchCall[1].body);

        expect(body.level).toBe('error');
        expect(body.message).toBe('Error message');
        expect(body.context).toEqual({ action: 'test' });
        expect(body.error).toEqual({
            name: 'Error',
            message: 'Test error',
            stack: expect.any(String),
        });
    });

    it('handles fetch errors gracefully', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();

        (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useClientLogger());

        await result.current.info('Test message');

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to send log to server:',
                expect.any(Error)
            );
            expect(consoleInfoSpy).toHaveBeenCalled();
        });

        consoleErrorSpy.mockRestore();
        consoleInfoSpy.mockRestore();
    });

    it('logs to console in development mode', async () => {
        const originalEnv = process.env.NODE_ENV;

        // Override NODE_ENV using defineProperty
        Object.defineProperty(process.env, 'NODE_ENV', {
            value: 'development',
            writable: true,
            configurable: true,
        });

        const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();

        const { result } = renderHook(() => useClientLogger());

        await result.current.info('Test message', { test: true });

        await waitFor(() => {
            expect(consoleInfoSpy).toHaveBeenCalledWith(
                'Test message',
                expect.objectContaining({ context: { test: true } })
            );
        });

        consoleInfoSpy.mockRestore();

        // Restore original NODE_ENV
        Object.defineProperty(process.env, 'NODE_ENV', {
            value: originalEnv,
            writable: true,
            configurable: true,
        });
    });

    it('sends logs without context', async () => {
        const { result } = renderHook(() => useClientLogger());

        await result.current.info('Simple message');

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    level: 'info',
                    message: 'Simple message',
                    context: undefined,
                    error: undefined,
                }),
            });
        });
    });

    it('sends error logs without error object', async () => {
        const { result } = renderHook(() => useClientLogger());

        await result.current.error('Error message', undefined, { action: 'test' });

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    level: 'error',
                    message: 'Error message',
                    context: { action: 'test' },
                    error: undefined,
                }),
            });
        });
    });
});
