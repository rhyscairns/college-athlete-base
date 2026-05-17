'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PlayerDashboardProps } from '../types';
import type { PlayerCardData, VideoModalState } from '../../common/types';
import { PlayerDashboardHeader } from './PlayerDashboardHeader';
import { FilterBar } from '../../common/components/FilterBar';
import { PlayerCardGrid } from '../../common/components/PlayerCardGrid';
import { Pagination } from '../../common/components/Pagination';
import { VideoModal } from '../../common/components/VideoModal';
import { useDebounce } from '@/hooks/useDebounce';
import { playerFilterCache } from '@/lib/cache/filterCache';
import { getPositionsForSport, getEventsForSport, hasSportPositions, hasSportEvents } from '@/constants';

export default function PlayerDashboard({ playerId }: PlayerDashboardProps) {
    const router = useRouter();

    // Filter state
    const [selectedSport, setSelectedSport] = useState<string>('All Sports');
    const [selectedPosition, setSelectedPosition] = useState<string>('All Positions');
    const [selectedStatus, setSelectedStatus] = useState<string>('All Statuses');
    const [profileLoaded, setProfileLoaded] = useState<boolean>(false);

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
    const pageSize = 6;

    // Video modal state
    const [videoModalState, setVideoModalState] = useState<VideoModalState>({
        isOpen: false,
        videoUrl: null,
        videoTitle: null,
        playerName: null,
    });

    // Available sports and positions (placeholder - will be populated from API in task 9)
    const [availableSports, setAvailableSports] = useState<string[]>(['All Sports']);

    // Dynamically get positions or events based on selected sport
    const availablePositions = useMemo(() => {
        if (selectedSport === 'All Sports') {
            return ['All Positions'];
        }

        const positions = getPositionsForSport(selectedSport);
        const events = getEventsForSport(selectedSport);

        // Use positions if available, otherwise use events
        if (positions.length > 0) {
            return ['All Positions', ...positions];
        } else if (events.length > 0) {
            return ['All Events', ...events];
        }

        return ['All Positions'];
    }, [selectedSport]);

    // Update position label based on sport
    const positionLabel = useMemo(() => {
        if (selectedSport === 'All Sports') {
            return 'All Positions';
        }
        return hasSportEvents(selectedSport) && !hasSportPositions(selectedSport) ? 'All Events' : 'All Positions';
    }, [selectedSport]);

    // Auth is validated server-side; mark profile loaded immediately
    useEffect(() => {
        setProfileLoaded(true);
    }, []);

    // Fetch available sports from players
    useEffect(() => {
        const fetchAvailableSports = async () => {
            try {
                const response = await fetch('/api/dashboard/players/sports');
                const data = await response.json();

                if (response.ok && data.success && data.data?.sports) {
                    setAvailableSports(['All Sports', ...data.data.sports]);
                }
            } catch (err) {
                console.error('Error fetching available sports:', err);
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
                excludeUserId: playerId,
                sport: debouncedSport !== 'All Sports' ? debouncedSport : undefined,
                position: debouncedPosition !== 'All Positions' ? debouncedPosition : undefined,
                status: debouncedStatus !== 'All Statuses' ? debouncedStatus.toLowerCase() : undefined,
            };

            // Check cache first
            const cachedData = playerFilterCache.get(params);
            if (cachedData) {
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
                excludeUserId: playerId,
            });

            // Add sport filter if not "All Sports"
            if (debouncedSport && debouncedSport !== 'All Sports') {
                urlParams.append('sport', debouncedSport);
            }

            // Add position filter if not "All Positions"
            if (debouncedPosition && debouncedPosition !== 'All Positions') {
                urlParams.append('position', debouncedPosition);
            }

            // Add status filter if not "All Statuses"
            if (debouncedStatus && debouncedStatus !== 'All Statuses') {
                urlParams.append('status', debouncedStatus.toLowerCase());
            }

            const response = await fetch(`/api/dashboard/players?${urlParams.toString()}`);

            // Handle authentication errors
            if (response.status === 401 || response.status === 403) {
                router.push('/login');
                return;
            }

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to fetch players');
            }

            // Cache the results
            playerFilterCache.set(params, data.data);

            // Update players state with response, mapping id to playerId
            setPlayers((data.data.players || []).map((player: any) => ({
                ...player,
                playerId: player.id,
            })));

            // Handle pagination data from response
            if (data.data.pagination) {
                setTotalPages(data.data.pagination.totalPages || 1);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unable to load players. Please check your connection.';
            setError(errorMessage);
            console.error('Error fetching players:', err);
            setPlayers([]);
        } finally {
            setIsLoading(false);
        }
    }, [playerId, debouncedSport, debouncedPosition, debouncedStatus, currentPage, pageSize, router]);

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
        setSelectedPosition(sport === 'All Sports' ? 'All Positions' : positionLabel);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    // Handler for position filter change
    const handlePositionChange = (position: string): void => {
        setSelectedPosition(position);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    // Handler for status filter change
    const handleStatusChange = (status: string): void => {
        setSelectedStatus(status);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    // Handler for search button click
    const handleSearch = (): void => {
        fetchPlayers();
    };

    // Handler for viewing player profile
    const handleViewProfile = (targetPlayerId: string): void => {
        router.push(`/player/dashboard/${playerId}/player-profile/${targetPlayerId}`);
    };

    // Handler for connecting with player
    const handleConnect = (_targetPlayerId: string): void => {
        // TODO: Implement connect modal/dialog
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
    const handleCloseVideoModal = () => {
        setVideoModalState({
            isOpen: false,
            videoUrl: null,
            videoTitle: null,
            playerName: null,
        });
    };

    // Handler for page change
    const handlePageChange = (page: number): void => {
        setCurrentPage(page);
        // Update URL with page parameter
        const url = new URL(window.location.href);
        url.searchParams.set('page', page.toString());
        router.push(url.pathname + url.search);
    };

    // Handler for clearing filters
    const handleClearFilters = (): void => {
        setSelectedSport('All Sports');
        setSelectedPosition('All Positions');
        setSelectedStatus('All Statuses');
        setCurrentPage(1);
        setError(null);
    };

    return (
        <div className="min-h-screen">
            {/* Skip Links for Accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none"
                style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
            >
                Skip to main content
            </a>
            <a
                href="#filter-controls"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-40 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none"
                style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
            >
                Skip to filters
            </a>

            {/* Dashboard Header */}
            <PlayerDashboardHeader playerId={playerId} />

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
                        selectedStatus={selectedStatus}
                        onStatusChange={handleStatusChange}
                    />
                </div>

                {/* Error Display */}
                {error && (
                    <div
                        className="mb-6 p-4 rounded-lg"
                        style={{ background: 'oklch(60% 0.22 25 / 0.1)', border: '1px solid oklch(60% 0.22 25 / 0.3)' }}
                        role="alert"
                        aria-live="assertive"
                    >
                        <p className="mb-2" style={{ color: 'var(--status-danger)' }}>{error}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={fetchPlayers}
                                className="px-4 py-2 rounded-lg transition-colors focus:outline-none font-semibold"
                                style={{ background: 'var(--status-danger)', color: 'var(--text-hi)' }}
                                aria-label="Retry loading players"
                            >
                                Retry
                            </button>
                            {(selectedSport !== 'All Sports' || selectedPosition !== 'All Positions' || selectedStatus !== 'All Statuses') && (
                                <button
                                    onClick={handleClearFilters}
                                    className="px-4 py-2 rounded-lg transition-colors focus:outline-none font-semibold"
                                    style={{ background: 'var(--ink-3)', color: 'var(--text-mid)' }}
                                    aria-label="Clear all filters"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* No Results Message with Clear Filters */}
                {!isLoading && !error && players.length === 0 && (
                    <div
                        className="mb-6 p-4 rounded-lg"
                        style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}
                        role="status"
                        aria-live="polite"
                    >
                        <p className="mb-2" style={{ color: 'var(--text-lo)' }}>No players found matching your filters.</p>
                        {(selectedSport !== 'All Sports' || selectedPosition !== 'All Positions' || selectedStatus !== 'All Statuses') && (
                            <button
                                onClick={handleClearFilters}
                                className="px-4 py-2 rounded-lg transition-colors focus:outline-none font-semibold"
                                style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
                                aria-label="Clear all filters"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}

                {/* Player Card Grid */}
                <PlayerCardGrid
                    players={players.map((player) => ({
                        ...player,
                        onPrimaryClick: () => handleViewProfile(player.playerId),
                        onSecondaryClick: () => handleConnect(player.playerId),
                    }))}
                    currentUserId={playerId}
                    userType="player"
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
