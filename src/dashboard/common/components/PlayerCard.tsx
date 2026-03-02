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
}: PlayerCardProps) {
    const playerName = `${firstName} ${lastName}`;
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

    return (
        <div className="bg-white/90 rounded-2xl shadow-lg border border-white/50 backdrop-blur-sm overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Video/Image Section */}
            <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900">
                {videoThumbnail ? (
                    <Image
                        src={videoThumbnail}
                        alt={`${playerName} highlight`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={false}
                    />
                ) : profileImage ? (
                    <Image
                        src={profileImage}
                        alt={playerName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={false}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl font-black text-white/10">
                            {initials}
                        </span>
                    </div>
                )}

                {/* Play button overlay for video thumbnail */}
                {videoThumbnail && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                            <svg
                                className="w-8 h-8 text-slate-900 ml-1"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            {/* Player Info Section */}
            <div className="p-4 sm:p-5">
                {/* Player Name */}
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 truncate">
                    {playerName}
                </h3>

                {/* Position & Sport */}
                <div className="space-y-1 mb-4">
                    <p className="text-base sm:text-lg font-semibold text-blue-600">
                        {position}
                    </p>
                    <p className="text-sm sm:text-base text-slate-600">
                        {sport}
                    </p>
                </div>

                {/* View Profile Button */}
                <Link
                    href={`/player/${playerId}/profile`}
                    className="block w-full min-h-[44px] px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white font-semibold text-center hover:shadow-lg transition-all touch-manipulation"
                >
                    View Profile
                </Link>
            </div>
        </div>
    );
});
