import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TypeaheadInput } from '../TypeaheadInput';

describe('TypeaheadInput', () => {
    const mockOptions = [
        'Soccer',
        'Basketball',
        'Football',
        'Baseball',
        'Swimming',
        'Track and Field',
    ];

    const defaultProps = {
        label: 'Sport',
        name: 'sport',
        value: '',
        options: mockOptions,
        onChange: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render with label and placeholder', () => {
            render(
                <TypeaheadInput
                    {...defaultProps}
                    placeholder="Select a sport"
                />
            );

            expect(screen.getByLabelText('Sport')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Select a sport')).toBeInTheDocument();
        });

        it('should render with initial value', () => {
            render(<TypeaheadInput {...defaultProps} value="Soccer" />);

            expect(screen.getByDisplayValue('Soccer')).toBeInTheDocument();
        });

        it('should render with custom className', () => {
            const { container } = render(
                <TypeaheadInput {...defaultProps} className="custom-class" />
            );

            expect(container.firstChild).toHaveClass('custom-class');
        });
    });

    describe('Dropdown Behavior', () => {
        it('should show dropdown after minChars threshold (3 characters)', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            // Type 3 characters
            await user.type(input, 'Soc');

            // Dropdown should be visible
            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });
        });

        it('should not show dropdown with fewer than minChars', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            // Type 2 characters
            await user.type(input, 'So');

            // Dropdown should not be visible
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        });

        it('should respect custom minChars value', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} minChars={2} />);

            const input = screen.getByLabelText('Sport');

            // Type 2 characters
            await user.type(input, 'So');

            // Dropdown should be visible with minChars=2
            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });
        });

        it('should close dropdown when input is cleared below minChars', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} value="Soccer" />);

            const input = screen.getByLabelText('Sport');

            // Open dropdown
            await user.clear(input);
            await user.type(input, 'Soc');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            // Clear to below minChars
            await user.clear(input);
            await user.type(input, 'So');

            // Dropdown should close
            await waitFor(() => {
                expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
            });
        });
    });

    describe('Filtering', () => {
        it('should filter options correctly (case-insensitive)', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            // Type lowercase
            await user.type(input, 'soc');

            await waitFor(() => {
                expect(screen.getByText('Soccer')).toBeInTheDocument();
            });
        });

        it('should filter with uppercase input', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'SOC');

            await waitFor(() => {
                expect(screen.getByText('Soccer')).toBeInTheDocument();
            });
        });

        it('should filter with mixed case input', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'SoC');

            await waitFor(() => {
                expect(screen.getByText('Soccer')).toBeInTheDocument();
            });
        });

        it('should show multiple matching options', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'ball');

            await waitFor(() => {
                expect(screen.getByText('Basketball')).toBeInTheDocument();
                expect(screen.getByText('Football')).toBeInTheDocument();
                expect(screen.getByText('Baseball')).toBeInTheDocument();
            });
        });

        it('should filter options as user types', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            // Type 'bas'
            await user.type(input, 'bas');

            await waitFor(() => {
                expect(screen.getByText('Basketball')).toBeInTheDocument();
                expect(screen.getByText('Baseball')).toBeInTheDocument();
            });

            // Type more to narrow down
            await user.type(input, 'ket');

            await waitFor(() => {
                expect(screen.getByText('Basketball')).toBeInTheDocument();
                expect(screen.queryByText('Baseball')).not.toBeInTheDocument();
            });
        });
    });

    describe('Keyboard Navigation', () => {
        it('should navigate down with ArrowDown key', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'ball');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            // Press ArrowDown
            fireEvent.keyDown(input, { key: 'ArrowDown' });

            // First option should be highlighted
            const firstOption = screen.getByText('Basketball');
            expect(firstOption).toHaveAttribute('aria-selected', 'true');
        });

        it('should navigate up with ArrowUp key', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'ball');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            // Navigate down twice
            fireEvent.keyDown(input, { key: 'ArrowDown' });
            fireEvent.keyDown(input, { key: 'ArrowDown' });

            // Navigate up once
            fireEvent.keyDown(input, { key: 'ArrowUp' });

            // First option should be highlighted again
            const firstOption = screen.getByText('Basketball');
            expect(firstOption).toHaveAttribute('aria-selected', 'true');
        });

        it('should not go below first option with ArrowUp', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'ball');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            // Press ArrowUp when no option is highlighted
            fireEvent.keyDown(input, { key: 'ArrowUp' });

            // First option should be highlighted
            const firstOption = screen.getByText('Basketball');
            expect(firstOption).toHaveAttribute('aria-selected', 'true');
        });

        it('should not go beyond last option with ArrowDown', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'ball');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            // Navigate to last option
            fireEvent.keyDown(input, { key: 'ArrowDown' });
            fireEvent.keyDown(input, { key: 'ArrowDown' });
            fireEvent.keyDown(input, { key: 'ArrowDown' });

            // Try to go beyond
            fireEvent.keyDown(input, { key: 'ArrowDown' });

            // Last option should still be highlighted
            const lastOption = screen.getByText('Baseball');
            expect(lastOption).toHaveAttribute('aria-selected', 'true');
        });

        it('should select option with Enter key', async () => {
            const user = userEvent.setup();
            const mockOnChange = jest.fn();
            const mockOnSelect = jest.fn();

            render(
                <TypeaheadInput
                    {...defaultProps}
                    onChange={mockOnChange}
                    onSelect={mockOnSelect}
                />
            );

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'ball');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            // Navigate to first option
            fireEvent.keyDown(input, { key: 'ArrowDown' });

            // Select with Enter
            fireEvent.keyDown(input, { key: 'Enter' });

            expect(mockOnChange).toHaveBeenCalledWith('Basketball');
            expect(mockOnSelect).toHaveBeenCalledWith('Basketball');

            // Dropdown should close
            await waitFor(() => {
                expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
            });
        });

        it('should close dropdown with Escape key', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'ball');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            // Press Escape
            fireEvent.keyDown(input, { key: 'Escape' });

            // Dropdown should close
            await waitFor(() => {
                expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
            });
        });
    });

    describe('Click Outside', () => {
        it('should close dropdown when clicking outside', async () => {
            const user = userEvent.setup();
            render(
                <div>
                    <TypeaheadInput {...defaultProps} />
                    <button>Outside Button</button>
                </div>
            );

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'ball');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            // Click outside
            const outsideButton = screen.getByText('Outside Button');
            fireEvent.mouseDown(outsideButton);

            // Dropdown should close
            await waitFor(() => {
                expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
            });
        });

        it('should not close dropdown when clicking inside', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'ball');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            // Click on input
            fireEvent.mouseDown(input);

            // Dropdown should remain open
            expect(screen.getByRole('listbox')).toBeInTheDocument();
        });
    });

    describe('Selection', () => {
        it('should call onChange when option is selected', async () => {
            const user = userEvent.setup();
            const mockOnChange = jest.fn();

            render(<TypeaheadInput {...defaultProps} onChange={mockOnChange} />);

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'soc');

            await waitFor(() => {
                expect(screen.getByText('Soccer')).toBeInTheDocument();
            });

            // Click on option
            const option = screen.getByText('Soccer');
            fireEvent.click(option);

            expect(mockOnChange).toHaveBeenCalledWith('Soccer');
        });

        it('should call onSelect when option is selected', async () => {
            const user = userEvent.setup();
            const mockOnSelect = jest.fn();

            render(<TypeaheadInput {...defaultProps} onSelect={mockOnSelect} />);

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'soc');

            await waitFor(() => {
                expect(screen.getByText('Soccer')).toBeInTheDocument();
            });

            // Click on option
            const option = screen.getByText('Soccer');
            fireEvent.click(option);

            expect(mockOnSelect).toHaveBeenCalledWith('Soccer');
        });

        it('should close dropdown after selection', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'soc');

            await waitFor(() => {
                expect(screen.getByText('Soccer')).toBeInTheDocument();
            });

            // Click on option
            const option = screen.getByText('Soccer');
            fireEvent.click(option);

            // Dropdown should close
            await waitFor(() => {
                expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
            });
        });

        it('should update input value after selection', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'soc');

            await waitFor(() => {
                expect(screen.getByText('Soccer')).toBeInTheDocument();
            });

            // Click on option
            const option = screen.getByText('Soccer');
            fireEvent.click(option);

            expect(input).toHaveValue('Soccer');
        });
    });

    describe('Disabled State', () => {
        it('should prevent interaction when disabled', () => {
            render(<TypeaheadInput {...defaultProps} disabled />);

            const input = screen.getByLabelText('Sport') as HTMLInputElement;

            expect(input).toBeDisabled();
        });

        it('should not open dropdown when disabled', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} disabled />);

            const input = screen.getByLabelText('Sport');

            // Try to type
            await user.type(input, 'soc');

            // Dropdown should not appear
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        });

        it('should have disabled styling', () => {
            render(<TypeaheadInput {...defaultProps} disabled />);

            const input = screen.getByLabelText('Sport');

            expect(input).toHaveClass('disabled:bg-gray-100');
            expect(input).toHaveClass('disabled:cursor-not-allowed');
        });
    });

    describe('Error Message', () => {
        it('should display error message when provided', () => {
            render(
                <TypeaheadInput
                    {...defaultProps}
                    error="Please select a valid sport"
                />
            );

            expect(screen.getByText('Please select a valid sport')).toBeInTheDocument();
        });

        it('should have error role alert', () => {
            render(
                <TypeaheadInput
                    {...defaultProps}
                    error="Please select a valid sport"
                />
            );

            const errorMessage = screen.getByText('Please select a valid sport');
            expect(errorMessage).toHaveAttribute('role', 'alert');
        });

        it('should apply error styling to input', () => {
            render(
                <TypeaheadInput
                    {...defaultProps}
                    error="Please select a valid sport"
                />
            );

            const input = screen.getByLabelText('Sport');
            expect(input).toHaveClass('border-red-500');
        });

        it('should not display error when not provided', () => {
            render(<TypeaheadInput {...defaultProps} />);

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    describe('ARIA Attributes', () => {
        it('should have correct combobox role', () => {
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');
            expect(input).toHaveAttribute('role', 'combobox');
        });

        it('should have aria-autocomplete attribute', () => {
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');
            expect(input).toHaveAttribute('aria-autocomplete', 'list');
        });

        it('should have aria-expanded false when closed', () => {
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');
            expect(input).toHaveAttribute('aria-expanded', 'false');
        });

        it('should have aria-expanded true when open', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'soc');

            await waitFor(() => {
                expect(input).toHaveAttribute('aria-expanded', 'true');
            });
        });

        it('should have aria-controls pointing to listbox', () => {
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');
            expect(input).toHaveAttribute('aria-controls', 'sport-listbox');
        });

        it('should have aria-activedescendant when option is highlighted', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'ball');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            // Navigate to first option
            fireEvent.keyDown(input, { key: 'ArrowDown' });

            expect(input).toHaveAttribute('aria-activedescendant', 'sport-option-0');
        });

        it('should have aria-describedby when error exists', () => {
            render(
                <TypeaheadInput
                    {...defaultProps}
                    error="Please select a valid sport"
                />
            );

            const input = screen.getByLabelText('Sport');
            expect(input).toHaveAttribute('aria-describedby', 'sport-error');
        });

        it('should have listbox role on dropdown', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'soc');

            await waitFor(() => {
                const listbox = screen.getByRole('listbox');
                expect(listbox).toBeInTheDocument();
                expect(listbox).toHaveAttribute('aria-label', 'Sport suggestions');
            });
        });

        it('should have option role on each suggestion', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'ball');

            await waitFor(() => {
                const options = screen.getAllByRole('option');
                expect(options.length).toBeGreaterThan(0);
                options.forEach(option => {
                    expect(option).toHaveAttribute('role', 'option');
                });
            });
        });

        it('should have aria-selected on highlighted option', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'ball');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            // Navigate to first option
            fireEvent.keyDown(input, { key: 'ArrowDown' });

            const firstOption = screen.getByText('Basketball');
            expect(firstOption).toHaveAttribute('aria-selected', 'true');
        });
    });

    describe('No Results Message', () => {
        it('should display no results message when no matches', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'xyz');

            await waitFor(() => {
                expect(screen.getByText('No results found')).toBeInTheDocument();
            });
        });

        it('should display custom no results message', async () => {
            const user = userEvent.setup();
            render(
                <TypeaheadInput
                    {...defaultProps}
                    noResultsMessage="No sports found"
                />
            );

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'xyz');

            await waitFor(() => {
                expect(screen.getByText('No sports found')).toBeInTheDocument();
            });
        });

        it('should have aria-disabled on no results option', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'xyz');

            await waitFor(() => {
                const noResults = screen.getByText('No results found');
                expect(noResults).toHaveAttribute('aria-disabled', 'true');
            });
        });

        it('should not allow selection of no results message', async () => {
            const user = userEvent.setup();
            const mockOnSelect = jest.fn();

            render(
                <TypeaheadInput
                    {...defaultProps}
                    onSelect={mockOnSelect}
                />
            );

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'xyz');

            await waitFor(() => {
                expect(screen.getByText('No results found')).toBeInTheDocument();
            });

            // Try to click no results message
            const noResults = screen.getByText('No results found');
            fireEvent.click(noResults);

            // onSelect should not be called
            expect(mockOnSelect).not.toHaveBeenCalled();
        });
    });

    describe('Mouse Interaction', () => {
        it('should highlight option on mouse enter', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            await user.type(input, 'ball');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            // Hover over second option
            const secondOption = screen.getByText('Football');
            fireEvent.mouseEnter(secondOption);

            expect(secondOption).toHaveAttribute('aria-selected', 'true');
        });

        it('should open dropdown on focus if input meets threshold', async () => {
            render(<TypeaheadInput {...defaultProps} value="Soccer" />);

            const input = screen.getByLabelText('Sport');

            // Focus input
            fireEvent.focus(input);

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });
        });
    });
});
