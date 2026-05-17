'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AthleteSearchResults } from '@/dashboard/coach/components/AthleteSearchResults';
import { SearchFiltersBar } from '@/dashboard/coach/components/SearchFiltersBar';
import { VideoModal } from '@/dashboard/common/components/VideoModal';
import { SearchCriteria, SearchResponse } from '@/dashboard/coach/types';
import type { VideoModalState } from '@/dashboard/common/types';
import { parseSearchParams, buildSearchQueryString } from '@/dashboard/coach/utils/search';

interface SearchPageProps {
    params: Promise<{ coachId: string }>;
}

export default function CoachSearchPage({ params }: SearchPageProps) {
    const { coachId } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Favorites state — mirrors CoachDashboard behaviour
    const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

    // Video modal state
    const [videoModal, setVideoModal] = useState<VideoModalState>({
        isOpen: false,
        videoUrl: null,
        videoTitle: null,
        playerName: null,
    });

    const handleWatchVideo = useCallback((_playerId: string, videoUrl: string, videoTitle?: string, playerName?: string) => {
        setVideoModal({ isOpen: true, videoUrl, videoTitle: videoTitle ?? null, playerName: playerName ?? null });
    }, []);

    const handleCloseVideo = useCallback(() => {
        setVideoModal({ isOpen: false, videoUrl: null, videoTitle: null, playerName: null });
    }, []);

    const criteria = parseSearchParams(searchParams);

    // Fetch search results
    useEffect(() => {
        const fetchSearchResults = async () => {
            setIsLoading(true);
            setError(null);

            try {
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
                if (criteria.country) queryParams.set('country', criteria.country);
                if (criteria.state) queryParams.set('state', criteria.state);
                queryParams.set('page', currentPage.toString());

                const response = await fetch(`/api/dashboard/athletes/search?${queryParams.toString()}`);
                if (!response.ok) throw new Error('Failed to fetch search results');

                const apiResponse = await response.json();
                // Remap API response fields to match PlayerProfile type
                const athletes = (apiResponse.data.athletes || []).map((a: any) => ({
                    ...a,
                    profileImageUrl: a.profileImage ?? a.profileImageUrl,
                    videoThumbnailUrl: a.videoThumbnail ?? a.videoThumbnailUrl,
                }));
                setSearchResults({
                    athletes,
                    totalCount: apiResponse.data.pagination.totalCount,
                    page: apiResponse.data.pagination.currentPage,
                    pageSize: apiResponse.data.pagination.pageSize,
                    filters: apiResponse.data.filters,
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while searching');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearchResults();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, currentPage]);

    // Fetch coach's current prospects so heart icons reflect saved state
    useEffect(() => {
        const fetchProspects = async () => {
            try {
                const res = await fetch(`/api/coach/${coachId}/prospects`);
                const data = await res.json();
                if (res.ok && data.success && Array.isArray(data.data)) {
                    setFavoritedIds(new Set(data.data.map((p: { playerId: string }) => p.playerId)));
                }
            } catch {
                // Non-critical — hearts default to unfavorited
            }
        };
        fetchProspects();
    }, [coachId]);

    // Optimistic favorite toggle — same logic as CoachDashboard
    const handleFavoriteToggle = useCallback(async (playerId: string, currentState: boolean) => {
        setFavoritedIds(prev => {
            const next = new Set(prev);
            currentState ? next.delete(playerId) : next.add(playerId);
            return next;
        });

        try {
            const res = currentState
                ? await fetch(`/api/coach/${coachId}/prospects/${playerId}`, { method: 'DELETE' })
                : await fetch(`/api/coach/${coachId}/prospects`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ playerId }),
                });

            if (!res.ok && res.status !== 409) {
                // Revert on failure
                setFavoritedIds(prev => {
                    const next = new Set(prev);
                    currentState ? next.add(playerId) : next.delete(playerId);
                    return next;
                });
            }
        } catch {
            setFavoritedIds(prev => {
                const next = new Set(prev);
                currentState ? next.add(playerId) : next.delete(playerId);
                return next;
            });
        }
    }, [coachId]);

    const handleFilterChange = (newCriteria: SearchCriteria) => {
        setCurrentPage(1);
        router.push(`/coach/${coachId}/dashboard/search?${buildSearchQueryString(newCriteria)}`);
    };

    const handleClearAll = () => {
        setCurrentPage(1);
        router.push(`/coach/${coachId}/dashboard/search`);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--ink-0)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* ── Page header ── */}
                <header className="relative overflow-hidden text-center px-6 pt-12 pb-10 mb-8 rounded-2xl">
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 rounded-2xl"
                        style={{
                            background: `radial-gradient(ellipse 80% 60% at 50% -10%, oklch(68% 0.22 150 / 0.18) 0%, transparent 70%), var(--ink-1)`,
                        }}
                    />
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 opacity-[0.03] rounded-2xl"
                        style={{
                            backgroundImage: `linear-gradient(var(--text-hi) 1px, transparent 1px), linear-gradient(90deg, var(--text-hi) 1px, transparent 1px)`,
                            backgroundSize: '48px 48px',
                        }}
                    />
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-5"
                        style={{ background: 'oklch(68% 0.22 150 / 0.15)', border: '1px solid oklch(68% 0.22 150 / 0.3)', color: 'var(--brand-500)' }}
                    >
                        <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand-500)' }} />
                        Search
                    </div>
                    <h1
                        className="font-black tracking-tight leading-none mb-3"
                        style={{
                            fontSize: 'clamp(2rem, 4vw + 1rem, 3rem)',
                            background: `linear-gradient(135deg, var(--text-hi) 0%, oklch(85% 0.15 150) 50%, var(--text-hi) 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Athlete Search Results
                    </h1>
                    <p className="text-base" style={{ color: 'var(--text-mid)' }}>
                        {searchResults && !isLoading
                            ? `Found ${searchResults.totalCount} athlete${searchResults.totalCount !== 1 ? 's' : ''}`
                            : 'Searching for athletes…'}
                    </p>
                </header>

                {/* ── Active filters bar ── */}
                <SearchFiltersBar
                    criteria={criteria}
                    onFilterChange={handleFilterChange}
                    onClearAll={handleClearAll}
                    data-testid="search-filters-bar"
                />

                {/* ── Error state ── */}
                {error && (
                    <div
                        className="mb-6 p-4 rounded-lg flex items-start gap-3"
                        role="alert"
                        style={{ background: 'oklch(65% 0.24 25 / 0.12)', border: '1px solid oklch(65% 0.24 25 / 0.3)' }}
                    >
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" style={{ color: 'var(--status-danger)' }}>
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--status-danger)' }}>Error loading search results</p>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-mid)' }}>{error}</p>
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="mt-3 px-3 py-1.5 text-sm font-semibold rounded-lg focus:outline-none focus:ring-2"
                                style={{ background: 'var(--status-danger)', color: 'var(--text-hi)' }}
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Results ── */}
                <AthleteSearchResults
                    athletes={searchResults?.athletes || []}
                    isLoading={isLoading}
                    totalCount={searchResults?.totalCount || 0}
                    currentPage={currentPage}
                    pageSize={searchResults?.pageSize || 3}
                    onPageChange={handlePageChange}
                    coachId={coachId}
                    favoritedPlayerIds={favoritedIds}
                    onFavoriteToggle={handleFavoriteToggle}
                    onWatchVideo={handleWatchVideo}
                />
            </div>

            {/* ── Video modal ── */}
            {videoModal.isOpen && videoModal.videoUrl && (
                <VideoModal
                    isOpen={videoModal.isOpen}
                    onClose={handleCloseVideo}
                    videoUrl={videoModal.videoUrl}
                    videoTitle={videoModal.videoTitle ?? undefined}
                    playerName={videoModal.playerName ?? undefined}
                />
            )}
        </div>
    );
}
