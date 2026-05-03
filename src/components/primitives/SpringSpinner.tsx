'use client';

import React from 'react';

interface SpringSpinnerProps {
    /** Size in px */
    size?: number;
    /** Accessible label */
    label?: string;
    className?: string;
    'data-testid'?: string;
}

/**
 * Pulsing brand-colored dot spinner.
 * Replaces the generic `animate-spin` circle — three dots with staggered
 * breath animation using the design system motion tokens.
 */
export function SpringSpinner({
    size = 8,
    label = 'Loading…',
    className = '',
    'data-testid': testId = 'spring-spinner',
}: SpringSpinnerProps) {
    const dotStyle = (delayMs: number): React.CSSProperties => ({
        width: size,
        height: size,
        background: 'var(--brand-500)',
        borderRadius: '50%',
        animationDelay: `${delayMs}ms`,
    });

    return (
        <span
            role="status"
            aria-label={label}
            data-testid={testId}
            className={`inline-flex items-center gap-1 ${className}`}
        >
            <span aria-hidden="true" className="animate-breath block" style={dotStyle(0)} />
            <span aria-hidden="true" className="animate-breath block" style={dotStyle(160)} />
            <span aria-hidden="true" className="animate-breath block" style={dotStyle(320)} />
            <span className="sr-only">{label}</span>
        </span>
    );
}
