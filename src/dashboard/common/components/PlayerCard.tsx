'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { PlayerCardProps } from '../types';

export const PlayerCard = React.memo(function PlayerCard({
    playerId,
    firstName,
    lastName,
    position,
    sport,
    videoThumbnail,
    profileImage,
    status,
    height,
    weight,
    primaryButtonLabel = 'View Profile',
    secondaryButtonLabel,
    onPrimaryClick,
    onSecondaryClick,
    priority = false,
}: PlayerCardProps) {
    const playerName = `${firstName} ${lastName}`;
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

    // Status badge styles
    const statusStyles = {
        available: 'bg-green-500 text-white',
        interested: 'bg-orange-500 text-white',
        contacted: 'bg-red-500 text-white',
    };

    const statusLabels = {
        available: 'Available',
        interested: 'Interested',
        contacted: 'Contacted',
    };

    // Build physical stats string for screen readers
    const physicalStats = (height && weight)
        ? `${height}, ${weight}`
        : height || weight || '';

    return (
        <article
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-gray-300 transition-all duration-300 hover:-translate-y-1"
            aria-label={`Player card for ${playerName}`}
        >
            {/* Video/Image Section */}
            <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900">
                {videoThumbnail ? (
                    <Image
                        src={videoThumbnail}
                        alt={`${playerName} highlight video thumbnail`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={priority}
                        loading={priority ? undefined : 'lazy'}
                    />
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

                {/* Play button overlay for video thumbnail */}
                {videoThumbnail && (
                    <div
                        className="absolute inset-0 flex items-center justify-center bg-black/20"
                        aria-hidden="true"
                    >
                        <div className="w-16 h-16 rounded-full bg-yellow-400/90 flex items-center justify-center shadow-lg">
                            <svg
                                className="w-8 h-8 text-slate-900 ml-1"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Status Badge */}
                {status && (
                    <div className="absolute top-3 right-3">
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold shadow-lg ${statusStyles[status]}`}
                            role="status"
                            aria-label={`Status: ${statusLabels[status]}`}
                        >
                            {statusLabels[status]}
                        </span>
                    </div>
                )}
            </div>

            {/* Player Info Section */}
            <div className="p-4 sm:p-5 bg-white">
                {/* Player Name */}
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 truncate">
                    {playerName}
                </h3>

                {/* Position & Sport */}
                <div className="space-y-1 mb-4">
                    <p className="text-base sm:text-lg font-semibold text-blue-600">
                        {position}
                    </p>
                    <p className="text-sm sm:text-base text-gray-700">
                        {sport}
                    </p>
                    {/* Height & Weight */}
                    {(height || weight) && (
                        <p
                            className="text-sm text-gray-500"
                            aria-label={`Physical stats: ${physicalStats}`}
                        >
                            {height && weight ? `${height} • ${weight}` : height || weight}
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2" role="group" aria-label="Player actions">
                    {/* Primary Button */}
                    {onPrimaryClick ? (
                        <button
                            onClick={onPrimaryClick}
                            aria-label={`${primaryButtonLabel} for ${playerName}`}
                            className="block w-full min-h-[44px] px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white font-bold text-center hover:shadow-lg hover:from-blue-400 hover:to-blue-500 transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                        >
                            {primaryButtonLabel}
                        </button>
                    ) : (
                        <Link
                            href={`/player/${playerId}/profile`}
                            aria-label={`${primaryButtonLabel} for ${playerName}`}
                            className="block w-full min-h-[44px] px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white font-bold text-center hover:shadow-lg hover:from-blue-400 hover:to-blue-500 transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                        >
                            {primaryButtonLabel}
                        </Link>
                    )}

                    {/* Secondary Button */}
                    {secondaryButtonLabel && (
                        <button
                            onClick={onSecondaryClick}
                            aria-label={`${secondaryButtonLabel} ${playerName}`}
                            className="block w-full min-h-[44px] px-4 py-3 bg-gray-100 rounded-lg text-gray-900 font-semibold text-center hover:bg-gray-200 transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white"
                        >
                            {secondaryButtonLabel}
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
});
