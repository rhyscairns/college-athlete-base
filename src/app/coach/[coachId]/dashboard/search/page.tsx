'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchFiltersBar } from '@/dashboard/coach/components/SearchFiltersBar';
import { AthleteSearchResults } from '@/dashboard/coach/components/AthleteSearchResults';
import { SearchCriteria, SearchResponse } from '@/dashboard/coach/types';
import { parseSearchParams, buildSearchQueryString } from '@/dashboard/coach/utils/search';

interface SearchPageProps {
    params: { coachId: string };
}

export default function CoachSearchPage({ params }: SearchPageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Parse URL search parameters
    const criteria = parseSearchParams(searchParams);

    useEffect(() => {
        const fetchSearchResults = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Build query string from criteria and pagination
                const queryParams = new URLSearchParams();

                if (criteria.sport) queryParams.set('sport', criteria.sport);
                if (criteria.position) queryParams.set('position', criteria.position);
                if (criteria.desiredDivision) queryParams.set('desiredDivision', criteria.desiredDivision);
                if (criteria.gpaMin !== undefined) queryParams.set('gpaMin', criteria.gpaMin.toString());
                if (criteria.gpaMax !== undefined) queryParams.set('gpaMax', criteria.gpaMax.toString());
                if (criteria.affordableAmount !== undefined) queryParams.set('affordableAmount', criteria.affordableAmount.toString());
                if (criteria.heightMin) queryParams.set('heightMin', criteria.heightMin);
                if (criteria.heightMax) queryParams.set('heightMax', criteria.heightMax);
                if (criteria.weightMin !== undefined) queryParams.set('weightMin', criteria.weightMin.toString());
                if (criteria.weightMax !== undefined) queryParams.set('weightMax', criteria.weightMax.toString());
                queryParams.set('page', currentPage.toString());

                const response = await fetch(`/api/dashboard/athletes/search?${queryParams.toString()}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch search results');
                }

                const apiResponse = await response.json();

                // Transform API response to match SearchResponse interface
                const data: SearchResponse = {
                    athletes: apiResponse.data.athletes,
                    totalCount: apiResponse.data.pagination.totalCount,
                    page: apiResponse.data.pagination.currentPage,
                    pageSize: apiResponse.data.pagination.pageSize,
                    filters: apiResponse.data.filters,
                };

                setSearchResults(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while searching');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearchResults();
    }, [searchParams, currentPage, criteria.sport, criteria.position, criteria.desiredDivision, criteria.gpaMin, criteria.gpaMax, criteria.affordableAmount, criteria.heightMin, criteria.heightMax, criteria.weightMin, criteria.weightMax]);

    const handleFilterChange = (newCriteria: SearchCriteria) => {
        // Reset to page 1 when filters change
        setCurrentPage(1);

        // Build new URL with updated criteria
        const queryString = buildSearchQueryString(newCriteria);
        router.push(`/coach/${params.coachId}/dashboard/search?${queryString}`);
    };

    const handleClearAll = () => {
        setCurrentPage(1);
        router.push(`/coach/${params.coachId}/dashboard/search`);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Athlete Search Results</h1>
                    <p className="text-gray-600">
                        {searchResults && !isLoading
                            ? `Found ${searchResults.totalCount} athlete${searchResults.totalCount !== 1 ? 's' : ''}`
                            : 'Searching for athletes...'}
                    </p>
                </div>

                <SearchFiltersBar
                    criteria={criteria}
                    onFilterChange={handleFilterChange}
                    onClearAll={handleClearAll}
                />

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-red-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error loading search results</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={() => window.location.reload()}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        Try again
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <AthleteSearchResults
                    athletes={searchResults?.athletes || []}
                    isLoading={isLoading}
                    totalCount={searchResults?.totalCount || 0}
                    currentPage={currentPage}
                    pageSize={searchResults?.pageSize || 20}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}
