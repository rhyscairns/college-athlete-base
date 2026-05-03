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

        it('should render height/weight text', () => {
            const propsWithStats = {
                ...mockProps,
                height: '6\'2"',
                weight: '210 lbs',
            };

            render(<PlayerInfoSection {...propsWithStats} />);

            const statsElement = screen.getByText('6\'2" • 210 lbs');
            expect(statsElement).toBeInTheDocument();
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
