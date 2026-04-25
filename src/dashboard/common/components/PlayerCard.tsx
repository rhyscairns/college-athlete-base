'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { PlayerCardProps } from '../types';
import { PlayerMediaDisplay } from './PlayerMediaDisplay';
import { PlayerStatusBadge } from './PlayerStatusBadge';
import { PlayerInfoSection } from './PlayerInfoSection';

/**
 * PlayerCard Component
 * 
 * Displays a player's profile information in a card format with media, stats, and action buttons.
 * Supports both coach and player views with dynamic routing based on user type.
 * 
 * Features:
 * - Responsive design with hover effects
 * - Video thumbnail or profile image display
 * - Optional status badge (available, interested, contacted)
 * - Configurable action button (link or callback)
 * - Accessible with ARIA labels and keyboard navigation
 * - Optimized with React.memo for performance
 * 
 * @param props - Component props
 * @param props.playerId - Unique identifier for the player
 * @param props.firstName - Player's first name
 * @param props.lastName - Player's last name
 * @param props.position - Player's position/role
 * @param props.sport - Sport the player participates in
 * @param props.videoThumbnail - Optional video thumbnail URL
 * @param props.profileImage - Optional profile image URL
 * @param props.status - Optional status badge (available, interested, contacted)
 * @param props.height - Optional height display (e.g., "6'2\"")
 * @param props.weight - Optional weight display (e.g., "210 lbs")
 * @param props.primaryButtonLabel - Custom label for action button (default: "View Profile")
 * @param props.onPrimaryClick - Optional callback for button click (renders button instead of link)
 * @param props.onWatchVideo - Optional callback for video play button
 * @param props.priority - Image loading priority for above-the-fold cards
 * @param props.currentUserId - Current logged-in user ID for routing
 * @param props.userType - Type of current user (coach or player) for routing
 * @returns Memoized player card component
 * 
 * @example
 * ```tsx
 * // Coach viewing player card
 * <PlayerCard
 *   playerId="player-123"
 *   firstName="John"
 *   lastName="Smith"
 *   position="Point Guard"
 *   sport="Basketball"
 *   height="6'2\""
 *   weight="185 lbs"
 *   status="available"
 *   currentUserId="coach-456"
 *   userType="coach"
 *   onWatchVideo={() => handleVideoPlay()}
 * />
 * 
 * // Player viewing another player's card
 * <PlayerCard
 *   playerId="player-789"
 *   firstName="Sarah"
 *   lastName="Johnson"
 *   position="Forward"
 *   sport="Soccer"
 *   currentUserId="player-123"
 *   userType="player"
 * />
 * ```
 */
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
    onPrimaryClick,
    onWatchVideo,
    secondaryButtonLabel,
    onSecondaryClick,
    priority = false,
    currentUserId,
    userType,
    isFavorited = false,
    onFavoriteToggle,
    onMessageClick,
}: PlayerCardProps) {
    const playerName = `${firstName} ${lastName}`;
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

    // Optimistic favorite state — local copy that flips immediately on click
    const [optimisticFavorited, setOptimisticFavorited] = useState(isFavorited);
    const [isToggling, setIsToggling] = useState(false);

    // Keep local state in sync when the parent prop changes (e.g. after a page reload)
    React.useEffect(() => {
        setOptimisticFavorited(isFavorited);
    }, [isFavorited]);

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!onFavoriteToggle || isToggling) return;

        const previousState = optimisticFavorited;
        setOptimisticFavorited(!previousState); // optimistic flip
        setIsToggling(true);

        try {
            await onFavoriteToggle(playerId, previousState);
        } catch {
            setOptimisticFavorited(previousState); // revert on error
        } finally {
            setIsToggling(false);
        }
    };

    // Build the profile URL based on user type
    const getProfileUrl = (): string => {
        if (userType === 'coach' && currentUserId) {
            return `/coach/${currentUserId}/dashboard/player-profile/${playerId}`;
        }
        if (userType === 'player' && currentUserId) {
            return `/player/dashboard/${currentUserId}/player-profile/${playerId}`;
        }
        // Default to player profile view
        return `/player/${playerId}/profile`;
    };

    const profileUrl = getProfileUrl();

    return (
        <article
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-gray-300 transition-all duration-300 hover:-translate-y-1"
            aria-label={`Player card for ${playerName}`}
        >
            {/* Media Section with Status Badge */}
            <div className="relative">
                <PlayerMediaDisplay
                    videoThumbnail={videoThumbnail}
                    profileImage={profileImage}
                    playerName={playerName}
                    initials={initials}
                    priority={priority}
                    onWatchVideo={onWatchVideo}
                />
                {status && <PlayerStatusBadge status={status} />}
                {/* Heart / favorite icon — only rendered when onFavoriteToggle is provided */}
                {onFavoriteToggle && (
                    <button
                        onClick={handleFavoriteClick}
                        disabled={isToggling}
                        aria-label={optimisticFavorited ? `Remove ${playerName} from prospects` : `Add ${playerName} to prospects`}
                        aria-pressed={optimisticFavorited}
                        className="absolute top-2 right-2 z-10 flex items-center justify-center w-14 h-14 rounded-full bg-black/40 hover:bg-black/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    >
                        {optimisticFavorited ? (
                            <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        ) : (
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        )}
                    </button>
                )}
            </div>

            {/* Player Info */}
            <PlayerInfoSection
                playerName={playerName}
                position={position}
                sport={sport}
                height={height}
                weight={weight}
            />

            {/* Action Buttons */}
            <div className="px-4 pb-4 sm:px-5 sm:pb-5 flex flex-col gap-2" role="group" aria-label="Player actions">
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
                        href={profileUrl}
                        aria-label={`${primaryButtonLabel} for ${playerName}`}
                        className="block w-full min-h-[44px] px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white font-bold text-center hover:shadow-lg hover:from-blue-400 hover:to-blue-500 transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                    >
                        {primaryButtonLabel}
                    </Link>
                )}
                {secondaryButtonLabel && onSecondaryClick && (
                    <button
                        onClick={onSecondaryClick}
                        aria-label={`${secondaryButtonLabel} ${playerName}`}
                        className="block w-full min-h-[44px] px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold text-center hover:bg-gray-200 hover:shadow-lg transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white"
                    >
                        {secondaryButtonLabel}
                    </button>
                )}
                {userType === 'coach' && onMessageClick && (
                    <button
                        onClick={onMessageClick}
                        aria-label={`Message ${playerName}`}
                        className="block w-full min-h-[44px] px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold text-center hover:bg-gray-200 hover:shadow-lg transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white"
                    >
                        Message
                    </button>
                )}
            </div>
        </article>
    );
});
