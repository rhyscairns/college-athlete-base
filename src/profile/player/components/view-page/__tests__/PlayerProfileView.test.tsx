import { render, screen } from '@testing-library/react';
import { PlayerProfileView } from '../PlayerProfileView';
import { mockPlayerData } from '../../../data/mockPlayerData';

// Mock all child components
jest.mock('../HeroSection', () => ({
    HeroSection: () => <div data-testid="hero-section">Hero Section</div>,
}));

jest.mock('../StatsShowcase', () => ({
    StatsShowcase: () => <div data-testid="stats-section">Stats Section</div>,
}));

jest.mock('../AthleticAchievementsSection', () => ({
    AthleticAchievementsSection: () => <div data-testid="achievements-section">Achievements Section</div>,
}));

jest.mock('../AcademicProfileSection', () => ({
    AcademicProfileSection: () => <div data-testid="academics-section">Academics Section</div>,
}));

jest.mock('../GameHighlightsSection', () => ({
    GameHighlightsSection: () => <div data-testid="highlights-section">Highlights Section</div>,
}));

jest.mock('../CoachesPerspectiveSection', () => ({
    CoachesPerspectiveSection: () => <div data-testid="coaches-section">Coaches Section</div>,
}));

jest.mock('../RecruitingContactSection', () => ({
    RecruitingContactSection: () => <div data-testid="contact-section">Contact Section</div>,
}));

jest.mock('../ProfileSideNav', () => ({
    ProfileSideNav: () => <div data-testid="side-nav">Side Nav</div>,
}));

jest.mock('../SuccessNotification', () => ({
    SuccessNotification: ({ message, onDismiss }: { message: string; onDismiss: () => void }) => (
        <div data-testid="success-notification" onClick={onDismiss}>
            {message}
        </div>
    ),
}));

describe('PlayerProfileView', () => {
    const defaultProps = {
        playerId: 'player-123',
        currentUserId: 'player-123',
        initialData: mockPlayerData,
    };

    it('renders all sections', () => {
        render(<PlayerProfileView {...defaultProps} />);

        expect(screen.getByTestId('hero-section')).toBeInTheDocument();
        expect(screen.getByTestId('stats-section')).toBeInTheDocument();
        expect(screen.getByTestId('achievements-section')).toBeInTheDocument();
        expect(screen.getByTestId('academics-section')).toBeInTheDocument();
        expect(screen.getByTestId('highlights-section')).toBeInTheDocument();
        expect(screen.getByTestId('coaches-section')).toBeInTheDocument();
        expect(screen.getByTestId('contact-section')).toBeInTheDocument();
    });

    it('renders the side navigation', () => {
        render(<PlayerProfileView {...defaultProps} />);

        expect(screen.getByTestId('side-nav')).toBeInTheDocument();
    });

    it('applies correct layout classes', () => {
        const { container } = render(<PlayerProfileView {...defaultProps} />);

        const mainContainer = container.firstChild;
        expect(mainContainer).toHaveClass('relative');
    });

    it('does not show success notification initially', () => {
        render(<PlayerProfileView {...defaultProps} />);

        expect(screen.queryByTestId('success-notification')).not.toBeInTheDocument();
    });
});
