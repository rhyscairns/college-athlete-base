'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CoachDashboardProps } from '../types';
import type { PlayerCardData, VideoModalState } from '../../common/types';
import { DashboardHeader } from '../../common/components/DashboardHeader';
import { FilterBar } from '../../common/components/FilterBar';
import { PlayerCardGrid } from '../../common/components/PlayerCardGrid';
import { Pagination } from '../../common/components/Pagination';
import { VideoModal } from '../../common/components/VideoModal';
import { useDebounce } from '@/hooks/useDebounce';
import { playerFilterCache } from '@/lib/cache/filterCache';
import { getPositionsForSport, getEventsForSport, hasSportPositions, hasSportEvents } from '@/constants';

export default function CoachDashboard({ coachId }: CoachDashboardProps) {
    const router = useRouter();

    const ALL_SPORTS = 'All Sports';
    const ALL_POSITIONS = 'All Positions';

    // Filter state
    const [selectedSport, setSelectedSport] = useState<string>(ALL_SPORTS);
    const [selectedPosition, setSelectedPosition] = useState<string>(ALL_POSITIONS);
    const [profileLoaded, setProfileLoaded] = useState<boolean>(false);

    // Debounce filter changes to reduce API calls
    const debouncedSport = useDebounce(selectedSport, 300);
    const debouncedPosition = useDebounce(selectedPosition, 300);

    // Data state
    const [players, setPlayers] = useState<PlayerCardData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const pageSize = 6;

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
                pageSize: pageSize,
                excludeUserId: coachId,
                sport: debouncedSport !== ALL_SPORTS ? debouncedSport : undefined,
                position: debouncedPosition !== ALL_POSITIONS ? debouncedPosition : undefined,
            };

            // Check cache first
            const cachedData = playerFilterCache.get(params);
            if (cachedData) {
                // Map 'id' from API to 'playerId' for PlayerCard component
                setPlayers((cachedData.players || []).map((player: any) => ({
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
                pageSize: pageSize.toString(),
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

            const response = await fetch(`/api/dashboard/players?${urlParams.toString()}`);
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to fetch players');
            }

            // Cache the results
            playerFilterCache.set(params, data.data);

            // Update players state with response
            // Map 'id' from API to 'playerId' for PlayerCard component
            setPlayers((data.data.players || []).map((player: any) => ({
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
    }, [coachId, debouncedSport, debouncedPosition, currentPage, pageSize]);

    // Fetch players when debounced filters or page changes
    useEffect(() => {
        // Only fetch after profile is loaded
        if (profileLoaded) {
            fetchPlayers();
        }
    }, [fetchPlayers, profileLoaded]);

    // Handler for sport filter change
    const handleSportChange = (sport: string): void => {
        setSelectedSport(sport);
        // Reset position to default when sport changes
        setSelectedPosition(sport === ALL_SPORTS ? ALL_POSITIONS : positionLabel);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    // Handler for position filter change
    const handlePositionChange = (position: string): void => {
        setSelectedPosition(position);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    // Handler for search button click
    const handleSearch = (): void => {
        fetchPlayers();
    };

    // Handler for page change
    const handlePageChange = (page: number): void => {
        setCurrentPage(page);
        // Update URL with page parameter
        const url = new URL(window.location.href);
        url.searchParams.set('page', page.toString());
        router.push(url.pathname + url.search);
    };

    // Handler for viewing player profile
    const handleViewProfile = (playerId: string): void => {
        router.push(`/coach/dashboard/${coachId}/player-profile/${playerId}`);
    };

    // Handler for contacting player
    const handleContact = (_playerId: string): void => {
        // TODO: Implement contact modal/dialog
    };

    // Handler for watching video
    const handleWatchVideo = (_playerId: string, videoUrl: string, videoTitle?: string, playerName?: string): void => {
        setVideoModalState({
            isOpen: true,
            videoUrl,
            videoTitle: videoTitle || null,
            playerName: playerName || null,
        });
    };

    // Handler for closing video modal
    const handleCloseVideoModal = (): void => {
        setVideoModalState({
            isOpen: false,
            videoUrl: null,
            videoTitle: null,
            playerName: null,
        });
    };

    // Memoize player card data to prevent unnecessary re-renders
    const playerCardData = useMemo(() =>
        players.map((player) => ({
            ...player,
            onPrimaryClick: () => handleViewProfile(player.playerId),
            onSecondaryClick: () => handleContact(player.playerId),
        })),
        [players, handleViewProfile]
    );

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Skip Links for Accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-500 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Skip to main content
            </a>
            <a
                href="#filter-controls"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-40 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-500 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Skip to filters
            </a>

            {/* Dashboard Header */}
            <DashboardHeader
                title="Player Recruitment Dashboard"
                subtitle="Discover and connect with talented athletes"
            />

            {/* Main Content */}
            <main
                id="main-content"
                className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
                role="main"
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
                    />
                </div>

                {/* Error Display */}
                {error && (
                    <div
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg"
                        role="alert"
                        aria-live="assertive"
                    >
                        <p className="text-red-400">{error}</p>
                        <button
                            onClick={fetchPlayers}
                            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
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
