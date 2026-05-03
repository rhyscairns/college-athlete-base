import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TypeaheadInput } from '../TypeaheadInput';

/**
 * Accessibility Tests for TypeaheadInput Component
 * 
 * Tests keyboard navigation, screen reader announcements, ARIA attributes,
 * and focus management to ensure WCAG 2.1 AA compliance.
 */
describe('TypeaheadInput - Accessibility', () => {
    const mockSportOptions = ['Soccer', 'Basketball', 'Football', 'Baseball', 'Swimming'];
    const mockPositionOptions = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'];

    const defaultProps = {
        label: 'Sport',
        name: 'sport',
        value: '',
        options: mockSportOptions,
        onChange: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Keyboard Navigation', () => {
        it('should navigate through sport suggestions with arrow keys and select with Enter', async () => {
            const user = userEvent.setup();
            const mockOnSelect = jest.fn();
            render(<TypeaheadInput {...defaultProps} onSelect={mockOnSelect} />);

            const input = screen.getByLabelText('Sport');
            await user.type(input, 'ball');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            const options = screen.getAllByRole('option');

            // Navigate down through options
            fireEvent.keyDown(input, { key: 'ArrowDown' });
            expect(options[0]).toHaveAttribute('aria-selected', 'true');

            fireEvent.keyDown(input, { key: 'ArrowDown' });
            expect(options[1]).toHaveAttribute('aria-selected', 'true');

            // Navigate up
            fireEvent.keyDown(input, { key: 'ArrowUp' });
            expect(options[0]).toHaveAttribute('aria-selected', 'true');

            // Select with Enter
            fireEvent.keyDown(input, { key: 'Enter' });
            expect(mockOnSelect).toHaveBeenCalledWith('Basketball');
            expect(input).toHaveValue('Basketball');
        });

        it('should navigate through position suggestions with arrow keys', async () => {
            const user = userEvent.setup();
            render(
                <TypeaheadInput
                    label="Position"
                    name="position"
                    value=""
                    options={mockPositionOptions}
                    onChange={jest.fn()}
                />
            );

            const input = screen.getByLabelText('Position');
            await user.type(input, 'der');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            const options = screen.getAllByRole('option');
            expect(options).toHaveLength(2); // Midfielder, Defender

            fireEvent.keyDown(input, { key: 'ArrowDown' });
            expect(options[0]).toHaveAttribute('aria-selected', 'true');

            fireEvent.keyDown(input, { key: 'ArrowDown' });
            expect(options[1]).toHaveAttribute('aria-selected', 'true');
        });

        it('should close dropdown with Escape key', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');
            await user.type(input, 'ball');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            fireEvent.keyDown(input, { key: 'Escape' });

            await waitFor(() => {
                expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
            });
            expect(input).toHaveFocus();
        });

        it('should support Tab key for focus management', async () => {
            const user = userEvent.setup();
            render(
                <div>
                    <TypeaheadInput {...defaultProps} />
                    <button>Next Field</button>
                </div>
            );

            const input = screen.getByLabelText('Sport');
            await user.type(input, 'ball');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            await user.tab();
            expect(screen.getByText('Next Field')).toHaveFocus();
        });

        it('should not navigate beyond boundaries', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');
            await user.type(input, 'ball');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            const options = screen.getAllByRole('option');

            // Try to go up from no selection
            fireEvent.keyDown(input, { key: 'ArrowUp' });
            expect(options[0]).toHaveAttribute('aria-selected', 'true');

            // Navigate to last option
            for (let i = 0; i < options.length; i++) {
                fireEvent.keyDown(input, { key: 'ArrowDown' });
            }

            // Try to go beyond last
            fireEvent.keyDown(input, { key: 'ArrowDown' });
            expect(options[options.length - 1]).toHaveAttribute('aria-selected', 'true');
        });
    });

    describe('Screen Reader - Combobox Announcement', () => {
        it('should announce typeahead as combobox with correct ARIA attributes', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            // Combobox role and attributes
            expect(input).toHaveAttribute('role', 'combobox');
            expect(input).toHaveAttribute('aria-autocomplete', 'list');
            expect(input).toHaveAttribute('aria-expanded', 'false');
            expect(input).toHaveAttribute('aria-controls', 'sport-listbox');

            // Open dropdown
            await user.type(input, 'soc');

            await waitFor(() => {
                expect(input).toHaveAttribute('aria-expanded', 'true');
                const listbox = screen.getByRole('listbox');
                expect(listbox).toHaveAttribute('id', 'sport-listbox');
                expect(listbox).toHaveAttribute('aria-label', 'Sport suggestions');
            });
        });
    });

    describe('Screen Reader - Number of Suggestions', () => {
        it('should announce correct number of suggestions via role structure', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');
            await user.type(input, 'ball');

            await waitFor(() => {
                const options = screen.getAllByRole('option');
                expect(options).toHaveLength(3); // Basketball, Football, Baseball
            });

            // Type more to narrow results
            await user.type(input, 'et');

            await waitFor(() => {
                const options = screen.getAllByRole('option');
                expect(options).toHaveLength(1); // Basketball
            });
        });
    });

    describe('Screen Reader - Highlighted Suggestion', () => {
        it('should announce highlighted suggestion with aria-activedescendant', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');
            await user.type(input, 'ball');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            // Initially no highlight
            expect(input).not.toHaveAttribute('aria-activedescendant');

            // Navigate to first option
            fireEvent.keyDown(input, { key: 'ArrowDown' });
            expect(input).toHaveAttribute('aria-activedescendant', 'sport-option-0');

            // Navigate to second option
            fireEvent.keyDown(input, { key: 'ArrowDown' });
            expect(input).toHaveAttribute('aria-activedescendant', 'sport-option-1');

            const options = screen.getAllByRole('option');
            expect(options[1]).toHaveAttribute('aria-selected', 'true');
            expect(options[1]).toHaveAttribute('id', 'sport-option-1');
        });
    });

    describe('Screen Reader - Selection Announcement', () => {
        it('should announce selection by updating input value and closing dropdown', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');
            await user.type(input, 'soc');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            // Select option
            fireEvent.keyDown(input, { key: 'ArrowDown' });
            expect(input).toHaveAttribute('aria-activedescendant', 'sport-option-0');

            fireEvent.keyDown(input, { key: 'Enter' });

            // Input value updates (screen reader announces)
            expect(input).toHaveValue('Soccer');

            // Dropdown closes (aria-expanded changes)
            await waitFor(() => {
                expect(input).toHaveAttribute('aria-expanded', 'false');
                expect(input).not.toHaveAttribute('aria-activedescendant');
            });

            // Focus remains on input
            expect(input).toHaveFocus();
        });
    });

    describe('Screen Reader - Validation Error Announcement', () => {
        it('should announce validation errors with role alert and aria-describedby', () => {
            render(
                <TypeaheadInput {...defaultProps} error="Please select a valid sport" />
            );

            const input = screen.getByLabelText('Sport');
            const errorMessage = screen.getByText('Please select a valid sport');

            // Error announced via role="alert"
            expect(errorMessage).toHaveAttribute('role', 'alert');
            expect(errorMessage).toHaveAttribute('id', 'sport-error');

            // Input linked to error
            expect(input).toHaveAttribute('aria-describedby', 'sport-error');
        });

        it('should announce error immediately when it appears', () => {
            const { rerender } = render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');
            expect(input).not.toHaveAttribute('aria-describedby');

            // Add error
            rerender(<TypeaheadInput {...defaultProps} error="This field is required" />);

            const errorMessage = screen.getByText('This field is required');
            expect(errorMessage).toHaveAttribute('role', 'alert');
            expect(input).toHaveAttribute('aria-describedby', 'sport-error');
        });
    });

    describe('Focus Indicators', () => {
        it('should have visible focus ring on input', () => {
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');
            expect(input).toHaveClass('focus:ring-2');
            expect(input).toHaveClass('focus:ring-blue-500');
        });

        it('should have visible highlighted state on options', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');
            await user.type(input, 'ball');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            fireEvent.keyDown(input, { key: 'ArrowDown' });

            const firstOption = screen.getAllByRole('option')[0];
            expect(firstOption).toHaveAttribute('aria-selected', 'true');
        });

        it('should maintain focus on input when navigating with keyboard', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');
            await user.click(input);
            expect(input).toHaveFocus();

            await user.type(input, 'ball');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            fireEvent.keyDown(input, { key: 'ArrowDown' });
            expect(input).toHaveFocus();
        });
    });

    describe('ARIA Attributes - Complete Structure', () => {
        it('should have all required ARIA attributes on all elements', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            // Input attributes
            expect(input).toHaveAttribute('role', 'combobox');
            expect(input).toHaveAttribute('aria-autocomplete', 'list');
            expect(input).toHaveAttribute('aria-expanded', 'false');
            expect(input).toHaveAttribute('aria-controls', 'sport-listbox');

            // Label association
            const label = screen.getByText('Sport');
            expect(label).toHaveAttribute('for', 'sport');
            expect(input).toHaveAttribute('id', 'sport');

            // Open dropdown
            await user.type(input, 'ball');

            await waitFor(() => {
                const listbox = screen.getByRole('listbox');
                expect(listbox).toHaveAttribute('id', 'sport-listbox');
                expect(listbox).toHaveAttribute('role', 'listbox');
                expect(listbox).toHaveAttribute('aria-label', 'Sport suggestions');

                const options = screen.getAllByRole('option');
                options.forEach((option, index) => {
                    expect(option).toHaveAttribute('role', 'option');
                    expect(option).toHaveAttribute('id', `sport-option-${index}`);
                    expect(option).toHaveAttribute('aria-selected');
                });
            });
        });

        it('should maintain ARIA relationships between elements', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');
            await user.type(input, 'ball');

            await waitFor(() => {
                const listbox = screen.getByRole('listbox');
                const listboxId = listbox.getAttribute('id');
                expect(input).toHaveAttribute('aria-controls', listboxId);
            });

            fireEvent.keyDown(input, { key: 'ArrowDown' });

            const options = screen.getAllByRole('option');
            const firstOptionId = options[0].getAttribute('id');
            expect(input).toHaveAttribute('aria-activedescendant', firstOptionId);
        });

        it('should have aria-disabled on no results option', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');
            await user.type(input, 'xyz');

            await waitFor(() => {
                const noResults = screen.getByText('No results found');
                expect(noResults).toHaveAttribute('role', 'option');
                expect(noResults).toHaveAttribute('aria-disabled', 'true');
            });
        });
    });

    describe('Complete Accessibility Flow', () => {
        it('should support complete keyboard-only workflow', async () => {
            const user = userEvent.setup();
            const mockOnSelect = jest.fn();

            render(
                <div>
                    <button>Previous Field</button>
                    <TypeaheadInput {...defaultProps} onSelect={mockOnSelect} />
                    <button>Next Field</button>
                </div>
            );

            // Tab to input
            await user.tab();
            await user.tab();

            const input = screen.getByLabelText('Sport');
            expect(input).toHaveFocus();

            // Type to filter
            await user.type(input, 'ball');

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            // Navigate with arrows
            fireEvent.keyDown(input, { key: 'ArrowDown' });
            fireEvent.keyDown(input, { key: 'ArrowDown' });

            // Select with Enter
            fireEvent.keyDown(input, { key: 'Enter' });

            expect(mockOnSelect).toHaveBeenCalledWith('Football');
            expect(input).toHaveValue('Football');

            // Tab to next field
            await user.tab();
            expect(screen.getByText('Next Field')).toHaveFocus();
        });

        it('should announce all state changes to screen readers', async () => {
            const user = userEvent.setup();
            render(<TypeaheadInput {...defaultProps} />);

            const input = screen.getByLabelText('Sport');

            // Initial state
            expect(input).toHaveAttribute('aria-expanded', 'false');

            // Open dropdown
            await user.type(input, 'ball');

            await waitFor(() => {
                expect(input).toHaveAttribute('aria-expanded', 'true');
            });

            // Navigate
            fireEvent.keyDown(input, { key: 'ArrowDown' });
            expect(input).toHaveAttribute('aria-activedescendant', 'sport-option-0');

            // Select
            fireEvent.keyDown(input, { key: 'Enter' });

            await waitFor(() => {
                expect(input).toHaveAttribute('aria-expanded', 'false');
                expect(input).not.toHaveAttribute('aria-activedescendant');
            });
        });
    });
});
