'use client';

import React from 'react';

interface SkeletonProps {
    /** Width — any valid CSS value or Tailwind class override via className */
    width?: string;
    /** Height — any valid CSS value */
    height?: string;
    /** Rounded corners */
    rounded?: 'sm' | 'md' | 'lg' | 'full' | 'none';
    className?: string;
    'data-testid'?: string;
}

const roundedMap = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
};

/**
 * Generic shimmer skeleton block.
 * Compose these to mirror the shape of real content while loading.
 */
export function Skeleton({
    width,
    height,
    rounded = 'md',
    className = '',
    'data-testid': testId = 'skeleton',
}: SkeletonProps) {
    return (
        <div
            role="status"
            aria-label="Loading…"
            data-testid={testId}
            className={`${roundedMap[rounded]} ${className} overflow-hidden`}
            style={{ width, height }}
        >
            {/* shimmer strip */}
            <div
                aria-hidden="true"
                className="h-full w-full animate-shimmer bg-[length:200%_100%]"
                style={{
                    background:
                        'linear-gradient(90deg, var(--ink-2) 25%, var(--ink-3) 50%, var(--ink-2) 75%)',
                }}
            />
            <span className="sr-only">Loading…</span>
        </div>
    );
}

/* ------------------------------------------------------------------
   PlayerCard skeleton — mirrors the real card layout exactly
   Media uses 4/3 ratio to match PlayerMediaDisplay
------------------------------------------------------------------ */
export function PlayerCardSkeleton({ 'data-testid': testId = 'player-card-skeleton' }: { 'data-testid'?: string }) {
    return (
        <div
            role="status"
            aria-label="Loading player card"
            data-testid={testId}
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--ink-1)' }}
        >
            {/* 4:3 media area — matches PlayerMediaDisplay aspectRatio */}
            <div className="aspect-[4/3] w-full">
                <Skeleton height="100%" rounded="none" data-testid="skeleton-media" />
            </div>
            {/* info strip */}
            <div className="p-4 space-y-3">
                <Skeleton height="1rem" width="60%" data-testid="skeleton-name" />
                <Skeleton height="0.875rem" width="40%" data-testid="skeleton-position" />
                <Skeleton height="0.875rem" width="35%" data-testid="skeleton-sport" />
                <div className="pt-2 space-y-2">
                    <Skeleton height="2.75rem" rounded="lg" data-testid="skeleton-btn-primary" />
                    <Skeleton height="2.75rem" rounded="lg" data-testid="skeleton-btn-secondary" />
                </div>
            </div>
            <span className="sr-only">Loading player information…</span>
        </div>
    );
}
