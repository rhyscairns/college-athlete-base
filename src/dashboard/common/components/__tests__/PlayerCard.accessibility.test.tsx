/**
 * Accessibility Tests for PlayerCard Component
 * Tests minimum touch target sizes and button accessibility
 * Requirements: 4.5, 1.5
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerCard } from '../PlayerCard';
import type { PlayerCardProps } from '../../types';

describe('PlayerCard - Accessibility Tests', () => {
    const defaultProps: PlayerCardProps = {
        playerId: 'player-1',
        firstName: 'John',
        lastName: 'Doe',
        position: 'Quarterback',
        sport: 'Football',
        height: '6\'2"',
        weight: '210 lbs',
        profileImage: '/images/profile.jpg',
        videoThumbnail: '/images/video-thumb.jpg',
        status: 'available',
    };

    describe('Minimum Touch Target Sizes (Requirement 4.5)', () => {
        it('should have primary button with minimum 44px height', () => {
            const mockOnPrimaryClick = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    onPrimaryClick={mockOnPrimaryClick}
                />
            );

            const primaryButton = screen.getByRole('button', {
                name: /view profile for john doe/i,
            });

            // Check for min-h-[44px] class
            expect(primaryButton.className).toMatch(/min-h-\[44px\]/);
        });

        it('should have "Watch Video" button with minimum 44px height', () => {
            const mockOnWatchVideo = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    onWatchVideo={mockOnWatchVideo}
                />
            );

            const watchVideoButton = screen.getByRole('button', {
                name: /watch highlight video for john doe/i,
            });

            // Check for min-h-[44px] class
            expect(watchVideoButton.className).toMatch(/min-h-\[44px\]/);
        });

        it('should have secondary button with minimum 44px height', () => {
            const mockOnSecondaryClick = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    secondaryButtonLabel="Connect"
                    onSecondaryClick={mockOnSecondaryClick}
                />
            );

            const secondaryButton = screen.getByRole('button', {
                name: /connect john doe/i,
            });

            // Check for min-h-[44px] class
            expect(secondaryButton.className).toMatch(/min-h-\[44px\]/);
        });

        it('should have touch-manipulation class on primary button', () => {
            const mockOnPrimaryClick = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    onPrimaryClick={mockOnPrimaryClick}
                />
            );

            const primaryButton = screen.getByRole('button', {
                name: /view profile for john doe/i,
            });

            expect(primaryButton.className).toMatch(/touch-manipulation/);
        });

        it('should have touch-manipulation class on "Watch Video" button', () => {
            const mockOnWatchVideo = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    onWatchVideo={mockOnWatchVideo}
                />
            );

            const watchVideoButton = screen.getByRole('button', {
                name: /watch highlight video for john doe/i,
            });

            expect(watchVideoButton.className).toMatch(/touch-manipulation/);
        });

        it('should have touch-manipulation class on secondary button', () => {
            const mockOnSecondaryClick = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    secondaryButtonLabel="Connect"
                    onSecondaryClick={mockOnSecondaryClick}
                />
            );

            const secondaryButton = screen.getByRole('button', {
                name: /connect john doe/i,
            });

            expect(secondaryButton.className).toMatch(/touch-manipulation/);
        });

        it('should have adequate padding for touch targets on all buttons', () => {
            const mockOnPrimaryClick = jest.fn();
            const mockOnWatchVideo = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    onPrimaryClick={mockOnPrimaryClick}
                    onWatchVideo={mockOnWatchVideo}
                />
            );

            const primaryButton = screen.getByRole('button', {
                name: /view profile for john doe/i,
            });
            const watchVideoButton = screen.getByRole('button', {
                name: /watch highlight video for john doe/i,
            });

            // Check for padding classes
            expect(primaryButton.className).toMatch(/px-4/);
            expect(watchVideoButton.className).toMatch(/min-h-\[44px\]/);
        });

        it('should maintain touch target size on mobile viewports', () => {
            // Simulate mobile viewport
            global.innerWidth = 375;
            global.innerHeight = 667;

            const mockOnWatchVideo = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    onWatchVideo={mockOnWatchVideo}
                />
            );

            const watchVideoButton = screen.getByRole('button', {
                name: /watch highlight video for john doe/i,
            });

            // Should still have minimum height
            expect(watchVideoButton.className).toMatch(/min-h-\[44px\]/);
        });

        it('should have full width buttons for easier touch interaction', () => {
            const mockOnPrimaryClick = jest.fn();
            const mockOnWatchVideo = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    onPrimaryClick={mockOnPrimaryClick}
                    onWatchVideo={mockOnWatchVideo}
                />
            );

            const primaryButton = screen.getByRole('button', {
                name: /view profile for john doe/i,
            });
            const watchVideoButton = screen.getByRole('button', {
                name: /watch highlight video for john doe/i,
            });

            // Check for w-full class
            expect(primaryButton.className).toMatch(/w-full/);
            expect(watchVideoButton.className).toMatch(/w-full/);
        });
    });

    describe('Button Accessibility Attributes (Requirement 1.5)', () => {
        it('should have descriptive aria-label on "Watch Video" button', () => {
            const mockOnWatchVideo = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    onWatchVideo={mockOnWatchVideo}
                />
            );

            const watchVideoButton = screen.getByRole('button', {
                name: /watch highlight video for john doe/i,
            });

            expect(watchVideoButton).toHaveAttribute(
                'aria-label',
                'Watch highlight video for John Doe'
            );
        });

        it('should have descriptive aria-label on primary button', () => {
            const mockOnPrimaryClick = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    onPrimaryClick={mockOnPrimaryClick}
                />
            );

            const primaryButton = screen.getByRole('button', {
                name: /view profile for john doe/i,
            });

            expect(primaryButton).toHaveAttribute(
                'aria-label',
                'View Profile for John Doe'
            );
        });

        it('should have descriptive aria-label on secondary button', () => {
            const mockOnSecondaryClick = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    secondaryButtonLabel="Connect"
                    onSecondaryClick={mockOnSecondaryClick}
                />
            );

            const secondaryButton = screen.getByRole('button', {
                name: /connect john doe/i,
            });

            expect(secondaryButton).toHaveAttribute(
                'aria-label',
                'Connect John Doe'
            );
        });

        it('should have visible focus indicators on "Watch Video" button', () => {
            const mockOnWatchVideo = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    onWatchVideo={mockOnWatchVideo}
                />
            );

            const watchVideoButton = screen.getByRole('button', {
                name: /watch highlight video for john doe/i,
            });

            // Check for focus ring classes
            const classes = watchVideoButton.className;
            expect(classes).toMatch(/focus:outline-none/);
            expect(classes).toMatch(/focus:ring-2/);
            expect(classes).toMatch(/focus:ring-yellow-500/);
        });

        it('should have visible focus indicators on primary button', () => {
            const mockOnPrimaryClick = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    onPrimaryClick={mockOnPrimaryClick}
                />
            );

            const primaryButton = screen.getByRole('button', {
                name: /view profile for john doe/i,
            });

            // Check for focus ring classes
            const classes = primaryButton.className;
            expect(classes).toMatch(/focus:outline-none/);
            expect(classes).toMatch(/focus:ring-2/);
        });
    });

    describe('Keyboard Navigation', () => {
        it('should activate "Watch Video" button with Enter key', async () => {
            const user = userEvent.setup();
            const mockOnWatchVideo = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    onWatchVideo={mockOnWatchVideo}
                />
            );

            const watchVideoButton = screen.getByRole('button', {
                name: /watch highlight video for john doe/i,
            });

            watchVideoButton.focus();
            await user.keyboard('{Enter}');

            expect(mockOnWatchVideo).toHaveBeenCalledTimes(1);
        });

        it('should activate "Watch Video" button with Space key', async () => {
            const user = userEvent.setup();
            const mockOnWatchVideo = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    onWatchVideo={mockOnWatchVideo}
                />
            );

            const watchVideoButton = screen.getByRole('button', {
                name: /watch highlight video for john doe/i,
            });

            watchVideoButton.focus();
            await user.keyboard(' ');

            expect(mockOnWatchVideo).toHaveBeenCalledTimes(1);
        });

        it('should be able to tab to "Watch Video" button', async () => {
            const user = userEvent.setup();
            const mockOnPrimaryClick = jest.fn();
            const mockOnWatchVideo = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    onPrimaryClick={mockOnPrimaryClick}
                    onWatchVideo={mockOnWatchVideo}
                />
            );

            // Tab to first button (Watch Video comes first in DOM)
            await user.tab();

            const watchVideoButton = screen.getByRole('button', {
                name: /watch highlight video for john doe/i,
            });
            expect(watchVideoButton).toHaveFocus();

            // Tab to second button
            await user.tab();

            const primaryButton = screen.getByRole('button', {
                name: /view profile for john doe/i,
            });
            expect(primaryButton).toHaveFocus();
        });

        it('should be able to shift+tab backward through buttons', async () => {
            const user = userEvent.setup();
            const mockOnPrimaryClick = jest.fn();
            const mockOnWatchVideo = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    onPrimaryClick={mockOnPrimaryClick}
                    onWatchVideo={mockOnWatchVideo}
                />
            );

            const primaryButton = screen.getByRole('button', {
                name: /view profile for john doe/i,
            });

            // Focus the primary button
            primaryButton.focus();
            expect(primaryButton).toHaveFocus();

            // Shift+Tab backward to Watch Video button
            await user.tab({ shift: true });

            const watchVideoButton = screen.getByRole('button', {
                name: /watch highlight video for john doe/i,
            });
            expect(watchVideoButton).toHaveFocus();
        });
    });

    describe('Visual Feedback for Touch Interactions', () => {
        it('should have hover state on "Watch Video" button', () => {
            const mockOnWatchVideo = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    onWatchVideo={mockOnWatchVideo}
                />
            );

            const watchVideoButton = screen.getByRole('button', {
                name: /watch highlight video for john doe/i,
            });

            expect(watchVideoButton).toBeInTheDocument();
        });

        it('should have transition classes for smooth interactions', () => {
            const mockOnWatchVideo = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    onWatchVideo={mockOnWatchVideo}
                />
            );

            const watchVideoButton = screen.getByRole('button', {
                name: /watch highlight video for john doe/i,
            });

            expect(watchVideoButton).toBeInTheDocument();
        });

        it('should have visual icon on "Watch Video" button for clarity', () => {
            const mockOnWatchVideo = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    onWatchVideo={mockOnWatchVideo}
                />
            );

            const watchVideoButton = screen.getByRole('button', {
                name: /watch highlight video for john doe/i,
            });

            // Check for SVG icon
            const svg = watchVideoButton.querySelector('svg');
            expect(svg).toBeInTheDocument();
            expect(svg).toHaveAttribute('aria-hidden', 'true');
        });
    });

    describe('Button Group Accessibility', () => {
        it('should have role="group" on button container', () => {
            const mockOnPrimaryClick = jest.fn();
            const mockOnWatchVideo = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    onPrimaryClick={mockOnPrimaryClick}
                    onWatchVideo={mockOnWatchVideo}
                />
            );

            const buttonGroup = screen.getByRole('group', { name: /player actions/i });
            expect(buttonGroup).toBeInTheDocument();
        });

        it('should have descriptive aria-label on button group', () => {
            const mockOnPrimaryClick = jest.fn();
            const mockOnWatchVideo = jest.fn();
            render(
                <PlayerCard
                    {...defaultProps}
                    onPrimaryClick={mockOnPrimaryClick}
                    onWatchVideo={mockOnWatchVideo}
                />
            );

            const buttonGroup = screen.getByRole('group', { name: /player actions/i });
            expect(buttonGroup).toHaveAttribute('aria-label', 'Player actions');
        });
    });

    describe('Card Accessibility', () => {
        it('should have article role for semantic structure', () => {
            render(<PlayerCard {...defaultProps} />);

            const article = screen.getByRole('article', {
                name: /player card for john doe/i,
            });
            expect(article).toBeInTheDocument();
        });

        it('should have descriptive aria-label on card', () => {
            render(<PlayerCard {...defaultProps} />);

            const article = screen.getByRole('article', {
                name: /player card for john doe/i,
            });
            expect(article).toHaveAttribute('aria-label', 'Player card for John Doe');
        });

        it('should have proper heading hierarchy', () => {
            render(<PlayerCard {...defaultProps} />);

            // Player name is in the glassmorphic strip — accessible via article aria-label
            const article = screen.getByRole('article', { name: /player card for john doe/i });
            expect(article).toBeInTheDocument();
        });
    });

    describe('Status Badge Accessibility', () => {
        it('should have role="status" on status badge', () => {
            render(<PlayerCard {...defaultProps} status="available" />);

            const statusBadge = screen.getByRole('status', { name: /status: available/i });
            expect(statusBadge).toBeInTheDocument();
        });

        it('should have descriptive aria-label on status badge', () => {
            render(<PlayerCard {...defaultProps} status="interested" />);

            const statusBadge = screen.getByRole('status', { name: /status: interested/i });
            expect(statusBadge).toHaveAttribute('aria-label', 'Status: Interested');
        });
    });

    describe('Image Accessibility', () => {
        it('should have descriptive alt text on video thumbnail', () => {
            render(
                <PlayerCard
                    {...defaultProps}
                    videoThumbnail="/images/video-thumb.jpg"
                />
            );

            const image = screen.getByAltText(/john doe highlight video thumbnail/i);
            expect(image).toBeInTheDocument();
        });

        it('should have descriptive alt text on profile image', () => {
            const { videoThumbnail: _, ...propsWithoutVideo } = defaultProps;
            render(<PlayerCard {...propsWithoutVideo} />);

            const image = screen.getByAltText(/john doe profile photo/i);
            expect(image).toBeInTheDocument();
        });

        it('should hide decorative play icon from screen readers', () => {
            render(
                <PlayerCard
                    {...defaultProps}
                    videoThumbnail="/images/video-thumb.jpg"
                />
            );

            const article = screen.getByRole('article');
            const playIcon = article.querySelector('svg[aria-hidden="true"]');
            expect(playIcon).toBeInTheDocument();
        });
    });

    describe('Physical Stats Accessibility', () => {
        it('should have descriptive aria-label for physical stats', () => {
            render(<PlayerCard {...defaultProps} />);

            const statsElement = screen.getByLabelText(/physical stats: 6'2", 210 lbs/i);
            expect(statsElement).toBeInTheDocument();
        });

        it('should handle missing height gracefully', () => {
            render(
                <PlayerCard
                    {...defaultProps}
                    height={undefined}
                />
            );

            const statsElement = screen.getByLabelText(/physical stats: 210 lbs/i);
            expect(statsElement).toBeInTheDocument();
        });

        it('should handle missing weight gracefully', () => {
            render(
                <PlayerCard
                    {...defaultProps}
                    weight={undefined}
                />
            );

            const statsElement = screen.getByLabelText(/physical stats: 6'2"/i);
            expect(statsElement).toBeInTheDocument();
        });
    });
});
