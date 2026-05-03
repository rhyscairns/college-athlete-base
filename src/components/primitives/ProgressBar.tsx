'use client';

import React, { useEffect, useState } from 'react';

interface ProgressBarProps {
    /** Whether the bar is actively running */
    active: boolean;
    className?: string;
    'data-testid'?: string;
}

/**
 * 2px top-of-page progress bar for route transitions.
 * Mount with active=true to start; set active=false to complete + fade out.
 *
 * Usage:
 *   <ProgressBar active={isNavigating} />
 */
export function ProgressBar({
    active,
    className = '',
    'data-testid': testId = 'progress-bar',
}: ProgressBarProps) {
    const [visible, setVisible] = useState(false);
    const [complete, setComplete] = useState(false);

    useEffect(() => {
        if (active) {
            setComplete(false);
            setVisible(true);
        } else if (visible) {
            // Trigger completion animation then hide
            setComplete(true);
            const t = setTimeout(() => setVisible(false), 400);
            return () => clearTimeout(t);
        }
    }, [active, visible]);

    if (!visible) return null;

    return (
        <div
            role="progressbar"
            aria-label="Page loading"
            aria-valuemin={0}
            aria-valuemax={100}
            data-testid={testId}
            className={`fixed top-0 left-0 right-0 z-[9999] h-[2px] ${className}`}
            style={{ background: 'var(--ink-2)' }}
        >
            <div
                aria-hidden="true"
                className={complete ? 'animate-progress-bar' : 'animate-shimmer'}
                style={{
                    height: '100%',
                    backgroundColor: complete ? 'var(--brand-500)' : 'transparent',
                    backgroundImage: complete
                        ? 'none'
                        : 'linear-gradient(90deg, var(--brand-500) 0%, var(--accent-500) 50%, var(--brand-500) 100%)',
                    backgroundSize: '200% 100%',
                    width: complete ? '100%' : '60%',
                    transition: complete ? undefined : 'width var(--d-slow) var(--e-out)',
                }}
            />
        </div>
    );
}
