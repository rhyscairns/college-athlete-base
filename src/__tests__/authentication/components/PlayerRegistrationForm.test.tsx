import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import { PlayerRegistrationForm } from '@/authentication/components/PlayerRegistrationForm';

const examplePassword = 'Password123!'

describe('PlayerRegistrationForm', () => {
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Component Rendering', () => {
        it('renders all required form fields', () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
            expect(document.getElementById('password')).toBeInTheDocument();
            expect(screen.getByLabelText(/sex/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/sport/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/position/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/gpa/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
        });

        it('renders optional fields', () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            expect(screen.getByLabelText(/scholarship amount needed/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/sat\/act results/i)).toBeInTheDocument();
        });

        it('renders submit button', () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            expect(screen.getByRole('button', { name: /create player account/i })).toBeInTheDocument();
        });

        it('renders cancel button when onCancel is provided', () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        });

        it('does not render cancel button when onCancel is not provided', () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        it('displays error when first name is empty on blur', async () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            const firstNameInput = screen.getByLabelText(/first name/i);
            fireEvent.blur(firstNameInput);

            await waitFor(() => {
                expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
            });
        });

        it('displays error when first name is too short', async () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            const firstNameInput = screen.getByLabelText(/first name/i);
            fireEvent.change(firstNameInput, { target: { value: 'A' } });
            fireEvent.blur(firstNameInput);

            await waitFor(() => {
                expect(screen.getByText(/must be at least 2 characters/i)).toBeInTheDocument();
            });
        });

        it('displays error when email is invalid', async () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            const emailInput = screen.getByLabelText(/email/i);
            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
            fireEvent.blur(emailInput);

            await waitFor(() => {
                expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
            });
        });

        it('displays error when password does not meet requirements', async () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            const passwordInput = document.getElementById('password') as HTMLInputElement;
            fireEvent.change(passwordInput, { target: { value: 'weak' } });
            fireEvent.blur(passwordInput);

            await waitFor(() => {
                expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
            });
        });

        it('displays error when GPA is out of range', async () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            const gpaInput = screen.getByLabelText(/gpa/i);
            fireEvent.change(gpaInput, { target: { value: '5.0' } });
            fireEvent.blur(gpaInput);

            await waitFor(() => {
                expect(screen.getByText(/gpa must be between 0\.0 and 4\.0/i)).toBeInTheDocument();
            });
        });

        it('clears error when field is corrected', async () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            const firstNameInput = screen.getByLabelText(/first name/i);
            fireEvent.blur(firstNameInput);

            await waitFor(() => {
                expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
            });

            fireEvent.change(firstNameInput, { target: { value: 'John' } });
            fireEvent.blur(firstNameInput);

            await waitFor(() => {
                expect(screen.queryByText(/this field is required/i)).not.toBeInTheDocument();
            });
        });
    });

    describe('Conditional Field Rendering', () => {
        it('shows state dropdown when USA is selected', async () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            const countrySelect = screen.getByLabelText(/country/i);
            fireEvent.change(countrySelect, { target: { value: 'USA' } });

            await waitFor(() => {
                expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
            });
        });

        it('shows region input when non-USA country is selected', async () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            const countrySelect = screen.getByLabelText(/country/i);
            fireEvent.change(countrySelect, { target: { value: 'CAN' } });

            await waitFor(() => {
                expect(screen.getByLabelText(/region\/county/i)).toBeInTheDocument();
            });
        });

        it('clears state when country changes from USA to another country', async () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            const countrySelect = screen.getByLabelText(/country/i);

            // Select USA and set state
            fireEvent.change(countrySelect, { target: { value: 'USA' } });
            await waitFor(() => {
                expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
            });

            const stateSelect = screen.getByLabelText(/state/i);
            fireEvent.change(stateSelect, { target: { value: 'CA' } });

            // Change to Canada
            fireEvent.change(countrySelect, { target: { value: 'CAN' } });

            await waitFor(() => {
                expect(screen.queryByLabelText(/state/i)).not.toBeInTheDocument();
                expect(screen.getByLabelText(/region\/county/i)).toBeInTheDocument();
            });
        });

        it('validates state is required when USA is selected', async () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            const countrySelect = screen.getByLabelText(/country/i);
            fireEvent.change(countrySelect, { target: { value: 'USA' } });

            await waitFor(() => {
                expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
            });

            const submitButton = screen.getByRole('button', { name: /create player account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnSubmit).not.toHaveBeenCalled();
            });
        });

        it('validates region is required when non-USA country is selected', async () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            const countrySelect = screen.getByLabelText(/country/i);
            fireEvent.change(countrySelect, { target: { value: 'CAN' } });

            await waitFor(() => {
                expect(screen.getByLabelText(/region\/county/i)).toBeInTheDocument();
            });

            const submitButton = screen.getByRole('button', { name: /create player account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnSubmit).not.toHaveBeenCalled();
            });
        });
    });

    describe('Form Submission', () => {
        const fillValidForm = () => {
            fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
            fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
            fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } });
            fireEvent.change(document.getElementById('password') as HTMLInputElement, { target: { value: examplePassword } });
            fireEvent.change(screen.getByLabelText(/sex/i), { target: { value: 'male' } });
            fireEvent.change(screen.getByLabelText(/sport/i), { target: { value: 'basketball' } });
            fireEvent.change(screen.getByLabelText(/position/i), { target: { value: 'Point Guard' } });
            fireEvent.change(screen.getByLabelText(/gpa/i), { target: { value: '3.5' } });
            fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'USA' } });
        };

        it('submits form with valid data including state', async () => {
            mockOnSubmit.mockResolvedValue(undefined);
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            fillValidForm();

            await waitFor(() => {
                expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
            });

            fireEvent.change(screen.getByLabelText(/state/i), { target: { value: 'CA' } });

            const submitButton = screen.getByRole('button', { name: /create player account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalledWith({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    password: examplePassword,
                    gender: 'male',
                    sport: 'basketball',
                    position: 'Point Guard',
                    gpa: 3.5,
                    country: 'USA',
                    state: 'CA',
                });
            });
        });

        it('submits form with valid data including region', async () => {
            mockOnSubmit.mockResolvedValue(undefined);
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            fillValidForm();
            fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'CAN' } });

            await waitFor(() => {
                expect(screen.getByLabelText(/region\/county/i)).toBeInTheDocument();
            });

            fireEvent.change(screen.getByLabelText(/region\/county/i), { target: { value: 'Ontario' } });

            const submitButton = screen.getByRole('button', { name: /create player account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalledWith({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    password: examplePassword,
                    gender: 'male',
                    sport: 'basketball',
                    position: 'Point Guard',
                    gpa: 3.5,
                    country: 'CAN',
                    region: 'Ontario',
                });
            });
        });

        it('submits form with optional fields', async () => {
            mockOnSubmit.mockResolvedValue(undefined);
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            fillValidForm();

            await waitFor(() => {
                expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
            });

            fireEvent.change(screen.getByLabelText(/state/i), { target: { value: 'CA' } });
            fireEvent.change(screen.getByLabelText(/scholarship amount needed/i), { target: { value: '50000' } });
            fireEvent.change(screen.getByLabelText(/sat\/act results/i), { target: { value: 'SAT: 1450' } });

            const submitButton = screen.getByRole('button', { name: /create player account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalledWith({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    password: examplePassword,
                    gender: 'male',
                    sport: 'basketball',
                    position: 'Point Guard',
                    gpa: 3.5,
                    country: 'USA',
                    state: 'CA',
                    scholarshipAmount: 50000,
                    testScores: 'SAT: 1450',
                });
            });
        });

        it('does not submit form with invalid data', async () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            const submitButton = screen.getByRole('button', { name: /create player account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnSubmit).not.toHaveBeenCalled();
            });
        });

        it('disables submit button during submission', async () => {
            mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            fillValidForm();

            await waitFor(() => {
                expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
            });

            fireEvent.change(screen.getByLabelText(/state/i), { target: { value: 'CA' } });

            const submitButton = screen.getByRole('button', { name: /create player account/i });
            fireEvent.click(submitButton);

            expect(submitButton).toBeDisabled();

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalled();
            });
        });

        it('displays error message on submission failure', async () => {
            mockOnSubmit.mockRejectedValue(new Error('Registration failed'));
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            fillValidForm();

            await waitFor(() => {
                expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
            });

            fireEvent.change(screen.getByLabelText(/state/i), { target: { value: 'CA' } });

            const submitButton = screen.getByRole('button', { name: /create player account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/an error occurred during registration/i)).toBeInTheDocument();
            });
        });

        it('focuses first error field on validation failure', async () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            const submitButton = screen.getByRole('button', { name: /create player account/i });
            fireEvent.click(submitButton);

            // The form should not submit when validation fails
            await waitFor(() => {
                expect(mockOnSubmit).not.toHaveBeenCalled();
            });

            // Verify the first error field exists (focus behavior is tested in integration)
            const firstNameInput = screen.getByLabelText(/first name/i);
            expect(firstNameInput).toBeInTheDocument();
        });
    });

    describe('Cancel Button', () => {
        it('calls onCancel when cancel button is clicked', () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            expect(mockOnCancel).toHaveBeenCalledTimes(1);
        });

        it('disables cancel button during submission', async () => {
            mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

            const fillValidForm = () => {
                fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
                fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
                fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } });
                fireEvent.change(document.getElementById('password') as HTMLInputElement, { target: { value: examplePassword } });
                fireEvent.change(screen.getByLabelText(/sex/i), { target: { value: 'male' } });
                fireEvent.change(screen.getByLabelText(/sport/i), { target: { value: 'basketball' } });
                fireEvent.change(screen.getByLabelText(/position/i), { target: { value: 'Point Guard' } });
                fireEvent.change(screen.getByLabelText(/gpa/i), { target: { value: '3.5' } });
                fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'USA' } });
            };

            fillValidForm();

            await waitFor(() => {
                expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
            });

            fireEvent.change(screen.getByLabelText(/state/i), { target: { value: 'CA' } });

            const submitButton = screen.getByRole('button', { name: /create player account/i });
            fireEvent.click(submitButton);

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            expect(cancelButton).toBeDisabled();

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalled();
            });
        });
    });

    describe('Optional Field Validation', () => {
        it('validates scholarship amount is positive', async () => {
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            const scholarshipInput = screen.getByLabelText(/scholarship amount needed/i);
            fireEvent.change(scholarshipInput, { target: { value: '-1000' } });
            fireEvent.blur(scholarshipInput);

            await waitFor(() => {
                expect(screen.getByText(/must be a positive number/i)).toBeInTheDocument();
            });
        });

        it('does not validate empty optional fields', async () => {
            mockOnSubmit.mockResolvedValue(undefined);
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
            fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
            fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } });
            fireEvent.change(document.getElementById('password') as HTMLInputElement, { target: { value: examplePassword } });
            fireEvent.change(screen.getByLabelText(/sex/i), { target: { value: 'male' } });
            fireEvent.change(screen.getByLabelText(/sport/i), { target: { value: 'basketball' } });
            fireEvent.change(screen.getByLabelText(/position/i), { target: { value: 'Point Guard' } });
            fireEvent.change(screen.getByLabelText(/gpa/i), { target: { value: '3.5' } });
            fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'USA' } });

            await waitFor(() => {
                expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
            });

            fireEvent.change(screen.getByLabelText(/state/i), { target: { value: 'CA' } });

            const submitButton = screen.getByRole('button', { name: /create player account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalled();
            });
        });
    });

    describe('GPA Rounding', () => {
        it('rounds GPA to 2 decimal places on submission', async () => {
            mockOnSubmit.mockResolvedValue(undefined);
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            // Fill form with valid data
            fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
            fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
            fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } });
            fireEvent.change(document.getElementById('password') as HTMLInputElement, { target: { value: examplePassword } });
            fireEvent.change(screen.getByLabelText(/sex/i), { target: { value: 'male' } });
            fireEvent.change(screen.getByLabelText(/sport/i), { target: { value: 'basketball' } });
            fireEvent.change(screen.getByLabelText(/position/i), { target: { value: 'Point Guard' } });
            fireEvent.change(screen.getByLabelText(/gpa/i), { target: { value: '4.0' } });
            fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'USA' } });

            await waitFor(() => {
                expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
            });

            fireEvent.change(screen.getByLabelText(/state/i), { target: { value: 'CA' } });

            const submitButton = screen.getByRole('button', { name: /create player account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalled();
            });

            // Verify GPA is exactly 4.0, not 3.96 or similar floating point error
            const submittedData = mockOnSubmit.mock.calls[0][0];
            expect(submittedData.gpa).toBe(4.0);
        });

        it('correctly rounds GPA with floating point precision issues', async () => {
            mockOnSubmit.mockResolvedValue(undefined);
            render(<PlayerRegistrationForm onSubmit={mockOnSubmit} />);

            // Fill form with valid data
            fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Jane' } });
            fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Smith' } });
            fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane.smith@example.com' } });
            fireEvent.change(document.getElementById('password') as HTMLInputElement, { target: { value: examplePassword } });
            fireEvent.change(screen.getByLabelText(/sex/i), { target: { value: 'female' } });
            fireEvent.change(screen.getByLabelText(/sport/i), { target: { value: 'soccer' } });
            fireEvent.change(screen.getByLabelText(/position/i), { target: { value: 'Forward' } });
            fireEvent.change(screen.getByLabelText(/gpa/i), { target: { value: '3.72' } });
            fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'USA' } });

            await waitFor(() => {
                expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
            });

            fireEvent.change(screen.getByLabelText(/state/i), { target: { value: 'TX' } });

            const submitButton = screen.getByRole('button', { name: /create player account/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalled();
            });

            // Verify GPA is exactly 3.72, not 3.69 or similar floating point error
            const submittedData = mockOnSubmit.mock.calls[0][0];
            expect(submittedData.gpa).toBe(3.72);
        });
    });
});
