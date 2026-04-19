import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlayerInfoSection } from '../PlayerInfoSection';

describe('PlayerInfoSection', () => {
    const mockProps = {
        playerName: 'John Smith',
        position: 'Point Guard',
        sport: 'Basketball',
    };

    describe('Rendering', () => {
        it('should render player name correctly', () => {
            render(<PlayerInfoSection {...mockProps} />);

            expect(screen.getByText('John Smith')).toBeInTheDocument();
        });

        it('should render position', () => {
            render(<PlayerInfoSection {...mockProps} />);

            expect(screen.getByText('Point Guard')).toBeInTheDocument();
        });

        it('should render sport', () => {
            render(<PlayerInfoSection {...mockProps} />);

            expect(screen.getByText('Basketball')).toBeInTheDocument();
        });

        it('should render player name as h3 heading', () => {
            render(<PlayerInfoSection {...mockProps} />);

            const heading = screen.getByRole('heading', { level: 3 });
            expect(heading).toHaveTextContent('John Smith');
        });
    });

    describe('Height and Weight Display', () => {
        it('should render height and weight when both are provided', () => {
            const propsWithStats = {
                ...mockProps,
                height: '6\'2"',
                weight: '210 lbs',
            };

            render(<PlayerInfoSection {...propsWithStats} />);

            expect(screen.getByText('6\'2" • 210 lbs')).toBeInTheDocument();
        });

        it('should render only height when weight is not provided', () => {
            const propsWithHeight = {
                ...mockProps,
                height: '6\'2"',
            };

            render(<PlayerInfoSection {...propsWithHeight} />);

            expect(screen.getByText('6\'2"')).toBeInTheDocument();
        });

        it('should render only weight when height is not provided', () => {
            const propsWithWeight = {
                ...mockProps,
                weight: '210 lbs',
            };

            render(<PlayerInfoSection {...propsWithWeight} />);

            expect(screen.getByText('210 lbs')).toBeInTheDocument();
        });

        it('should not render height/weight section when neither is provided', () => {
            render(<PlayerInfoSection {...mockProps} />);

            // Check that the bullet separator doesn't exist
            expect(screen.queryByText(/•/)).not.toBeInTheDocument();
        });

        it('should use appropriate text styling for height/weight', () => {
            const propsWithStats = {
                ...mockProps,
                height: '6\'2"',
                weight: '210 lbs',
            };

            render(<PlayerInfoSection {...propsWithStats} />);

            const statsElement = screen.getByText('6\'2" • 210 lbs');
            expect(statsElement).toHaveClass('text-sm', 'text-gray-500');
        });
    });

    describe('Styling', () => {
        it('should have responsive padding', () => {
            const { container } = render(<PlayerInfoSection {...mockProps} />);

            const section = container.firstChild;
            expect(section).toHaveClass('p-4', 'sm:p-5');
        });

        it('should have responsive text sizes for player name', () => {
            render(<PlayerInfoSection {...mockProps} />);

            const name = screen.getByText('John Smith');
            expect(name).toHaveClass('text-xl', 'sm:text-2xl');
        });

        it('should have responsive text sizes for position', () => {
            render(<PlayerInfoSection {...mockProps} />);

            const position = screen.getByText('Point Guard');
            expect(position).toHaveClass('text-base', 'sm:text-lg');
        });

        it('should have responsive text sizes for sport', () => {
            render(<PlayerInfoSection {...mockProps} />);

            const sport = screen.getByText('Basketball');
            expect(sport).toHaveClass('text-sm', 'sm:text-base');
        });

        it('should truncate long player names', () => {
            const propsWithLongName = {
                ...mockProps,
                playerName: 'Christopher Montgomery-Wellington III',
            };

            render(<PlayerInfoSection {...propsWithLongName} />);

            const name = screen.getByText('Christopher Montgomery-Wellington III');
            expect(name).toHaveClass('truncate');
        });

        it('should use blue color for position text', () => {
            render(<PlayerInfoSection {...mockProps} />);

            const position = screen.getByText('Point Guard');
            expect(position).toHaveClass('text-blue-600');
        });

        it('should use gray color for sport text', () => {
            render(<PlayerInfoSection {...mockProps} />);

            const sport = screen.getByText('Basketball');
            expect(sport).toHaveClass('text-gray-700');
        });
    });

    describe('Edge Cases', () => {
        it('should handle single character names', () => {
            const propsWithShortName = {
                ...mockProps,
                playerName: 'A B',
            };

            render(<PlayerInfoSection {...propsWithShortName} />);

            expect(screen.getByText('A B')).toBeInTheDocument();
        });

        it('should handle long position names', () => {
            const propsWithLongPosition = {
                ...mockProps,
                position: 'Defensive Midfielder / Central Midfielder',
            };

            render(<PlayerInfoSection {...propsWithLongPosition} />);

            expect(screen.getByText('Defensive Midfielder / Central Midfielder')).toBeInTheDocument();
        });

        it('should handle long sport names', () => {
            const propsWithLongSport = {
                ...mockProps,
                sport: 'Track and Field - Long Distance Running',
            };

            render(<PlayerInfoSection {...propsWithLongSport} />);

            expect(screen.getByText('Track and Field - Long Distance Running')).toBeInTheDocument();
        });

        it('should handle special characters in measurements', () => {
            const propsWithSpecialChars = {
                ...mockProps,
                height: '6\'2"',
                weight: '210 lbs',
            };

            render(<PlayerInfoSection {...propsWithSpecialChars} />);

            expect(screen.getByText('6\'2" • 210 lbs')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should use semantic heading for player name', () => {
            render(<PlayerInfoSection {...mockProps} />);

            const heading = screen.getByRole('heading', { level: 3, name: 'John Smith' });
            expect(heading).toBeInTheDocument();
        });

        it('should have proper text hierarchy', () => {
            const { container } = render(<PlayerInfoSection {...mockProps} />);

            const heading = screen.getByRole('heading', { level: 3 });
            const position = screen.getByText('Point Guard');
            const sport = screen.getByText('Basketball');

            // Verify they're all in the same container
            expect(container.firstChild).toContainElement(heading);
            expect(container.firstChild).toContainElement(position);
            expect(container.firstChild).toContainElement(sport);
        });
    });
});
