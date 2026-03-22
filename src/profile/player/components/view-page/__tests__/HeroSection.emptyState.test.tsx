/**
 * Integration tests for HeroSection empty state handling
 * Tests Requirements 3.1, 3.2, 3.4
 */

import { render, screen } from '@testing-library/react';
import { HeroSection } from '../HeroSection';

describe('HeroSection - Empty State Integration', () => {
    describe('Requirement 3.1: Empty sections display placeholder content', () => {
        it('displays default values when fields are empty', () => {
            const emptyPlayer = {
                firstName: '',
                lastName: '',
                initials: '',
                position: '',
                school: '',
                location: '',
                classYear: '',
                height: '',
                weight: '',
                academic: { gpa: 0 },
                performanceMetrics: [],
            } as any;

            render(<HeroSection player={emptyPlayer} />);

            // Should show default values
            expect(screen.getByText('First Last')).toBeInTheDocument();
            expect(screen.getAllByText('Position').length).toBeGreaterThan(0);
            expect(screen.getAllByText('School Name').length).toBeGreaterThan(0);
        });
    });

    describe('Requirement 3.2: UI does not break with missing optional fields', () => {
        it('renders without errors when all optional fields are missing', () => {
            const playerWithoutOptionals = {
                firstName: 'John',
                lastName: 'Doe',
                initials: 'JD',
                position: 'Quarterback',
                school: 'Test High',
                location: '',
                classYear: '',
                height: '',
                weight: '',
                academic: { gpa: 0 },
                performanceMetrics: undefined,
            } as any;

            const { container } = render(<HeroSection player={playerWithoutOptionals} />);

            // Component should render without errors
            expect(container.querySelector('section')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        it('renders without errors when performanceMetrics is undefined', () => {
            const player = {
                firstName: 'Jane',
                lastName: 'Smith',
                initials: 'JS',
                position: 'Forward',
                school: 'Test School',
                location: 'City, State',
                classYear: '2025',
                height: "5'10\"",
                weight: '150 lbs',
                academic: { gpa: 3.5 },
                performanceMetrics: undefined,
            } as any;

            render(<HeroSection player={player} />);

            // Should render without performance metrics section
            expect(screen.queryByText('Performance Highlights')).not.toBeInTheDocument();
        });

        it('renders without errors when academic.gpa is 0', () => {
            const player = {
                firstName: 'Test',
                lastName: 'Player',
                initials: 'TP',
                position: 'Guard',
                school: 'Test School',
                location: 'City, State',
                classYear: '2025',
                height: "6'0\"",
                weight: '180 lbs',
                academic: { gpa: 0 },
                performanceMetrics: [],
            } as any;

            render(<HeroSection player={player} />);

            // Should not render GPA stat
            expect(screen.queryByText('GPA')).not.toBeInTheDocument();
        });
    });

    describe('Requirement 3.4: Profile owner sees edit prompts', () => {
        it('shows edit button for profile owner', () => {
            const player = {
                firstName: 'Owner',
                lastName: 'Player',
                initials: 'OP',
                position: 'Center',
                school: 'Test School',
                location: '',
                classYear: '',
                height: '',
                weight: '',
                academic: { gpa: 0 },
                performanceMetrics: [],
            } as any;

            render(<HeroSection player={player} isOwner={true} />);

            // Edit button should be visible for owner
            expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
        });

        it('does not show edit button for non-owner', () => {
            const player = {
                firstName: 'Other',
                lastName: 'Player',
                initials: 'OP',
                position: 'Forward',
                school: 'Test School',
                location: '',
                classYear: '',
                height: '',
                weight: '',
                academic: { gpa: 0 },
                performanceMetrics: [],
            } as any;

            render(<HeroSection player={player} isOwner={false} />);

            // Edit button should not be visible for non-owner
            expect(screen.queryByRole('button', { name: /edit profile/i })).not.toBeInTheDocument();
        });
    });

    describe('Real-world scenarios', () => {
        it('handles new player with minimal data', () => {
            const newPlayer = {
                firstName: 'New',
                lastName: 'Player',
                initials: 'NP',
                position: 'Athlete',
                school: 'High School',
                location: '',
                classYear: '',
                height: '',
                weight: '',
                academic: { gpa: 0 },
                performanceMetrics: [],
            } as any;

            render(<HeroSection player={newPlayer} isOwner={true} />);

            // Should show required fields
            expect(screen.getByText('New Player')).toBeInTheDocument();
            expect(screen.getAllByText('Athlete').length).toBeGreaterThan(0);
            expect(screen.getAllByText('High School').length).toBeGreaterThan(0);

            // Should not show optional empty sections
            expect(screen.queryByText('Height')).not.toBeInTheDocument();
            expect(screen.queryByText('Weight')).not.toBeInTheDocument();
            expect(screen.queryByText('GPA')).not.toBeInTheDocument();
            expect(screen.queryByText('Performance Highlights')).not.toBeInTheDocument();

            // Should show edit button
            expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
        });

        it('handles partially completed profile', () => {
            const partialPlayer = {
                firstName: 'Partial',
                lastName: 'Player',
                initials: 'PP',
                position: 'Guard',
                school: 'Test High',
                location: 'Austin, TX',
                classYear: '2025',
                height: "6'1\"",
                weight: '',
                academic: { gpa: 3.2 },
                performanceMetrics: [
                    { label: 'Fast runner', value: '4.5s' },
                ],
            } as any;

            render(<HeroSection player={partialPlayer} />);

            // Should show filled fields
            expect(screen.getByText('Partial Player')).toBeInTheDocument();
            expect(screen.getAllByText(/Austin, TX/).length).toBeGreaterThan(0);
            expect(screen.getByText(/Class of 2025/)).toBeInTheDocument();
            expect(screen.getByText("6'1\"")).toBeInTheDocument();
            expect(screen.getByText('3.2')).toBeInTheDocument();
            expect(screen.getByText('Fast runner')).toBeInTheDocument();

            // Should not show empty weight
            expect(screen.queryByText('Weight')).not.toBeInTheDocument();
        });

        it('handles complete profile', () => {
            const completePlayer = {
                firstName: 'Complete',
                lastName: 'Player',
                initials: 'CP',
                position: 'Quarterback',
                school: 'Elite High',
                location: 'Dallas, TX',
                classYear: '2024',
                height: "6'3\"",
                weight: '210 lbs',
                academic: { gpa: 4.0 },
                performanceMetrics: [
                    { label: '4.4s 40-Yard Dash', value: '4.4s' },
                    { label: '38" Vertical', value: '38"' },
                ],
            } as any;

            render(<HeroSection player={completePlayer} />);

            // All fields should be visible
            expect(screen.getByText('Complete Player')).toBeInTheDocument();
            expect(screen.getAllByText('Quarterback').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Elite High').length).toBeGreaterThan(0);
            expect(screen.getAllByText(/Dallas, TX/).length).toBeGreaterThan(0);
            expect(screen.getByText(/Class of 2024/)).toBeInTheDocument();
            expect(screen.getByText("6'3\"")).toBeInTheDocument();
            expect(screen.getByText('210 lbs')).toBeInTheDocument();
            expect(screen.getByText('4')).toBeInTheDocument(); // GPA displayed as number
            expect(screen.getByText('4.4s 40-Yard Dash')).toBeInTheDocument();
            expect(screen.getByText('38" Vertical')).toBeInTheDocument();
        });
    });
});
