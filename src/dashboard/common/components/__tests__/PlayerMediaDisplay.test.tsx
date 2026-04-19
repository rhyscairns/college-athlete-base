import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerMediaDisplay } from '../PlayerMediaDisplay';

// Mock Next.js Image component
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...props} />;
    },
}));

describe('PlayerMediaDisplay', () => {
    const mockProps = {
        playerName: 'John Smith',
        initials: 'JS',
    };

    describe('Rendering', () => {
        it('should render video thumbnail when provided', () => {
            render(
                <PlayerMediaDisplay
                    {...mockProps}
                    videoThumbnail="https://example.com/video-thumb.jpg"
                />
            );

            const image = screen.getByAltText('John Smith highlight video thumbnail');
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', 'https://example.com/video-thumb.jpg');
        });

        it('should render profile image when no video thumbnail', () => {
            render(
                <PlayerMediaDisplay
                    {...mockProps}
                    profileImage="https://example.com/profile.jpg"
                />
            );

            const image = screen.getByAltText('John Smith profile photo');
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', 'https://example.com/profile.jpg');
        });

        it('should render initials fallback when no images provided', () => {
            render(<PlayerMediaDisplay {...mockProps} />);

            const initials = screen.getByText('JS');
            expect(initials).toBeInTheDocument();
            expect(initials).toHaveAttribute('aria-hidden', 'true');
        });

        it('should prioritize video thumbnail over profile image', () => {
            render(
                <PlayerMediaDisplay
                    {...mockProps}
                    videoThumbnail="https://example.com/video-thumb.jpg"
                    profileImage="https://example.com/profile.jpg"
                />
            );

            expect(screen.getByAltText('John Smith highlight video thumbnail')).toBeInTheDocument();
            expect(screen.queryByAltText('John Smith profile photo')).not.toBeInTheDocument();
        });
    });

    describe('Play Button', () => {
        it('should render play button when video thumbnail and onWatchVideo are provided', () => {
            const onWatchVideo = jest.fn();

            render(
                <PlayerMediaDisplay
                    {...mockProps}
                    videoThumbnail="https://example.com/video-thumb.jpg"
                    onWatchVideo={onWatchVideo}
                />
            );

            const playButton = screen.getByRole('button', {
                name: 'Watch highlight video for John Smith',
            });
            expect(playButton).toBeInTheDocument();
        });

        it('should not render play button when no video thumbnail', () => {
            const onWatchVideo = jest.fn();

            render(
                <PlayerMediaDisplay
                    {...mockProps}
                    profileImage="https://example.com/profile.jpg"
                    onWatchVideo={onWatchVideo}
                />
            );

            expect(
                screen.queryByRole('button', { name: /Watch highlight video/i })
            ).not.toBeInTheDocument();
        });

        it('should not render play button when no onWatchVideo callback', () => {
            render(
                <PlayerMediaDisplay
                    {...mockProps}
                    videoThumbnail="https://example.com/video-thumb.jpg"
                />
            );

            expect(
                screen.queryByRole('button', { name: /Watch highlight video/i })
            ).not.toBeInTheDocument();
        });

        it('should call onWatchVideo when play button is clicked', async () => {
            const user = userEvent.setup();
            const onWatchVideo = jest.fn();

            render(
                <PlayerMediaDisplay
                    {...mockProps}
                    videoThumbnail="https://example.com/video-thumb.jpg"
                    onWatchVideo={onWatchVideo}
                />
            );

            const playButton = screen.getByRole('button', {
                name: 'Watch highlight video for John Smith',
            });

            await user.click(playButton);

            expect(onWatchVideo).toHaveBeenCalledTimes(1);
        });

        it('should have play icon SVG', () => {
            const onWatchVideo = jest.fn();

            render(
                <PlayerMediaDisplay
                    {...mockProps}
                    videoThumbnail="https://example.com/video-thumb.jpg"
                    onWatchVideo={onWatchVideo}
                />
            );

            const playButton = screen.getByRole('button');
            const svg = playButton.querySelector('svg');

            expect(svg).toBeInTheDocument();
            expect(svg).toHaveAttribute('aria-hidden', 'true');
        });
    });

    describe('Image Priority', () => {
        it('should pass priority prop to Image component when true', () => {
            render(
                <PlayerMediaDisplay
                    {...mockProps}
                    videoThumbnail="https://example.com/video-thumb.jpg"
                    priority={true}
                />
            );

            const image = screen.getByAltText('John Smith highlight video thumbnail');
            // Priority prop is passed to Next.js Image, loading attribute should not be present
            expect(image).not.toHaveAttribute('loading');
        });

        it('should set lazy loading when priority is false', () => {
            render(
                <PlayerMediaDisplay
                    {...mockProps}
                    videoThumbnail="https://example.com/video-thumb.jpg"
                    priority={false}
                />
            );

            const image = screen.getByAltText('John Smith highlight video thumbnail');
            expect(image).toHaveAttribute('loading', 'lazy');
        });

        it('should default to lazy loading when priority is not provided', () => {
            render(
                <PlayerMediaDisplay
                    {...mockProps}
                    videoThumbnail="https://example.com/video-thumb.jpg"
                />
            );

            const image = screen.getByAltText('John Smith highlight video thumbnail');
            expect(image).toHaveAttribute('loading', 'lazy');
        });
    });

    describe('Styling', () => {
        it('should have aspect-video ratio container', () => {
            const { container } = render(<PlayerMediaDisplay {...mockProps} />);

            const wrapper = container.firstChild;
            expect(wrapper).toHaveClass('aspect-video');
        });

        it('should have gradient background', () => {
            const { container } = render(<PlayerMediaDisplay {...mockProps} />);

            const wrapper = container.firstChild;
            expect(wrapper).toHaveClass('bg-gradient-to-br', 'from-slate-800', 'to-slate-900');
        });

        it('should apply object-cover to images', () => {
            render(
                <PlayerMediaDisplay
                    {...mockProps}
                    videoThumbnail="https://example.com/video-thumb.jpg"
                />
            );

            const image = screen.getByAltText('John Smith highlight video thumbnail');
            expect(image).toHaveClass('object-cover');
        });

        it('should have responsive sizes attribute', () => {
            render(
                <PlayerMediaDisplay
                    {...mockProps}
                    videoThumbnail="https://example.com/video-thumb.jpg"
                />
            );

            const image = screen.getByAltText('John Smith highlight video thumbnail');
            expect(image).toHaveAttribute(
                'sizes',
                '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
            );
        });
    });

    describe('Accessibility', () => {
        it('should have proper alt text for video thumbnail', () => {
            render(
                <PlayerMediaDisplay
                    {...mockProps}
                    videoThumbnail="https://example.com/video-thumb.jpg"
                />
            );

            expect(screen.getByAltText('John Smith highlight video thumbnail')).toBeInTheDocument();
        });

        it('should have proper alt text for profile image', () => {
            render(
                <PlayerMediaDisplay
                    {...mockProps}
                    profileImage="https://example.com/profile.jpg"
                />
            );

            expect(screen.getByAltText('John Smith profile photo')).toBeInTheDocument();
        });

        it('should have aria-label on play button', () => {
            const onWatchVideo = jest.fn();

            render(
                <PlayerMediaDisplay
                    {...mockProps}
                    videoThumbnail="https://example.com/video-thumb.jpg"
                    onWatchVideo={onWatchVideo}
                />
            );

            const playButton = screen.getByRole('button');
            expect(playButton).toHaveAttribute(
                'aria-label',
                'Watch highlight video for John Smith'
            );
        });

        it('should hide decorative initials from screen readers', () => {
            render(<PlayerMediaDisplay {...mockProps} />);

            const initials = screen.getByText('JS');
            expect(initials).toHaveAttribute('aria-hidden', 'true');
        });

        it('should hide decorative play icon from screen readers', () => {
            const onWatchVideo = jest.fn();

            render(
                <PlayerMediaDisplay
                    {...mockProps}
                    videoThumbnail="https://example.com/video-thumb.jpg"
                    onWatchVideo={onWatchVideo}
                />
            );

            const svg = screen.getByRole('button').querySelector('svg');
            expect(svg).toHaveAttribute('aria-hidden', 'true');
        });

        it('should have focus ring on play button', () => {
            const onWatchVideo = jest.fn();

            render(
                <PlayerMediaDisplay
                    {...mockProps}
                    videoThumbnail="https://example.com/video-thumb.jpg"
                    onWatchVideo={onWatchVideo}
                />
            );

            const playButton = screen.getByRole('button');
            expect(playButton).toHaveClass('focus:ring-2', 'focus:ring-yellow-500');
        });
    });

    describe('Edge Cases', () => {
        it('should handle player names with special characters', () => {
            render(
                <PlayerMediaDisplay
                    playerName="O'Brien-Smith Jr."
                    initials="OS"
                    videoThumbnail="https://example.com/video-thumb.jpg"
                />
            );

            expect(
                screen.getByAltText("O'Brien-Smith Jr. highlight video thumbnail")
            ).toBeInTheDocument();
        });

        it('should handle single character initials', () => {
            render(<PlayerMediaDisplay playerName="X Y" initials="X" />);

            expect(screen.getByText('X')).toBeInTheDocument();
        });

        it('should handle long player names', () => {
            const longName = 'Christopher Montgomery-Wellington III';

            render(
                <PlayerMediaDisplay
                    playerName={longName}
                    initials="CM"
                    profileImage="https://example.com/profile.jpg"
                />
            );

            expect(
                screen.getByAltText(`${longName} profile photo`)
            ).toBeInTheDocument();
        });

        it('should handle empty string for optional props', () => {
            render(
                <PlayerMediaDisplay
                    {...mockProps}
                    videoThumbnail=""
                    profileImage=""
                />
            );

            // Should fall back to initials
            expect(screen.getByText('JS')).toBeInTheDocument();
        });
    });
});
