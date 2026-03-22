import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlayerCardGrid } from '../PlayerCardGrid';
import type { PlayerCardData } from '../../types';

// Mock the PlayerCard component
jest.mock('../PlayerCard', () => ({
    PlayerCard: jest.fn(({ playerId, firstName, lastName, primaryButtonLabel, secondaryButtonLabel }) => (
        <div data-testid={`player-card-${playerId}`}>
            <span>{firstName} {lastName}</span>
            <button>{primaryButtonLabel}</button>
            {secondaryButtonLabel && <button>{secondaryButtonLabel}</button>}
        </div>
    )),
}));

describe('PlayerCardGrid', () => {
    const mockPlayers: PlayerCardData[] = [
        {
            playerId: '1',
            firstName: 'John',
            lastName: 'Doe',
            position: 'Quarterback',
            sport: 'Football',
            status: 'available',
            height: '6\'2"',
            weight: '210 lbs',
        },
        {
            playerId: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            position: 'Point Guard',
            sport: 'Basketball',
            status: 'interested',
        },
        {
            playerId: '3',
            firstName: 'Mike',
            lastName: 'Johnson',
            position: 'Forward',
            sport: 'Soccer',
            status: 'contacted',
        },
    ];

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders player cards in a grid layout', () => {
            const { container } = render(
                <PlayerCardGrid
                    players={mockPlayers}
                    currentUserId="999"
                    userType="coach"
                />
            );

            const grid = container.querySelector('.grid');
            expect(grid).toBeInTheDocument();
            expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
        });

        it('renders correct number of player cards', () => {
            render(
                <PlayerCardGrid
                    players={mockPlayers}
                    currentUserId="999"
                    userType="coach"
                />
            );

            expect(screen.getByTestId('player-card-1')).toBeInTheDocument();
            expect(screen.getByTestId('player-card-2')).toBeInTheDocument();
            expect(screen.getByTestId('player-card-3')).toBeInTheDocument();
        });

        it('renders with consistent spacing', () => {
            const { container } = render(
                <PlayerCardGrid
                    players={mockPlayers}
                    currentUserId="999"
                    userType="coach"
                />
            );

            const grid = container.querySelector('.grid');
            expect(grid).toHaveClass('gap-6');
        });
    });

    describe('Current User Filtering', () => {
        it('excludes current user card from coach dashboard', () => {
            render(
                <PlayerCardGrid
                    players={mockPlayers}
                    currentUserId="2"
                    userType="coach"
                />
            );

            expect(screen.getByTestId('player-card-1')).toBeInTheDocument();
            expect(screen.queryByTestId('player-card-2')).not.toBeInTheDocument();
            expect(screen.getByTestId('player-card-3')).toBeInTheDocument();
        });

        it('excludes current user card from player dashboard', () => {
            render(
                <PlayerCardGrid
                    players={mockPlayers}
                    currentUserId="1"
                    userType="player"
                />
            );

            expect(screen.queryByTestId('player-card-1')).not.toBeInTheDocument();
            expect(screen.getByTestId('player-card-2')).toBeInTheDocument();
            expect(screen.getByTestId('player-card-3')).toBeInTheDocument();
        });

        it('shows all cards when current user is not in the list', () => {
            render(
                <PlayerCardGrid
                    players={mockPlayers}
                    currentUserId="999"
                    userType="coach"
                />
            );

            expect(screen.getByTestId('player-card-1')).toBeInTheDocument();
            expect(screen.getByTestId('player-card-2')).toBeInTheDocument();
            expect(screen.getByTestId('player-card-3')).toBeInTheDocument();
        });
    });

    describe('Button Labels by User Type', () => {
        it('shows "Contact" button for coach user type', () => {
            render(
                <PlayerCardGrid
                    players={mockPlayers}
                    currentUserId="999"
                    userType="coach"
                />
            );

            const contactButtons = screen.getAllByText('Contact');
            expect(contactButtons).toHaveLength(mockPlayers.length);
        });

        it('shows "Connect" button for player user type', () => {
            render(
                <PlayerCardGrid
                    players={mockPlayers}
                    currentUserId="999"
                    userType="player"
                />
            );

            const connectButtons = screen.getAllByText('Connect');
            expect(connectButtons).toHaveLength(mockPlayers.length);
        });

        it('always shows "View Profile" as primary button', () => {
            render(
                <PlayerCardGrid
                    players={mockPlayers}
                    currentUserId="999"
                    userType="coach"
                />
            );

            const viewProfileButtons = screen.getAllByText('View Profile');
            expect(viewProfileButtons).toHaveLength(mockPlayers.length);
        });
    });

    describe('Loading State', () => {
        it('shows loading skeletons when isLoading is true', () => {
            const { container } = render(
                <PlayerCardGrid
                    players={mockPlayers}
                    currentUserId="999"
                    userType="coach"
                    isLoading={true}
                />
            );

            const skeletons = container.querySelectorAll('.animate-pulse');
            expect(skeletons.length).toBeGreaterThan(0);
        });

        it('shows 8 loading skeletons', () => {
            const { container } = render(
                <PlayerCardGrid
                    players={mockPlayers}
                    currentUserId="999"
                    userType="coach"
                    isLoading={true}
                />
            );

            const skeletons = container.querySelectorAll('.animate-pulse');
            expect(skeletons).toHaveLength(8);
        });

        it('does not show player cards when loading', () => {
            render(
                <PlayerCardGrid
                    players={mockPlayers}
                    currentUserId="999"
                    userType="coach"
                    isLoading={true}
                />
            );

            expect(screen.queryByTestId('player-card-1')).not.toBeInTheDocument();
            expect(screen.queryByTestId('player-card-2')).not.toBeInTheDocument();
            expect(screen.queryByTestId('player-card-3')).not.toBeInTheDocument();
        });

        it('shows grid layout for loading skeletons', () => {
            const { container } = render(
                <PlayerCardGrid
                    players={mockPlayers}
                    currentUserId="999"
                    userType="coach"
                    isLoading={true}
                />
            );

            const grid = container.querySelector('.grid');
            expect(grid).toBeInTheDocument();
            expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
        });
    });

    describe('Empty State', () => {
        it('shows empty message when no players', () => {
            render(
                <PlayerCardGrid
                    players={[]}
                    currentUserId="999"
                    userType="coach"
                />
            );

            expect(screen.getByText('No players found')).toBeInTheDocument();
        });

        it('shows custom empty message when provided', () => {
            render(
                <PlayerCardGrid
                    players={[]}
                    currentUserId="999"
                    userType="coach"
                    emptyMessage="No players match your filters"
                />
            );

            expect(screen.getByText('No players match your filters')).toBeInTheDocument();
        });

        it('shows empty state when all players are filtered out', () => {
            render(
                <PlayerCardGrid
                    players={[{ ...mockPlayers[0], playerId: '1' }]}
                    currentUserId="1"
                    userType="coach"
                />
            );

            expect(screen.getByText('No players found')).toBeInTheDocument();
        });

        it('does not show empty state when loading', () => {
            render(
                <PlayerCardGrid
                    players={[]}
                    currentUserId="999"
                    userType="coach"
                    isLoading={true}
                />
            );

            expect(screen.queryByText('No players found')).not.toBeInTheDocument();
        });

        it('centers empty state message', () => {
            const { container } = render(
                <PlayerCardGrid
                    players={[]}
                    currentUserId="999"
                    userType="coach"
                />
            );

            const emptyContainer = container.querySelector('.flex.items-center.justify-center');
            expect(emptyContainer).toBeInTheDocument();
        });
    });

    describe('Responsive Grid Layout', () => {
        it('applies mobile layout classes (1 column)', () => {
            const { container } = render(
                <PlayerCardGrid
                    players={mockPlayers}
                    currentUserId="999"
                    userType="coach"
                />
            );

            const grid = container.querySelector('.grid');
            expect(grid).toHaveClass('grid-cols-1');
        });

        it('applies tablet layout classes (2 columns)', () => {
            const { container } = render(
                <PlayerCardGrid
                    players={mockPlayers}
                    currentUserId="999"
                    userType="coach"
                />
            );

            const grid = container.querySelector('.grid');
            expect(grid).toHaveClass('md:grid-cols-2');
        });

        it('applies desktop layout classes (3 columns)', () => {
            const { container } = render(
                <PlayerCardGrid
                    players={mockPlayers}
                    currentUserId="999"
                    userType="coach"
                />
            );

            const grid = container.querySelector('.grid');
            expect(grid).toHaveClass('lg:grid-cols-3');
        });

        it('applies large desktop layout classes (3 columns)', () => {
            const { container } = render(
                <PlayerCardGrid
                    players={mockPlayers}
                    currentUserId="999"
                    userType="coach"
                />
            );

            const grid = container.querySelector('.grid');
            expect(grid).toHaveClass('lg:grid-cols-3');
        });
    });

    describe('Props Passing', () => {
        it('passes all player data to PlayerCard', () => {
            const PlayerCard = require('../PlayerCard').PlayerCard;

            render(
                <PlayerCardGrid
                    players={mockPlayers}
                    currentUserId="999"
                    userType="coach"
                />
            );

            // Check that PlayerCard was called with the first player's data
            const firstCall = PlayerCard.mock.calls[0][0];
            expect(firstCall).toMatchObject({
                playerId: '1',
                firstName: 'John',
                lastName: 'Doe',
                position: 'Quarterback',
                sport: 'Football',
                status: 'available',
                height: '6\'2"',
                weight: '210 lbs',
            });
        });

        it('passes callbacks to PlayerCard when provided', () => {
            const PlayerCard = require('../PlayerCard').PlayerCard;
            const onPrimaryClick = jest.fn();
            const onSecondaryClick = jest.fn();

            const playersWithCallbacks = [
                {
                    ...mockPlayers[0],
                    onPrimaryClick,
                    onSecondaryClick,
                },
            ];

            render(
                <PlayerCardGrid
                    players={playersWithCallbacks}
                    currentUserId="999"
                    userType="coach"
                />
            );

            // Check that PlayerCard was called with the callbacks
            const firstCall = PlayerCard.mock.calls[0][0];
            expect(firstCall.onPrimaryClick).toBe(onPrimaryClick);
            expect(firstCall.onSecondaryClick).toBe(onSecondaryClick);
        });
    });

    describe('Edge Cases', () => {
        it('handles empty players array', () => {
            render(
                <PlayerCardGrid
                    players={[]}
                    currentUserId="999"
                    userType="coach"
                />
            );

            expect(screen.getByText('No players found')).toBeInTheDocument();
        });

        it('handles single player', () => {
            render(
                <PlayerCardGrid
                    players={[mockPlayers[0]]}
                    currentUserId="999"
                    userType="coach"
                />
            );

            expect(screen.getByTestId('player-card-1')).toBeInTheDocument();
        });

        it('handles players without optional fields', () => {
            const minimalPlayer: PlayerCardData = {
                playerId: '4',
                firstName: 'Test',
                lastName: 'Player',
                position: 'Position',
                sport: 'Sport',
            };

            render(
                <PlayerCardGrid
                    players={[minimalPlayer]}
                    currentUserId="999"
                    userType="coach"
                />
            );

            expect(screen.getByTestId('player-card-4')).toBeInTheDocument();
        });
    });

    describe('Video Modal Integration', () => {
        it('passes onWatchVideo handler to PlayerCard when video data exists', () => {
            const PlayerCard = require('../PlayerCard').PlayerCard;
            const onWatchVideo = jest.fn();

            const playersWithVideo: PlayerCardData[] = [
                {
                    ...mockPlayers[0],
                    videoUrl: 'https://youtube.com/watch?v=test123',
                    videoTitle: 'Highlight Reel',
                },
            ];

            render(
                <PlayerCardGrid
                    players={playersWithVideo}
                    currentUserId="999"
                    userType="coach"
                    onWatchVideo={onWatchVideo}
                />
            );

            const firstCall = PlayerCard.mock.calls[0][0];
            expect(firstCall.onWatchVideo).toBeDefined();
            expect(typeof firstCall.onWatchVideo).toBe('function');
        });

        it('does not pass onWatchVideo handler when video URL is missing', () => {
            const PlayerCard = require('../PlayerCard').PlayerCard;
            const onWatchVideo = jest.fn();

            render(
                <PlayerCardGrid
                    players={mockPlayers}
                    currentUserId="999"
                    userType="coach"
                    onWatchVideo={onWatchVideo}
                />
            );

            const firstCall = PlayerCard.mock.calls[0][0];
            expect(firstCall.onWatchVideo).toBeUndefined();
        });

        it('does not pass onWatchVideo handler when onWatchVideo prop is not provided', () => {
            const PlayerCard = require('../PlayerCard').PlayerCard;

            const playersWithVideo: PlayerCardData[] = [
                {
                    ...mockPlayers[0],
                    videoUrl: 'https://youtube.com/watch?v=test123',
                    videoTitle: 'Highlight Reel',
                },
            ];

            render(
                <PlayerCardGrid
                    players={playersWithVideo}
                    currentUserId="999"
                    userType="coach"
                />
            );

            const firstCall = PlayerCard.mock.calls[0][0];
            expect(firstCall.onWatchVideo).toBeUndefined();
        });

        it('calls onWatchVideo with correct parameters when handler is invoked', () => {
            const PlayerCard = require('../PlayerCard').PlayerCard;
            const onWatchVideo = jest.fn();

            const playersWithVideo: PlayerCardData[] = [
                {
                    ...mockPlayers[0],
                    videoUrl: 'https://youtube.com/watch?v=test123',
                    videoTitle: 'Highlight Reel',
                },
            ];

            render(
                <PlayerCardGrid
                    players={playersWithVideo}
                    currentUserId="999"
                    userType="coach"
                    onWatchVideo={onWatchVideo}
                />
            );

            const firstCall = PlayerCard.mock.calls[0][0];
            firstCall.onWatchVideo();

            expect(onWatchVideo).toHaveBeenCalledWith(
                '1',
                'https://youtube.com/watch?v=test123',
                'Highlight Reel',
                'John Doe'
            );
        });

        it('passes video data without title when title is missing', () => {
            const PlayerCard = require('../PlayerCard').PlayerCard;
            const onWatchVideo = jest.fn();

            const playersWithVideo: PlayerCardData[] = [
                {
                    ...mockPlayers[0],
                    videoUrl: 'https://youtube.com/watch?v=test123',
                },
            ];

            render(
                <PlayerCardGrid
                    players={playersWithVideo}
                    currentUserId="999"
                    userType="coach"
                    onWatchVideo={onWatchVideo}
                />
            );

            const firstCall = PlayerCard.mock.calls[0][0];
            firstCall.onWatchVideo();

            expect(onWatchVideo).toHaveBeenCalledWith(
                '1',
                'https://youtube.com/watch?v=test123',
                undefined,
                'John Doe'
            );
        });

        it('handles multiple players with mixed video availability', () => {
            const PlayerCard = require('../PlayerCard').PlayerCard;
            const onWatchVideo = jest.fn();

            const mixedPlayers: PlayerCardData[] = [
                {
                    ...mockPlayers[0],
                    videoUrl: 'https://youtube.com/watch?v=test123',
                    videoTitle: 'Highlight Reel',
                },
                {
                    ...mockPlayers[1],
                    // No video URL
                },
                {
                    ...mockPlayers[2],
                    videoUrl: 'https://youtube.com/watch?v=test456',
                },
            ];

            render(
                <PlayerCardGrid
                    players={mixedPlayers}
                    currentUserId="999"
                    userType="coach"
                    onWatchVideo={onWatchVideo}
                />
            );

            // First player should have onWatchVideo
            const firstCall = PlayerCard.mock.calls[0][0];
            expect(firstCall.onWatchVideo).toBeDefined();

            // Second player should not have onWatchVideo
            const secondCall = PlayerCard.mock.calls[1][0];
            expect(secondCall.onWatchVideo).toBeUndefined();

            // Third player should have onWatchVideo
            const thirdCall = PlayerCard.mock.calls[2][0];
            expect(thirdCall.onWatchVideo).toBeDefined();
        });
    });
});
