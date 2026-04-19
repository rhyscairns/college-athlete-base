'use client';

import React from 'react';
import Image from 'next/image';
import type { PlayerMediaDisplayProps } from '../types';

/**
 * Displays player media (video thumbnail, profile image, or initials fallback).
 * Includes an interactive play button overlay when video is available.
 * 
 * @param props - Component props
 * @param props.videoThumbnail - Optional URL for video thumbnail image
 * @param props.profileImage - Optional URL for profile image (fallback if no video)
 * @param props.playerName - Full name of the player for alt text and aria labels
 * @param props.initials - Player initials for fallback display
 * @param props.priority - Whether to prioritize image loading (for above-fold content)
 * @param props.onWatchVideo - Optional callback when play button is clicked
 * @returns Player media display component with aspect-video ratio
 */
export const PlayerMediaDisplay: React.FC<PlayerMediaDisplayProps> = ({
    videoThumbnail,
    profileImage,
    playerName,
    initials,
    priority = false,
    onWatchVideo,
}): React.ReactElement => {
    return (
        <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900">
            {videoThumbnail ? (
                <>
                    <Image
                        src={videoThumbnail}
                        alt={`${playerName} highlight video thumbnail`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={priority}
                        loading={priority ? undefined : 'lazy'}
                    />
                    {/* Decorative play icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <svg
                            className="w-12 h-12 text-white/70 drop-shadow-lg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </>
            ) : profileImage ? (
                <Image
                    src={profileImage}
                    alt={`${playerName} profile photo`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={priority}
                    loading={priority ? undefined : 'lazy'}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl font-black text-white/10" aria-hidden="true">
                        {initials}
                    </span>
                </div>
            )}

            {/* Watch Video button - shown when videoThumbnail and onWatchVideo are provided */}
            {videoThumbnail && onWatchVideo && (
                <button
                    onClick={onWatchVideo}
                    aria-label={`Watch highlight video for ${playerName}`}
                    className="absolute inset-x-0 bottom-0 w-full min-h-[44px] px-4 py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 hover:shadow-lg transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                    <svg
                        className="w-5 h-5 text-slate-900"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path d="M8 5v14l11-7z" />
                    </svg>
                    <span className="text-slate-900 font-semibold text-sm">Watch Video</span>
                </button>
            )}
        </div>
    );
};
