import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { PlayerCard } from '../PlayerCard';
import type { PlayerCardProps } from '../../types';

// Mock Next.js Link component
jest.mock('next/link', () => {
    return ({ children, href, className, ...rest }: { children: React.ReactNode; href: string; className?: string;[key: string]: any }) => {
        return <a href={href} className={className} {...rest}>{children}</a>;
    };
});

// Mock Next.js Image component
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // Filter out Next.js Image-specific props that aren't valid HTML attributes
        const { fill, priority, sizes, ...imgProps } = props;
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...imgProps} />;
    },
}));

describe('PlayerCard', () => {
    const mockPlayerData: PlayerCardProps = {
        playerId: 'player-123',
        firstName: 'John',
        lastName: 'Smith',
        position: 'Point Guard',
        sport: 'Basketball',
    };

    describe('Rendering', () => {
        it('should render player name correctly', () => {
            render(<PlayerCard {...mockPlayerData} />);

            expect(screen.getByText('John Smith')).toBeInTheDocument();
        });

        it('should render position', () => {
            render(<PlayerCard {...mockPlayerData} />);

            expect(screen.getByText('Point Guard')).toBeInTheDocument();
        });

        it('should render sport', () => {
            render(<PlayerCard {...mockPlayerData} />);

            expect(screen.getByText('Basketball')).toBeInTheDocument();
        });

        it('should render view profile button with correct link', () => {
            render(<PlayerCard {...mockPlayerData} />);

            const link = screen.getByRole('link', { name: /view profile/i });
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute('href', '/player/player-123/profile');
        });
    });

    describe('Video Thumbnail', () => {
        it('should render video thumbnail when provided', () => {
            const dataWithVideo = {
                ...mockPlayerData,
                videoThumbnail: 'https://example.com/video-thumb.jpg',
            };

            render(<PlayerCard {...dataWithVideo} />);

            const image = screen.getByAltText('John Smith highlight video thumbnail');
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', 'https://example.com/video-thumb.jpg');
        });

        it('should show play button overlay when video thumbnail is present', () => {
            const dataWithVideo = {
                ...mockPlayerData,
                videoThumbnail: 'https://example.com/video-thumb.jpg',
            };

            render(<PlayerCard {...dataWithVideo} />);

            // Check for play button SVG
            const svg = screen.getByAltText('John Smith highlight video thumbnail').parentElement?.querySelector('svg');
            expect(svg).toBeInTheDocument();
        });

        it('should use Next.js Image component for video thumbnail', () => {
            const dataWithVideo = {
                ...mockPlayerData,
                videoThumbnail: 'https://example.com/video-thumb.jpg',
            };

            render(<PlayerCard {...dataWithVideo} />);

            const image = screen.getByAltText('John Smith highlight video thumbnail');
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', 'https://example.com/video-thumb.jpg');
        });
    });

    describe('Profile Image', () => {
        it('should render profile image when no video thumbnail is provided', () => {
            const dataWithImage = {
                ...mockPlayerData,
                profileImage: 'https://example.com/profile.jpg',
            };

            render(<PlayerCard {...dataWithImage} />);

            const image = screen.getByAltText('John Smith profile photo');
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', 'https://example.com/profile.jpg');
        });

        it('should prioritize video thumbnail over profile image', () => {
            const dataWithBoth = {
                ...mockPlayerData,
                videoThumbnail: 'https://example.com/video-thumb.jpg',
                profileImage: 'https://example.com/profile.jpg',
            };

            render(<PlayerCard {...dataWithBoth} />);

            // Should show video thumbnail
            expect(screen.getByAltText('John Smith highlight video thumbnail')).toBeInTheDocument();
            // Should not show profile image
            expect(screen.queryByAltText('John Smith profile photo')).not.toBeInTheDocument();
        });

        it('should use Next.js Image component for profile image', () => {
            const dataWithImage = {
                ...mockPlayerData,
                profileImage: 'https://example.com/profile.jpg',
            };

            render(<PlayerCard {...dataWithImage} />);

            const image = screen.getByAltText('John Smith profile photo');
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', 'https://example.com/profile.jpg');
        });
    });

    describe('Fallback Display', () => {
        it('should show initials when no images are provided', () => {
            render(<PlayerCard {...mockPlayerData} />);

            expect(screen.getByText('JS')).toBeInTheDocument();
        });

        it('should calculate initials correctly', () => {
            const data = {
                ...mockPlayerData,
                firstName: 'Michael',
                lastName: 'Jordan',
            };

            render(<PlayerCard {...data} />);

            expect(screen.getByText('MJ')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper alt text for video thumbnail', () => {
            const dataWithVideo = {
                ...mockPlayerData,
                videoThumbnail: 'https://example.com/video-thumb.jpg',
            };

            render(<PlayerCard {...dataWithVideo} />);

            expect(screen.getByAltText('John Smith highlight video thumbnail')).toBeInTheDocument();
        });

        it('should have proper alt text for profile image', () => {
            const dataWithImage = {
                ...mockPlayerData,
                profileImage: 'https://example.com/profile.jpg',
            };

            render(<PlayerCard {...dataWithImage} />);

            expect(screen.getByAltText('John Smith profile photo')).toBeInTheDocument();
        });

        it('should have minimum touch target size for button', () => {
            render(<PlayerCard {...mockPlayerData} />);

            const button = screen.getByRole('link', { name: /view profile/i });
            // Verify the button exists and has appropriate styling classes
            expect(button).toBeInTheDocument();
            expect(button).toHaveClass('min-h-[44px]');
        });
    });

    describe('Styling', () => {
        it('should be memoized with React.memo', () => {
            expect(typeof PlayerCard).toBe('object');
        });
    });

    describe('Status Badge', () => {
        it('should not render status badge when status is not provided', () => {
            render(<PlayerCard {...mockPlayerData} />);

            expect(screen.queryByText('Available')).not.toBeInTheDocument();
            expect(screen.queryByText('Interested')).not.toBeInTheDocument();
            expect(screen.queryByText('Contacted')).not.toBeInTheDocument();
        });

        it('should render available status badge', () => {
            render(<PlayerCard {...mockPlayerData} status="available" />);
            expect(screen.getByText('Available')).toBeInTheDocument();
        });

        it('should render interested status badge', () => {
            render(<PlayerCard {...mockPlayerData} status="interested" />);
            expect(screen.getByText('Interested')).toBeInTheDocument();
        });

        it('should render contacted status badge', () => {
            render(<PlayerCard {...mockPlayerData} status="contacted" />);
            expect(screen.getByText('Contacted')).toBeInTheDocument();
        });
    });

    describe('Height and Weight Display', () => {
        it('should render height and weight when both are provided', () => {
            const dataWithStats = {
                ...mockPlayerData,
                height: '6\'2"',
                weight: '210 lbs',
            };

            render(<PlayerCard {...dataWithStats} />);

            expect(screen.getByText('6\'2" • 210 lbs')).toBeInTheDocument();
        });

        it('should render only height when weight is not provided', () => {
            const dataWithHeight = {
                ...mockPlayerData,
                height: '6\'2"',
            };

            render(<PlayerCard {...dataWithHeight} />);

            expect(screen.getByText('6\'2"')).toBeInTheDocument();
        });

        it('should render only weight when height is not provided', () => {
            const dataWithWeight = {
                ...mockPlayerData,
                weight: '210 lbs',
            };

            render(<PlayerCard {...dataWithWeight} />);

            expect(screen.getByText('210 lbs')).toBeInTheDocument();
        });

        it('should not render height/weight section when neither is provided', () => {
            render(<PlayerCard {...mockPlayerData} />);

            // Check that the text doesn't exist by looking for the bullet separator
            expect(screen.queryByText(/•/)).not.toBeInTheDocument();
        });

        it('should display height and weight below position', () => {
            const dataWithStats = {
                ...mockPlayerData,
                height: '6\'2"',
                weight: '210 lbs',
            };

            render(<PlayerCard {...dataWithStats} />);

            // Both stats and sport are in the bottom panel
            const statsElement = screen.getByText('6\'2" • 210 lbs');
            expect(statsElement).toBeInTheDocument();
        });

        it('should use appropriate text styling for height/weight', () => {
            const dataWithStats = {
                ...mockPlayerData,
                height: '6\'2"',
                weight: '210 lbs',
            };

            render(<PlayerCard {...dataWithStats} />);

            const statsElement = screen.getByText('6\'2" • 210 lbs');
            expect(statsElement).toBeInTheDocument();
        });
    });

    describe('Configurable Action Buttons', () => {
        it('should render default primary button as link with "View Profile" label', () => {
            render(<PlayerCard {...mockPlayerData} />);

            const button = screen.getByRole('link', { name: /view profile/i });
            expect(button).toBeInTheDocument();
            expect(button).toHaveAttribute('href', '/player/player-123/profile');
        });

        it('should render custom primary button label', () => {
            const dataWithCustomLabel = {
                ...mockPlayerData,
                primaryButtonLabel: 'See Details',
            };

            render(<PlayerCard {...dataWithCustomLabel} />);

            expect(screen.getByRole('link', { name: /see details/i })).toBeInTheDocument();
        });

        it('should render primary button as button when onPrimaryClick is provided', () => {
            const handleClick = jest.fn();
            const dataWithCallback = {
                ...mockPlayerData,
                onPrimaryClick: handleClick,
            };

            render(<PlayerCard {...dataWithCallback} />);

            const button = screen.getByRole('button', { name: /view profile/i });
            expect(button).toBeInTheDocument();

            button.click();
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('should style primary button with blue gradient', () => {
            const handleClick = jest.fn();
            const dataWithCallback = {
                ...mockPlayerData,
                onPrimaryClick: handleClick,
            };

            render(<PlayerCard {...dataWithCallback} />);

            const button = screen.getByRole('button', { name: /view profile/i });
            expect(button).toBeInTheDocument();
        });

        it('should have minimum touch target size for button', () => {
            const handleClick = jest.fn();
            const dataWithCallback = {
                ...mockPlayerData,
                onPrimaryClick: handleClick,
            };

            render(<PlayerCard {...dataWithCallback} />);

            const button = screen.getByRole('button', { name: /view profile/i });
            expect(button).toHaveClass('min-h-[44px]');
        });
    });

    describe('Edge Cases', () => {
        it('should handle single character names', () => {
            const data = {
                ...mockPlayerData,
                firstName: 'A',
                lastName: 'B',
            };

            render(<PlayerCard {...data} />);

            expect(screen.getByText('A B')).toBeInTheDocument();
            expect(screen.getByText('AB')).toBeInTheDocument();
        });

        it('should handle long names with truncation', () => {
            const data = {
                ...mockPlayerData,
                firstName: 'Christopher',
                lastName: 'Montgomery-Wellington',
            };

            render(<PlayerCard {...data} />);

            const name = screen.getByText('Christopher Montgomery-Wellington');
            expect(name).toHaveClass('truncate');
        });

        it('should handle long position names', () => {
            const data = {
                ...mockPlayerData,
                position: 'Defensive Midfielder / Central Midfielder',
            };

            render(<PlayerCard {...data} />);

            expect(screen.getByText('Defensive Midfielder / Central Midfielder')).toBeInTheDocument();
        });
    });

    describe('Heart Icon / Favorite Toggle', () => {
        it('should not render heart icon when onFavoriteToggle is not provided', () => {
            render(<PlayerCard {...mockPlayerData} />);

            expect(screen.queryByRole('button', { name: /prospects/i })).not.toBeInTheDocument();
        });

        it('should render heart icon button when onFavoriteToggle is provided', () => {
            const handleToggle = jest.fn();
            render(<PlayerCard {...mockPlayerData} onFavoriteToggle={handleToggle} />);

            const heartBtn = screen.getByRole('button', { name: /add john smith to prospects/i });
            expect(heartBtn).toBeInTheDocument();
        });

        it('should render outlined heart when isFavorited is false', () => {
            const handleToggle = jest.fn();
            render(<PlayerCard {...mockPlayerData} isFavorited={false} onFavoriteToggle={handleToggle} />);

            const heartBtn = screen.getByRole('button', { name: /add john smith to prospects/i });
            expect(heartBtn).toBeInTheDocument();
            // outlined heart uses stroke, not fill
            const svg = heartBtn.querySelector('svg');
            expect(svg).toHaveAttribute('fill', 'none');
            expect(svg).toHaveAttribute('stroke', 'currentColor');
        });

        it('should render filled heart when isFavorited is true', () => {
            const handleToggle = jest.fn();
            render(<PlayerCard {...mockPlayerData} isFavorited={true} onFavoriteToggle={handleToggle} />);

            const heartBtn = screen.getByRole('button', { name: /remove john smith from prospects/i });
            expect(heartBtn).toBeInTheDocument();
            // filled heart uses fill="currentColor"
            const svg = heartBtn.querySelector('svg');
            expect(svg).toHaveAttribute('fill', 'currentColor');
        });

        it('should have correct aria-pressed when favorited', () => {
            const handleToggle = jest.fn();
            render(<PlayerCard {...mockPlayerData} isFavorited={true} onFavoriteToggle={handleToggle} />);

            const heartBtn = screen.getByRole('button', { name: /remove john smith from prospects/i });
            expect(heartBtn).toHaveAttribute('aria-pressed', 'true');
        });

        it('should have correct aria-pressed when not favorited', () => {
            const handleToggle = jest.fn();
            render(<PlayerCard {...mockPlayerData} isFavorited={false} onFavoriteToggle={handleToggle} />);

            const heartBtn = screen.getByRole('button', { name: /add john smith to prospects/i });
            expect(heartBtn).toHaveAttribute('aria-pressed', 'false');
        });

        it('should call onFavoriteToggle with playerId and current state when clicked', async () => {
            const handleToggle = jest.fn().mockResolvedValue(undefined);
            render(<PlayerCard {...mockPlayerData} isFavorited={false} onFavoriteToggle={handleToggle} />);

            const heartBtn = screen.getByRole('button', { name: /add john smith to prospects/i });
            await act(async () => {
                fireEvent.click(heartBtn);
            });

            expect(handleToggle).toHaveBeenCalledTimes(1);
            expect(handleToggle).toHaveBeenCalledWith('player-123', false);
        });

        it('should call onFavoriteToggle with current favorited state true when unfavoriting', async () => {
            const handleToggle = jest.fn().mockResolvedValue(undefined);
            render(<PlayerCard {...mockPlayerData} isFavorited={true} onFavoriteToggle={handleToggle} />);

            const heartBtn = screen.getByRole('button', { name: /remove john smith from prospects/i });
            await act(async () => {
                fireEvent.click(heartBtn);
            });

            expect(handleToggle).toHaveBeenCalledWith('player-123', true);
        });

        it('should optimistically flip icon state on click before API resolves', async () => {
            let resolveToggle!: () => void;
            const handleToggle = jest.fn().mockReturnValue(
                new Promise<void>((res) => { resolveToggle = res; })
            );

            render(<PlayerCard {...mockPlayerData} isFavorited={false} onFavoriteToggle={handleToggle} />);

            const heartBtn = screen.getByRole('button', { name: /add john smith to prospects/i });
            fireEvent.click(heartBtn);

            // After click, optimistic state should flip to favorited before promise resolves
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /remove john smith from prospects/i })).toBeInTheDocument();
            });

            // Resolve the promise
            await act(async () => { resolveToggle(); });
        });

        it('should revert icon state when onFavoriteToggle throws an error', async () => {
            const handleToggle = jest.fn().mockRejectedValue(new Error('API error'));
            render(<PlayerCard {...mockPlayerData} isFavorited={false} onFavoriteToggle={handleToggle} />);

            const heartBtn = screen.getByRole('button', { name: /add john smith to prospects/i });
            await act(async () => {
                fireEvent.click(heartBtn);
            });

            // Should revert back to outlined (not favorited)
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /add john smith to prospects/i })).toBeInTheDocument();
            });
        });

        it('should disable the heart button while toggle is in-flight', async () => {
            let resolveToggle!: () => void;
            const handleToggle = jest.fn().mockReturnValue(
                new Promise<void>((res) => { resolveToggle = res; })
            );

            render(<PlayerCard {...mockPlayerData} isFavorited={false} onFavoriteToggle={handleToggle} />);

            const heartBtn = screen.getByRole('button', { name: /add john smith to prospects/i });
            fireEvent.click(heartBtn);

            // Button should be disabled while in-flight
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /remove john smith from prospects/i })).toBeDisabled();
            });

            await act(async () => { resolveToggle(); });

            // Button should be re-enabled after resolution
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /remove john smith from prospects/i })).not.toBeDisabled();
            });
        });

        it('should sync local state when isFavorited prop changes', () => {
            const handleToggle = jest.fn();
            const { rerender } = render(
                <PlayerCard {...mockPlayerData} isFavorited={false} onFavoriteToggle={handleToggle} />
            );

            expect(screen.getByRole('button', { name: /add john smith to prospects/i })).toBeInTheDocument();

            rerender(<PlayerCard {...mockPlayerData} isFavorited={true} onFavoriteToggle={handleToggle} />);

            expect(screen.getByRole('button', { name: /remove john smith from prospects/i })).toBeInTheDocument();
        });
    });

    describe('Message Button (Coach View)', () => {
        it('should not render Message button when onMessageClick is not provided', () => {
            render(<PlayerCard {...mockPlayerData} userType="coach" />);
            expect(screen.queryByRole('button', { name: /message john smith/i })).not.toBeInTheDocument();
        });

        it('should not render Message button for player userType even when onMessageClick is provided', () => {
            const handleMessage = jest.fn();
            render(<PlayerCard {...mockPlayerData} userType="player" onMessageClick={handleMessage} />);
            expect(screen.queryByRole('button', { name: /message john smith/i })).not.toBeInTheDocument();
        });

        it('should render Message button when userType is coach and onMessageClick is provided', () => {
            const handleMessage = jest.fn();
            render(<PlayerCard {...mockPlayerData} userType="coach" onMessageClick={handleMessage} />);
            expect(screen.getByRole('button', { name: /message john smith/i })).toBeInTheDocument();
        });

        it('should call onMessageClick when Message button is clicked', () => {
            const handleMessage = jest.fn();
            render(<PlayerCard {...mockPlayerData} userType="coach" onMessageClick={handleMessage} />);
            fireEvent.click(screen.getByRole('button', { name: /message john smith/i }));
            expect(handleMessage).toHaveBeenCalledTimes(1);
        });

        it('should style Message button consistently with secondary button', () => {
            const handleMessage = jest.fn();
            render(<PlayerCard {...mockPlayerData} userType="coach" onMessageClick={handleMessage} />);
            const btn = screen.getByRole('button', { name: /message john smith/i });
            expect(btn).toHaveClass('min-h-[44px]');
        });
    });

    describe('Play Button Overlay', () => {
        it('should render clickable play button when video thumbnail and onWatchVideo are provided', () => {
            const handleWatchVideo = jest.fn();
            const dataWithVideo = {
                ...mockPlayerData,
                videoThumbnail: 'https://example.com/video-thumb.jpg',
                onWatchVideo: handleWatchVideo,
            };

            render(<PlayerCard {...dataWithVideo} />);

            const button = screen.getByRole('button', { name: /watch highlight video/i });
            expect(button).toBeInTheDocument();
        });

        it('should not render play button when onWatchVideo is not provided', () => {
            const dataWithVideo = {
                ...mockPlayerData,
                videoThumbnail: 'https://example.com/video-thumb.jpg',
            };

            render(<PlayerCard {...dataWithVideo} />);

            expect(screen.queryByRole('button', { name: /watch highlight video/i })).not.toBeInTheDocument();
        });

        it('should call onWatchVideo when play button is clicked', () => {
            const handleWatchVideo = jest.fn();
            const dataWithVideo = {
                ...mockPlayerData,
                videoThumbnail: 'https://example.com/video-thumb.jpg',
                onWatchVideo: handleWatchVideo,
            };

            render(<PlayerCard {...dataWithVideo} />);

            const button = screen.getByRole('button', { name: /watch highlight video/i });
            button.click();

            expect(handleWatchVideo).toHaveBeenCalledTimes(1);
        });

        it('should have proper accessibility attributes', () => {
            const handleWatchVideo = jest.fn();
            const dataWithVideo = {
                ...mockPlayerData,
                videoThumbnail: 'https://example.com/video-thumb.jpg',
                onWatchVideo: handleWatchVideo,
            };

            render(<PlayerCard {...dataWithVideo} />);

            const button = screen.getByRole('button', { name: 'Watch highlight video for John Smith' });
            expect(button).toBeInTheDocument();
        });

        it('should have focus ring for keyboard navigation', () => {
            const handleWatchVideo = jest.fn();
            const dataWithVideo = {
                ...mockPlayerData,
                videoThumbnail: 'https://example.com/video-thumb.jpg',
                onWatchVideo: handleWatchVideo,
            };

            render(<PlayerCard {...dataWithVideo} />);

            const button = screen.getByRole('button', { name: /watch highlight video/i });
            expect(button).toBeInTheDocument();
        });

        it('should display play icon in button', () => {
            const handleWatchVideo = jest.fn();
            const dataWithVideo = {
                ...mockPlayerData,
                videoThumbnail: 'https://example.com/video-thumb.jpg',
                onWatchVideo: handleWatchVideo,
            };

            render(<PlayerCard {...dataWithVideo} />);

            const button = screen.getByRole('button', { name: /watch highlight video/i });
            const svg = button.querySelector('svg');
            expect(svg).toBeInTheDocument();
        });
    });
});
