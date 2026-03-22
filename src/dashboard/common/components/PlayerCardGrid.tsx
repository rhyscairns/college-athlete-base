'use client';

import React from 'react';
import { PlayerCard } from './PlayerCard';
import type { PlayerCardData, PlayerCardGridProps } from '../types';

export const PlayerCardGrid: React.FC<PlayerCardGridProps> = ({
    players,
    currentUserId,
    userType,
    isLoading = false,
    emptyMessage = 'No players found',
    onWatchVideo,
}) => {
    // Filter out current user's card
    const filteredPlayers = players.filter(
        (player) => player.playerId !== currentUserId
    );

    // Determine button labels based on userType
    const getButtonLabels = () => {
        if (userType === 'coach') {
            return {
                primary: 'View Profile',
                secondary: 'Contact',
            };
        }
        return {
            primary: 'View Profile',
            secondary: 'Connect',
        };
    };

    const buttonLabels = getButtonLabels();

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <div
            className="bg-slate-800/50 rounded-2xl shadow-lg border border-white/10 overflow-hidden animate-pulse"
            role="status"
            aria-label="Loading player card"
        >
            {/* Image skeleton */}
            <div className="aspect-video bg-slate-700" />
            {/* Content skeleton */}
            <div className="p-4 sm:p-5 space-y-3">
                <div className="h-6 bg-slate-700 rounded w-3/4" />
                <div className="h-4 bg-slate-700 rounded w-1/2" />
                <div className="h-4 bg-slate-700 rounded w-2/3" />
                <div className="space-y-2 pt-2">
                    <div className="h-11 bg-slate-700 rounded" />
                    <div className="h-11 bg-slate-700 rounded" />
                </div>
            </div>
            <span className="sr-only">Loading player information...</span>
        </div>
    );

    // Show loading skeletons
    if (isLoading) {
        return (
            <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                role="region"
                aria-label="Player cards loading"
                aria-busy="true"
            >
                {Array.from({ length: 8 }).map((_, index) => (
                    <LoadingSkeleton key={index} />
                ))}
            </div>
        );
    }

    // Show empty state
    if (filteredPlayers.length === 0) {
        return (
            <div
                className="flex items-center justify-center min-h-[400px]"
                role="status"
                aria-live="polite"
            >
                <div className="text-center">
                    <p className="text-xl text-gray-600">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    // Render player cards
    // First 3 cards get priority loading (above the fold on desktop)
    return (
        <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="region"
            aria-label={`${filteredPlayers.length} player ${filteredPlayers.length === 1 ? 'card' : 'cards'}`}
        >
            {filteredPlayers.map((player, index) => (
                <PlayerCard
                    key={player.playerId}
                    playerId={player.playerId}
                    firstName={player.firstName}
                    lastName={player.lastName}
                    position={player.position}
                    sport={player.sport}
                    videoThumbnail={player.videoThumbnail}
                    profileImage={player.profileImage}
                    status={player.status}
                    height={player.height}
                    weight={player.weight}
                    primaryButtonLabel={buttonLabels.primary}
                    secondaryButtonLabel={buttonLabels.secondary}
                    onPrimaryClick={player.onPrimaryClick}
                    onSecondaryClick={player.onSecondaryClick}
                    onWatchVideo={
                        player.videoUrl && onWatchVideo
                            ? () => onWatchVideo(
                                player.playerId,
                                player.videoUrl!,
                                player.videoTitle,
                                `${player.firstName} ${player.lastName}`
                            )
                            : undefined
                    }
                    priority={index < 3}
                />
            ))}
        </div>
    );
};
