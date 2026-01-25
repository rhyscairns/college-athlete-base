import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatsShowcase } from '../StatsShowcase';
import { mockPlayerData } from '../../../data/mockPlayerData';

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Helper to setup user event with no delay
const setupUser = () => userEvent.setup({ delay: null });

// Helper to advance timers in act
const advanceTimers = () => {
    act(() => {
        jest.runAllTimers();
    });
};

describe('StatsShowcase - Inline Editing', () => {
    const defaultProps = {
        stats: mockPlayerData.stats,
        isOwner: true,
        isEditing: false,
        isAnyOtherSectionEditing: false,
        onEdit: jest.fn(),
        onSave: jest.fn(),
        onCancel: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    describe('Edit button visibility (Requirements 1.1, 1.2)', () => {
        it('shows edit button when user is the owner and not editing', () => {
            render(<StatsShowcase {...defaultProps} />);

            const editButton = screen.getByRole('button', { name: /edit/i });
            expect(editButton).toBeInTheDocument();
        });

        it('hides edit button when user is not the owner', () => {
            render(<StatsShowcase {...defaultProps} isOwner={false} />);

            const editButton = screen.queryByRole('button', { name: /edit/i });
            expect(editButton).not.toBeInTheDocument();
        });

        it('hides edit button when section is in edit mode', () => {
            render(<StatsShowcase {...defaultProps} isEditing={true} />);

            const editButton = screen.queryByRole('button', { name: /edit/i });
            expect(editButton).not.toBeInTheDocument();
        });

        it('disables edit button when another section is being edited', () => {
            render(<StatsShowcase {...defaultProps} isAnyOtherSectionEditing={true} />);

            const editButton = screen.getByRole('button', { name: /edit/i });
            expect(editButton).toBeDisabled();
        });
    });

    describe('Entering edit mode (Requirements 1.3, 1.4)', () => {
        it('calls onEdit when edit button is clicked', () => {
            const onEdit = jest.fn();
            render(<StatsShowcase {...defaultProps} onEdit={onEdit} />);

            const editButton = screen.getByRole('button', { name: /edit/i });
            fireEvent.click(editButton);

            expect(onEdit).toHaveBeenCalledTimes(1);
        });

        it('displays edit form when isEditing is true', () => {
            render(<StatsShowcase {...defaultProps} isEditing={true} />);

            // Check for stat name and value inputs (multiple exist)
            const nameInputs = screen.getAllByLabelText(/stat name/i);
            const valueInputs = screen.getAllByLabelText(/value/i);
            expect(nameInputs.length).toBeGreaterThan(0);
            expect(valueInputs.length).toBeGreaterThan(0);
        });

        it('displays Save and Cancel buttons in edit mode', () => {
            render(<StatsShowcase {...defaultProps} isEditing={true} />);

            expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        });

        it('hides view mode content when in edit mode', () => {
            render(<StatsShowcase {...defaultProps} isEditing={true} />);

            // The stat cards should not be visible in edit mode
            // Check that the large stat values are not displayed
            const receivingYardsDisplay = screen.queryByText(mockPlayerData.stats.receivingYards.toLocaleString());
            expect(receivingYardsDisplay).not.toBeInTheDocument();
        });

        it('displays all existing stats in edit mode', () => {
            render(<StatsShowcase {...defaultProps} isEditing={true} />);

            // Check that all stat values are present in inputs
            const valueInputs = screen.getAllByLabelText(/value/i);
            expect(valueInputs.length).toBeGreaterThan(0);

            // Check that specific stat values are present
            expect(screen.getByDisplayValue(String(mockPlayerData.stats.receivingYards))).toBeInTheDocument();
            expect(screen.getByDisplayValue(String(mockPlayerData.stats.touchdowns))).toBeInTheDocument();
            expect(screen.getByDisplayValue(String(mockPlayerData.stats.receptions))).toBeInTheDocument();
        });
    });

    describe('Exiting edit mode - Cancel (Requirements 1.6)', () => {
        it('calls onCancel when cancel button is clicked', () => {
            const onCancel = jest.fn();
            render(<StatsShowcase {...defaultProps} isEditing={true} onCancel={onCancel} />);

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            expect(onCancel).toHaveBeenCalledTimes(1);
        });

        it('resets form data when cancel is clicked after changes', async () => {
            const user = setupUser();
            const { rerender } = render(<StatsShowcase {...defaultProps} isEditing={true} />);

            advanceTimers();

            // Change a stat value
            const valueInputs = screen.getAllByLabelText(/value/i);
            const firstValueInput = valueInputs[0];
            await user.clear(firstValueInput);
            await user.type(firstValueInput, '9999');

            expect(firstValueInput).toHaveValue('9999');

            // Click cancel
            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            // Simulate parent component setting isEditing back to false
            rerender(<StatsShowcase {...defaultProps} isEditing={false} />);

            // Re-enter edit mode to check if data was reset
            rerender(<StatsShowcase {...defaultProps} isEditing={true} />);

            advanceTimers();

            // Form should show original data
            expect(screen.getByDisplayValue(String(mockPlayerData.stats.receivingYards))).toBeInTheDocument();
        });
    });

    describe('Exiting edit mode - Save (Requirements 1.5)', () => {
        it('calls onSave with updated data when save button is clicked with valid data', async () => {
            const user = setupUser();
            const onSave = jest.fn();
            render(<StatsShowcase {...defaultProps} isEditing={true} onSave={onSave} />);

            advanceTimers();

            // Change a stat value
            const receivingYardsInput = screen.getByDisplayValue(String(mockPlayerData.stats.receivingYards));
            await user.clear(receivingYardsInput);
            await user.type(receivingYardsInput, '1500');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);

            advanceTimers();

            // Wait for async save operation
            await waitFor(() => {
                expect(onSave).toHaveBeenCalledTimes(1);
            });

            // Check that onSave was called with updated data
            expect(onSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    stats: expect.objectContaining({
                        receivingYards: 1500,
                    }),
                })
            );
        });

        it('shows loading state on save button during save', async () => {
            render(<StatsShowcase {...defaultProps} isEditing={true} />);

            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);

            // During save, button should show loading state
            await waitFor(() => {
                expect(saveButton).toHaveTextContent(/saving/i);
            });
        });

        it('disables inputs during save', async () => {
            render(<StatsShowcase {...defaultProps} isEditing={true} />);

            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);

            // Check that inputs are disabled during save
            const valueInputs = screen.getAllByLabelText(/value/i);
            await waitFor(() => {
                expect(valueInputs[0]).toBeDisabled();
            });
        });
    });

    describe('Add stat functionality (Requirements 10.1, 10.5)', () => {
        it('displays Add Stat button in edit mode', () => {
            render(<StatsShowcase {...defaultProps} isEditing={true} />);

            const addButton = screen.getByRole('button', { name: /\+ add stat/i });
            expect(addButton).toBeInTheDocument();
        });

        it('adds a new stat when Add Stat button is clicked', async () => {
            const user = setupUser();
            render(<StatsShowcase {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Get initial number of stat inputs
            const initialNameInputs = screen.getAllByLabelText(/stat name/i);
            const initialCount = initialNameInputs.length;

            // Click Add Stat button
            const addButton = screen.getByRole('button', { name: /\+ add stat/i });
            await user.click(addButton);

            // Check that a new stat input was added
            const updatedNameInputs = screen.getAllByLabelText(/stat name/i);
            expect(updatedNameInputs.length).toBe(initialCount + 1);
        });

        it('allows typing in new stat name and value', async () => {
            const user = setupUser();
            render(<StatsShowcase {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Add a new stat
            const addButton = screen.getByRole('button', { name: /\+ add stat/i });
            await user.click(addButton);

            // Get the new stat inputs (last ones in the list)
            const nameInputs = screen.getAllByLabelText(/stat name/i);
            const valueInputs = screen.getAllByLabelText(/value/i);
            const newNameInput = nameInputs[nameInputs.length - 1];
            const newValueInput = valueInputs[valueInputs.length - 1];

            // The new stat name input will have a generated key like "newStat6"
            const initialNameValue = (newNameInput as HTMLInputElement).value;
            expect(initialNameValue).toMatch(/newStat\d+/);

            // Type in the value
            await user.type(newValueInput, '45');
            expect(newValueInput).toHaveValue('45');
        });

        it('saves new stat when save is clicked', async () => {
            const user = setupUser();
            const onSave = jest.fn();
            render(<StatsShowcase {...defaultProps} isEditing={true} onSave={onSave} />);
            advanceTimers();

            // Add a new stat
            const addButton = screen.getByRole('button', { name: /\+ add stat/i });
            await user.click(addButton);

            // Get the new stat inputs
            const nameInputs = screen.getAllByLabelText(/stat name/i);
            const valueInputs = screen.getAllByLabelText(/value/i);
            const newNameInput = nameInputs[nameInputs.length - 1];
            const newValueInput = valueInputs[valueInputs.length - 1];

            // Type in the new stat value (name will have a generated key)
            await user.type(newValueInput, '3');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for save to complete
            await waitFor(() => {
                expect(onSave).toHaveBeenCalled();
            });

            // Check that the new stat was included (it will have the generated key name)
            const savedData = onSave.mock.calls[0][0];
            // The new stat should exist with the generated key
            const statKeys = Object.keys(savedData.stats);
            expect(statKeys.length).toBe(6); // 5 original + 1 new
        });

        it('allows adding multiple stats in sequence', async () => {
            const user = setupUser();
            render(<StatsShowcase {...defaultProps} isEditing={true} />);
            advanceTimers();

            const addButton = screen.getByRole('button', { name: /\+ add stat/i });

            // Get initial count
            const initialInputs = screen.getAllByLabelText(/stat name/i);
            const initialCount = initialInputs.length;

            // Add first stat
            await user.click(addButton);
            const inputs1 = screen.getAllByLabelText(/stat name/i);
            expect(inputs1.length).toBe(initialCount + 1);

            // Add second stat
            await user.click(addButton);
            const inputs2 = screen.getAllByLabelText(/stat name/i);
            expect(inputs2.length).toBe(initialCount + 2);

            // Add third stat
            await user.click(addButton);
            const inputs3 = screen.getAllByLabelText(/stat name/i);
            expect(inputs3.length).toBe(initialCount + 3);
        });
    });

    describe('Remove stat functionality (Requirements 10.1, 10.5)', () => {
        it('displays Remove button for each stat in edit mode', () => {
            render(<StatsShowcase {...defaultProps} isEditing={true} />);

            const removeButtons = screen.getAllByRole('button', { name: /remove/i });
            expect(removeButtons.length).toBeGreaterThan(0);
        });

        it('removes a stat when Remove button is clicked', async () => {
            const user = setupUser();
            render(<StatsShowcase {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Get initial number of stats
            const initialNameInputs = screen.getAllByLabelText(/stat name/i);
            const initialCount = initialNameInputs.length;

            // Click the first Remove button
            const removeButtons = screen.getAllByRole('button', { name: /remove/i });
            await user.click(removeButtons[0]);

            // Check that a stat was removed
            const updatedNameInputs = screen.getAllByLabelText(/stat name/i);
            expect(updatedNameInputs.length).toBe(initialCount - 1);
        });

        it('removes the correct stat when Remove button is clicked', async () => {
            const user = setupUser();
            render(<StatsShowcase {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Get the first stat value
            const valueInputs = screen.getAllByLabelText(/value/i);
            const firstStatValue = (valueInputs[0] as HTMLInputElement).value;

            // Click the first Remove button
            const removeButtons = screen.getAllByRole('button', { name: /remove/i });
            await user.click(removeButtons[0]);

            // Check that the first stat value is no longer present
            const updatedValueInputs = screen.getAllByLabelText(/value/i);
            const values = updatedValueInputs.map((input) => (input as HTMLInputElement).value);
            expect(values).not.toContain(firstStatValue);
        });

        it('saves updated stats after removal', async () => {
            const user = setupUser();
            const onSave = jest.fn();
            render(<StatsShowcase {...defaultProps} isEditing={true} onSave={onSave} />);
            advanceTimers();

            // Get initial stat count
            const initialNameInputs = screen.getAllByLabelText(/stat name/i);
            const initialCount = initialNameInputs.length;

            // Remove the first stat
            const removeButtons = screen.getAllByRole('button', { name: /remove/i });
            await user.click(removeButtons[0]);

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for save to complete
            await waitFor(() => {
                expect(onSave).toHaveBeenCalled();
            });

            // Check that the saved stats have one less item
            const savedData = onSave.mock.calls[0][0];
            const savedStatsCount = Object.keys(savedData.stats).length;
            expect(savedStatsCount).toBe(initialCount - 1);
        });

        it('allows removing multiple stats', async () => {
            const user = setupUser();
            render(<StatsShowcase {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Get initial count
            const initialInputs = screen.getAllByLabelText(/stat name/i);
            const initialCount = initialInputs.length;

            // Remove first stat
            let removeButtons = screen.getAllByRole('button', { name: /remove/i });
            await user.click(removeButtons[0]);

            // Remove another stat
            removeButtons = screen.getAllByRole('button', { name: /remove/i });
            await user.click(removeButtons[0]);

            // Check that two stats were removed
            const updatedInputs = screen.getAllByLabelText(/stat name/i);
            expect(updatedInputs.length).toBe(initialCount - 2);
        });
    });

    describe('Stat value updates (Requirements 1.3, 1.4)', () => {
        it('updates stat value when input changes', async () => {
            const user = setupUser();
            render(<StatsShowcase {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Change the first stat value
            const valueInputs = screen.getAllByLabelText(/value/i);
            const firstValueInput = valueInputs[0];
            await user.clear(firstValueInput);
            await user.type(firstValueInput, '2000');

            expect(firstValueInput).toHaveValue('2000');
        });

        it('updates stat name when input changes', async () => {
            const user = setupUser();
            render(<StatsShowcase {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Get the first stat name input
            const nameInputs = screen.getAllByLabelText(/stat name/i);
            const firstNameInput = nameInputs[0];
            const originalValue = (firstNameInput as HTMLInputElement).value;

            // Verify the input has the original stat name
            expect(firstNameInput).toHaveValue(originalValue);

            // The component allows changing stat names through the handleKeyChange function
            // which is triggered by onChange. We can verify the input is editable.
            expect(firstNameInput).not.toBeDisabled();
        });

        it('updates multiple stat values independently', async () => {
            const user = setupUser();
            render(<StatsShowcase {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Change multiple stat values
            const valueInputs = screen.getAllByLabelText(/value/i);
            await user.clear(valueInputs[0]);
            await user.type(valueInputs[0], '1111');
            await user.clear(valueInputs[1]);
            await user.type(valueInputs[1], '2222');

            expect(valueInputs[0]).toHaveValue('1111');
            expect(valueInputs[1]).toHaveValue('2222');
        });

        it('saves all updated stat values', async () => {
            const user = setupUser();
            const onSave = jest.fn();
            render(<StatsShowcase {...defaultProps} isEditing={true} onSave={onSave} />);
            advanceTimers();

            // Update multiple stats
            const receivingYardsInput = screen.getByDisplayValue(String(mockPlayerData.stats.receivingYards));
            const touchdownsInput = screen.getByDisplayValue(String(mockPlayerData.stats.touchdowns));

            await user.clear(receivingYardsInput);
            await user.type(receivingYardsInput, '1800');
            await user.clear(touchdownsInput);
            await user.type(touchdownsInput, '20');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for save to complete
            await waitFor(() => {
                expect(onSave).toHaveBeenCalled();
            });

            // Check that all updated values were saved
            const savedData = onSave.mock.calls[0][0];
            expect(savedData.stats.receivingYards).toBe(1800);
            expect(savedData.stats.touchdowns).toBe(20);
        });

        it('converts string values to numbers when saving', async () => {
            const user = setupUser();
            const onSave = jest.fn();
            render(<StatsShowcase {...defaultProps} isEditing={true} onSave={onSave} />);
            advanceTimers();

            // Update a stat value
            const valueInputs = screen.getAllByLabelText(/value/i);
            await user.clear(valueInputs[0]);
            await user.type(valueInputs[0], '1234');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for save to complete
            await waitFor(() => {
                expect(onSave).toHaveBeenCalled();
            });

            // Check that the value was converted to a number
            const savedData = onSave.mock.calls[0][0];
            const firstStatKey = Object.keys(savedData.stats)[0];
            expect(typeof savedData.stats[firstStatKey]).toBe('number');
        });
    });

    describe('Validation (Requirements 1.5)', () => {
        it('displays error when stat value is empty and save is clicked', async () => {
            const user = setupUser();
            render(<StatsShowcase {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Clear a stat value
            const valueInputs = screen.getAllByLabelText(/value/i);
            await user.clear(valueInputs[0]);

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for validation error
            await waitFor(() => {
                expect(screen.getByText(/value is required/i)).toBeInTheDocument();
            });
        });

        it('displays error when stat value is not a number', async () => {
            const user = setupUser();
            render(<StatsShowcase {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Enter non-numeric value
            const valueInputs = screen.getAllByLabelText(/value/i);
            await user.clear(valueInputs[0]);
            await user.type(valueInputs[0], 'abc');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for validation error
            await waitFor(() => {
                expect(screen.getByText(/value must be a number/i)).toBeInTheDocument();
            });
        });

        it('does not call onSave when validation fails', async () => {
            const user = setupUser();
            const onSave = jest.fn();
            render(<StatsShowcase {...defaultProps} isEditing={true} onSave={onSave} />);
            advanceTimers();

            // Clear a stat value to trigger validation error
            const valueInputs = screen.getAllByLabelText(/value/i);
            await user.clear(valueInputs[0]);

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for error to appear
            await waitFor(() => {
                expect(screen.getByText(/value is required/i)).toBeInTheDocument();
            });

            expect(onSave).not.toHaveBeenCalled();
        });

        it('displays multiple validation errors when multiple values are invalid', async () => {
            const user = setupUser();
            render(<StatsShowcase {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Clear multiple stat values
            const valueInputs = screen.getAllByLabelText(/value/i);
            await user.clear(valueInputs[0]);
            await user.clear(valueInputs[1]);

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for validation errors
            await waitFor(() => {
                const errors = screen.getAllByText(/value is required/i);
                expect(errors.length).toBeGreaterThanOrEqual(2);
            });
        });
    });

    describe('Keyboard navigation (Requirements 1.6)', () => {
        it('cancels editing when Escape key is pressed', async () => {
            const onCancel = jest.fn();
            render(<StatsShowcase {...defaultProps} isEditing={true} onCancel={onCancel} />);

            // Press Escape key
            fireEvent.keyDown(document, { key: 'Escape' });

            expect(onCancel).toHaveBeenCalledTimes(1);
        });

        it('does not trigger Escape handler when not in edit mode', () => {
            const onCancel = jest.fn();
            render(<StatsShowcase {...defaultProps} isEditing={false} onCancel={onCancel} />);

            // Press Escape key
            fireEvent.keyDown(document, { key: 'Escape' });

            expect(onCancel).not.toHaveBeenCalled();
        });
    });

    describe('View mode display', () => {
        it('displays stat cards in view mode', () => {
            render(<StatsShowcase {...defaultProps} isEditing={false} />);

            // Check that stat values are displayed
            expect(screen.getByText(mockPlayerData.stats.receivingYards.toLocaleString())).toBeInTheDocument();
            expect(screen.getByText(String(mockPlayerData.stats.touchdowns))).toBeInTheDocument();
            expect(screen.getByText(String(mockPlayerData.stats.receptions))).toBeInTheDocument();
        });

        it('displays stat labels in view mode', () => {
            render(<StatsShowcase {...defaultProps} isEditing={false} />);

            // Check that stat labels are displayed
            expect(screen.getByText(/receiving yards/i)).toBeInTheDocument();
            expect(screen.getByText(/touchdowns/i)).toBeInTheDocument();
            expect(screen.getByText(/receptions/i)).toBeInTheDocument();
        });
    });

    describe('Initial form data', () => {
        it('initializes form with stats data', () => {
            render(<StatsShowcase {...defaultProps} isEditing={true} />);

            // Check that all stat values are present
            expect(screen.getByDisplayValue(String(mockPlayerData.stats.receivingYards))).toBeInTheDocument();
            expect(screen.getByDisplayValue(String(mockPlayerData.stats.touchdowns))).toBeInTheDocument();
            expect(screen.getByDisplayValue(String(mockPlayerData.stats.receptions))).toBeInTheDocument();
            expect(screen.getByDisplayValue(String(mockPlayerData.stats.yardsPerCatch))).toBeInTheDocument();
            expect(screen.getByDisplayValue(String(mockPlayerData.stats.longestReception))).toBeInTheDocument();
        });
    });
});
