'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { PlayerCardProps } from '../types';
import { PlayerMediaDisplay } from './PlayerMediaDisplay';
import { PlayerStatusBadge } from './PlayerStatusBadge';
import { FavoriteButton } from './FavoriteButton';

/**
 * PlayerCard — 2026 redesign
 *
 * Visual language:
 * - 4:5 aspect-ratio media with gradient overlay (via PlayerMediaDisplay)
 * - Player name + position in a glassmorphic strip at the bottom of the media
 * - Stats in mono font (--type-stat)
 * - Hover: image scales 1.04 (handled in PlayerMediaDisplay), stats panel slides up,
 *   subtle 3D tilt toward cursor via JS mouse tracking
 * - Favorite heart: subtle scale on click using brand green
 * - Container query: adapts for grid (image-dominant) vs list view (horizontal)
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
    videoUrl,
    secondaryButtonLabel,
    onSecondaryClick,
    priority = false,
    currentUserId,
    userType,
    isFavorited = false,
    onFavoriteToggle,
    onMessageClick,
    hasAcceptedOffer = false,
}: PlayerCardProps) {
    const playerName = `${firstName} ${lastName}`;
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

    // Optimistic favorite state
    const [optimisticFavorited, setOptimisticFavorited] = useState(isFavorited);
    const [isToggling, setIsToggling] = useState(false);

    // 3D tilt state
    const cardRef = useRef<HTMLElement>(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    React.useEffect(() => {
        setOptimisticFavorited(isFavorited);
    }, [isFavorited]);

    // ── 3D tilt handlers ──
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        setTilt({ x: dy * -2, y: dx * 2 }); // rotateX, rotateY in degrees
    }, []);

    const handleMouseLeave = useCallback(() => {
        setTilt({ x: 0, y: 0 });
    }, []);

    // ── Favorite toggle ──
    const handleFavoriteClick = async () => {
        if (!onFavoriteToggle || isToggling) return;

        const previousState = optimisticFavorited;
        setOptimisticFavorited(!previousState);
        setIsToggling(true);

        try {
            await onFavoriteToggle(playerId, previousState);
        } catch {
            setOptimisticFavorited(previousState);
        } finally {
            setIsToggling(false);
        }
    };

    // ── Profile URL ──
    const getProfileUrl = (): string => {
        if (userType === 'coach' && currentUserId) {
            return `/coach/${currentUserId}/dashboard/player-profile/${playerId}`;
        }
        if (userType === 'player' && currentUserId) {
            return `/player/dashboard/${currentUserId}/player-profile/${playerId}`;
        }
        return `/player/${playerId}/profile`;
    };

    const profileUrl = getProfileUrl();

    const cardStyle: React.CSSProperties = {
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: tilt.x === 0 && tilt.y === 0
            ? `transform var(--d-base) var(--e-out)`
            : `transform var(--d-fast) var(--e-glide)`,
        containerType: 'inline-size',
        // clip-path stays stable through 3D transforms — no flicker unlike overflow-hidden
        clipPath: 'inset(0 round 1rem)',
    };

    return (
        <article
            ref={cardRef}
            className="group relative rounded-2xl cursor-default"
            style={{
                ...cardStyle,
                background: hasAcceptedOffer ? 'oklch(68% 0.22 150 / 0.07)' : 'var(--ink-1)'
            }}
            aria-label={`Player card for ${playerName}${hasAcceptedOffer ? ', offer accepted' : ''}`}
            data-testid="player-card"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Single wrapper — clip-path on the article handles rounding */}
            <div>
                {/* ── Media + glassmorphic info strip ── */}
                <div className="relative">
                    <PlayerMediaDisplay
                        videoThumbnail={videoThumbnail}
                        videoUrl={videoUrl}
                        profileImage={profileImage}
                        playerName={playerName}
                        initials={initials}
                        priority={priority}
                        onWatchVideo={onWatchVideo}
                    />

                    {/* Status badge */}
                    {status && <PlayerStatusBadge status={status} />}

                    {/* Committed overlay badge */}
                    {hasAcceptedOffer && (
                        <div
                            data-testid="offer-accepted-banner"
                            className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                            style={{
                                background: 'oklch(68% 0.22 150 / 0.92)',
                                color: 'var(--ink-0)',
                                backdropFilter: 'blur(4px)',
                            }}
                            aria-label="Player has committed"
                        >
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Committed
                        </div>
                    )}

                    {/* Glassmorphic name + position strip — slides up on hover */}
                    <div
                        aria-hidden="true"
                        className="absolute bottom-0 left-0 right-0 px-4 py-3 translate-y-2 opacity-90 group-hover:translate-y-0 group-hover:opacity-100"
                        style={{
                            backdropFilter: 'blur(12px) saturate(1.4)',
                            background: 'oklch(15% 0.015 260 / 0.72)',
                            transition: `transform var(--d-base) var(--e-out), opacity var(--d-fast) var(--e-glide)`,
                        }}
                    >
                        <p
                            className="font-bold truncate"
                            style={{ font: 'var(--type-h1)', color: 'var(--text-hi)', fontSize: '1rem' }}
                        >
                            {playerName}
                        </p>
                        <p style={{ color: 'var(--brand-500)', fontSize: '0.875rem', fontWeight: 500 }}>
                            {position}
                        </p>
                    </div>

                    {/* Favorite heart button */}
                    {onFavoriteToggle && (
                        <div className="absolute top-3 right-3 z-10">
                            <FavoriteButton
                                isFavorited={optimisticFavorited}
                                playerName={playerName}
                                isDisabled={isToggling}
                                onClick={handleFavoriteClick}
                                variant="card"
                            />
                        </div>
                    )}
                </div>

                {/* ── Stats + actions panel — slides up on hover ── */}
                <div
                    className="px-4 pb-4 pt-3 translate-y-1 group-hover:translate-y-0"
                    style={{
                        transition: `transform var(--d-base) var(--e-out)`,
                        background: 'var(--ink-1)',
                    }}
                >
                    {/* Sport + physical stats in mono font */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span style={{ color: 'var(--text-mid)', fontSize: '0.8125rem' }}>{sport}</span>
                        {(height || weight) && (
                            <span
                                style={{
                                    font: 'var(--type-stat)',
                                    fontSize: '0.8125rem',
                                    color: 'var(--text-lo)',
                                }}
                                aria-label={`Physical stats: ${[height, weight].filter(Boolean).join(', ')}`}
                            >
                                {height && weight ? `${height} • ${weight}` : height || weight}
                            </span>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2" role="group" aria-label="Player actions">
                        {onPrimaryClick ? (
                            <button
                                onClick={onPrimaryClick}
                                aria-label={`${primaryButtonLabel} for ${playerName}`}
                                className="w-full min-h-[44px] px-4 py-2.5 rounded-lg font-semibold text-sm text-center touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2"
                                style={{
                                    background: 'var(--brand-500)',
                                    color: 'var(--ink-0)',
                                    transition: `background var(--d-fast) var(--e-glide)`,
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--brand-600)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'var(--brand-500)')}
                            >
                                {primaryButtonLabel}
                            </button>
                        ) : (
                            <Link
                                href={profileUrl}
                                aria-label={`${primaryButtonLabel} for ${playerName}`}
                                className="block w-full min-h-[44px] px-4 py-2.5 rounded-lg font-semibold text-sm text-center touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2"
                                style={{
                                    background: 'var(--brand-500)',
                                    color: 'var(--ink-0)',
                                    transition: `background var(--d-fast) var(--e-glide)`,
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--brand-600)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'var(--brand-500)')}
                            >
                                {primaryButtonLabel}
                            </Link>
                        )}

                        {secondaryButtonLabel && onSecondaryClick && (
                            <button
                                onClick={onSecondaryClick}
                                aria-label={`${secondaryButtonLabel} ${playerName}`}
                                className="w-full min-h-[44px] px-4 py-2.5 rounded-lg font-semibold text-sm text-center touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2"
                                style={{
                                    background: 'var(--ink-3)',
                                    color: 'var(--text-mid)',
                                    transition: `background var(--d-fast) var(--e-glide)`,
                                }}
                            >
                                {secondaryButtonLabel}
                            </button>
                        )}

                        {userType === 'coach' && onMessageClick && (
                            <button
                                onClick={onMessageClick}
                                aria-label={`Message ${playerName}`}
                                className="w-full min-h-[44px] px-4 py-2.5 rounded-lg font-semibold text-sm text-center focus:outline-none focus:ring-2 focus:ring-offset-2"
                                style={{
                                    background: 'var(--ink-3)',
                                    color: 'var(--text-mid)',
                                    transition: `background var(--d-fast) var(--e-glide)`,
                                }}
                            >
                                Message
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
});
