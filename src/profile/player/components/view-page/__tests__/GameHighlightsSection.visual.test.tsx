import { render, screen } from '@testing-library/react';
import { GameHighlightsSection } from '../GameHighlightsSection';

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('GameHighlightsSection - Light Theme Visual Tests', () => {
    const mockVideos = [
        {
            id: '1',
            title: 'Championship Game Highlights',
            description: 'Final game of the season',
            duration: '5:45',
            isFeatured: true,
            url: 'https://youtube.com/watch?v=123',
            thumbnail: 'https://example.com/thumb1.jpg',
            date: 'Sept 2023',
        },
        {
            id: '2',
            title: 'Season Opener',
            description: 'First game highlights',
            duration: '3:45',
            isFeatured: false,
            date: 'Aug 2023',
            url: 'https://youtube.com/watch?v=456',
            thumbnail: 'https://example.com/thumb2.jpg',
        },
        {
            id: '3',
            title: 'Mid-Season Highlights',
            description: '',
            duration: '4:20',
            isFeatured: false,
            date: 'Oct 2023',
            url: 'https://youtube.com/watch?v=789',
            thumbnail: '',
        },
    ];

    describe('Container and Layout', () => {
        it('renders with white background card', () => {
            const { container } = render(<GameHighlightsSection videos={mockVideos} />);

            const card = container.querySelector('.bg-white.rounded-2xl.shadow-lg');
            expect(card).toBeInTheDocument();
        });

        it('has blue gradient header', () => {
            const { container } = render(<GameHighlightsSection videos={mockVideos} />);

            const header = container.querySelector('.bg-gradient-to-r.from-blue-600.to-blue-500');
            expect(header).toBeInTheDocument();
        });

        it('renders section icon in header', () => {
            render(<GameHighlightsSection videos={mockVideos} />);

            const { container } = render(<GameHighlightsSection videos={mockVideos} />);
            const icon = container.querySelector('.text-2xl');
            expect(icon).toHaveTextContent('🎥');
        });

        it('renders section title in white', () => {
            render(<GameHighlightsSection videos={mockVideos} />);

            const title = screen.getByText('Game Highlights');
            expect(title).toHaveClass('text-white');
        });

        it('renders subtitle in blue-100', () => {
            render(<GameHighlightsSection videos={mockVideos} />);

            const subtitle = screen.getByText('Watch the action');
            expect(subtitle).toHaveClass('text-blue-100');
        });
    });

    describe('Edit Button Styling', () => {
        it('renders edit button with white background and blue text', () => {
            render(
                <GameHighlightsSection
                    videos={mockVideos}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            const editButton = screen.getByRole('button', { name: /edit/i });
            expect(editButton).toHaveClass('bg-white', 'text-blue-600');
        });

        it('edit button has hover state', () => {
            render(
                <GameHighlightsSection
                    videos={mockVideos}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            const editButton = screen.getByRole('button', { name: /edit/i });
            expect(editButton).toHaveClass('hover:bg-blue-50');
        });
    });

    describe('Featured Video Card Styling', () => {
        it('renders featured video with light gray gradient background', () => {
            const { container } = render(<GameHighlightsSection videos={mockVideos} />);

            const featuredCard = container.querySelector('.bg-gradient-to-br.from-gray-50.to-gray-100');
            expect(featuredCard).toBeInTheDocument();
        });

        it('featured video has gray border', () => {
            const { container } = render(<GameHighlightsSection videos={mockVideos} />);

            const featuredCard = container.querySelector('.border-gray-200');
            expect(featuredCard).toBeInTheDocument();
        });

        it('featured badge uses light theme colors', () => {
            render(<GameHighlightsSection videos={mockVideos} />);

            const badge = screen.getByText('MAIN VIDEO');
            expect(badge).toHaveClass('bg-yellow-100', 'border-yellow-300', 'text-yellow-700');
        });

        it('featured video title uses dark text', () => {
            render(<GameHighlightsSection videos={mockVideos} />);

            const title = screen.getByText('Championship Game Highlights');
            expect(title).toHaveClass('text-gray-900');
        });

        it('featured video description uses gray text', () => {
            render(<GameHighlightsSection videos={mockVideos} />);

            const description = screen.getByText('Final game of the season');
            expect(description).toHaveClass('text-gray-600');
        });

        it('featured video has hover effects', () => {
            const { container } = render(<GameHighlightsSection videos={mockVideos} />);

            const featuredCard = container.querySelector('.hover\\:border-yellow-400');
            expect(featuredCard).toBeInTheDocument();
        });
    });

    describe('Other Videos Card Styling', () => {
        it('renders other videos with light gray gradient background', () => {
            const { container } = render(<GameHighlightsSection videos={mockVideos} />);

            const videoCards = container.querySelectorAll('.bg-gradient-to-br.from-gray-50.to-gray-100');
            expect(videoCards.length).toBeGreaterThan(1);
        });

        it('other video cards have gray borders', () => {
            const { container } = render(<GameHighlightsSection videos={mockVideos} />);

            const videoCards = container.querySelectorAll('.border-gray-200');
            expect(videoCards.length).toBeGreaterThan(0);
        });

        it('other video titles use dark text', () => {
            render(<GameHighlightsSection videos={mockVideos} />);

            const title = screen.getByText('Season Opener');
            expect(title).toHaveClass('text-gray-900');
        });

        it('other video dates use gray text', () => {
            render(<GameHighlightsSection videos={mockVideos} />);

            const date = screen.getByText('Aug 2023');
            expect(date).toHaveClass('text-gray-600');
        });

        it('other videos have hover effects', () => {
            const { container } = render(<GameHighlightsSection videos={mockVideos} />);

            const videoCard = container.querySelector('.hover\\:border-blue-400');
            expect(videoCard).toBeInTheDocument();
        });
    });

    describe('Empty State Styling', () => {
        it('renders empty state with white card background', () => {
            const { container } = render(
                <GameHighlightsSection
                    videos={[]}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            const card = container.querySelector('.bg-white.rounded-2xl.shadow-lg');
            expect(card).toBeInTheDocument();
        });

        it('renders empty state message', () => {
            render(
                <GameHighlightsSection
                    videos={[]}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            expect(screen.getByText('No Videos Yet')).toBeInTheDocument();
            expect(
                screen.getByText(
                    'Add highlight videos to showcase your best plays and skills to college recruiters.'
                )
            ).toBeInTheDocument();
        });
    });

    describe('Responsive Design', () => {
        it('uses responsive padding on container', () => {
            const { container } = render(<GameHighlightsSection videos={mockVideos} />);

            const section = container.querySelector('section');
            expect(section).toHaveClass('px-4', 'py-8');
        });

        it('uses responsive padding on header', () => {
            const { container } = render(<GameHighlightsSection videos={mockVideos} />);

            const header = container.querySelector('.bg-gradient-to-r');
            expect(header).toHaveClass('px-6', 'py-6', 'sm:px-8');
        });

        it('uses responsive padding on content', () => {
            const { container } = render(<GameHighlightsSection videos={mockVideos} />);

            const content = container.querySelector('.p-6.sm\\:p-8');
            expect(content).toBeInTheDocument();
        });

        it('uses responsive flex layout', () => {
            const { container } = render(<GameHighlightsSection videos={mockVideos} />);

            const flexContainer = container.querySelector('.flex.flex-col.lg\\:flex-row');
            expect(flexContainer).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('has proper section id for navigation', () => {
            const { container } = render(<GameHighlightsSection videos={mockVideos} />);

            const section = container.querySelector('section');
            expect(section).toHaveAttribute('id', 'highlights');
        });

        it('edit button has title attribute', () => {
            render(
                <GameHighlightsSection
                    videos={mockVideos}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={false}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            const editButton = screen.getByRole('button', { name: /edit/i });
            expect(editButton).toHaveAttribute('title', 'Edit section');
        });

        it('edit button shows disabled tooltip when another section is editing', () => {
            render(
                <GameHighlightsSection
                    videos={mockVideos}
                    isOwner={true}
                    isEditing={false}
                    isAnyOtherSectionEditing={true}
                    onEdit={jest.fn()}
                    onSave={jest.fn()}
                    onCancel={jest.fn()}
                />
            );

            const editButton = screen.getByRole('button', { name: /edit/i });
            expect(editButton).toHaveAttribute('title', 'Another section is being edited');
        });
    });

    describe('Video Thumbnail Styling', () => {
        it('video thumbnails have dark gradient background', () => {
            const { container } = render(<GameHighlightsSection videos={mockVideos} />);

            const thumbnails = container.querySelectorAll('.bg-gradient-to-br.from-slate-800.to-slate-900');
            expect(thumbnails.length).toBeGreaterThan(0);
        });

        it('play button uses yellow color', () => {
            const { container } = render(<GameHighlightsSection videos={mockVideos} />);

            const playButtons = container.querySelectorAll('.bg-yellow-400');
            expect(playButtons.length).toBeGreaterThan(0);
        });
    });
});
