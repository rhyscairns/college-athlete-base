import { render, screen } from '@testing-library/react';
import { HeroSection } from '../HeroSection';
import { mockPlayerData } from '../../../data/mockPlayerData';

jest.mock('../../../data/mockPlayerData', () => ({
    mockPlayerData: {
        firstName: 'Marcus',
        lastName: 'Johnson',
        initials: 'MJ',
        position: 'Wide Receiver',
        school: 'Westlake High School',
        location: 'Austin, TX',
        classYear: '2025',
        height: "6'2\"",
        weight: '185 lbs',
        academic: { gpa: 3.8 },
        performanceMetrics: [
            { label: '4.45s 40-Yard Dash', value: '4.45s' },
            { label: '36" Vertical', value: '36"' },
        ],
        profileImage: '/images/player.jpg',
    },
}));

describe('HeroSection', () => {
    const mockPlayer = {
        firstName: 'Marcus',
        lastName: 'Johnson',
        initials: 'MJ',
        position: 'Wide Receiver',
        school: 'Westlake High School',
        location: 'Austin, TX',
        classYear: '2025',
        height: "6'2\"",
        weight: '185 lbs',
        academic: { gpa: 3.8 },
        performanceMetrics: [
            { label: '4.45s 40-Yard Dash', value: '4.45s' },
            { label: '36" Vertical', value: '36"' },
        ],
        profileImage: '/images/player.jpg',
    } as any;

    it('renders player name', () => {
        render(<HeroSection player={mockPlayer} />);

        expect(screen.getByText('Marcus')).toBeInTheDocument();
        expect(screen.getByText('Johnson')).toBeInTheDocument();
    });

    it('renders player position and school', () => {
        render(<HeroSection player={mockPlayer} />);

        expect(screen.getByText('Wide Receiver')).toBeInTheDocument();
        expect(screen.getByText('Westlake High School')).toBeInTheDocument();
    });

    it('renders player stats', () => {
        render(<HeroSection player={mockPlayer} />);

        expect(screen.getByText("6'2\"")).toBeInTheDocument();
        expect(screen.getByText('185 lbs')).toBeInTheDocument();
        expect(screen.getByText('3.8')).toBeInTheDocument();
    });

    it('renders performance metrics', () => {
        render(<HeroSection player={mockPlayer} />);

        expect(screen.getByText('4.45s 40-Yard Dash')).toBeInTheDocument();
        expect(screen.getByText('36" Vertical')).toBeInTheDocument();
    });

    it('renders recruitment status badge', () => {
        render(<HeroSection player={mockPlayer} />);

        expect(screen.getByText('Open to Recruitment')).toBeInTheDocument();
    });

    it('has correct section id for navigation', () => {
        const { container } = render(<HeroSection player={mockPlayer} />);

        const section = container.querySelector('section');
        expect(section).toHaveAttribute('id', 'hero');
    });
});
