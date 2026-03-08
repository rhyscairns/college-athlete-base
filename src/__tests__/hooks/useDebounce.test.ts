/**
 * Tests for useDebounce hook
 */

import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('should return initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('initial', 500));
        expect(result.current).toBe('initial');
    });

    it('should debounce value changes', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: { value: 'initial', delay: 500 },
            }
        );

        expect(result.current).toBe('initial');

        // Change value
        rerender({ value: 'updated', delay: 500 });

        // Value should not change immediately
        expect(result.current).toBe('initial');

        // Fast-forward time
        act(() => {
            jest.advanceTimersByTime(500);
        });

        // Value should now be updated
        expect(result.current).toBe('updated');
    });

    it('should cancel previous timeout on rapid changes', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: { value: 'initial', delay: 500 },
            }
        );

        // Change value multiple times rapidly
        rerender({ value: 'change1', delay: 500 });
        act(() => {
            jest.advanceTimersByTime(200);
        });

        rerender({ value: 'change2', delay: 500 });
        act(() => {
            jest.advanceTimersByTime(200);
        });

        rerender({ value: 'change3', delay: 500 });

        // Value should still be initial
        expect(result.current).toBe('initial');

        // Fast-forward remaining time
        act(() => {
            jest.advanceTimersByTime(500);
        });

        // Only the last change should be applied
        expect(result.current).toBe('change3');
    });

    it('should handle different delay values', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: { value: 'initial', delay: 1000 },
            }
        );

        rerender({ value: 'updated', delay: 1000 });

        act(() => {
            jest.advanceTimersByTime(500);
        });
        expect(result.current).toBe('initial');

        act(() => {
            jest.advanceTimersByTime(500);
        });
        expect(result.current).toBe('updated');
    });

    it('should use default delay of 500ms', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value),
            {
                initialProps: { value: 'initial' },
            }
        );

        rerender({ value: 'updated' });

        act(() => {
            jest.advanceTimersByTime(499);
        });
        expect(result.current).toBe('initial');

        act(() => {
            jest.advanceTimersByTime(1);
        });
        expect(result.current).toBe('updated');
    });

    it('should handle complex objects', () => {
        const initialObj = { name: 'John', age: 30 };
        const updatedObj = { name: 'Jane', age: 25 };

        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 500),
            {
                initialProps: { value: initialObj },
            }
        );

        expect(result.current).toEqual(initialObj);

        rerender({ value: updatedObj });

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(result.current).toEqual(updatedObj);
    });

    it('should handle number values', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            {
                initialProps: { value: 0 },
            }
        );

        expect(result.current).toBe(0);

        rerender({ value: 42 });

        act(() => {
            jest.advanceTimersByTime(300);
        });

        expect(result.current).toBe(42);
    });

    it('should handle boolean values', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 200),
            {
                initialProps: { value: false },
            }
        );

        expect(result.current).toBe(false);

        rerender({ value: true });

        act(() => {
            jest.advanceTimersByTime(200);
        });

        expect(result.current).toBe(true);
    });

    it('should cleanup timeout on unmount', () => {
        const { unmount, rerender } = renderHook(
            ({ value }) => useDebounce(value, 500),
            {
                initialProps: { value: 'initial' },
            }
        );

        rerender({ value: 'updated' });

        // Unmount before timeout completes
        unmount();

        // Should not throw error
        expect(() => {
            act(() => {
                jest.advanceTimersByTime(500);
            });
        }).not.toThrow();
    });
});
