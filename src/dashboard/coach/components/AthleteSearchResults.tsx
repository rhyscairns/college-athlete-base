'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PlayerCard } from '../../common/components/PlayerCard';
import { PlayerCardSkeleton } from '../../../components/primitives/Skeleton';
import { EmptyState } from '../../../components/primitives/EmptyState';
import { NoSearchResultsIllustration } from '../../../components/primitives/illustrations/NoSearchResults';
import { Pagination } from '../../common/components/Pagination';
import type { AthleteSearchResultsProps } from '../types';
import { inchesToHeight } from '../utils/search';

export const AthleteSearchResults: React.FC<AthleteSearchResultsProps> = ({
    athletes,
    isLoading,
    totalCount,
    currentPage,
    pageSize,
    onPageChange,
    coachId,
    favoritedPlayerIds,
    onFavoriteToggle,
    onWatchVideo,
}) => {
    const router = useRouter();

    // Navigate to the search-scoped player profile URL
    const handleAthleteClick = (playerId: string) => {
        if (coachId) {
            router.push(`/coach/${coachId}/dashboard/search/${playerId}`);
        } else {
            router.push(`/coach/dashboard/search/${playerId}`);
        }
    };

    // Loading skeleton states
    if (isLoading) {
        return (
            <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                role="region"
                aria-label="Loading search results"
                aria-busy="true"
            >
                {Array.from({ length: pageSize }).map((_, index) => (
                    <PlayerCardSkeleton key={`skeleton-${index}`} />
                ))}
            </div>
        );
    }

    // Empty state (task 4.6)
    if (!isLoading && athletes.length === 0) {
        return (
            <EmptyState
                illustration={<NoSearchResultsIllustration />}
                title="No athletes found"
                description="No athletes match your search criteria — try adjusting your filters."
                data-testid="no-results-message"
            />
        );
    }

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);

    // Render athlete cards in responsive grid
    return (
        <div role="region" aria-label="Search results">
            {/* Results count */}
            <div className="mb-4 sm:mb-6">
                <p className="text-sm sm:text-base" role="status" aria-live="polite" style={{ color: 'var(--text-mid)' }}>
                    Found <span className="font-semibold" style={{ color: 'var(--text-hi)' }}>{totalCount}</span> {totalCount === 1 ? 'athlete' : 'athletes'}
                    {totalPages > 1 && (
                        <span style={{ color: 'var(--text-lo)' }}>
                            {' '}(Page {currentPage} of {totalPages})
                        </span>
                    )}
                </p>
            </div>

            {/* Responsive grid layout: 1 col mobile, 2 col tablet, 3 col desktop */}
            <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                role="list"
                aria-label={`${athletes.length} athlete ${athletes.length === 1 ? 'card' : 'cards'}`}
            >
                {athletes.map((athlete, index) => {
                    // Convert height from inches to display format
                    const heightDisplay = inchesToHeight(athlete.heightInches) ?? undefined;
                    const weightDisplay = `${athlete.weightLbs} lbs`;

                    // First 3 cards get priority loading (above the fold on desktop)
                    const priority = index < 3;

                    return (
                        <PlayerCard
                            key={athlete.id}
                            playerId={athlete.id}
                            firstName={athlete.firstName}
                            lastName={athlete.lastName}
                            position={athlete.position}
                            sport={athlete.sport}
                            profileImage={athlete.profileImageUrl}
                            videoThumbnail={athlete.videoUrl ? (athlete.videoThumbnailUrl ?? athlete.profileImageUrl ?? undefined) : undefined}
                            height={heightDisplay}
                            weight={weightDisplay}
                            primaryButtonLabel="View Profile"
                            onPrimaryClick={() => handleAthleteClick(athlete.id)}
                            userType="coach"
                            currentUserId={coachId}
                            isFavorited={favoritedPlayerIds?.has(athlete.id)}
                            onFavoriteToggle={onFavoriteToggle}
                            onWatchVideo={
                                athlete.videoUrl && onWatchVideo
                                    ? () => onWatchVideo(
                                        athlete.id,
                                        athlete.videoUrl!,
                                        undefined,
                                        `${athlete.firstName} ${athlete.lastName}`
                                    )
                                    : undefined
                            }
                            priority={priority}
                        />
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 sm:mt-8">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
};
