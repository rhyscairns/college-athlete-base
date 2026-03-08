import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar, FilterBarProps } from '../FilterBar';

describe('FilterBar', () => {
    const mockOnSportChange = jest.fn();
    const mockOnPositionChange = jest.fn();
    const mockOnSearch = jest.fn();

    const defaultProps: FilterBarProps = {
        sports: ['All Sports', 'Football', 'Basketball', 'Soccer'],
        positions: ['All Positions', 'Quarterback', 'Wide Receiver'],
        selectedSport: 'Football',
        selectedPosition: 'All Positions',
        onSportChange: mockOnSportChange,
        onPositionChange: mockOnPositionChange,
        onSearch: mockOnSearch,
        isLoading: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Component Structure', () => {
        it('renders the filter label', () => {
            render(<FilterBar {...defaultProps} />);
            expect(screen.getByText('Filter by:')).toBeInTheDocument();
        });

        it('renders sport dropdown with all options', () => {
            render(<FilterBar {...defaultProps} />);
            const sportDropdown = screen.getAllByRole('combobox')[0];
            expect(sportDropdown).toBeInTheDocument();

            defaultProps.sports.forEach((sport) => {
                expect(screen.getByRole('option', { name: sport })).toBeInTheDocument();
            });
        });

        it('renders position dropdown with all options', () => {
            render(<FilterBar {...defaultProps} />);
            const positionDropdown = screen.getAllByRole('combobox')[1];
            expect(positionDropdown).toBeInTheDocument();

            defaultProps.positions.forEach((position) => {
                expect(screen.getByRole('option', { name: position })).toBeInTheDocument();
            });
        });

        it('renders search button with icon and text', () => {
            render(<FilterBar {...defaultProps} />);
            const searchButton = screen.getByRole('button', { name: /search/i });
            expect(searchButton).toBeInTheDocument();

            // Check for SVG icon
            const svg = searchButton.querySelector('svg');
            expect(svg).toBeInTheDocument();
        });
    });

    describe('Sport Dropdown Behavior', () => {
        it('displays the selected sport', () => {
            render(<FilterBar {...defaultProps} />);
            const sportDropdown = screen.getAllByRole('combobox')[0] as HTMLSelectElement;
            expect(sportDropdown.value).toBe('Football');
        });

        it('calls onSportChange when sport is changed', () => {
            render(<FilterBar {...defaultProps} />);
            const sportDropdown = screen.getAllByRole('combobox')[0];

            fireEvent.change(sportDropdown, { target: { value: 'Basketball' } });

            expect(mockOnSportChange).toHaveBeenCalledTimes(1);
            expect(mockOnSportChange).toHaveBeenCalledWith('Basketball');
        });

        it('disables sport dropdown when loading', () => {
            render(<FilterBar {...defaultProps} isLoading={true} />);
            const sportDropdown = screen.getAllByRole('combobox')[0];
            expect(sportDropdown).toBeDisabled();
        });

        it('applies light theme styling to sport dropdown', () => {
            render(<FilterBar {...defaultProps} />);
            const sportDropdown = screen.getAllByRole('combobox')[0];
            expect(sportDropdown).toHaveClass('bg-white', 'text-gray-900');
        });
    });

    describe('Position Dropdown Behavior', () => {
        it('displays the selected position', () => {
            render(<FilterBar {...defaultProps} />);
            const positionDropdown = screen.getAllByRole('combobox')[1] as HTMLSelectElement;
            expect(positionDropdown.value).toBe('All Positions');
        });

        it('calls onPositionChange when position is changed', () => {
            render(<FilterBar {...defaultProps} />);
            const positionDropdown = screen.getAllByRole('combobox')[1];

            fireEvent.change(positionDropdown, { target: { value: 'Quarterback' } });

            expect(mockOnPositionChange).toHaveBeenCalledTimes(1);
            expect(mockOnPositionChange).toHaveBeenCalledWith('Quarterback');
        });

        it('disables position dropdown when loading', () => {
            render(<FilterBar {...defaultProps} isLoading={true} />);
            const positionDropdown = screen.getAllByRole('combobox')[1];
            expect(positionDropdown).toBeDisabled();
        });

        it('applies light theme styling to position dropdown', () => {
            render(<FilterBar {...defaultProps} />);
            const positionDropdown = screen.getAllByRole('combobox')[1];
            expect(positionDropdown).toHaveClass('bg-white', 'text-gray-900');
        });
    });

    describe('Search Button Behavior', () => {
        it('calls onSearch when clicked', () => {
            render(<FilterBar {...defaultProps} />);
            const searchButton = screen.getByRole('button', { name: /search/i });

            fireEvent.click(searchButton);

            expect(mockOnSearch).toHaveBeenCalledTimes(1);
        });

        it('disables search button when loading', () => {
            render(<FilterBar {...defaultProps} isLoading={true} />);
            const searchButton = screen.getByRole('button', { name: /search/i });
            expect(searchButton).toBeDisabled();
        });

        it('applies blue theme styling to search button', () => {
            render(<FilterBar {...defaultProps} />);
            const searchButton = screen.getByRole('button', { name: /search/i });
            expect(searchButton).toHaveClass('bg-blue-500', 'hover:bg-blue-600');
        });

        it('has minimum 44px height for touch accessibility', () => {
            render(<FilterBar {...defaultProps} />);
            const searchButton = screen.getByRole('button', { name: /search/i });
            expect(searchButton).toHaveClass('min-h-[44px]');
        });

        it('shows hover state styling', () => {
            render(<FilterBar {...defaultProps} />);
            const searchButton = screen.getByRole('button', { name: /search/i });
            expect(searchButton).toHaveClass('hover:bg-blue-600');
        });
    });

    describe('Loading State', () => {
        it('disables all controls when loading', () => {
            render(<FilterBar {...defaultProps} isLoading={true} />);

            const sportDropdown = screen.getAllByRole('combobox')[0];
            const positionDropdown = screen.getAllByRole('combobox')[1];
            const searchButton = screen.getByRole('button', { name: /search/i });

            expect(sportDropdown).toBeDisabled();
            expect(positionDropdown).toBeDisabled();
            expect(searchButton).toBeDisabled();
        });

        it('applies disabled styling when loading', () => {
            render(<FilterBar {...defaultProps} isLoading={true} />);

            const sportDropdown = screen.getAllByRole('combobox')[0];
            const positionDropdown = screen.getAllByRole('combobox')[1];
            const searchButton = screen.getByRole('button', { name: /search/i });

            expect(sportDropdown).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
            expect(positionDropdown).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
            expect(searchButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
        });
    });

    describe('Responsive Behavior', () => {
        it('applies responsive classes for mobile stacking', () => {
            const { container } = render(<FilterBar {...defaultProps} />);

            // Check main container has flex-col for mobile and flex-row for desktop
            const mainContainer = container.querySelector('.flex.flex-col.md\\:flex-row.md\\:items-center');
            expect(mainContainer).toBeInTheDocument();
        });

        it('applies responsive classes to filter controls', () => {
            const { container } = render(<FilterBar {...defaultProps} />);

            // Check filter controls container
            const controlsContainer = container.querySelector('.flex.flex-col.md\\:flex-row.gap-4.flex-1');
            expect(controlsContainer).toBeInTheDocument();
        });
    });

    describe('Light Theme Styling', () => {
        it('applies light theme background to container', () => {
            const { container } = render(<FilterBar {...defaultProps} />);
            const mainContainer = container.querySelector('.bg-gray-50');
            expect(mainContainer).toBeInTheDocument();
        });

        it('applies light theme to filter label', () => {
            render(<FilterBar {...defaultProps} />);
            const label = screen.getByText('Filter by:');
            expect(label).toHaveClass('text-gray-700');
        });
    });

    describe('Accessibility', () => {
        it('has proper focus styles on dropdowns', () => {
            render(<FilterBar {...defaultProps} />);
            const sportDropdown = screen.getAllByRole('combobox')[0];
            expect(sportDropdown).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
        });

        it('has proper focus styles on search button', () => {
            render(<FilterBar {...defaultProps} />);
            const searchButton = screen.getByRole('button', { name: /search/i });
            expect(searchButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
        });

        it('maintains keyboard navigation when not loading', () => {
            render(<FilterBar {...defaultProps} />);

            const sportDropdown = screen.getAllByRole('combobox')[0];
            const positionDropdown = screen.getAllByRole('combobox')[1];
            const searchButton = screen.getByRole('button', { name: /search/i });

            expect(sportDropdown).not.toHaveAttribute('tabIndex', '-1');
            expect(positionDropdown).not.toHaveAttribute('tabIndex', '-1');
            expect(searchButton).not.toHaveAttribute('tabIndex', '-1');
        });
    });

    describe('Edge Cases', () => {
        it('handles empty sports array', () => {
            render(<FilterBar {...defaultProps} sports={[]} />);
            const sportDropdown = screen.getAllByRole('combobox')[0];
            expect(sportDropdown).toBeInTheDocument();
        });

        it('handles empty positions array', () => {
            render(<FilterBar {...defaultProps} positions={[]} />);
            const positionDropdown = screen.getAllByRole('combobox')[1];
            expect(positionDropdown).toBeInTheDocument();
        });

        it('handles undefined isLoading prop', () => {
            const { isLoading, ...propsWithoutLoading } = defaultProps;
            render(<FilterBar {...propsWithoutLoading} />);

            const sportDropdown = screen.getAllByRole('combobox')[0];
            expect(sportDropdown).not.toBeDisabled();
        });
    });
});
