'use client';

import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'cab-theme';

/**
 * useTheme — persists dark/light preference in localStorage and applies
 * data-theme attribute to <html>. Defaults to dark (brand experience).
 */
export function useTheme() {
    const [theme, setTheme] = useState<Theme>('dark');

    // Initialise from storage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
        const initial = stored ?? 'dark';
        setTheme(initial);
        document.documentElement.setAttribute('data-theme', initial);
    }, []);

    const toggle = () => {
        setTheme(prev => {
            const next: Theme = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem(STORAGE_KEY, next);
            document.documentElement.setAttribute('data-theme', next);
            return next;
        });
    };

    return { theme, toggle };
}
