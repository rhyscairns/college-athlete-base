import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AcademicProfileSection } from '../AcademicProfileSection';
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

describe('AcademicProfileSection - Inline Editing', () => {
    const defaultProps = {
        academic: mockPlayerData.academic,
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
            render(<AcademicProfileSection {...defaultProps} />);

            const editButton = screen.getByRole('button', { name: /edit/i });
            expect(editButton).toBeInTheDocument();
        });

        it('hides edit button when user is not the owner', () => {
            render(<AcademicProfileSection {...defaultProps} isOwner={false} />);

            const editButton = screen.queryByRole('button', { name: /edit/i });
            expect(editButton).not.toBeInTheDocument();
        });

        it('hides edit button when section is in edit mode', () => {
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);

            const editButton = screen.queryByRole('button', { name: /edit/i });
            expect(editButton).not.toBeInTheDocument();
        });

        it('disables edit button when another section is being edited', () => {
            render(<AcademicProfileSection {...defaultProps} isAnyOtherSectionEditing={true} />);

            const editButton = screen.getByRole('button', { name: /edit/i });
            expect(editButton).toBeDisabled();
        });
    });

    describe('Entering edit mode (Requirements 1.3, 1.4)', () => {
        it('calls onEdit when edit button is clicked', () => {
            const onEdit = jest.fn();
            render(<AcademicProfileSection {...defaultProps} onEdit={onEdit} />);

            const editButton = screen.getByRole('button', { name: /edit/i });
            fireEvent.click(editButton);

            expect(onEdit).toHaveBeenCalledTimes(1);
        });

        it('displays edit form when isEditing is true', () => {
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);

            // Check for form inputs by their role and name
            expect(screen.getByRole('spinbutton', { name: /gpa/i })).toBeInTheDocument();
            expect(screen.getByLabelText(/gpa scale/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/sat total/i)).toBeInTheDocument();
        });

        it('displays Save and Cancel buttons in edit mode', () => {
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);

            expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        });

        it('hides view mode content when in edit mode', () => {
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);

            // The GPA display card should not be visible in edit mode
            const gpaDisplay = screen.queryByText(mockPlayerData.academic.gpa.toString());
            // In edit mode, GPA is in an input field, not displayed as text
            expect(gpaDisplay).not.toBeInTheDocument();
        });
    });

    describe('Exiting edit mode - Cancel (Requirements 1.6)', () => {
        it('calls onCancel when cancel button is clicked', () => {
            const onCancel = jest.fn();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} onCancel={onCancel} />);

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            expect(onCancel).toHaveBeenCalledTimes(1);
        });

        it('resets form data when cancel is clicked after changes', async () => {
            const user = setupUser();
            const { rerender } = render(<AcademicProfileSection {...defaultProps} isEditing={true} />);

            advanceTimers();

            // Change GPA (use name attribute since label has asterisk)
            const gpaInput = screen.getByRole('spinbutton', { name: /gpa/i });
            await user.clear(gpaInput);
            await user.type(gpaInput, '3.0');

            expect(gpaInput).toHaveValue(3.0);

            // Click cancel
            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            // Simulate parent component setting isEditing back to false
            rerender(<AcademicProfileSection {...defaultProps} isEditing={false} />);

            // Re-enter edit mode to check if data was reset
            rerender(<AcademicProfileSection {...defaultProps} isEditing={true} />);

            advanceTimers();

            // Form should show original data
            const resetGpaInput = screen.getByRole('spinbutton', { name: /gpa/i });
            expect(resetGpaInput).toHaveValue(mockPlayerData.academic.gpa);
        });
    });

    describe('Exiting edit mode - Save (Requirements 1.5)', () => {
        it('calls onSave with updated data when save button is clicked with valid data', async () => {
            const user = setupUser();
            const onSave = jest.fn();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} onSave={onSave} />);

            advanceTimers();

            // Change GPA
            const gpaInput = screen.getByRole('spinbutton', { name: /gpa/i });
            await user.clear(gpaInput);
            await user.type(gpaInput, '3.8');

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
                    academic: expect.objectContaining({
                        gpa: 3.8,
                    }),
                })
            );
        });

        it('shows loading state on save button during save', async () => {
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);

            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);

            // During save, button should show loading state
            await waitFor(() => {
                expect(saveButton).toHaveTextContent(/saving/i);
            });
        });

        it('disables inputs during save', async () => {
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);

            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);

            // Check that inputs are disabled during save
            const gpaInput = screen.getByRole('spinbutton', { name: /gpa/i });
            await waitFor(() => {
                expect(gpaInput).toBeDisabled();
            });
        });
    });

    describe('Validation for GPA range (Requirements 4.1, 4.2, 4.3)', () => {
        it('displays error when GPA is below 0.0 and save is clicked', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Set GPA below minimum by directly changing the input value
            // (HTML5 number inputs with min attribute prevent typing negative values)
            const gpaInput = screen.getByRole('spinbutton', { name: /gpa/i }) as HTMLInputElement;

            // Directly set the value to bypass HTML5 validation
            fireEvent.change(gpaInput, { target: { value: '-1' } });

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for validation error
            await waitFor(() => {
                expect(screen.getByText(/gpa must be between 0\.0 and 4\.0/i)).toBeInTheDocument();
            });
        });

        it('displays error when GPA is above 4.0 and save is clicked', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Set GPA above maximum
            const gpaInput = screen.getByRole('spinbutton', { name: /gpa/i });
            await user.clear(gpaInput);
            await user.type(gpaInput, '4.5');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for validation error
            await waitFor(() => {
                expect(screen.getByText(/gpa must be between 0\.0 and 4\.0/i)).toBeInTheDocument();
            });
        });

        it('accepts valid GPA of 0.0', async () => {
            const user = setupUser();
            const onSave = jest.fn();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} onSave={onSave} />);
            advanceTimers();

            // Set GPA to minimum valid value
            const gpaInput = screen.getByRole('spinbutton', { name: /gpa/i });
            await user.clear(gpaInput);
            await user.type(gpaInput, '0.0');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Should save successfully
            await waitFor(() => {
                expect(onSave).toHaveBeenCalled();
            });
        });

        it('accepts valid GPA of 4.0', async () => {
            const user = setupUser();
            const onSave = jest.fn();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} onSave={onSave} />);
            advanceTimers();

            // Set GPA to maximum valid value
            const gpaInput = screen.getByRole('spinbutton', { name: /gpa/i });
            await user.clear(gpaInput);
            await user.type(gpaInput, '4.0');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Should save successfully
            await waitFor(() => {
                expect(onSave).toHaveBeenCalled();
            });
        });

        it('does not call onSave when GPA validation fails', async () => {
            const user = setupUser();
            const onSave = jest.fn();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} onSave={onSave} />);
            advanceTimers();

            // Set invalid GPA
            const gpaInput = screen.getByRole('spinbutton', { name: /gpa/i });
            await user.clear(gpaInput);
            await user.type(gpaInput, '5.0');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for error to appear
            await waitFor(() => {
                expect(screen.getByText(/gpa must be between 0\.0 and 4\.0/i)).toBeInTheDocument();
            });

            expect(onSave).not.toHaveBeenCalled();
        });
    });

    describe('Validation for test scores (Requirements 4.1, 4.2, 4.3)', () => {
        it('displays error when SAT score is below 400', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Set SAT score below minimum
            const satInput = screen.getByLabelText(/sat total/i);
            await user.clear(satInput);
            await user.type(satInput, '300');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for validation error
            await waitFor(() => {
                expect(screen.getByText(/sat score must be between 400 and 1600/i)).toBeInTheDocument();
            });
        });

        it('displays error when SAT score is above 1600', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Set SAT score above maximum
            const satInput = screen.getByLabelText(/sat total/i);
            await user.clear(satInput);
            await user.type(satInput, '1700');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for validation error
            await waitFor(() => {
                expect(screen.getByText(/sat score must be between 400 and 1600/i)).toBeInTheDocument();
            });
        });

        it('accepts valid SAT score of 400', async () => {
            const user = setupUser();
            const onSave = jest.fn();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} onSave={onSave} />);
            advanceTimers();

            // Set SAT to minimum valid value
            const satInput = screen.getByLabelText(/sat total/i);
            await user.clear(satInput);
            await user.type(satInput, '400');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Should save successfully
            await waitFor(() => {
                expect(onSave).toHaveBeenCalled();
            });
        });

        it('accepts valid SAT score of 1600', async () => {
            const user = setupUser();
            const onSave = jest.fn();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} onSave={onSave} />);
            advanceTimers();

            // Set SAT to maximum valid value
            const satInput = screen.getByLabelText(/sat total/i);
            await user.clear(satInput);
            await user.type(satInput, '1600');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Should save successfully
            await waitFor(() => {
                expect(onSave).toHaveBeenCalled();
            });
        });

        it('displays error when SAT Math score is below 200', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Set SAT Math below minimum
            const satMathInput = screen.getByLabelText(/sat math/i);
            await user.clear(satMathInput);
            await user.type(satMathInput, '150');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for validation error
            await waitFor(() => {
                expect(screen.getByText(/sat math score must be between 200 and 800/i)).toBeInTheDocument();
            });
        });

        it('displays error when SAT Math score is above 800', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Set SAT Math above maximum
            const satMathInput = screen.getByLabelText(/sat math/i);
            await user.clear(satMathInput);
            await user.type(satMathInput, '850');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for validation error
            await waitFor(() => {
                expect(screen.getByText(/sat math score must be between 200 and 800/i)).toBeInTheDocument();
            });
        });

        it('displays error when SAT Reading score is below 200', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Set SAT Reading below minimum
            const satReadingInput = screen.getByLabelText(/sat reading/i);
            await user.clear(satReadingInput);
            await user.type(satReadingInput, '150');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for validation error
            await waitFor(() => {
                expect(screen.getByText(/sat reading score must be between 200 and 800/i)).toBeInTheDocument();
            });
        });

        it('displays error when SAT Reading score is above 800', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Set SAT Reading above maximum
            const satReadingInput = screen.getByLabelText(/sat reading/i);
            await user.clear(satReadingInput);
            await user.type(satReadingInput, '850');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for validation error
            await waitFor(() => {
                expect(screen.getByText(/sat reading score must be between 200 and 800/i)).toBeInTheDocument();
            });
        });

        it('displays error when ACT score is below 1', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Set ACT score below minimum
            const actInput = screen.getByLabelText(/act score/i);
            await user.clear(actInput);
            await user.type(actInput, '0');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for validation error
            await waitFor(() => {
                expect(screen.getByText(/act score must be between 1 and 36/i)).toBeInTheDocument();
            });
        });

        it('displays error when ACT score is above 36', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Set ACT score above maximum
            const actInput = screen.getByLabelText(/act score/i);
            await user.clear(actInput);
            await user.type(actInput, '37');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for validation error
            await waitFor(() => {
                expect(screen.getByText(/act score must be between 1 and 36/i)).toBeInTheDocument();
            });
        });

        it('accepts valid ACT score of 1', async () => {
            const user = setupUser();
            const onSave = jest.fn();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} onSave={onSave} />);
            advanceTimers();

            // Set ACT to minimum valid value
            const actInput = screen.getByLabelText(/act score/i);
            await user.clear(actInput);
            await user.type(actInput, '1');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Should save successfully
            await waitFor(() => {
                expect(onSave).toHaveBeenCalled();
            });
        });

        it('accepts valid ACT score of 36', async () => {
            const user = setupUser();
            const onSave = jest.fn();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} onSave={onSave} />);
            advanceTimers();

            // Set ACT to maximum valid value
            const actInput = screen.getByLabelText(/act score/i);
            await user.clear(actInput);
            await user.type(actInput, '36');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Should save successfully
            await waitFor(() => {
                expect(onSave).toHaveBeenCalled();
            });
        });

        it('displays multiple validation errors when multiple test scores are invalid', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Set multiple invalid test scores
            const satInput = screen.getByLabelText(/sat total/i);
            const actInput = screen.getByLabelText(/act score/i);

            await user.clear(satInput);
            await user.type(satInput, '2000');
            await user.clear(actInput);
            await user.type(actInput, '40');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for all validation errors
            await waitFor(() => {
                expect(screen.getByText(/sat score must be between 400 and 1600/i)).toBeInTheDocument();
                expect(screen.getByText(/act score must be between 1 and 36/i)).toBeInTheDocument();
            });
        });
    });

    describe('Coursework add/remove functionality (Requirements 10.5)', () => {
        it('displays existing coursework in edit mode', () => {
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);

            // Check that existing coursework is displayed
            mockPlayerData.academic.coursework.forEach((course) => {
                const input = screen.getByDisplayValue(course);
                expect(input).toBeInTheDocument();
            });
        });

        it('adds a new coursework item when Add Course button is clicked', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Get initial number of coursework inputs by placeholder
            const initialInputs = screen.getAllByPlaceholderText(/ap calculus/i);
            const initialCount = initialInputs.length;

            // Click Add Course button
            const addButton = screen.getByRole('button', { name: /\+ add course/i });
            await user.click(addButton);

            // Check that a new input was added
            const updatedInputs = screen.getAllByPlaceholderText(/ap calculus/i);
            expect(updatedInputs.length).toBe(initialCount + 1);
        });

        it('removes a coursework item when Remove button is clicked', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Get initial number of coursework inputs
            const initialInputs = screen.getAllByPlaceholderText(/ap calculus/i);
            const initialCount = initialInputs.length;

            // Click the first Remove button
            const removeButtons = screen.getAllByRole('button', { name: /remove/i });
            await user.click(removeButtons[0]);

            // Check that an input was removed
            const updatedInputs = screen.getAllByPlaceholderText(/ap calculus/i);
            expect(updatedInputs.length).toBe(initialCount - 1);
        });

        it('updates coursework value when input changes', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            // Get the first coursework input
            const courseworkInputs = screen.getAllByPlaceholderText(/ap calculus/i);
            const firstInput = courseworkInputs[0];

            // Change the value
            await user.clear(firstInput);
            await user.type(firstInput, 'New Advanced Course');

            expect(firstInput).toHaveValue('New Advanced Course');
        });

        it('saves updated coursework when save is clicked', async () => {
            const user = setupUser();
            const onSave = jest.fn();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} onSave={onSave} />);
            advanceTimers();

            // Add a new course
            const addButton = screen.getByRole('button', { name: /\+ add course/i });
            await user.click(addButton);

            // Get all coursework inputs
            const courseworkInputs = screen.getAllByPlaceholderText(/ap calculus/i);
            const newInput = courseworkInputs[courseworkInputs.length - 1];

            // Type in the new course
            await user.type(newInput, 'AP Computer Science');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for save to complete
            await waitFor(() => {
                expect(onSave).toHaveBeenCalled();
            });

            // Check that the new coursework was included
            const savedData = onSave.mock.calls[0][0];
            expect(savedData.academic.coursework).toContain('AP Computer Science');
        });

        it('saves coursework with removed items', async () => {
            const user = setupUser();
            const onSave = jest.fn();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} onSave={onSave} />);
            advanceTimers();

            // Get the first course value
            const courseworkInputs = screen.getAllByPlaceholderText(/ap calculus/i);
            const firstCourseValue = (courseworkInputs[0] as HTMLInputElement).value;

            // Remove the first course
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

            // Check that the removed coursework is not included
            const savedData = onSave.mock.calls[0][0];
            expect(savedData.academic.coursework).not.toContain(firstCourseValue);
        });

        it('allows adding multiple courses in sequence', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            const addButton = screen.getByRole('button', { name: /\+ add course/i });

            // Add first course
            await user.click(addButton);
            const inputs1 = screen.getAllByPlaceholderText(/ap calculus/i);
            const count1 = inputs1.length;

            // Add second course
            await user.click(addButton);
            const inputs2 = screen.getAllByPlaceholderText(/ap calculus/i);
            const count2 = inputs2.length;

            // Add third course
            await user.click(addButton);
            const inputs3 = screen.getAllByPlaceholderText(/ap calculus/i);
            const count3 = inputs3.length;

            expect(count2).toBe(count1 + 1);
            expect(count3).toBe(count2 + 1);
        });
    });

    describe('Form data updates correctly (Requirements 1.3, 1.4)', () => {
        it('updates GPA when input changes', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            const gpaInput = screen.getByRole('spinbutton', { name: /gpa/i });
            await user.clear(gpaInput);
            await user.type(gpaInput, '3.9');

            expect(gpaInput).toHaveValue(3.9);
        });

        it('updates GPA Scale when input changes', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            const gpaScaleInput = screen.getByLabelText(/gpa scale/i);
            await user.clear(gpaScaleInput);
            await user.type(gpaScaleInput, '5.0 Scale');

            expect(gpaScaleInput).toHaveValue('5.0 Scale');
        });

        it('updates SAT Total when input changes', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            const satInput = screen.getByLabelText(/sat total/i);
            await user.clear(satInput);
            await user.type(satInput, '1450');

            expect(satInput).toHaveValue(1450);
        });

        it('updates SAT Math when input changes', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            const satMathInput = screen.getByLabelText(/sat math/i);
            await user.clear(satMathInput);
            await user.type(satMathInput, '750');

            expect(satMathInput).toHaveValue(750);
        });

        it('updates SAT Reading when input changes', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            const satReadingInput = screen.getByLabelText(/sat reading/i);
            await user.clear(satReadingInput);
            await user.type(satReadingInput, '700');

            expect(satReadingInput).toHaveValue(700);
        });

        it('updates ACT Score when input changes', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            const actInput = screen.getByLabelText(/act score/i);
            await user.clear(actInput);
            await user.type(actInput, '32');

            expect(actInput).toHaveValue(32);
        });

        it('updates Class Rank when input changes', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            const classRankInput = screen.getByLabelText(/^class rank$/i);
            await user.clear(classRankInput);
            await user.type(classRankInput, '5 of 500');

            expect(classRankInput).toHaveValue('5 of 500');
        });

        it('updates Class Rank Detail when input changes', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            const classRankDetailInput = screen.getByLabelText(/class rank detail/i);
            await user.clear(classRankDetailInput);
            await user.type(classRankDetailInput, 'Top 1% of graduating class');

            expect(classRankDetailInput).toHaveValue('Top 1% of graduating class');
        });

        it('updates NCAA Eligibility Center ID when input changes', async () => {
            const user = setupUser();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);
            advanceTimers();

            const ncaaInput = screen.getByLabelText(/ncaa eligibility center id/i);
            await user.clear(ncaaInput);
            await user.type(ncaaInput, '1234567890');

            expect(ncaaInput).toHaveValue('1234567890');
        });

        it('passes all updated fields to onSave', async () => {
            const user = setupUser();
            const onSave = jest.fn();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} onSave={onSave} />);
            advanceTimers();

            // Update multiple fields
            const gpaInput = screen.getByRole('spinbutton', { name: /gpa/i });
            const satInput = screen.getByLabelText(/sat total/i);
            const actInput = screen.getByLabelText(/act score/i);

            await user.clear(gpaInput);
            await user.type(gpaInput, '3.95');
            await user.clear(satInput);
            await user.type(satInput, '1500');
            await user.clear(actInput);
            await user.type(actInput, '34');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for save to complete
            await waitFor(() => {
                expect(onSave).toHaveBeenCalled();
            });

            // Verify all fields were passed to onSave
            expect(onSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    academic: expect.objectContaining({
                        gpa: 3.95,
                        satScore: 1500,
                        actScore: 34,
                    }),
                })
            );
        });

        it('preserves unchanged fields when saving', async () => {
            const user = setupUser();
            const onSave = jest.fn();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} onSave={onSave} />);
            advanceTimers();

            // Only update GPA
            const gpaInput = screen.getByRole('spinbutton', { name: /gpa/i });
            await user.clear(gpaInput);
            await user.type(gpaInput, '3.7');

            // Click save
            const saveButton = screen.getByRole('button', { name: /save/i });
            fireEvent.click(saveButton);
            advanceTimers();

            // Wait for save to complete
            await waitFor(() => {
                expect(onSave).toHaveBeenCalled();
            });

            // Verify all fields are included, with only GPA changed
            expect(onSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    academic: expect.objectContaining({
                        gpa: 3.7,
                        gpaScale: mockPlayerData.academic.gpaScale,
                        satScore: mockPlayerData.academic.satScore,
                        actScore: mockPlayerData.academic.actScore,
                        classRank: mockPlayerData.academic.classRank,
                    }),
                })
            );
        });
    });

    describe('Keyboard navigation', () => {
        it('cancels editing when Escape key is pressed', async () => {
            const onCancel = jest.fn();
            render(<AcademicProfileSection {...defaultProps} isEditing={true} onCancel={onCancel} />);

            // Press Escape key
            fireEvent.keyDown(document, { key: 'Escape' });

            expect(onCancel).toHaveBeenCalledTimes(1);
        });

        it('does not trigger Escape handler when not in edit mode', () => {
            const onCancel = jest.fn();
            render(<AcademicProfileSection {...defaultProps} isEditing={false} onCancel={onCancel} />);

            // Press Escape key
            fireEvent.keyDown(document, { key: 'Escape' });

            expect(onCancel).not.toHaveBeenCalled();
        });
    });

    describe('Initial form data', () => {
        it('initializes form with academic data', () => {
            render(<AcademicProfileSection {...defaultProps} isEditing={true} />);

            expect(screen.getByRole('spinbutton', { name: /gpa/i })).toHaveValue(mockPlayerData.academic.gpa);
            expect(screen.getByLabelText(/gpa scale/i)).toHaveValue(mockPlayerData.academic.gpaScale);
            expect(screen.getByLabelText(/sat total/i)).toHaveValue(mockPlayerData.academic.satScore);
            expect(screen.getByLabelText(/sat math/i)).toHaveValue(mockPlayerData.academic.satMath);
            expect(screen.getByLabelText(/sat reading/i)).toHaveValue(mockPlayerData.academic.satReading);
            // ACT score is optional and may be undefined
            const actInput = screen.getByLabelText(/act score/i);
            if (mockPlayerData.academic.actScore !== undefined) {
                expect(actInput).toHaveValue(mockPlayerData.academic.actScore);
            } else {
                expect(actInput).toHaveValue(null);
            }
            expect(screen.getByLabelText(/^class rank$/i)).toHaveValue(mockPlayerData.academic.classRank);
            expect(screen.getByLabelText(/class rank detail/i)).toHaveValue(mockPlayerData.academic.classRankDetail);
            expect(screen.getByLabelText(/ncaa eligibility center id/i)).toHaveValue(mockPlayerData.academic.ncaaEligibilityCenter);
        });
    });

    describe('View mode display', () => {
        it('displays academic information in view mode', () => {
            render(<AcademicProfileSection {...defaultProps} isEditing={false} />);

            // Check that GPA is displayed
            expect(screen.getByText(mockPlayerData.academic.gpa.toString())).toBeInTheDocument();
            expect(screen.getByText(mockPlayerData.academic.gpaScale)).toBeInTheDocument();

            // Check that test scores are displayed
            expect(screen.getByText(new RegExp(mockPlayerData.academic.satScore!.toString()))).toBeInTheDocument();

            // Check that class rank is displayed
            expect(screen.getByText(mockPlayerData.academic.classRank)).toBeInTheDocument();

            // Check that NCAA eligibility is displayed
            expect(screen.getByText(mockPlayerData.academic.ncaaEligibilityCenter)).toBeInTheDocument();

            // Check that coursework is displayed
            mockPlayerData.academic.coursework.forEach((course) => {
                expect(screen.getByText(course)).toBeInTheDocument();
            });
        });
    });
});
