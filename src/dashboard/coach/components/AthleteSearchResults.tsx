'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PlayerCard } from '../../common/components/PlayerCard';
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
}) => {
    const router = useRouter();

    // Handle athlete card click to navigate to profile
    const handleAthleteClick = (playerId: string) => {
        router.push(`/player/${playerId}/profile`);
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
                    <div
                        key={`skeleton-${index}`}
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-pulse"
                        role="status"
                        aria-label="Loading athlete card"
                    >
                        {/* Image skeleton */}
                        <div className="aspect-video bg-gray-300" />

                        {/* Content skeleton */}
                        <div className="p-4 sm:p-5">
                            {/* Name skeleton */}
                            <div className="h-6 sm:h-7 bg-gray-300 rounded mb-2 w-3/4" />

                            {/* Position skeleton */}
                            <div className="h-4 sm:h-5 bg-gray-200 rounded mb-1 w-1/2" />

                            {/* Sport skeleton */}
                            <div className="h-3 sm:h-4 bg-gray-200 rounded mb-1 w-2/3" />

                            {/* Stats skeleton */}
                            <div className="h-3 sm:h-4 bg-gray-200 rounded mb-4 w-1/3" />

                            {/* Button skeletons */}
                            <div className="space-y-2">
                                <div className="h-10 sm:h-11 bg-gray-300 rounded-lg" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Empty state with helpful message when no results
    if (!isLoading && athletes.length === 0) {
        return (
            <div
                className="flex flex-col items-center justify-center py-12 sm:py-16 px-4"
                role="status"
                aria-live="polite"
            >
                <div className="text-center max-w-md">
                    {/* Icon */}
                    <div className="mb-4 sm:mb-6">
                        <svg
                            className="w-16 h-16 sm:w-24 sm:h-24 mx-auto text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>

                    {/* Message */}
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                        No Athletes Found
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                        We couldn't find any athletes matching your search criteria.
                        Try adjusting your filters to see more results.
                    </p>

                    {/* Suggestions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-left">
                        <p className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">
                            Try these tips:
                        </p>
                        <ul className="text-xs sm:text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>Broaden your GPA range</li>
                            <li>Remove height or weight restrictions</li>
                            <li>Try different positions or divisions</li>
                            <li>Clear all filters and start fresh</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);

    // Render athlete cards in responsive grid
    return (
        <div role="region" aria-label="Search results">
            {/* Results count */}
            <div className="mb-4 sm:mb-6">
                <p className="text-sm sm:text-base text-gray-700" role="status" aria-live="polite">
                    Found <span className="font-semibold">{totalCount}</span> {totalCount === 1 ? 'athlete' : 'athletes'}
                    {totalPages > 1 && (
                        <span className="text-gray-500">
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
                            videoThumbnail={athlete.videoUrl ? athlete.profileImageUrl : undefined}
                            height={heightDisplay}
                            weight={weightDisplay}
                            primaryButtonLabel="View Profile"
                            onPrimaryClick={() => handleAthleteClick(athlete.id)}
                            onWatchVideo={athlete.videoUrl ? () => {
                                // Video modal functionality can be added later
                                console.log('Watch video:', athlete.videoUrl);
                            } : undefined}
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
