'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CoachDashboardProps, DashboardPlayerApiResponse } from '../types';
import type { PlayerCardData, VideoModalState } from '../../common/types';
import { CoachDashboardHeader } from './CoachDashboardHeader';
import { FilterBar } from '../../common/components/FilterBar';
import { PlayerCardGrid } from '../../common/components/PlayerCardGrid';
import { Pagination } from '../../common/components/Pagination';
import { VideoModal } from '../../common/components/VideoModal';
import { useDebounce } from '@/hooks/useDebounce';
import { playerFilterCache } from '@/lib/cache/filterCache';
import { getPositionsForSport, getEventsForSport, hasSportPositions, hasSportEvents } from '@/constants';

const ALL_SPORTS = 'All Sports';
const ALL_POSITIONS = 'All Positions';

export default function CoachDashboard({ coachId }: CoachDashboardProps) {
    const router = useRouter();

    // Filter state
    const [selectedSport, setSelectedSport] = useState<string>(ALL_SPORTS);
    const [selectedPosition, setSelectedPosition] = useState<string>(ALL_POSITIONS);
    const [selectedStatus, setSelectedStatus] = useState<string>('All Statuses');
    const [profileLoaded, setProfileLoaded] = useState<boolean>(false);

    // Prospects / favorites state
    const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
    const [prospectsCount, setProspectsCount] = useState<number | undefined>(undefined);

    // Debounce filter changes to reduce API calls
    const debouncedSport = useDebounce(selectedSport, 300);
    const debouncedPosition = useDebounce(selectedPosition, 300);
    const debouncedStatus = useDebounce(selectedStatus, 300);

    // Data state
    const [players, setPlayers] = useState<PlayerCardData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const PAGE_SIZE = 6;

    // Video modal state
    const [videoModalState, setVideoModalState] = useState<VideoModalState>({
        isOpen: false,
        videoUrl: null,
        videoTitle: null,
        playerName: null,
    });

    // Available sports and positions (placeholder - will be populated from API in task 9)
    const [availableSports, setAvailableSports] = useState<string[]>([ALL_SPORTS]);

    // Dynamically get positions or events based on selected sport
    const availablePositions = useMemo(() => {
        if (selectedSport === ALL_SPORTS) {
            return [ALL_POSITIONS];
        }

        const positions = getPositionsForSport(selectedSport);
        const events = getEventsForSport(selectedSport);

        // Use positions if available, otherwise use events
        if (positions.length > 0) {
            return [ALL_POSITIONS, ...positions];
        } else if (events.length > 0) {
            return ['All Events', ...events];
        }

        return [ALL_POSITIONS];
    }, [selectedSport]);

    // Update position label based on sport
    const positionLabel = useMemo(() => {
        if (selectedSport === ALL_SPORTS) {
            return ALL_POSITIONS;
        }
        return hasSportEvents(selectedSport) && !hasSportPositions(selectedSport) ? 'All Events' : ALL_POSITIONS;
    }, [selectedSport]);

    // Fetch coach profile and set initial sport filter
    useEffect(() => {
        const fetchCoachProfile = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Clear cache on mount so hasAcceptedOffer is always fresh
                playerFilterCache.clear();

                const response = await fetch(`/api/coach/${coachId}/profile`);
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.error || 'Failed to fetch coach profile');
                }

                // Set initial sport filter to coach's sport
                if (data.data?.sport) {
                    setSelectedSport(data.data.sport);
                }
                setProfileLoaded(true);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load coach profile';
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCoachProfile();
    }, [coachId]);

    // Fetch available sports from players
    useEffect(() => {
        const fetchAvailableSports = async () => {
            try {
                const response = await fetch('/api/dashboard/players/sports');
                const data = await response.json();

                if (response.ok && data.success && data.data?.sports) {
                    setAvailableSports([ALL_SPORTS, ...data.data.sports]);
                }
            } catch (_err) {
                // Keep default 'All Sports' if fetch fails
            }
        };

        fetchAvailableSports();
    }, []);

    // Fetch filtered players list
    const fetchPlayers = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Build query parameters
            const params = {
                page: currentPage,
                pageSize: PAGE_SIZE,
                excludeUserId: coachId,
                sport: debouncedSport !== ALL_SPORTS ? debouncedSport : undefined,
                position: debouncedPosition !== ALL_POSITIONS ? debouncedPosition : undefined,
                status: debouncedStatus !== 'All Statuses' ? debouncedStatus.toLowerCase() : undefined,
            };

            // Check cache first
            const cachedData = playerFilterCache.get(params);
            if (cachedData) {
                // Map 'id' from API to 'playerId' for PlayerCard component
                setPlayers((cachedData.players || []).map((player: DashboardPlayerApiResponse) => ({
                    ...player,
                    playerId: player.id,
                })));
                if (cachedData.pagination) {
                    setTotalPages(cachedData.pagination.totalPages || 1);
                }
                setIsLoading(false);
                return;
            }

            // Build URL query parameters
            const urlParams = new URLSearchParams({
                page: currentPage.toString(),
                pageSize: PAGE_SIZE.toString(),
                excludeUserId: coachId,
            });

            // Add sport filter if not "All Sports"
            if (debouncedSport && debouncedSport !== ALL_SPORTS) {
                urlParams.append('sport', debouncedSport);
            }

            // Add position filter if not "All Positions"
            if (debouncedPosition && debouncedPosition !== ALL_POSITIONS) {
                urlParams.append('position', debouncedPosition);
            }

            // Add status filter if not "All Statuses"
            if (debouncedStatus && debouncedStatus !== 'All Statuses') {
                urlParams.append('status', debouncedStatus.toLowerCase());
            }

            const response = await fetch(`/api/dashboard/players?${urlParams.toString()}`);
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to fetch players');
            }

            // Cache the results
            playerFilterCache.set(params, data.data);

            // Map 'id' from API to 'playerId' for PlayerCard component
            setPlayers((data.data.players || []).map((player: DashboardPlayerApiResponse) => ({
                ...player,
                playerId: player.id,
            })));

            // Handle pagination data from response
            if (data.data.pagination) {
                setTotalPages(data.data.pagination.totalPages || 1);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load players';
            setError(errorMessage);
            setPlayers([]);
        } finally {
            setIsLoading(false);
        }
    }, [coachId, debouncedSport, debouncedPosition, debouncedStatus, currentPage]);

    // Fetch players when debounced filters or page changes
    useEffect(() => {
        // Only fetch after profile is loaded
        if (profileLoaded) {
            fetchPlayers();
        }
    }, [fetchPlayers, profileLoaded]);

    // Fetch coach's current prospects on mount (requirement 8.3)
    useEffect(() => {
        const fetchProspects = async () => {
            try {
                const response = await fetch(`/api/coach/${coachId}/prospects`);
                const data = await response.json();
                if (response.ok && data.success && Array.isArray(data.data)) {
                    const ids = new Set<string>(data.data.map((p: { playerId: string }) => p.playerId));
                    setFavoritedIds(ids);
                    setProspectsCount(ids.size);
                }
            } catch (_err) {
                // Non-critical — silently ignore; heart icons will default to unfavorited
            }
        };

        fetchProspects();
    }, [coachId]);

    // Optimistic favorite toggle — calls POST or DELETE and reverts on failure (requirements 4.3, 4.4, 4.5)
    const handleFavoriteToggle = useCallback(async (playerId: string, currentState: boolean) => {
        // Optimistically update state
        setFavoritedIds((prev) => {
            const next = new Set(prev);
            if (currentState) {
                next.delete(playerId);
            } else {
                next.add(playerId);
            }
            return next;
        });
        setProspectsCount((prev) => (prev ?? 0) + (currentState ? -1 : 1));

        try {
            let response: Response;
            if (currentState) {
                // Currently favorited → DELETE
                response = await fetch(`/api/coach/${coachId}/prospects/${playerId}`, {
                    method: 'DELETE',
                });
            } else {
                // Currently unfavorited → POST
                response = await fetch(`/api/coach/${coachId}/prospects`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ playerId }),
                });
            }

            if (!response.ok && response.status !== 409) {
                // Revert on failure (409 = already favorited, treat as success)
                setFavoritedIds((prev) => {
                    const next = new Set(prev);
                    if (currentState) {
                        next.add(playerId);
                    } else {
                        next.delete(playerId);
                    }
                    return next;
                });
                setProspectsCount((prev) => (prev ?? 0) + (currentState ? 1 : -1));
                setError('Failed to update prospect. Please try again.');
            }
        } catch (_err) {
            // Revert on network error
            setFavoritedIds((prev) => {
                const next = new Set(prev);
                if (currentState) {
                    next.add(playerId);
                } else {
                    next.delete(playerId);
                }
                return next;
            });
            setProspectsCount((prev) => (prev ?? 0) + (currentState ? 1 : -1));
            setError('Failed to update prospect. Please try again.');
        }
    }, [coachId]);

    // Handler for sport filter change
    const handleSportChange = useCallback((sport: string): void => {
        setSelectedSport(sport);
        // Reset position to default when sport changes
        setSelectedPosition(sport === ALL_SPORTS ? ALL_POSITIONS : positionLabel);
        setCurrentPage(1);
    }, [positionLabel]);

    // Handler for position filter change
    const handlePositionChange = useCallback((position: string): void => {
        setSelectedPosition(position);
        setCurrentPage(1);
    }, []);

    // Handler for status filter change
    const handleStatusChange = useCallback((status: string): void => {
        setSelectedStatus(status);
        setCurrentPage(1);
    }, []);

    // Handler for search button click
    const handleSearch = useCallback((): void => {
        fetchPlayers();
    }, [fetchPlayers]);

    // Handler for page change
    const handlePageChange = useCallback((page: number): void => {
        setCurrentPage(page);
        const url = new URL(window.location.href);
        url.searchParams.set('page', page.toString());
        router.push(url.pathname + url.search);
    }, [router]);

    // Handler for viewing player profile
    const handleViewProfile = useCallback((playerId: string): void => {
        router.push(`/coach/${coachId}/dashboard/player-profile/${playerId}`);
    }, [router, coachId]);

    // Handler for contacting player (TODO: Implement contact modal/dialog)
    const handleContact = useCallback((_playerId: string): void => { }, []);

    // Handler for messaging player — navigates to the coach-player thread
    const handleMessage = useCallback((playerId: string): void => {
        router.push(`/coach/${coachId}/messages/${playerId}`);
    }, [router, coachId]);

    // Handler for watching video
    const handleWatchVideo = useCallback((_playerId: string, videoUrl: string, videoTitle?: string, playerName?: string): void => {
        setVideoModalState({
            isOpen: true,
            videoUrl,
            videoTitle: videoTitle ?? null,
            playerName: playerName ?? null,
        });
    }, []);

    // Handler for closing video modal
    const handleCloseVideoModal = useCallback((): void => {
        setVideoModalState({
            isOpen: false,
            videoUrl: null,
            videoTitle: null,
            playerName: null,
        });
    }, []);

    // Memoize player card data to prevent unnecessary re-renders
    const playerCardData = useMemo(() =>
        players.map((player) => ({
            ...player,
            onPrimaryClick: () => handleViewProfile(player.playerId),
            onSecondaryClick: () => handleContact(player.playerId),
            onMessageClick: () => handleMessage(player.playerId),
        })),
        [players, handleViewProfile, handleContact, handleMessage]
    );

    return (
        <div className="min-h-screen">
            {/* Skip Links for Accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none focus:ring-2"
                style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
            >
                Skip to main content
            </a>
            <a
                href="#filter-controls"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-40 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none focus:ring-2"
                style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
            >
                Skip to filters
            </a>

            {/* Dashboard Header */}
            <CoachDashboardHeader coachId={coachId} prospectsCountOverride={prospectsCount} />

            {/* Main Content */}
            <main
                id="main-content"
                className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
                {/* Filter Bar */}
                <div id="filter-controls">
                    <FilterBar
                        sports={availableSports}
                        positions={availablePositions}
                        selectedSport={selectedSport}
                        selectedPosition={selectedPosition}
                        onSportChange={handleSportChange}
                        onPositionChange={handlePositionChange}
                        onSearch={handleSearch}
                        isLoading={isLoading}
                        selectedStatus={selectedStatus}
                        onStatusChange={handleStatusChange}
                    />
                </div>

                {/* Error Display */}
                {error && (
                    <div
                        className="mb-6 p-4 rounded-lg"
                        role="alert"
                        aria-live="assertive"
                        style={{
                            background: 'oklch(65% 0.24 25 / 0.12)',
                            border: '1px solid oklch(65% 0.24 25 / 0.4)',
                        }}
                    >
                        <p style={{ color: 'var(--status-danger)' }}>{error}</p>
                        <button
                            onClick={fetchPlayers}
                            className="mt-2 px-4 py-2 rounded-lg font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                            style={{ background: 'var(--status-danger)', color: 'var(--text-hi)' }}
                            aria-label="Retry loading players"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Player Card Grid */}
                <PlayerCardGrid
                    players={playerCardData}
                    currentUserId={coachId}
                    userType="coach"
                    isLoading={isLoading}
                    emptyMessage="No players found matching your filters"
                    onWatchVideo={handleWatchVideo}
                    favoritedPlayerIds={favoritedIds}
                    onFavoriteToggle={handleFavoriteToggle}
                />

                {/* Pagination */}
                {!isLoading && players.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </main>

            {/* Video Modal */}
            {videoModalState.isOpen && videoModalState.videoUrl && (
                <VideoModal
                    isOpen={videoModalState.isOpen}
                    onClose={handleCloseVideoModal}
                    videoUrl={videoModalState.videoUrl}
                    videoTitle={videoModalState.videoTitle || undefined}
                    playerName={videoModalState.playerName || undefined}
                />
            )}
        </div>
    );
}
