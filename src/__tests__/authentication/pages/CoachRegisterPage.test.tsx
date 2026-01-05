import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CoachRegisterPage } from '@/authentication/pages/CoachRegisterPage';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('CoachRegisterPage', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });
    it('renders the coach registration form', () => {
        render(<CoachRegisterPage />);

        expect(screen.getByText(/coach registration/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/coaching category/i)).toBeInTheDocument();
    });

    it('displays success message after successful registration', async () => {
        render(<CoachRegisterPage />);

        // Fill in all required fields
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john.doe@university.edu' } });
        fireEvent.change(document.getElementById('password') as HTMLElement, { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByLabelText(/coaching category/i), { target: { value: 'mens' } });
        fireEvent.change(screen.getByLabelText(/primary sport/i), { target: { value: 'basketball' } });
        fireEvent.change(screen.getByLabelText(/university/i), { target: { value: 'State University' } });

        const submitButton = screen.getByRole('button', { name: /create coach account/i });
        fireEvent.click(submitButton);

        // Fast-forward through the simulated API call
        jest.advanceTimersByTime(1500);

        await waitFor(() => {
            expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
        });
    });

    it('includes coaching category in registration data', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        render(<CoachRegisterPage />);

        // Fill in all required fields
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

        // Fast-forward through the simulated API call
        jest.advanceTimersByTime(1500);

        await waitFor(() => {
            expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
        });

        // Verify the console.log was called with the correct data including coachingCategory
        expect(consoleSpy).toHaveBeenCalledWith('Coach registration data:', expect.objectContaining({
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@college.edu',
            password: 'SecurePass456!',
            coachingCategory: 'womens',
            sports: ['soccer', 'volleyball'],
            university: 'Tech College',
        }));

        consoleSpy.mockRestore();
    });

    it('displays link to return to login', () => {
        render(<CoachRegisterPage />);

        const loginLink = screen.getByText(/back to login/i);
        expect(loginLink).toBeInTheDocument();
    });
});
