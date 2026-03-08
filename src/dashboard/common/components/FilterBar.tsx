'use client';

import React from 'react';

export interface FilterBarProps {
    sports: string[];
    positions: string[];
    selectedSport: string;
    selectedPosition: string;
    onSportChange: (sport: string) => void;
    onPositionChange: (position: string) => void;
    onSearch: () => void;
    isLoading?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
    sports,
    positions,
    selectedSport,
    selectedPosition,
    onSportChange,
    onPositionChange,
    onSearch,
    isLoading = false,
}) => {
    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            action();
        }
    };

    return (
        <div
            className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200"
            role="search"
            aria-label="Player filter controls"
        >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Filter Label */}
                <span
                    className="text-gray-700 font-medium whitespace-nowrap"
                    id="filter-label"
                    aria-hidden="true"
                >
                    Filter by:
                </span>

                {/* Filter Controls Container */}
                <div className="flex flex-col md:flex-row gap-4 flex-1">
                    {/* Sport Dropdown */}
                    <div className="flex-1">
                        <label htmlFor="sport-filter" className="sr-only">
                            Filter by sport
                        </label>
                        <select
                            id="sport-filter"
                            value={selectedSport}
                            onChange={(e) => onSportChange(e.target.value)}
                            disabled={isLoading}
                            aria-label="Filter by sport"
                            aria-describedby="filter-label"
                            className="w-full px-4 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {sports.map((sport) => (
                                <option key={sport} value={sport}>
                                    {sport}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Position Dropdown */}
                    <div className="flex-1">
                        <label htmlFor="position-filter" className="sr-only">
                            Filter by position
                        </label>
                        <select
                            id="position-filter"
                            value={selectedPosition}
                            onChange={(e) => onPositionChange(e.target.value)}
                            disabled={isLoading}
                            aria-label="Filter by position"
                            aria-describedby="filter-label"
                            className="w-full px-4 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {positions.map((position) => (
                                <option key={position} value={position}>
                                    {position}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={onSearch}
                        onKeyDown={(e) => handleKeyDown(e, onSearch)}
                        disabled={isLoading}
                        aria-label="Apply filters and search"
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] flex items-center justify-center gap-2"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <span>Search</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
