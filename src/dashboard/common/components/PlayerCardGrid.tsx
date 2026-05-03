'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { PlayerCard } from './PlayerCard';
import { PlayerCardSkeleton } from '../../../components/primitives/Skeleton';
import type { PlayerCardGridProps } from '../types';

// Max cards that get stagger animation (rest snap in immediately)
const STAGGER_MAX = 12;
const STAGGER_STEP_MS = 50;

/**
 * PlayerCardGrid — 2026 redesign
 *
 * Features:
 * - Stagger-reveal on mount (50ms increments, max 12 cards)
 * - FLIP animation on filter changes (cards animate to new positions)
 * - Scroll-driven fade via CSS animation-timeline: view() where supported
 * - Content-shaped PlayerCardSkeleton while loading
 * - Empty state with accessible status role
 */
export const PlayerCardGrid: React.FC<PlayerCardGridProps> = ({
    players,
    currentUserId,
    userType,
    isLoading = false,
    emptyMessage = 'No players found',
    onWatchVideo,
    favoritedPlayerIds,
    onFavoriteToggle,
}) => {
    // Filter out current user
    const filteredPlayers = useMemo(
        () => players.filter((p) => p.playerId !== currentUserId),
        [players, currentUserId]
    );

    const buttonLabels = useMemo(() => ({
        primary: 'View Profile',
        secondary: userType === 'coach' ? 'Contact' : 'Connect',
    }), [userType]);

    // ── FLIP: store previous positions before re-render ──
    const gridRef = useRef<HTMLDivElement>(null);
    const prevPositions = useRef<Map<string, DOMRect>>(new Map());

    // Capture positions before update
    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;
        const map = new Map<string, DOMRect>();
        grid.querySelectorAll<HTMLElement>('[data-player-id]').forEach((el) => {
            const id = el.dataset.playerId!;
            map.set(id, el.getBoundingClientRect());
        });
        prevPositions.current = map;
    });

    // Play FLIP after update
    useEffect(() => {
        const grid = gridRef.current;
        if (!grid || prevPositions.current.size === 0) return;

        grid.querySelectorAll<HTMLElement>('[data-player-id]').forEach((el) => {
            const id = el.dataset.playerId!;
            const prev = prevPositions.current.get(id);
            if (!prev) return;
            const next = el.getBoundingClientRect();
            const dx = prev.left - next.left;
            const dy = prev.top - next.top;
            if (dx === 0 && dy === 0) return;

            el.animate(
                [
                    { transform: `translate(${dx}px, ${dy}px)` },
                    { transform: 'translate(0, 0)' },
                ],
                {
                    duration: 400,
                    easing: 'cubic-bezier(0.65, 0, 0.35, 1)', // --e-glide
                    fill: 'both',
                }
            );
        });
    }, [filteredPlayers]);

    // ── Loading state ──
    if (isLoading) {
        return (
            <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                role="region"
                aria-label="Player cards loading"
                aria-busy="true"
            >
                {Array.from({ length: 3 }).map((_, i) => (
                    <PlayerCardSkeleton key={i} data-testid={`player-card-skeleton-${i}`} />
                ))}
            </div>
        );
    }

    // ── Empty state ──
    if (filteredPlayers.length === 0) {
        return (
            <div
                className="flex items-center justify-center min-h-[400px]"
                role="status"
                aria-live="polite"
            >
                <p className="text-xl" style={{ color: 'var(--text-mid)' }}>{emptyMessage}</p>
            </div>
        );
    }

    // ── Grid ──
    return (
        <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="region"
            aria-label={`${filteredPlayers.length} player ${filteredPlayers.length === 1 ? 'card' : 'cards'}`}
            data-testid="player-card-grid"
        >
            {filteredPlayers.map((player, index) => (
                <div
                    key={player.playerId}
                    data-player-id={player.playerId}
                    style={{
                        animationDelay: index < STAGGER_MAX ? `${index * STAGGER_STEP_MS}ms` : '0ms',
                        animationFillMode: 'both',
                    }}
                    className="animate-fade-in scroll-reveal"
                >
                    <PlayerCard
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
                        currentUserId={currentUserId}
                        userType={userType}
                        onPrimaryClick={player.onPrimaryClick}
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
                        isFavorited={favoritedPlayerIds?.has(player.playerId)}
                        onFavoriteToggle={onFavoriteToggle}
                        onMessageClick={player.onMessageClick}
                        priority={index < 3}
                    />
                </div>
            ))}
        </div>
    );
};
