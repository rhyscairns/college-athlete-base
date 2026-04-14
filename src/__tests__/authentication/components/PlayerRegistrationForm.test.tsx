import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlayerRegistrationForm } from '@/authentication/components/PlayerRegistrationForm';
import { generatePlayerRegistration, generateDateOfBirth } from '@/__tests__/utils/test-data-generators';

// Helper to get password input reliably
const getPasswordInput = () => document.getElementById('password') as HTMLInputElement;

// Helper function to fill valid form
const fillValidForm = () => {
    const testData = generatePlayerRegistration();

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: testData.firstName } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: testData.lastName } });
    fireEvent.change(screen.getByLabelText(/date of birth/i), { target: { value: testData.dateOfBirth } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: testData.email } });
    fireEvent.change(getPasswordInput(), { target: { value: testData.password } });
    fireEvent.change(screen.getByLabelText(/sex/i), { target: { value: testData.sex } });
    fireEvent.change(screen.getByLabelText(/sport/i), { target: { value: testData.sport } });
    fireEvent.change(screen.getByLabelText(/position/i), { target: { value: testData.position } });
    fireEvent.change(screen.getByLabelText(/gpa/i), { target: { value: testData.gpa.toString() } });
    fireEvent.change(screen.getByLabelText(/country/i), { target: { value: testData.country } });

    if (testData.state) {
        fireEvent.change(screen.getByLabelText(/state/i), { target: { value: testData.state } });
    }

    return testData;
};

describe('PlayerRegistrationForm', () => {
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Form Rendering', () => {
        it('renders all required fields including date of birth field', () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            // Name fields
            expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();

            // Date of birth field
            expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();

            // Email and password
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
            expect(getPasswordInput()).toBeInTheDocument();

            // Sport-related fields
            expect(screen.getByLabelText(/sex/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/sport/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/position/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/gpa/i)).toBeInTheDocument();

            // Location fields
            expect(screen.getByLabelText(/country/i)).toBeInTheDocument();

            // Optional fields
            expect(screen.getByLabelText(/scholarship amount needed/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/sat\/act results/i)).toBeInTheDocument();

            // Submit button
            expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
        });

        it('renders cancel button when onCancel prop is provided', () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        });

        it('does not render cancel button when onCancel prop is not provided', () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        it('validates first name is required', async () => {
            const { container } = render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);
            const form = container.querySelector('form') as HTMLFormElement;

            fireEvent.submit(form);

            await waitFor(() => {
                const errors = screen.getAllByText(/this field is required/i);
                expect(errors.length).toBeGreaterThan(0);
            });
        });

        it('validates first name minimum length', async () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);
            const firstNameInput = screen.getByLabelText(/first name/i);

            fireEvent.change(firstNameInput, { target: { value: 'A' } });
            fireEvent.blur(firstNameInput);

            await waitFor(() => {
                expect(screen.getByText(/must be at least 2 characters/i)).toBeInTheDocument();
            });
        });

        it('validates last name is required', async () => {
            const { container } = render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);
            const form = container.querySelector('form') as HTMLFormElement;

            fireEvent.submit(form);

            await waitFor(() => {
                expect(screen.getAllByText(/this field is required/i).length).toBeGreaterThan(0);
            });
        });

        it('validates email format', async () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);
            const emailInput = screen.getByLabelText(/email/i);

            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
            fireEvent.blur(emailInput);

            await waitFor(() => {
                expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
            });
        });

        it('validates password requirements', async () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);
            const passwordInput = getPasswordInput();

            fireEvent.change(passwordInput, { target: { value: 'short' } });
            fireEvent.blur(passwordInput);

            await waitFor(() => {
                expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
            });
        });

        it('validates date of birth is required', async () => {
            const { container } = render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);
            const form = container.querySelector('form') as HTMLFormElement;

            fireEvent.submit(form);

            await waitFor(() => {
                expect(screen.getAllByText(/this field is required/i).length).toBeGreaterThan(0);
            });
        });

        it('validates date of birth minimum age requirement', async () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);
            const dobInput = screen.getByLabelText(/date of birth/i);

            // Set date to 10 years ago (under 13)
            const tooYoung = generateDateOfBirth(10);
            fireEvent.change(dobInput, { target: { value: tooYoung } });
            fireEvent.blur(dobInput);

            await waitFor(() => {
                expect(screen.getByText(/you must be at least 13 years old to register/i)).toBeInTheDocument();
            });
        });

        it('validates GPA is required', async () => {
            const { container } = render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);
            const form = container.querySelector('form') as HTMLFormElement;

            fireEvent.submit(form);

            await waitFor(() => {
                expect(screen.getAllByText(/this field is required/i).length).toBeGreaterThan(0);
            });
        });

        it('validates GPA format', async () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);
            const gpaInput = screen.getByLabelText(/gpa/i);

            fireEvent.change(gpaInput, { target: { value: '5.0' } });
            fireEvent.blur(gpaInput);

            await waitFor(() => {
                expect(screen.getByText(/gpa must be between 0\.0 and 4\.0/i)).toBeInTheDocument();
            });
        });

        it('validates position is required', async () => {
            const { container } = render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);
            const form = container.querySelector('form') as HTMLFormElement;

            fireEvent.submit(form);

            await waitFor(() => {
                expect(screen.getAllByText(/this field is required/i).length).toBeGreaterThan(0);
            });
        });

        it('validates state is required when country is USA', async () => {
            const { container } = render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);
            const countrySelect = screen.getByLabelText(/country/i);

            fireEvent.change(countrySelect, { target: { value: 'USA' } });

            const form = container.querySelector('form') as HTMLFormElement;
            fireEvent.submit(form);

            await waitFor(() => {
                expect(screen.getAllByText(/this field is required/i).length).toBeGreaterThan(0);
            });
        });

        it('validates region is required when country is not USA', async () => {
            const { container } = render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);
            const countrySelect = screen.getByLabelText(/country/i);

            fireEvent.change(countrySelect, { target: { value: 'CAN' } });

            const form = container.querySelector('form') as HTMLFormElement;
            fireEvent.submit(form);

            await waitFor(() => {
                expect(screen.getAllByText(/this field is required/i).length).toBeGreaterThan(0);
            });
        });

        it('validates scholarship amount is positive', async () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);
            const scholarshipInput = screen.getByLabelText(/scholarship amount needed/i);

            fireEvent.change(scholarshipInput, { target: { value: '-1000' } });
            fireEvent.blur(scholarshipInput);

            await waitFor(() => {
                expect(screen.getByText(/must be a positive number/i)).toBeInTheDocument();
            });
        });
    });

    describe('Form Submission', () => {
        it('submits form with valid data', async () => {
            mockOnSubmit.mockResolvedValueOnce(undefined);
            const { container } = render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            const testData = fillValidForm();
            const form = container.querySelector('form') as HTMLFormElement;

            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        firstName: testData.firstName,
                        lastName: testData.lastName,
                        dateOfBirth: testData.dateOfBirth,
                        email: testData.email,
                        password: testData.password,
                        gender: testData.sex,
                        sport: testData.sport,
                        position: testData.position,
                        gpa: testData.gpa,
                        country: testData.country,
                        state: testData.state,
                    })
                );
            });
        });

        it('submits form with optional fields', async () => {
            mockOnSubmit.mockResolvedValueOnce(undefined);
            const { container } = render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            const testData = fillValidForm();
            const scholarshipAmount = '50000';
            const testScores = 'SAT: 1400, ACT: 32';

            fireEvent.change(screen.getByLabelText(/scholarship amount needed/i), { target: { value: scholarshipAmount } });
            fireEvent.change(screen.getByLabelText(/sat\/act results/i), { target: { value: testScores } });

            const form = container.querySelector('form') as HTMLFormElement;
            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        scholarshipAmount: parseFloat(scholarshipAmount),
                        testScores,
                    })
                );
            });
        });

        it('does not submit form with invalid data', async () => {
            const { container } = render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);
            const form = container.querySelector('form') as HTMLFormElement;

            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockOnSubmit).not.toHaveBeenCalled();
            });
        });
    });

    describe('Form Disabling During Submission', () => {
        it('disables all inputs during submission', async () => {
            mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
            const { container } = render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            fillValidForm();
            const form = container.querySelector('form') as HTMLFormElement;

            fireEvent.submit(form);

            await waitFor(() => {
                expect(screen.getByLabelText(/first name/i)).toBeDisabled();
                expect(screen.getByLabelText(/last name/i)).toBeDisabled();
                expect(screen.getByLabelText(/date of birth/i)).toBeDisabled();
                expect(screen.getByLabelText(/email/i)).toBeDisabled();
                expect(getPasswordInput()).toBeDisabled();
                expect(screen.getByLabelText(/sex/i)).toBeDisabled();
                expect(screen.getByLabelText(/sport/i)).toBeDisabled();
                expect(screen.getByLabelText(/position/i)).toBeDisabled();
                expect(screen.getByLabelText(/gpa/i)).toBeDisabled();
                expect(screen.getByLabelText(/country/i)).toBeDisabled();
            });
        });

        it('disables submit button during submission', async () => {
            let resolveSubmit: () => void;
            const submitPromise = new Promise<void>(resolve => {
                resolveSubmit = resolve;
            });
            mockOnSubmit.mockReturnValue(submitPromise);

            const { container } = render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            fillValidForm();
            const form = container.querySelector('form') as HTMLFormElement;

            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalled();
                const submitButton = screen.getByRole('button', { name: /loading/i });
                expect(submitButton).toBeDisabled();
            });

            resolveSubmit!();
        });

        it('disables cancel button during submission', async () => {
            let resolveSubmit: () => void;
            const submitPromise = new Promise<void>(resolve => {
                resolveSubmit = resolve;
            });
            mockOnSubmit.mockReturnValue(submitPromise);

            const { container } = render(<PlayerRegistrationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

            fillValidForm();
            const form = container.querySelector('form') as HTMLFormElement;

            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalled();
            });

            expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();

            resolveSubmit!();
        });

        it('re-enables form after successful submission', async () => {
            mockOnSubmit.mockResolvedValueOnce(undefined);
            const { container } = render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            fillValidForm();
            const form = container.querySelector('form') as HTMLFormElement;

            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(screen.getByLabelText(/first name/i)).not.toBeDisabled();
            });
        });

        it('re-enables form after failed submission', async () => {
            mockOnSubmit.mockRejectedValueOnce(new Error('Submission failed'));
            const { container } = render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            fillValidForm();
            const form = container.querySelector('form') as HTMLFormElement;

            fireEvent.submit(form);

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(screen.getByLabelText(/first name/i)).not.toBeDisabled();
            });
        });
    });

    describe('Cancel Button Functionality', () => {
        it('calls onCancel when cancel button is clicked', () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            expect(mockOnCancel).toHaveBeenCalledTimes(1);
        });

        it('does not call onCancel when cancel button is disabled', async () => {
            mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
            const { container } = render(<PlayerRegistrationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

            fillValidForm();
            const form = container.querySelector('form') as HTMLFormElement;
            fireEvent.submit(form);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
            });

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            expect(mockOnCancel).not.toHaveBeenCalled();
        });
    });

    describe('Conditional Field Rendering', () => {
        it('shows state field when USA is selected', () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);
            const countrySelect = screen.getByLabelText(/country/i);

            fireEvent.change(countrySelect, { target: { value: 'USA' } });

            expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
            expect(screen.queryByLabelText(/region/i)).not.toBeInTheDocument();
        });

        it('shows region field when non-USA country is selected', async () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);
            const countrySelect = screen.getByLabelText(/country/i);

            fireEvent.change(countrySelect, { target: { value: 'CAN' } });

            await waitFor(() => {
                expect(screen.getByLabelText(/region/i)).toBeInTheDocument();
            });
            expect(screen.queryByLabelText(/^state$/i)).not.toBeInTheDocument();
        });

        it('clears state when switching from USA to another country', () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);
            const countrySelect = screen.getByLabelText(/country/i);

            // Select USA and set state
            fireEvent.change(countrySelect, { target: { value: 'USA' } });
            const stateSelect = screen.getByLabelText(/state/i);
            fireEvent.change(stateSelect, { target: { value: 'CA' } });

            // Switch to Canada
            fireEvent.change(countrySelect, { target: { value: 'CAN' } });

            // State field should not exist anymore
            expect(screen.queryByLabelText(/^state$/i)).not.toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('displays general error message on submission failure', async () => {
            mockOnSubmit.mockRejectedValueOnce(new Error('Network error'));
            const { container } = render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            fillValidForm();
            const form = container.querySelector('form') as HTMLFormElement;

            fireEvent.submit(form);

            await waitFor(() => {
                expect(screen.getByText(/an error occurred during registration/i)).toBeInTheDocument();
            });
        });

        it('clears general error on resubmission', async () => {
            mockOnSubmit.mockRejectedValueOnce(new Error('Network error'));
            const { container } = render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            fillValidForm();
            const form = container.querySelector('form') as HTMLFormElement;

            // First submission fails
            fireEvent.submit(form);

            await waitFor(() => {
                expect(screen.getByText(/an error occurred during registration/i)).toBeInTheDocument();
            });

            // Second submission succeeds
            mockOnSubmit.mockResolvedValueOnce(undefined);
            fireEvent.submit(form);

            await waitFor(() => {
                expect(screen.queryByText(/an error occurred during registration/i)).not.toBeInTheDocument();
            });
        });
    });
});
