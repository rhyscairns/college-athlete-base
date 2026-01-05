import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CoachRegistrationForm } from '@/authentication/components/CoachRegistrationForm';

const exampleEmail = 'john.doe@university.edu'
const examplePassword = 'Password123!'

describe('CoachRegistrationForm', () => {
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all required fields', () => {
        render(<CoachRegistrationForm onSubmit={mockOnSubmit} />);

        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(document.getElementById('password')).toBeInTheDocument();
        expect(screen.getByLabelText(/coaching category/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/primary sport/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/secondary sport/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/university/i)).toBeInTheDocument();
    });

    it('displays coaching category options', () => {
        render(<CoachRegistrationForm onSubmit={mockOnSubmit} />);

        const coachingCategorySelect = screen.getByLabelText(/coaching category/i);
        fireEvent.click(coachingCategorySelect);

        // Check that the options are in the select element
        const options = screen.getAllByRole('option');
        const optionTexts = options.map(option => option.textContent);

        expect(optionTexts).toContain("Men's");
        expect(optionTexts).toContain("Women's");
    });

    it('validates .edu email requirement', async () => {
        render(<CoachRegistrationForm onSubmit={mockOnSubmit} />);

        const emailInput = screen.getByLabelText(/email/i);

        fireEvent.change(emailInput, { target: { value: 'coach@gmail.com' } });
        fireEvent.blur(emailInput);

        await waitFor(() => {
            expect(screen.getByText(/please enter a valid \.edu email address/i)).toBeInTheDocument();
        });
    });

    it('accepts valid .edu email', async () => {
        render(<CoachRegistrationForm onSubmit={mockOnSubmit} />);

        const emailInput = screen.getByLabelText(/email/i);

        fireEvent.change(emailInput, { target: { value: 'coach@university.edu' } });
        fireEvent.blur(emailInput);

        await waitFor(() => {
            expect(screen.queryByText(/please enter a valid \.edu email address/i)).not.toBeInTheDocument();
        });
    });

    it('validates required fields on submit', async () => {
        render(<CoachRegistrationForm onSubmit={mockOnSubmit} />);

        const submitButton = screen.getByRole('button', { name: /create coach account/i });

        // Button should be disabled when form is empty
        expect(submitButton).toBeDisabled();
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('validates coaching category is required', async () => {
        render(<CoachRegistrationForm onSubmit={mockOnSubmit} />);

        // Fill in all fields except coaching category
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: exampleEmail } });
        fireEvent.change(document.getElementById('password') as HTMLElement, { target: { value: examplePassword } });
        fireEvent.change(screen.getByLabelText(/primary sport/i), { target: { value: 'basketball' } });
        fireEvent.change(screen.getByLabelText(/university/i), { target: { value: 'State University' } });

        // Button should still be disabled without coaching category
        const submitButton = screen.getByRole('button', { name: /create coach account/i });
        expect(submitButton).toBeDisabled();
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('submits form with valid data including coaching category', async () => {
        mockOnSubmit.mockResolvedValue(undefined);
        render(<CoachRegistrationForm onSubmit={mockOnSubmit} />);

        // Fill in all required fields
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: exampleEmail } });
        fireEvent.change(document.getElementById('password') as HTMLElement, { target: { value: examplePassword } });
        fireEvent.change(screen.getByLabelText(/coaching category/i), { target: { value: 'mens' } });
        fireEvent.change(screen.getByLabelText(/primary sport/i), { target: { value: 'basketball' } });
        fireEvent.change(screen.getByLabelText(/university/i), { target: { value: 'State University' } });

        const submitButton = screen.getByRole('button', { name: /create coach account/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                firstName: 'John',
                lastName: 'Doe',
                email: exampleEmail,
                password: examplePassword,
                coachingCategory: 'mens',
                sports: ['basketball'],
                university: 'State University',
            });
        });
    });

    it('submits form with both primary and secondary sports', async () => {
        mockOnSubmit.mockResolvedValue(undefined);
        render(<CoachRegistrationForm onSubmit={mockOnSubmit} />);

        // Fill in all required fields plus secondary sport
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Jane' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Smith' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane.smith@college.edu' } });
        fireEvent.change(document.getElementById('password') as HTMLElement, { target: { value: 'SecurePass456!' } });
        fireEvent.change(screen.getByLabelText(/coaching category/i), { target: { value: 'womens' } });
        fireEvent.change(screen.getByLabelText(/primary sport/i), { target: { value: 'soccer' } });
        fireEvent.change(screen.getByLabelText(/secondary sport/i), { target: { value: 'volleyball' } });
        fireEvent.change(screen.getByLabelText(/university/i), { target: { value: 'Tech College' } });

        const submitButton = screen.getByRole('button', { name: /create coach account/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@college.edu',
                password: 'SecurePass456!',
                coachingCategory: 'womens',
                sports: ['soccer', 'volleyball'],
                university: 'Tech College',
            });
        });
    });

    it('prevents selecting same sport for primary and secondary', async () => {
        render(<CoachRegistrationForm onSubmit={mockOnSubmit} />);

        fireEvent.change(screen.getByLabelText(/primary sport/i), { target: { value: 'basketball' } });
        fireEvent.change(screen.getByLabelText(/secondary sport/i), { target: { value: 'basketball' } });
        fireEvent.blur(screen.getByLabelText(/secondary sport/i));

        await waitFor(() => {
            expect(screen.getByText(/secondary sport must be different from primary sport/i)).toBeInTheDocument();
        });
    });

    it('disables submit button when form is invalid', () => {
        render(<CoachRegistrationForm onSubmit={mockOnSubmit} />);

        const submitButton = screen.getByRole('button', { name: /create coach account/i });
        expect(submitButton).toBeDisabled();
    });

    it('enables submit button when all required fields are filled', async () => {
        render(<CoachRegistrationForm onSubmit={mockOnSubmit} />);

        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: exampleEmail } });
        fireEvent.change(document.getElementById('password') as HTMLElement, { target: { value: examplePassword } });
        fireEvent.change(screen.getByLabelText(/coaching category/i), { target: { value: 'mens' } });
        fireEvent.change(screen.getByLabelText(/primary sport/i), { target: { value: 'basketball' } });
        fireEvent.change(screen.getByLabelText(/university/i), { target: { value: 'State University' } });

        await waitFor(() => {
            const submitButton = screen.getByRole('button', { name: /create coach account/i });
            expect(submitButton).not.toBeDisabled();
        });
    });

    it('calls onCancel when cancel button is clicked', () => {
        render(<CoachRegistrationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('displays loading state during submission', async () => {
        mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
        render(<CoachRegistrationForm onSubmit={mockOnSubmit} />);

        // Fill in all required fields
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: exampleEmail } });
        fireEvent.change(document.getElementById('password') as HTMLElement, { target: { value: examplePassword } });
        fireEvent.change(screen.getByLabelText(/coaching category/i), { target: { value: 'mens' } });
        fireEvent.change(screen.getByLabelText(/primary sport/i), { target: { value: 'basketball' } });
        fireEvent.change(screen.getByLabelText(/university/i), { target: { value: 'State University' } });

        const submitButton = screen.getByRole('button', { name: /create coach account/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(submitButton).toBeDisabled();
        });
    });

    it('displays error message on submission failure', async () => {
        mockOnSubmit.mockRejectedValue(new Error('Registration failed'));
        render(<CoachRegistrationForm onSubmit={mockOnSubmit} />);

        // Fill in all required fields
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: exampleEmail } });
        fireEvent.change(document.getElementById('password') as HTMLElement, { target: { value: examplePassword } });
        fireEvent.change(screen.getByLabelText(/coaching category/i), { target: { value: 'mens' } });
        fireEvent.change(screen.getByLabelText(/primary sport/i), { target: { value: 'basketball' } });
        fireEvent.change(screen.getByLabelText(/university/i), { target: { value: 'State University' } });

        const submitButton = screen.getByRole('button', { name: /create coach account/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/an error occurred during registration/i)).toBeInTheDocument();
        });
    });
});
