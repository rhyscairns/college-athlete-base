import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VideoCard } from '../VideoCard';
import type { Video } from '../../../types';

describe('VideoCard', () => {
    const mockVideo: Video = {
        id: '1',
        title: 'Championship Game Highlights',
        description: 'Amazing plays from the championship game',
        url: 'https://youtube.com/watch?v=test',
        duration: '5:30',
        date: '2024-03-15',
        isFeatured: false,
    };

    const mockOnClick = jest.fn();

    beforeEach(() => {
        mockOnClick.mockClear();
    });

    describe('Featured Variant', () => {
        it('renders featured video card with all information', () => {
            render(<VideoCard video={mockVideo} variant="featured" onClick={mockOnClick} />);

            expect(screen.getByRole('button', { name: /play featured video: championship game highlights/i })).toBeInTheDocument();
            expect(screen.getByText('Championship Game Highlights')).toBeInTheDocument();
            expect(screen.getByText('Amazing plays from the championship game')).toBeInTheDocument();
            expect(screen.getByText('5:30')).toBeInTheDocument();
            expect(screen.getByText('2024-03-15')).toBeInTheDocument();
            expect(screen.getByText('MAIN VIDEO')).toBeInTheDocument();
        });

        it('renders without optional fields', () => {
            const minimalVideo: Video = {
                id: '2',
                title: 'Test Video',
                url: 'https://youtube.com/watch?v=test2',
                isFeatured: false,
            };

            render(<VideoCard video={minimalVideo} variant="featured" onClick={mockOnClick} />);

            expect(screen.getByText('Test Video')).toBeInTheDocument();
            expect(screen.getByText('Click to play')).toBeInTheDocument();
            expect(screen.queryByText(/amazing plays/i)).not.toBeInTheDocument();
        });

        it('calls onClick when clicked', async () => {
            const user = userEvent.setup();
            render(<VideoCard video={mockVideo} variant="featured" onClick={mockOnClick} />);

            const button = screen.getByRole('button');
            await user.click(button);

            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });

        it('is keyboard accessible', async () => {
            const user = userEvent.setup();
            render(<VideoCard video={mockVideo} variant="featured" onClick={mockOnClick} />);

            const button = screen.getByRole('button');
            button.focus();
            expect(button).toHaveFocus();

            await user.keyboard('{Enter}');
            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });
    });

    describe('Sidebar Variant', () => {
        it('renders sidebar video card with compact layout', () => {
            render(<VideoCard video={mockVideo} variant="sidebar" onClick={mockOnClick} />);

            const button = screen.getByRole('listitem', { name: /play video: championship game highlights/i });
            expect(button).toBeInTheDocument();
            expect(screen.getByText('Championship Game Highlights')).toBeInTheDocument();
            expect(screen.getByText('5:30')).toBeInTheDocument();
            expect(screen.getByText('2024-03-15')).toBeInTheDocument();
        });

        it('does not show description in sidebar variant', () => {
            render(<VideoCard video={mockVideo} variant="sidebar" onClick={mockOnClick} />);

            expect(screen.queryByText('Amazing plays from the championship game')).not.toBeInTheDocument();
        });

        it('calls onClick when clicked', async () => {
            const user = userEvent.setup();
            render(<VideoCard video={mockVideo} variant="sidebar" onClick={mockOnClick} />);

            const button = screen.getByRole('listitem');
            await user.click(button);

            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });
    });

    describe('Grid Variant', () => {
        it('renders grid video card', () => {
            render(<VideoCard video={mockVideo} variant="grid" onClick={mockOnClick} />);

            const button = screen.getByRole('listitem', { name: /play video: championship game highlights/i });
            expect(button).toBeInTheDocument();
            expect(screen.getByText('Championship Game Highlights')).toBeInTheDocument();
            expect(screen.getByText('5:30')).toBeInTheDocument();
            expect(screen.getByText('2024-03-15')).toBeInTheDocument();
        });

        it('does not show description in grid variant', () => {
            render(<VideoCard video={mockVideo} variant="grid" onClick={mockOnClick} />);

            expect(screen.queryByText('Amazing plays from the championship game')).not.toBeInTheDocument();
        });

        it('calls onClick when clicked', async () => {
            const user = userEvent.setup();
            render(<VideoCard video={mockVideo} variant="grid" onClick={mockOnClick} />);

            const button = screen.getByRole('listitem');
            await user.click(button);

            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });

        it('renders without duration', () => {
            const videoWithoutDuration: Video = {
                ...mockVideo,
                duration: undefined,
            };

            render(<VideoCard video={videoWithoutDuration} variant="grid" onClick={mockOnClick} />);

            expect(screen.getByText('Championship Game Highlights')).toBeInTheDocument();
            expect(screen.queryByText('5:30')).not.toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA labels for all variants', () => {
            const { rerender } = render(<VideoCard video={mockVideo} variant="featured" onClick={mockOnClick} />);
            expect(screen.getByRole('button', { name: /play featured video/i })).toBeInTheDocument();

            rerender(<VideoCard video={mockVideo} variant="sidebar" onClick={mockOnClick} />);
            expect(screen.getByRole('listitem', { name: /play video/i })).toBeInTheDocument();

            rerender(<VideoCard video={mockVideo} variant="grid" onClick={mockOnClick} />);
            expect(screen.getByRole('listitem', { name: /play video/i })).toBeInTheDocument();
        });

        it('has focus visible styles', () => {
            render(<VideoCard video={mockVideo} variant="featured" onClick={mockOnClick} />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('focus:outline-none');
        });
    });
});
