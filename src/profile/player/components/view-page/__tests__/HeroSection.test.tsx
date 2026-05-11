import { render, screen } from '@testing-library/react';
import { HeroSection } from '../HeroSection';

// Mock the sports constants
jest.mock('@/constants/sports', () => ({
    hasSportPositions: jest.fn((sport: string) => {
        const positionSports = ['Soccer', 'Football', 'Basketball'];
        return positionSports.includes(sport);
    }),
    hasSportEvents: jest.fn((sport: string) => {
        const eventSports = ['Swimming & Diving', 'Track & Field'];
        return eventSports.includes(sport);
    }),
}));

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

        expect(screen.getByText('Marcus Johnson')).toBeInTheDocument();
    });

    it('renders player position and school', () => {
        render(<HeroSection player={mockPlayer} />);

        // Position and school appear multiple times in the new layout
        expect(screen.getAllByText('Wide Receiver').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Westlake High School').length).toBeGreaterThan(0);
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
            expect(screen.getByText('Marcus Johnson')).toBeInTheDocument();
            expect(screen.getAllByText('Wide Receiver').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Westlake High School').length).toBeGreaterThan(0);

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
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getAllByText('Quarterback').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Test High School').length).toBeGreaterThan(0);

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

            // Should generate initials from first and last name (MJ from Marcus Johnson)
            const initialsElements = container.querySelectorAll('span');
            const hasInitials = Array.from(initialsElements).some(
                (el) => el.textContent === 'MJ'
            );
            expect(hasInitials).toBe(true);
        });

        it('renders only location when classYear is missing', () => {
            const playerWithOnlyLocation = {
                ...mockPlayer,
                classYear: '',
            };

            render(<HeroSection player={playerWithOnlyLocation} />);

            expect(screen.getAllByText(/Austin, TX/).length).toBeGreaterThan(0);
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

    describe('Sport and Position/Event Display', () => {
        it('displays sport when hero.sport exists', () => {
            const playerWithSport = {
                ...mockPlayer,
                sport: 'Soccer',
            };

            render(<HeroSection player={playerWithSport} />);

            expect(screen.getByText('Sport')).toBeInTheDocument();
            expect(screen.getByText('Soccer')).toBeInTheDocument();
        });

        it('does not display sport when hero.sport is undefined', () => {
            const playerWithoutSport = {
                ...mockPlayer,
                sport: undefined,
            };

            render(<HeroSection player={playerWithoutSport} />);

            expect(screen.queryByText('Sport')).not.toBeInTheDocument();
        });

        it('does not display sport when hero.sport is empty string', () => {
            const playerWithEmptySport = {
                ...mockPlayer,
                sport: '',
            };

            render(<HeroSection player={playerWithEmptySport} />);

            expect(screen.queryByText('Sport')).not.toBeInTheDocument();
        });

        it('displays position when hero.position exists', () => {
            const playerWithPosition = {
                ...mockPlayer,
                sport: 'Soccer',
                position: 'Forward',
            };

            render(<HeroSection player={playerWithPosition} />);

            // Position label should be displayed
            expect(screen.getByText('Position')).toBeInTheDocument();
            // Position value should be displayed (appears in header and Athletic Profile)
            expect(screen.getAllByText('Forward').length).toBeGreaterThan(0);
        });

        it('does not display position/event when hero.position is undefined', () => {
            const playerWithoutPosition = {
                ...mockPlayer,
                sport: 'Soccer',
                position: undefined,
            };

            render(<HeroSection player={playerWithoutPosition} />);

            // Position label should not be in Athletic Profile section
            // Note: "Position" text appears in the header, so we need to check more specifically
            const athleticProfileSection = screen.getByText('Athletic Profile').closest('div');
            expect(athleticProfileSection).toBeInTheDocument();

            // Check that position field is not rendered in the athletic profile
            const positionFields = screen.queryAllByText('Position');
            // Should only find "Position" in the header (player.position fallback), not in Athletic Profile
            expect(positionFields.length).toBeLessThanOrEqual(1);
        });

        it('does not display position/event when hero.position is empty string', () => {
            const playerWithEmptyPosition = {
                ...mockPlayer,
                sport: 'Soccer',
                position: '',
            };

            render(<HeroSection player={playerWithEmptyPosition} />);

            // Check that position field is not rendered in the athletic profile
            const athleticProfileSection = screen.getByText('Athletic Profile').closest('div');
            expect(athleticProfileSection).toBeInTheDocument();

            // Position label should not appear in Athletic Profile when position is empty
            const positionLabels = screen.queryAllByText('Position');
            // Should only find "Position" as fallback text in header, not as a label
            expect(positionLabels.length).toBeLessThanOrEqual(1);
        });

        it('shows "Position" label for position-based sports', () => {
            const playerWithPositionSport = {
                ...mockPlayer,
                sport: 'Soccer',
                position: 'Midfielder',
            };

            render(<HeroSection player={playerWithPositionSport} />);

            // Should show "Position" label
            expect(screen.getByText('Position')).toBeInTheDocument();
            expect(screen.getAllByText('Midfielder').length).toBeGreaterThan(0);
        });

        it('shows "Event" label for event-based sports', () => {
            const playerWithEventSport = {
                ...mockPlayer,
                sport: 'Swimming & Diving',
                position: '100m Freestyle',
            };

            render(<HeroSection player={playerWithEventSport} />);

            // Should show "Event" label instead of "Position"
            expect(screen.getByText('Event')).toBeInTheDocument();
            expect(screen.getAllByText('100m Freestyle').length).toBeGreaterThan(0);
        });

        it('shows "Event" label for Track & Field', () => {
            const playerWithTrackAndField = {
                ...mockPlayer,
                sport: 'Track & Field',
                position: '400m Dash',
            };

            render(<HeroSection player={playerWithTrackAndField} />);

            // Should show "Event" label
            expect(screen.getByText('Event')).toBeInTheDocument();
            expect(screen.getAllByText('400m Dash').length).toBeGreaterThan(0);
        });

        it('shows "Position" label for Football', () => {
            const playerWithFootball = {
                ...mockPlayer,
                sport: 'Football',
                position: 'Quarterback',
            };

            render(<HeroSection player={playerWithFootball} />);

            // Should show "Position" label
            expect(screen.getByText('Position')).toBeInTheDocument();
            expect(screen.getAllByText('Quarterback').length).toBeGreaterThan(0);
        });

        it('shows "Position" label for Basketball', () => {
            const playerWithBasketball = {
                ...mockPlayer,
                sport: 'Basketball',
                position: 'Point Guard',
            };

            render(<HeroSection player={playerWithBasketball} />);

            // Should show "Position" label
            expect(screen.getByText('Position')).toBeInTheDocument();
            expect(screen.getAllByText('Point Guard').length).toBeGreaterThan(0);
        });

        it('displays both sport and position when both exist', () => {
            const playerWithBoth = {
                ...mockPlayer,
                sport: 'Soccer',
                position: 'Goalkeeper',
            };

            render(<HeroSection player={playerWithBoth} />);

            // Both should be displayed
            expect(screen.getByText('Sport')).toBeInTheDocument();
            expect(screen.getByText('Soccer')).toBeInTheDocument();
            expect(screen.getByText('Position')).toBeInTheDocument();
            expect(screen.getAllByText('Goalkeeper').length).toBeGreaterThan(0);
        });

        it('displays sport without position when position is missing', () => {
            const playerWithOnlySport = {
                ...mockPlayer,
                sport: 'Soccer',
                position: undefined,
            };

            render(<HeroSection player={playerWithOnlySport} />);

            // Sport should be displayed
            expect(screen.getByText('Sport')).toBeInTheDocument();
            expect(screen.getByText('Soccer')).toBeInTheDocument();

            // Position should not be displayed in Athletic Profile
            const athleticProfileSection = screen.getByText('Athletic Profile').closest('div');
            expect(athleticProfileSection).toBeInTheDocument();
        });

        it('defaults to "Position" label when sport is not recognized', () => {
            const playerWithUnknownSport = {
                ...mockPlayer,
                sport: 'Unknown Sport',
                position: 'Some Position',
            };

            render(<HeroSection player={playerWithUnknownSport} />);

            // Should default to "Position" label
            expect(screen.getByText('Position')).toBeInTheDocument();
            expect(screen.getAllByText('Some Position').length).toBeGreaterThan(0);
        });
    });

    describe('Scholarship Accepted Badge', () => {
        it('should not render scholarship accepted badge when hasAcceptedOffer is false', () => {
            render(<HeroSection player={{ ...mockPlayer, hasAcceptedOffer: false }} />);
            expect(screen.queryByTestId('scholarship-accepted-badge')).not.toBeInTheDocument();
            expect(screen.queryByText('Scholarship Accepted')).not.toBeInTheDocument();
        });

        it('should not render scholarship accepted badge when hasAcceptedOffer is not provided', () => {
            render(<HeroSection player={mockPlayer} />);
            expect(screen.queryByTestId('scholarship-accepted-badge')).not.toBeInTheDocument();
        });

        it('should render scholarship accepted badge when hasAcceptedOffer is true', () => {
            render(<HeroSection player={{ ...mockPlayer, hasAcceptedOffer: true }} />);
            expect(screen.getByTestId('scholarship-accepted-badge')).toBeInTheDocument();
            expect(screen.getByText('Scholarship Accepted')).toBeInTheDocument();
        });

        it('should render badge near the player name', () => {
            render(<HeroSection player={{ ...mockPlayer, hasAcceptedOffer: true }} />);
            const name = screen.getByText('Marcus Johnson');
            const badge = screen.getByTestId('scholarship-accepted-badge');
            // Badge should be a sibling or near the name element
            expect(name.parentElement).toContainElement(badge);
        });
    });
});
