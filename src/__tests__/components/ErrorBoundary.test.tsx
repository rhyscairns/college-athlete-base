/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { logger } from '@/lib/logger';

// Mock the logger
jest.mock('@/lib/logger', () => ({
    logger: {
        error: jest.fn(),
    },
}));

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error('Test error');
    }
    return <div>No error</div>;
};

describe('ErrorBoundary', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Suppress console.error for these tests
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders children when there is no error', () => {
        render(
            <ErrorBoundary>
                <div>Test content</div>
            </ErrorBoundary>
        );

        expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('renders error UI when an error is thrown', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(
            screen.getByText(/We're sorry, but something unexpected happened/)
        ).toBeInTheDocument();
    });

    it('logs error when caught', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(logger.error).toHaveBeenCalledWith(
            'React Error Boundary caught an error',
            expect.any(Error),
            expect.objectContaining({
                errorBoundary: true,
            })
        );
    });

    it('renders custom fallback when provided', () => {
        const customFallback = <div>Custom error message</div>;

        render(
            <ErrorBoundary fallback={customFallback}>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('Custom error message')).toBeInTheDocument();
        expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('shows refresh button in error UI', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        const refreshButton = screen.getByRole('button', { name: /refresh page/i });
        expect(refreshButton).toBeInTheDocument();
    });

    it('does not show error details in production', () => {
        const originalEnv = process.env.NODE_ENV;
        
        // Override NODE_ENV using defineProperty
        Object.defineProperty(process.env, 'NODE_ENV', {
            value: 'production',
            writable: true,
            configurable: true,
        });

        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.queryByText('Test error')).not.toBeInTheDocument();

        // Restore original NODE_ENV
        Object.defineProperty(process.env, 'NODE_ENV', {
            value: originalEnv,
            writable: true,
            configurable: true,
        });
    });

    it('updates state when error is caught', () => {
        const { rerender } = render(
            <ErrorBoundary>
                <ThrowError shouldThrow={false} />
            </ErrorBoundary>
        );

        expect(screen.getByText('No error')).toBeInTheDocument();

        // Trigger error
        rerender(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
});
