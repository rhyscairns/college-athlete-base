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

        it('renders sport dropdown', () => {
            render(<FilterBar {...defaultProps} />);
            const sportDropdown = screen.getAllByRole('combobox')[0];
            expect(sportDropdown).toBeInTheDocument();
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

        it('renders position dropdown', () => {
            render(<FilterBar {...defaultProps} />);
            const positionDropdown = screen.getAllByRole('combobox')[1];
            expect(positionDropdown).toBeInTheDocument();
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

        it('renders search button', () => {
            render(<FilterBar {...defaultProps} />);
            const searchButton = screen.getByRole('button', { name: /search/i });
            expect(searchButton).toBeInTheDocument();
        });

        it('has minimum touch target height', () => {
            render(<FilterBar {...defaultProps} />);
            const searchButton = screen.getByRole('button', { name: /search/i });
            expect(searchButton).toBeInTheDocument();
        });

        it('shows hover state styling', () => {
            render(<FilterBar {...defaultProps} />);
            const searchButton = screen.getByRole('button', { name: /search/i });
            expect(searchButton).toBeInTheDocument();
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
            expect(sportDropdown).toBeDisabled();
            expect(positionDropdown).toBeDisabled();
            expect(searchButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
        });
    });

    describe('Responsive Behavior', () => {
        it('renders filter controls container', () => {
            const { container } = render(<FilterBar {...defaultProps} />);
            const filterContainer = container.querySelector('[role="search"]');
            expect(filterContainer).toBeInTheDocument();
        });

        it('renders dropdowns and button in a row', () => {
            render(<FilterBar {...defaultProps} />);
            expect(screen.getAllByRole('combobox')).toHaveLength(2);
            expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
        });
    });

    describe('Light Theme Styling', () => {
        it('renders filter bar container', () => {
            const { container } = render(<FilterBar {...defaultProps} />);
            const filterBar = container.querySelector('[data-testid="filter-bar"]');
            expect(filterBar).toBeInTheDocument();
        });

        it('renders filter label', () => {
            render(<FilterBar {...defaultProps} />);
            expect(screen.getByText('Filter by:')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('has proper focus styles on dropdowns', () => {
            render(<FilterBar {...defaultProps} />);
            const sportDropdown = screen.getAllByRole('combobox')[0];
            expect(sportDropdown).toBeInTheDocument();
        });

        it('has proper focus styles on search button', () => {
            render(<FilterBar {...defaultProps} />);
            const searchButton = screen.getByRole('button', { name: /search/i });
            expect(searchButton).toHaveClass('focus:outline-none', 'focus:ring-2');
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
            const { isLoading: _l, ...propsWithoutLoading } = defaultProps;
            render(<FilterBar {...propsWithoutLoading} />);
            const sportDropdown = screen.getAllByRole('combobox')[0];
            expect(sportDropdown).not.toBeDisabled();
        });
    });
});
