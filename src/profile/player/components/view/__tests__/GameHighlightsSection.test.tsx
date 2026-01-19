import { render, screen } from '@testing-library/react';
import { GameHighlightsSection } from '../GameHighlightsSection';

describe('GameHighlightsSection', () => {
    const mockVideos = [
        {
            id: '1',
            title: 'Junior Season Highlights',
            description: 'Full season compilation',
            duration: '5:45',
            isFeatured: true,
            url: '',
            thumbnail: '',
            date: '',
        },
        {
            id: '2',
            title: 'Season Opener',
            description: '',
            duration: '3:45',
            isFeatured: false,
            date: 'Sept 2023',
            url: '',
            thumbnail: '',
        },
    ];

    it('renders section title', () => {
        render(<GameHighlightsSection videos={mockVideos} />);

        expect(screen.getByText('Game Highlights')).toBeInTheDocument();
    });

    it('renders featured video', () => {
        render(<GameHighlightsSection videos={mockVideos} />);

        expect(screen.getByText('Junior Season Highlights')).toBeInTheDocument();
        expect(screen.getByText('Full season compilation')).toBeInTheDocument();
        expect(screen.getByText('FEATURED')).toBeInTheDocument();
    });

    it('renders other videos', () => {
        render(<GameHighlightsSection videos={mockVideos} />);

        expect(screen.getByText('Season Opener')).toBeInTheDocument();
    });

    it('has correct section id for navigation', () => {
        const { container } = render(<GameHighlightsSection videos={mockVideos} />);

        const section = container.querySelector('section');
        expect(section).toHaveAttribute('id', 'highlights');
    });
});
