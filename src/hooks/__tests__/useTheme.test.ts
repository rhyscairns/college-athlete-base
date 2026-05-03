import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => { store[key] = value; },
        clear: () => { store = {}; },
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useTheme', () => {
    beforeEach(() => {
        localStorageMock.clear();
        document.documentElement.removeAttribute('data-theme');
    });

    it('defaults to dark theme', () => {
        const { result } = renderHook(() => useTheme());
        expect(result.current.theme).toBe('dark');
    });

    it('applies data-theme attribute to html element', () => {
        renderHook(() => useTheme());
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('toggles from dark to light', () => {
        const { result } = renderHook(() => useTheme());
        act(() => result.current.toggle());
        expect(result.current.theme).toBe('light');
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('toggles back to dark from light', () => {
        const { result } = renderHook(() => useTheme());
        act(() => result.current.toggle());
        act(() => result.current.toggle());
        expect(result.current.theme).toBe('dark');
    });

    it('persists theme to localStorage', () => {
        const { result } = renderHook(() => useTheme());
        act(() => result.current.toggle());
        expect(localStorageMock.getItem('cab-theme')).toBe('light');
    });

    it('reads stored theme on mount', () => {
        localStorageMock.setItem('cab-theme', 'light');
        const { result } = renderHook(() => useTheme());
        expect(result.current.theme).toBe('light');
    });
});
