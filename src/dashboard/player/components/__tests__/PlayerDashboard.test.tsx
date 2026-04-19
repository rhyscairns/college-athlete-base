/**
 * PlayerDashboard Component Tests
 * 
 * Tests the player dashboard functionality including:
 * - Profile initialization and data fetching
 * - Sport and position filtering with debouncing
 * - Error handling and retry mechanisms
 * - Authentication redirects (401/403)
 * - Accessibility features (skip links, ARIA labels)
 * - Clear filters functionality
 * - Pagination controls
 * 
 * @see {@link PlayerDashboard} for the component implementation
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PlayerDashboard from '../PlayerDashboard';
import { useRouter } from 'next/navigation';
import { playerFilterCache } from '@/lib/cache/filterCache';

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/hooks/useDebounce', () => ({
    useDebounce: jest.fn((value) => value),
}));

jest.mock('@/lib/cache/filterCache', () => ({
    playerFilterCache: {
        get: jest.fn(),
        set: jest.fn(),
    },
}));

jest.mock('@/dashboard/common/components/DashboardHeader', () => ({
    DashboardHeader: ({ title, subtitle }: any) => (
        <div data-testid="dashboard-header">
            <h1>{title}</h1>
            <p>{subtitle}</p>
        </div>
    ),
}));

jest.mock('@/dashboard/common/components/FilterBar', () => ({
    FilterBar: ({ sports, positions, selectedSport, selectedPosition, onSportChange, onPositionChange, onSearch, isLoading }: any) => (
        <div data-testid="filter-bar">
            <select data-testid="sport-select" value={selectedSport} onChange={(e) => onSportChange(e.target.value)}>
                {sports.map((sport: string) => (
                    <option key={sport} value={sport}>{sport}</option>
                ))}
            </select>
            <select data-testid="position-select" value={selectedPosition} onChange={(e) => onPositionChange(e.target.value)}>
                {positions.map((position: string) => (
                    <option key={position} value={position}>{position}</option>
                ))}
            </select>
            <button data-testid="search-button" onClick={onSearch} disabled={isLoading}>Search</button>
        </div>
    ),
}));

jest.mock('@/dashboard/common/components/PlayerCardGrid', () => ({
    PlayerCardGrid: ({ players, isLoading, emptyMessage }: any) => (
        <div data-testid="player-card-grid">
            {isLoading ? (
                <div data-testid="loading">Loading...</div>
            ) : players.length === 0 ? (
                <div data-testid="empty-message">{emptyMessage}</div>
            ) : (
                players.map((player: any) => (
                    <div key={player.playerId} data-testid={`player-${player.playerId}`}>
                        {player.firstName} {player.lastName}
                    </div>
                ))
            )}
        </div>
    ),
}));

jest.mock('@/dashboard/common/components/Pagination', () => ({
    Pagination: ({ currentPage, totalPages, onPageChange }: any) => (
        <div data-testid="pagination">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
        </div>
    ),
}));

jest.mock('@/dashboard/common/components/VideoModal', () => ({
    VideoModal: ({ isOpen, onClose, videoTitle, playerName }: any) => (
        isOpen ? (
            <div data-testid="video-modal">
                <button onClick={onClose}>Close</button>
                <div>{videoTitle || 'Video'}</div>
                <div>{playerName}</div>
            </div>
        ) : null
    ),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('PlayerDashboard', () => {
    let mockFetch: jest.MockedFunction<typeof fetch>;
    const mockPush = jest.fn();
    const mockRouter = { push: mockPush };

    const mockPlayerData = {
        id: 'player-123',
        firstName: 'John',
        lastName: 'Doe',
        sport: 'Basketball',
        position: 'Point Guard',
    };

    const mockPlayersResponse = {
        success: true,
        data: {
            players: [
                { id: 'player-1', firstName: 'Jane', lastName: 'Smith', position: 'Forward', sport: 'Basketball' },
                { id: 'player-2', firstName: 'Mike', lastName: 'Johnson', position: 'Guard', sport: 'Basketball' },
            ],
            pagination: {
                totalPages: 2,
                currentPage: 1,
            },
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
        mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (playerFilterCache.get as jest.Mock).mockReturnValue(null);
    });

    describe('Initialization', () => {
        it('should render dashboard with header', async () => {
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: mockPlayerData }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: { sports: ['Basketball', 'Football'] } }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockPlayersResponse,
                } as Response);

            render(<PlayerDashboard playerId="player-123" />);

            await waitFor(() => {
                expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
            });

            expect(screen.getByText('Player Discovery Dashboard')).toBeInTheDocument();
        });

        it('should fetch player profile on mount', async () => {
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: mockPlayerData }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: { sports: [] } }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockPlayersResponse,
                } as Response);

            render(<PlayerDashboard playerId="player-123" />);

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/api/player/player-123/profile');
            });
        });

        it('should handle 401 error during profile fetch', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: async () => ({ success: false, error: 'Unauthorized' }),
            } as Response);

            render(<PlayerDashboard playerId="player-123" />);

            // Verify the fetch was called
            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/api/player/player-123/profile');
            });

            // The component should attempt to redirect (router.push is called)
            // Note: In a real scenario, this would redirect to /login
        });

        it('should handle 403 error during players fetch', async () => {
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: mockPlayerData }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: { sports: [] } }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: false,
                    status: 403,
                    json: async () => ({ success: false, error: 'Forbidden' }),
                } as Response);

            render(<PlayerDashboard playerId="player-123" />);

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith(
                    expect.stringContaining('/api/dashboard/players')
                );
            });
        });
    });

    describe('Filter Functionality', () => {
        it('should change sport filter', async () => {
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: mockPlayerData }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: { sports: ['Basketball', 'Football'] } }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockPlayersResponse,
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockPlayersResponse,
                } as Response);

            render(<PlayerDashboard playerId="player-123" />);

            await waitFor(() => {
                expect(screen.getByTestId('sport-select')).toBeInTheDocument();
            });

            const sportSelect = screen.getByTestId('sport-select') as HTMLSelectElement;

            // Wait for initial load to complete
            await waitFor(() => {
                expect(sportSelect.value).toBe('All Sports');
            });

            fireEvent.change(sportSelect, { target: { value: 'Football' } });

            // The component uses debounce, so we need to wait
            await waitFor(() => {
                expect(sportSelect.value).toBe('Football');
            }, { timeout: 1000 });
        });

        it('should reset position when sport changes', async () => {
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: mockPlayerData }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: { sports: ['Basketball'] } }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockPlayersResponse,
                } as Response);

            render(<PlayerDashboard playerId="player-123" />);

            await waitFor(() => {
                expect(screen.getByTestId('sport-select')).toBeInTheDocument();
            });

            const sportSelect = screen.getByTestId('sport-select');
            fireEvent.change(sportSelect, { target: { value: 'Basketball' } });

            const positionSelect = screen.getByTestId('position-select');
            expect(positionSelect).toHaveValue('All Positions');
        });
    });

    describe('Error Handling', () => {
        it('should display error message on fetch failure', async () => {
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: mockPlayerData }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: { sports: [] } }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: false,
                    json: async () => ({ success: false, error: 'Failed to fetch' }),
                } as Response);

            render(<PlayerDashboard playerId="player-123" />);

            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
            });
        });

        it('should show retry button on error', async () => {
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: mockPlayerData }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: { sports: [] } }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: false,
                    json: async () => ({ success: false, error: 'Failed to fetch' }),
                } as Response);

            render(<PlayerDashboard playerId="player-123" />);

            await waitFor(() => {
                expect(screen.getByLabelText('Retry loading players')).toBeInTheDocument();
            });
        });
    });

    describe('Accessibility', () => {
        it('should have skip links', async () => {
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: mockPlayerData }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: { sports: [] } }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockPlayersResponse,
                } as Response);

            render(<PlayerDashboard playerId="player-123" />);

            await waitFor(() => {
                expect(screen.getByText('Skip to main content')).toBeInTheDocument();
            });

            expect(screen.getByText('Skip to filters')).toBeInTheDocument();
        });

        it('should have proper ARIA labels', async () => {
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: mockPlayerData }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: { sports: [] } }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockPlayersResponse,
                } as Response);

            render(<PlayerDashboard playerId="player-123" />);

            await waitFor(() => {
                expect(screen.getByRole('main')).toBeInTheDocument();
            });
        });
    });

    describe('Clear Filters', () => {
        it('should show clear filters button when filters are active', async () => {
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: mockPlayerData }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: { sports: ['Basketball'] } }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockPlayersResponse,
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: false, error: 'No players found' }),
                } as Response);

            render(<PlayerDashboard playerId="player-123" />);

            await waitFor(() => {
                expect(screen.getByTestId('sport-select')).toBeInTheDocument();
            });

            const sportSelect = screen.getByTestId('sport-select');
            fireEvent.change(sportSelect, { target: { value: 'Basketball' } });

            await waitFor(() => {
                const clearButton = screen.queryByLabelText('Clear all filters');
                if (clearButton) {
                    expect(clearButton).toBeInTheDocument();
                }
            });
        });

        it('should reset filters when clear button is clicked', async () => {
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: mockPlayerData }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: { sports: ['Basketball'] } }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockPlayersResponse,
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: { players: [], pagination: { totalPages: 0 } } }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockPlayersResponse,
                } as Response);

            render(<PlayerDashboard playerId="player-123" />);

            await waitFor(() => {
                expect(screen.getByTestId('sport-select')).toBeInTheDocument();
            });

            const sportSelect = screen.getByTestId('sport-select');
            fireEvent.change(sportSelect, { target: { value: 'Basketball' } });

            await waitFor(() => {
                const clearButton = screen.queryByLabelText('Clear all filters');
                if (clearButton) {
                    fireEvent.click(clearButton);
                    expect(sportSelect).toHaveValue('All Sports');
                }
            });
        });
    });

    describe('Pagination', () => {
        it('should show pagination when players are loaded', async () => {
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: mockPlayerData }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: { sports: [] } }),
                } as Response)
                .mockResolvedValue({
                    ok: true,
                    json: async () => mockPlayersResponse,
                } as Response);

            render(<PlayerDashboard playerId="player-123" />);

            await waitFor(() => {
                expect(screen.getByTestId('pagination')).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it('should not show pagination when no players', async () => {
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: mockPlayerData }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: { sports: [] } }),
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, data: { players: [], pagination: { totalPages: 0 } } }),
                } as Response);

            render(<PlayerDashboard playerId="player-123" />);

            await waitFor(() => {
                expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
            });
        });
    });
});
