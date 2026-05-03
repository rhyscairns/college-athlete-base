'use client';

import React from 'react';

interface EmptyStateProps {
    illustration: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
    'data-testid'?: string;
}

/**
 * Shared empty state layout — illustration + copy + optional CTA.
 * Each screen supplies its own SVG illustration.
 */
export function EmptyState({
    illustration,
    title,
    description,
    action,
    'data-testid': testId = 'empty-state',
}: EmptyStateProps) {
    return (
        <div
            className="flex flex-col items-center justify-center py-16 px-6 text-center"
            role="status"
            aria-live="polite"
            data-testid={testId}
        >
            <div className="mb-6 opacity-60" aria-hidden="true">
                {illustration}
            </div>
            <p
                className="text-lg font-semibold mb-2"
                style={{ color: 'var(--text-hi)' }}
            >
                {title}
            </p>
            <p
                className="text-sm max-w-xs mb-6"
                style={{ color: 'var(--text-mid)' }}
            >
                {description}
            </p>
            {action}
        </div>
    );
}
