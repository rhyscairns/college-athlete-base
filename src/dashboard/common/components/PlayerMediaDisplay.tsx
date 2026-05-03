'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import type { PlayerMediaDisplayProps } from '../types';

/**
 * Displays player media with 4:5 aspect ratio, gradient overlay, and glassmorphic
 * name strip. Supports video thumbnail, profile image, or initials fallback.
 * Includes an interactive play button overlay when video is available.
 */
export const PlayerMediaDisplay: React.FC<PlayerMediaDisplayProps> = ({
    videoThumbnail,
    profileImage,
    playerName,
    initials,
    priority = false,
    onWatchVideo,
}): React.ReactElement => {
    const hasMedia = !!(videoThumbnail || profileImage);

    return (
        <div
            className="relative overflow-hidden"
            style={{ aspectRatio: '4/3', background: 'var(--ink-1)' }}
            data-testid="player-media"
        >
            {/* ── Media layer ── */}
            {videoThumbnail ? (
                <Image
                    src={videoThumbnail}
                    alt={`${playerName} highlight video thumbnail`}
                    fill
                    className="object-cover transition-transform duration-[var(--d-slow)] ease-[var(--e-glide)] group-hover:scale-[1.04]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={priority}
                    loading={priority ? undefined : 'lazy'}
                />
            ) : profileImage ? (
                <Image
                    src={profileImage}
                    alt={`${playerName} profile photo`}
                    fill
                    className="object-cover transition-transform duration-[var(--d-slow)] ease-[var(--e-glide)] group-hover:scale-[1.04]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={priority}
                    loading={priority ? undefined : 'lazy'}
                />
            ) : (
                /* Initials fallback */
                <div className="w-full h-full flex items-center justify-center">
                    <span
                        className="font-black select-none"
                        style={{
                            font: 'var(--type-display)',
                            color: 'var(--text-lo)',
                        }}
                        aria-hidden="true"
                    >
                        {initials}
                    </span>
                </div>
            )}

            {/* ── Gradient overlay (always present over media) ── */}
            {hasMedia && (
                <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            'linear-gradient(to bottom, transparent 40%, oklch(10% 0.015 260 / 0.85) 100%)',
                    }}
                />
            )}

            {/* ── Watch Video button — shown when onWatchVideo is provided AND videoThumbnail exists ── */}
            {videoThumbnail && onWatchVideo && (
                <button
                    onClick={onWatchVideo}
                    aria-label={`Watch highlight video for ${playerName}`}
                    className="absolute inset-0 w-full h-full min-h-[44px] flex items-center justify-center touch-manipulation focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-inset"
                >
                    <span
                        aria-hidden="true"
                        className="flex items-center justify-center w-14 h-14 rounded-full"
                        style={{
                            background: 'oklch(78% 0.18 75 / 0.9)',
                            backdropFilter: 'blur(4px)',
                        }}
                    >
                        <svg
                            className="w-7 h-7 translate-x-0.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            style={{ color: 'var(--ink-0)' }}
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </span>
                </button>
            )}

            {/* ── Decorative play icon (no callback, but has thumbnail) ── */}
            {videoThumbnail && !onWatchVideo && (
                <div
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                    <span
                        className="flex items-center justify-center w-12 h-12 rounded-full"
                        style={{ background: 'oklch(98% 0.005 260 / 0.25)' }}
                    >
                        <svg className="w-6 h-6 translate-x-0.5" fill="white" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </span>
                </div>
            )}
        </div>
    );
};
