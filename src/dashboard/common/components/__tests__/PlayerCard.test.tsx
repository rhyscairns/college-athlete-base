import React from 'react';
import { render, screen } from '@testing-library/react';
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
        it('should have hover effects', () => {
            render(<PlayerCard {...mockPlayerData} />);

            const card = screen.getByText('John Smith').closest('div')?.parentElement;
            expect(card).toHaveClass('hover:shadow-2xl');
            expect(card).toHaveClass('hover:-translate-y-1');
        });

        it('should have responsive padding', () => {
            render(<PlayerCard {...mockPlayerData} />);

            const infoSection = screen.getByText('John Smith').parentElement;
            expect(infoSection).toHaveClass('p-4', 'sm:p-5');
        });

        it('should have responsive text sizes', () => {
            render(<PlayerCard {...mockPlayerData} />);

            const name = screen.getByText('John Smith');
            expect(name).toHaveClass('text-xl', 'sm:text-2xl');
        });
    });

    describe('Component Memoization', () => {
        it('should be memoized with React.memo', () => {
            // React.memo components don't always have displayName set
            // Instead, verify it's a memoized component by checking the type
            expect(typeof PlayerCard).toBe('object');
        });
    });

    describe('Status Badge', () => {
        it('should render available status badge with green styling', () => {
            const dataWithStatus = {
                ...mockPlayerData,
                status: 'available' as const,
            };

            render(<PlayerCard {...dataWithStatus} />);

            const badge = screen.getByText('Available');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass('bg-green-500', 'text-white');
        });

        it('should render interested status badge with orange styling', () => {
            const dataWithStatus = {
                ...mockPlayerData,
                status: 'interested' as const,
            };

            render(<PlayerCard {...dataWithStatus} />);

            const badge = screen.getByText('Interested');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass('bg-orange-500', 'text-white');
        });

        it('should render contacted status badge with red styling', () => {
            const dataWithStatus = {
                ...mockPlayerData,
                status: 'contacted' as const,
            };

            render(<PlayerCard {...dataWithStatus} />);

            const badge = screen.getByText('Contacted');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass('bg-red-500', 'text-white');
        });

        it('should not render status badge when status is not provided', () => {
            render(<PlayerCard {...mockPlayerData} />);

            expect(screen.queryByText('Available')).not.toBeInTheDocument();
            expect(screen.queryByText('Interested')).not.toBeInTheDocument();
            expect(screen.queryByText('Contacted')).not.toBeInTheDocument();
        });

        it('should position status badge in top-right corner', () => {
            const dataWithStatus = {
                ...mockPlayerData,
                status: 'available' as const,
            };

            render(<PlayerCard {...dataWithStatus} />);

            const badgeContainer = screen.getByText('Available').parentElement;
            expect(badgeContainer).toHaveClass('absolute', 'top-3', 'right-3');
        });

        it('should have rounded corners on status badge', () => {
            const dataWithStatus = {
                ...mockPlayerData,
                status: 'available' as const,
            };

            render(<PlayerCard {...dataWithStatus} />);

            const badge = screen.getByText('Available');
            expect(badge).toHaveClass('rounded-full');
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

            const { container } = render(<PlayerCard {...dataWithStats} />);

            const statsElement = screen.getByText('6\'2" • 210 lbs');
            const positionElement = screen.getByText('Point Guard');

            // Both should be in the same parent container
            expect(statsElement.parentElement).toBe(positionElement.parentElement);
        });

        it('should use appropriate text styling for height/weight', () => {
            const dataWithStats = {
                ...mockPlayerData,
                height: '6\'2"',
                weight: '210 lbs',
            };

            render(<PlayerCard {...dataWithStats} />);

            const statsElement = screen.getByText('6\'2" • 210 lbs');
            expect(statsElement).toHaveClass('text-sm', 'text-gray-500');
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
            expect(button).toHaveClass('bg-gradient-to-r', 'from-blue-500', 'to-blue-600');
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
            expect(button).toHaveClass('focus:ring-2', 'focus:ring-yellow-500');
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
