import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeroSection } from '../HeroSection';
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

describe('HeroSection - Inline Editing', () => {
    const defaultProps = {
        player: mockPlayerData,
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

    describe('Edit button visibility (Requirements 1.1, 1.2, 6.1, 6.2)', () => {
        it('shows edit button when user is the owner and not editing', () => {
            render(<HeroSection {...defaultProps} />);

            const editButton = screen.getByRole('button', { name: /edit/i });
            expect(editButton).toBeInTheDocument();
        });

        it('hides edit button when user is not the owner', () => {
            render(<HeroSection {...defaultProps} isOwner={false} />);

            const editButton = screen.queryByRole('button', { name: /edit/i });
            expect(editButton).not.toBeInTheDocument();
        });

        it('hides edit button when section is in edit mode', () => {
            render(<HeroSection {...defaultProps} isEditing={true} />);

            const editButton = screen.queryByRole('button', { name: /edit/i });
            expect(editButton).not.toBeInTheDocument();
        });

        it('disables edit button when another section is being edited', () => {
            render(<HeroSection {...defaultProps} isAnyOtherSectionEditing={true} />);

            const editButton = screen.getByRole('button', { name: /edit/i });
            expect(editButton).toBeDisabled();
        });
    });

    describe('Entering edit mode (Requirements 1.3, 1.4)', () => {
        it('calls onEdit when edit button is clicked', () => {
            const onEdit = jest.fn();
            render(<HeroSection {...defaultProps} onEdit={onEdit} />);

            const editButton = screen.getByRole('button', { name: /edit/i });
            fireEvent.click(editButton);

            expect(onEdit).toHaveBeenCalledTimes(1);
        });

        it('displays edit form when isEditing is true', () => {
            render(<HeroSection {...defaultProps} isEditing={true} />);

            // Check for form inputs
            expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/position/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/school/i)).toBeInTheDocument();
        });

        it('displays Save and Cancel buttons in edit mode', () => {
            render(<HeroSection {...defaultProps} isEditing={true} />);

            expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        });

        it('hides view mode content when in edit mode', () => {
            render(<HeroSection {...defaultProps} isEditing={true} />);

            // The large name display should not be visible
            const nameHeadings = screen.queryAllByRole('heading', { level: 1 });
            // In edit mode, we should not see the large display names
            expect(nameHeadings.length).toBe(0);
        });
    });

    describe('Exiting edit mode - Cancel (Requirements 1.6)', () => {
        it('calls onCancel when cancel button is clicked', () => {
            const onCancel = jest.fn();
            render(<HeroSection {...defaultProps} isEditing={true} onCancel={onCancel} />);

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            expect(onCancel).toHaveBeenCalledTimes(1);
        });

        it('resets form data when cancel is clicked after changes', async () => {
            const user = userEvent.setup({ delay: null });
            const { rerender } = render(<HeroSection {...defaultProps} isEditing={true} />);

            // Fast-forward timers for initial render effects
            act(() => {
                jest.runAllTimers();
            });

            // Change first name
            const firstNameInput = screen.getByLabelText(/first name/i);
            await user.clear(firstNameInput);
            await user.type(firstNameInput, 'Changed');

            expect(firstNameInput).toHaveValue('Changed');

            // Click cancel
            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            // Simulate parent component setting isEditing back to false
            rerender(<HeroSection {...defaultProps} isEditing={false} />);

            // Re-enter edit mode to check if data was reset
            rerender(<HeroSection {...defaultProps} isEditing={true} />);

            // Fast-forward timers for re-render effects
            act(() => {
                jest.runAllTimers();
            });

            // Form should show original data
            const resetFirstNameInput = screen.getByLabelText(/first name/i);
            expect(resetFirstNameInput).toHaveValue(mockPlayerData.firstName);
        });
    });

    describe('Exiting edit mode - Save (Requirements 1.5, 1.7)', () => {
        it('calls onSave with updated data when save button is clicked with valid data', async () => {
            const user = userEvent.setup({ delay: null });
            const onSave = jest.fn();
            render(<HeroSection {...defaultProps} isEditing={true} onSave={onSave} />);

            // Fast-forward initial timers
            act(() => {
                jest.runAllTimers();
            });

            // Change first name
            const firstNameInput = screen.getByLabelText(/first name/i);
            await user.clear(firstNameInput);
            await user.type(firstNameInput, 'UpdatedFirst');

            // Change last name
            const lastNameInput = screen.getByLabelText(/last name/i);
            await user.clear(lastNameInput);
            await user.type(lastNameInput, 'UpdatedLast');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);

            // Fast-forward the save delay timer
            act(() => {
                jest.runAllTimers();
            });

            // Wait for async save operation
            await waitFor(() => {
                expect(onSave).toHaveBeenCalledTimes(1);
            });

            // Check that onSave was called with updated data
            expect(onSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    firstName: 'UpdatedFirst',
                    lastName: 'UpdatedLast',
                })
            );
        });

        it('shows loading state on save button during save', async () => {
            render(<HeroSection {...defaultProps} isEditing={true} />);

            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);

            // During save, button should show loading state
            await waitFor(() => {
                expect(saveButton).toHaveTextContent(/saving/i);
            });
        });

        it('disables inputs during save', async () => {
            render(<HeroSection {...defaultProps} isEditing={true} />);

            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);

            // Check that inputs are disabled during save
            const firstNameInput = screen.getByLabelText(/first name/i);
            await waitFor(() => {
                expect(firstNameInput).toBeDisabled();
            });
        });
    });

    describe('Validation errors (Requirements 4.1, 4.2, 4.3)', () => {
        it('displays error when first name is empty and save is clicked', async () => {
            const user = setupUser();
            render(<HeroSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Clear first name
            const firstNameInput = screen.getByLabelText(/first name/i);
            await user.clear(firstNameInput);

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for validation error
            await waitFor(() => {
                expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
            });
        });

        it('displays error when last name is empty and save is clicked', async () => {
            const user = setupUser();
            render(<HeroSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Clear last name
            const lastNameInput = screen.getByLabelText(/last name/i);
            await user.clear(lastNameInput);

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for validation error
            await waitFor(() => {
                expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
            });
        });

        it('displays error when position is empty and save is clicked', async () => {
            const user = setupUser();
            render(<HeroSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Clear position
            const positionInput = screen.getByLabelText(/position/i);
            await user.clear(positionInput);

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for validation error
            await waitFor(() => {
                expect(screen.getByText(/position is required/i)).toBeInTheDocument();
            });
        });

        it('displays error when school is empty and save is clicked', async () => {
            const user = setupUser();
            render(<HeroSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Clear school
            const schoolInput = screen.getByLabelText(/school/i);
            await user.clear(schoolInput);

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for validation error
            await waitFor(() => {
                expect(screen.getByText(/school is required/i)).toBeInTheDocument();
            });
        });

        it('displays multiple validation errors when multiple fields are empty', async () => {
            const user = setupUser();
            render(<HeroSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Clear multiple required fields
            const firstNameInput = screen.getByLabelText(/first name/i);
            const lastNameInput = screen.getByLabelText(/last name/i);
            const positionInput = screen.getByLabelText(/position/i);

            await user.clear(firstNameInput);
            await user.clear(lastNameInput);
            await user.clear(positionInput);

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for all validation errors
            await waitFor(() => {
                expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
                expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
                expect(screen.getByText(/position is required/i)).toBeInTheDocument();
            });
        });

        it('does not call onSave when validation fails', async () => {
            const user = setupUser();
            const onSave = jest.fn();
            render(<HeroSection {...defaultProps} isEditing={true} onSave={onSave} />);
            advanceTimers();

            // Clear required field
            const firstNameInput = screen.getByLabelText(/first name/i);
            await user.clear(firstNameInput);

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait a bit to ensure onSave is not called
            await waitFor(() => {
                expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
            });

            expect(onSave).not.toHaveBeenCalled();
        });

        it('clears validation errors when field is corrected', async () => {
            const user = setupUser();
            render(<HeroSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Clear first name to trigger error
            const firstNameInput = screen.getByLabelText(/first name/i);
            await user.clear(firstNameInput);

            // Click save to show error
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for error to appear
            await waitFor(() => {
                expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
            });

            // Fix the field
            await user.type(firstNameInput, 'Fixed');

            // Click save again
            fireEvent.click(saveButton);
            advanceTimers();

            // Error should be cleared
            await waitFor(() => {
                expect(screen.queryByText(/first name is required/i)).not.toBeInTheDocument();
            });
        });
    });

    describe('Form data updates (Requirements 1.3, 1.4)', () => {
        it('updates form data when first name input changes', async () => {
            const user = setupUser();
            render(<HeroSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            const firstNameInput = screen.getByLabelText(/first name/i);
            await user.clear(firstNameInput);
            await user.type(firstNameInput, 'NewFirst');

            expect(firstNameInput).toHaveValue('NewFirst');
        });

        it('updates form data when last name input changes', async () => {
            const user = setupUser();
            render(<HeroSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            const lastNameInput = screen.getByLabelText(/last name/i);
            await user.clear(lastNameInput);
            await user.type(lastNameInput, 'NewLast');

            expect(lastNameInput).toHaveValue('NewLast');
        });

        it('updates form data when position input changes', async () => {
            const user = setupUser();
            render(<HeroSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            const positionInput = screen.getByLabelText(/position/i);
            await user.clear(positionInput);
            await user.type(positionInput, 'Quarterback');

            expect(positionInput).toHaveValue('Quarterback');
        });

        it('updates form data when school input changes', async () => {
            const user = setupUser();
            render(<HeroSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            const schoolInput = screen.getByLabelText(/school/i);
            await user.clear(schoolInput);
            await user.type(schoolInput, 'New High School');

            expect(schoolInput).toHaveValue('New High School');
        });

        it('updates form data when location input changes', async () => {
            const user = setupUser();
            render(<HeroSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            const locationInput = screen.getByLabelText(/location/i);
            await user.clear(locationInput);
            await user.type(locationInput, 'Dallas, TX');

            expect(locationInput).toHaveValue('Dallas, TX');
        });

        it('updates form data when class year input changes', async () => {
            const user = setupUser();
            render(<HeroSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            const classYearInput = screen.getByLabelText(/class year/i);
            await user.clear(classYearInput);
            await user.type(classYearInput, '2026');

            expect(classYearInput).toHaveValue('2026');
        });

        it('updates form data when height input changes', async () => {
            const user = setupUser();
            render(<HeroSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            const heightInput = screen.getByLabelText(/height/i);
            await user.clear(heightInput);
            await user.type(heightInput, '6\'3"');

            expect(heightInput).toHaveValue('6\'3"');
        });

        it('updates form data when weight input changes', async () => {
            const user = setupUser();
            render(<HeroSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            const weightInput = screen.getByLabelText(/weight/i);
            await user.clear(weightInput);
            await user.type(weightInput, '190 lbs');

            expect(weightInput).toHaveValue('190 lbs');
        });
    });

    describe('Parent state updates (Requirements 1.7)', () => {
        it('passes all updated fields to onSave', async () => {
            const user = setupUser();
            const onSave = jest.fn();
            render(<HeroSection {...defaultProps} isEditing={true} onSave={onSave} />);
            advanceTimers();

            // Update multiple fields
            const firstNameInput = screen.getByLabelText(/first name/i);
            const lastNameInput = screen.getByLabelText(/last name/i);
            const positionInput = screen.getByLabelText(/position/i);
            const schoolInput = screen.getByLabelText(/school/i);
            const locationInput = screen.getByLabelText(/location/i);
            const classYearInput = screen.getByLabelText(/class year/i);
            const heightInput = screen.getByLabelText(/height/i);
            const weightInput = screen.getByLabelText(/weight/i);

            await user.clear(firstNameInput);
            await user.type(firstNameInput, 'John');
            await user.clear(lastNameInput);
            await user.type(lastNameInput, 'Doe');
            await user.clear(positionInput);
            await user.type(positionInput, 'Quarterback');
            await user.clear(schoolInput);
            await user.type(schoolInput, 'Central High');
            await user.clear(locationInput);
            await user.type(locationInput, 'Houston, TX');
            await user.clear(classYearInput);
            await user.type(classYearInput, '2026');
            await user.clear(heightInput);
            await user.type(heightInput, '6\'1"');
            await user.clear(weightInput);
            await user.type(weightInput, '200 lbs');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for save to complete
            await waitFor(() => {
                expect(onSave).toHaveBeenCalled();
            });

            // Verify all fields were passed to onSave
            expect(onSave).toHaveBeenCalledWith({
                firstName: 'John',
                lastName: 'Doe',
                position: 'Quarterback',
                school: 'Central High',
                location: 'Houston, TX',
                classYear: '2026',
                height: '6\'1"',
                weight: '200 lbs',
            });
        });

        it('preserves unchanged fields when saving', async () => {
            const user = setupUser();
            const onSave = jest.fn();
            render(<HeroSection {...defaultProps} isEditing={true} onSave={onSave} />);
            advanceTimers();

            // Only update first name
            const firstNameInput = screen.getByLabelText(/first name/i);
            await user.clear(firstNameInput);
            await user.type(firstNameInput, 'UpdatedFirst');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for save to complete
            await waitFor(() => {
                expect(onSave).toHaveBeenCalled();
            });

            // Verify all fields are included, with only firstName changed
            expect(onSave).toHaveBeenCalledWith({
                firstName: 'UpdatedFirst',
                lastName: mockPlayerData.lastName,
                position: mockPlayerData.position,
                school: mockPlayerData.school,
                location: mockPlayerData.location,
                classYear: mockPlayerData.classYear,
                height: mockPlayerData.height,
                weight: mockPlayerData.weight,
            });
        });
    });

    describe('Keyboard navigation (Requirements 1.6)', () => {
        it('cancels editing when Escape key is pressed', async () => {
            const onCancel = jest.fn();
            render(<HeroSection {...defaultProps} isEditing={true} onCancel={onCancel} />);

            // Press Escape key
            fireEvent.keyDown(document, { key: 'Escape' });

            expect(onCancel).toHaveBeenCalledTimes(1);
        });

        it('does not trigger Escape handler when not in edit mode', () => {
            const onCancel = jest.fn();
            render(<HeroSection {...defaultProps} isEditing={false} onCancel={onCancel} />);

            // Press Escape key
            fireEvent.keyDown(document, { key: 'Escape' });

            expect(onCancel).not.toHaveBeenCalled();
        });
    });

    describe('Initial form data', () => {
        it('initializes form with player data', () => {
            render(<HeroSection {...defaultProps} isEditing={true} />);

            expect(screen.getByLabelText(/first name/i)).toHaveValue(mockPlayerData.firstName);
            expect(screen.getByLabelText(/last name/i)).toHaveValue(mockPlayerData.lastName);
            expect(screen.getByLabelText(/position/i)).toHaveValue(mockPlayerData.position);
            expect(screen.getByLabelText(/school/i)).toHaveValue(mockPlayerData.school);
            expect(screen.getByLabelText(/location/i)).toHaveValue(mockPlayerData.location);
            expect(screen.getByLabelText(/class year/i)).toHaveValue(mockPlayerData.classYear);
            expect(screen.getByLabelText(/height/i)).toHaveValue(mockPlayerData.height);
            expect(screen.getByLabelText(/weight/i)).toHaveValue(mockPlayerData.weight);
        });
    });

    describe('View mode display', () => {
        it('displays player information in view mode', () => {
            render(<HeroSection {...defaultProps} isEditing={false} />);

            // Check that player name is displayed
            expect(screen.getByText(mockPlayerData.firstName)).toBeInTheDocument();
            expect(screen.getByText(mockPlayerData.lastName)).toBeInTheDocument();

            // Check that position and school are displayed
            expect(screen.getByText(mockPlayerData.position)).toBeInTheDocument();
            expect(screen.getByText(mockPlayerData.school)).toBeInTheDocument();

            // Check that location and class year are displayed
            expect(screen.getByText(new RegExp(mockPlayerData.location, 'i'))).toBeInTheDocument();
            expect(screen.getByText(new RegExp(mockPlayerData.classYear, 'i'))).toBeInTheDocument();
        });
    });
});
