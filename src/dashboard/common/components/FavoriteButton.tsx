'use client';

import React, { useState } from 'react';

interface FavoriteButtonProps {
    isFavorited: boolean;
    playerName: string;
    isDisabled?: boolean;
    onClick: () => void;
    /** 'card' = square glassmorphic overlay (PlayerCard), 'row' = inline icon-only (table) */
    variant?: 'card' | 'row';
}

/**
 * Shared favorite/unfavorite heart button.
 * Used in PlayerCard (variant="card") and ProspectsTable (variant="row").
 */
export function FavoriteButton({
    isFavorited,
    playerName,
    isDisabled = false,
    onClick,
    variant = 'card',
}: FavoriteButtonProps) {
    const [clickCount, setClickCount] = useState(0);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isDisabled) return;
        setClickCount(c => c + 1);
        onClick();
    };

    const label = isFavorited
        ? `Remove ${playerName} from prospects`
        : `Add ${playerName} to prospects`;

    if (variant === 'row') {
        return (
            <button
                onClick={handleClick}
                disabled={isDisabled}
                aria-label={label}
                aria-pressed={isFavorited}
                className="flex items-center justify-center w-8 h-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                    background: isFavorited ? 'oklch(68% 0.22 150 / 0.12)' : 'transparent',
                    border: isFavorited
                        ? '1px solid oklch(68% 0.22 150 / 0.35)'
                        : '1px solid var(--ink-3)',
                    transition: `background var(--d-fast) var(--e-glide), border-color var(--d-fast) var(--e-glide)`,
                }}
            >
                <span
                    key={clickCount}
                    aria-hidden="true"
                    className={clickCount > 0 ? 'heart-pop' : ''}
                    style={{ display: 'inline-flex' }}
                >
                    {isFavorited ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"
                            style={{ color: 'var(--brand-500)' }}>
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}
                            viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--text-mid)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    )}
                </span>
            </button>
        );
    }

    // variant === 'card'
    return (
        <button
            onClick={handleClick}
            disabled={isDisabled}
            aria-label={label}
            aria-pressed={isFavorited}
            className="flex items-center justify-center w-9 h-9 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
                background: isFavorited
                    ? 'oklch(68% 0.22 150 / 0.15)'
                    : 'oklch(15% 0.015 260 / 0.5)',
                border: isFavorited
                    ? '1px solid oklch(68% 0.22 150 / 0.4)'
                    : '1px solid oklch(98% 0.005 260 / 0.12)',
                backdropFilter: 'blur(8px)',
                transition: `background var(--d-fast) var(--e-glide), border-color var(--d-fast) var(--e-glide)`,
            }}
        >
            <span
                key={clickCount}
                aria-hidden="true"
                className={clickCount > 0 ? 'heart-pop' : ''}
                style={{ display: 'inline-flex' }}
            >
                {isFavorited ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"
                        style={{ color: 'var(--brand-500)' }}>
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}
                        viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--text-mid)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                )}
            </span>
        </button>
    );
}
