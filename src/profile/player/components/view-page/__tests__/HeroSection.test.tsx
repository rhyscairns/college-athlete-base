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

    describe('Empty State Handling', () => {
        it('renders with missing optional fields (location, classYear)', () => {
            const playerWithoutOptionalFields = {
                ...mockPlayer,
                location: '',
                classYear: '',
            };

            render(<HeroSection player={playerWithoutOptionalFields} />);

            // Required fields should still render
            expect(screen.getByText('Marcus')).toBeInTheDocument();
            expect(screen.getByText('Johnson')).toBeInTheDocument();
            expect(screen.getByText('Wide Receiver')).toBeInTheDocument();
            expect(screen.getByText('Westlake High School')).toBeInTheDocument();

            // Optional location/classYear section should not render
            expect(screen.queryByText(/Austin, TX/)).not.toBeInTheDocument();
            expect(screen.queryByText(/Class of/)).not.toBeInTheDocument();
        });

        it('renders with missing height and weight', () => {
            const playerWithoutPhysicalStats = {
                ...mockPlayer,
                height: '',
                weight: '',
            };

            render(<HeroSection player={playerWithoutPhysicalStats} />);

            // Should not render empty stat boxes
            expect(screen.queryByText('Height')).not.toBeInTheDocument();
            expect(screen.queryByText('Weight')).not.toBeInTheDocument();

            // GPA should still render if present
            expect(screen.getByText('GPA')).toBeInTheDocument();
            expect(screen.getByText('3.8')).toBeInTheDocument();
        });

        it('renders with missing GPA', () => {
            const playerWithoutGPA = {
                ...mockPlayer,
                academic: { gpa: 0 },
            };

            render(<HeroSection player={playerWithoutGPA} />);

            // Should not render GPA stat box when GPA is 0
            expect(screen.queryByText('GPA')).not.toBeInTheDocument();

            // Height and weight should still render
            expect(screen.getByText('Height')).toBeInTheDocument();
            expect(screen.getByText('Weight')).toBeInTheDocument();
        });

        it('renders with no performance metrics', () => {
            const playerWithoutMetrics = {
                ...mockPlayer,
                performanceMetrics: [],
            };

            render(<HeroSection player={playerWithoutMetrics} />);

            // Performance Highlights section should not render
            expect(screen.queryByText('Performance Highlights')).not.toBeInTheDocument();
            expect(screen.queryByText('4.45s 40-Yard Dash')).not.toBeInTheDocument();
        });

        it('renders with undefined performance metrics', () => {
            const playerWithUndefinedMetrics = {
                ...mockPlayer,
                performanceMetrics: undefined,
            };

            render(<HeroSection player={playerWithUndefinedMetrics} />);

            // Performance Highlights section should not render
            expect(screen.queryByText('Performance Highlights')).not.toBeInTheDocument();
        });

        it('renders with all optional fields missing', () => {
            const minimalPlayer = {
                firstName: 'John',
                lastName: 'Doe',
                initials: 'JD',
                position: 'Quarterback',
                school: 'Test High School',
                location: '',
                classYear: '',
                height: '',
                weight: '',
                academic: { gpa: 0 },
                performanceMetrics: [],
            } as any;

            render(<HeroSection player={minimalPlayer} />);

            // Required fields should render
            expect(screen.getByText('John')).toBeInTheDocument();
            expect(screen.getByText('Doe')).toBeInTheDocument();
            expect(screen.getByText('Quarterback')).toBeInTheDocument();
            expect(screen.getByText('Test High School')).toBeInTheDocument();

            // Optional sections should not render
            expect(screen.queryByText(/Class of/)).not.toBeInTheDocument();
            expect(screen.queryByText('Height')).not.toBeInTheDocument();
            expect(screen.queryByText('Weight')).not.toBeInTheDocument();
            expect(screen.queryByText('GPA')).not.toBeInTheDocument();
            expect(screen.queryByText('Performance Highlights')).not.toBeInTheDocument();
        });

        it('renders initials placeholder when initials are missing', () => {
            const playerWithoutInitials = {
                ...mockPlayer,
                initials: '',
            };

            const { container } = render(<HeroSection player={playerWithoutInitials} />);

            // Should render ?? as placeholder
            const initialsElements = container.querySelectorAll('span');
            const hasPlaceholder = Array.from(initialsElements).some(
                (el) => el.textContent === '??'
            );
            expect(hasPlaceholder).toBe(true);
        });

        it('renders only location when classYear is missing', () => {
            const playerWithOnlyLocation = {
                ...mockPlayer,
                classYear: '',
            };

            render(<HeroSection player={playerWithOnlyLocation} />);

            expect(screen.getByText(/Austin, TX/)).toBeInTheDocument();
            expect(screen.queryByText(/Class of/)).not.toBeInTheDocument();
        });

        it('renders only classYear when location is missing', () => {
            const playerWithOnlyClassYear = {
                ...mockPlayer,
                location: '',
            };

            render(<HeroSection player={playerWithOnlyClassYear} />);

            expect(screen.getByText(/Class of 2025/)).toBeInTheDocument();
            expect(screen.queryByText(/Austin, TX/)).not.toBeInTheDocument();
        });

        it('renders partial quick stats when some are missing', () => {
            const playerWithPartialStats = {
                ...mockPlayer,
                height: "6'2\"",
                weight: '',
                academic: { gpa: 0 },
            };

            render(<HeroSection player={playerWithPartialStats} />);

            // Only height should render
            expect(screen.getByText('Height')).toBeInTheDocument();
            expect(screen.getByText("6'2\"")).toBeInTheDocument();
            expect(screen.queryByText('Weight')).not.toBeInTheDocument();
            expect(screen.queryByText('GPA')).not.toBeInTheDocument();
        });
    });
});
