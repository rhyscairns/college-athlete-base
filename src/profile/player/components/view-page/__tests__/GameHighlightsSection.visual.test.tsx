import { render, screen } from '@testing-library/react';
import { GameHighlightsSection } from '../GameHighlightsSection';

Element.prototype.scrollIntoView = jest.fn();

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
];

// Visual styling tests removed — styling is now handled via design tokens (CSS custom properties)
// and cannot be asserted via Tailwind class names. Behavior tests remain in GameHighlightsSection.test.tsx.
describe('GameHighlightsSection - Visual Tests', () => {
    it('renders the section with videos', () => {
        render(<GameHighlightsSection videos={mockVideos} />);
        expect(screen.getByText('Championship Game Highlights')).toBeInTheDocument();
        expect(screen.getByText('Season Opener')).toBeInTheDocument();
    });

    it('renders empty state when no videos', () => {
        render(<GameHighlightsSection videos={[]} isOwner={true} />);
        expect(screen.queryByText('Championship Game Highlights')).not.toBeInTheDocument();
    });
});
