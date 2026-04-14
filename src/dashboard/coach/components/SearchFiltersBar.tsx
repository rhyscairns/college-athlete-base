'use client';

import React, { useState } from 'react';
import { SearchCriteria } from '../types';
import { inchesToHeight } from '../utils/search';

export interface SearchFiltersBarProps {
    criteria: SearchCriteria;
    onFilterChange: (criteria: SearchCriteria) => void;
    onClearAll: () => void;
    onRefineSearch?: () => void;
}

interface FilterChip {
    key: string;
    label: string;
    value: string;
}

export function SearchFiltersBar({
    criteria,
    onFilterChange,
    onClearAll,
    onRefineSearch,
}: SearchFiltersBarProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    // Build array of active filters for display
    const activeFilters: FilterChip[] = [];

    if (criteria.sport) {
        activeFilters.push({
            key: 'sport',
            label: 'Sport',
            value: criteria.sport,
        });
    }

    if (criteria.position) {
        activeFilters.push({
            key: 'position',
            label: 'Position',
            value: criteria.position,
        });
    }

    if (criteria.desiredDivision) {
        activeFilters.push({
            key: 'desiredDivision',
            label: 'Division',
            value: criteria.desiredDivision,
        });
    }

    if (criteria.gpaMin !== undefined || criteria.gpaMax !== undefined) {
        const min = criteria.gpaMin?.toFixed(1) ?? '0.0';
        const max = criteria.gpaMax?.toFixed(1) ?? '4.0';
        activeFilters.push({
            key: 'gpa',
            label: 'GPA',
            value: `${min} - ${max}`,
        });
    }

    if (criteria.affordableAmount !== undefined) {
        activeFilters.push({
            key: 'affordableAmount',
            label: 'Affordable Amount',
            value: `$${criteria.affordableAmount.toLocaleString()}`,
        });
    }

    if (criteria.heightMin !== undefined || criteria.heightMax !== undefined) {
        const min = criteria.heightMin ?? '0"';
        const max = criteria.heightMax ?? '∞';
        activeFilters.push({
            key: 'height',
            label: 'Height',
            value: `${min} - ${max}`,
        });
    }

    if (criteria.weightMin !== undefined || criteria.weightMax !== undefined) {
        const min = criteria.weightMin ?? 0;
        const max = criteria.weightMax ?? '∞';
        activeFilters.push({
            key: 'weight',
            label: 'Weight',
            value: `${min} - ${max} lbs`,
        });
    }

    // Handle removing a specific filter
    const handleRemoveFilter = (filterKey: string) => {
        const newCriteria = { ...criteria };

        switch (filterKey) {
            case 'sport':
                delete newCriteria.sport;
                // Also remove position since it depends on sport
                delete newCriteria.position;
                break;
            case 'position':
                delete newCriteria.position;
                break;
            case 'desiredDivision':
                delete newCriteria.desiredDivision;
                break;
            case 'gpa':
                delete newCriteria.gpaMin;
                delete newCriteria.gpaMax;
                break;
            case 'affordableAmount':
                delete newCriteria.affordableAmount;
                break;
            case 'height':
                delete newCriteria.heightMin;
                delete newCriteria.heightMax;
                break;
            case 'weight':
                delete newCriteria.weightMin;
                delete newCriteria.weightMax;
                break;
        }

        onFilterChange(newCriteria);
    };

    // Don't render if no active filters
    if (activeFilters.length === 0) {
        return null;
    }

    return (
        <div className="bg-white border-b border-gray-200">
            {/* Mobile: Collapsible header */}
            <div className="lg:hidden px-4 py-3 flex items-center justify-between">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls="filters-content"
                >
                    <span>Active Filters ({activeFilters.length})</span>
                    <svg
                        className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>
                <div className="flex gap-2">
                    {onRefineSearch && (
                        <button
                            onClick={onRefineSearch}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="button"
                        >
                            Refine
                        </button>
                    )}
                    <button
                        onClick={onClearAll}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                        type="button"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Filter chips - Collapsible on mobile, always visible on desktop */}
            <div
                id="filters-content"
                className={`px-4 sm:px-6 py-3 sm:py-4 ${isExpanded ? 'block' : 'hidden'} lg:block`}
            >
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 hidden lg:inline">Active Filters:</span>

                    {/* Filter chips */}
                    <div className="flex flex-wrap gap-2">
                        {activeFilters.map((filter) => (
                            <div
                                key={filter.key}
                                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm"
                            >
                                <span className="font-medium">{filter.label}:</span>
                                <span className="truncate max-w-[120px] sm:max-w-none">{filter.value}</span>
                                <button
                                    onClick={() => handleRemoveFilter(filter.key)}
                                    className="ml-0.5 sm:ml-1 hover:bg-blue-100 rounded-full p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label={`Remove ${filter.label} filter`}
                                    type="button"
                                >
                                    <svg
                                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Action buttons - Desktop only (mobile has them in header) */}
                    <div className="hidden lg:flex gap-2 ml-auto">
                        {onRefineSearch && (
                            <button
                                onClick={onRefineSearch}
                                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="button"
                            >
                                Refine Search
                            </button>
                        )}
                        <button
                            onClick={onClearAll}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                            type="button"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
