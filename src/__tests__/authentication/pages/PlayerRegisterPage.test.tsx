import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import { PlayerRegisterPage } from '@/authentication/pages/PlayerRegisterPage';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('PlayerRegisterPage', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
    });

    describe('Page Rendering', () => {
        it('renders page title', () => {
            render(<PlayerRegisterPage />);

            expect(screen.getByText(/player registration/i)).toBeInTheDocument();
        });

        it('renders PlayerRegistrationForm', () => {
            render(<PlayerRegisterPage />);

            expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /create player account/i })).toBeInTheDocument();
        });

        it('renders back to login link', () => {
            render(<PlayerRegisterPage />);

            expect(screen.getByText(/back to login/i)).toBeInTheDocument();
        });
    });

    describe('Navigation', () => {
        it('navigates to login when back to login link is clicked', () => {
            render(<PlayerRegisterPage />);

            const backLink = screen.getByText(/back to login/i);
            fireEvent.click(backLink);

            expect(mockPush).toHaveBeenCalledWith('/login');
        });

        it('navigates to login when cancel button is clicked', () => {
            render(<PlayerRegisterPage />);

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            expect(mockPush).toHaveBeenCalledWith('/login');
        });
    });

    describe('Form Submission', () => {
        const fillValidForm = async () => {
            fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
            fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
            fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } });
            fireEvent.change(document.getElementById('password') as HTMLInputElement, { target: { value: 'Password123!' } });
            fireEvent.change(screen.getByLabelText(/sex/i), { target: { value: 'male' } });
            fireEvent.change(screen.getByLabelText(/sport/i), { target: { value: 'basketball' } });
            fireEvent.change(screen.getByLabelText(/position/i), { target: { value: 'Point Guard' } });
            fireEvent.change(screen.getByLabelText(/gpa/i), { target: { value: '3.5' } });
            fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'USA' } });

            await waitFor(() => {
                expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
            });

            fireEvent.change(screen.getByLabelText(/state/i), { target: { value: 'CA' } });
        };

        it('displays success message after successful registration', async () => {
            render(<PlayerRegisterPage />);

            await fillValidForm();

            const submitButton = screen.getByRole('button', { name: /create player account/i });
            fireEvent.click(submitButton);

            // Wait for the async submission to complete and success message to appear
            await waitFor(() => {
                expect(screen.getByText(/success!/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            expect(screen.getByText(/registration successful! redirecting to login\.\.\./i)).toBeInTheDocument();
        });

        it('redirects to login after successful registration', async () => {
            render(<PlayerRegisterPage />);

            await fillValidForm();

            const submitButton = screen.getByRole('button', { name: /create player account/i });
            fireEvent.click(submitButton);

            // Wait for success message
            await waitFor(() => {
                expect(screen.getByText(/success!/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            // Wait for redirect (2 seconds after success message)
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/login');
            }, { timeout: 3000 });
        });

        it('handles form submission successfully', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            render(<PlayerRegisterPage />);

            await fillValidForm();

            const submitButton = screen.getByRole('button', { name: /create player account/i });
            fireEvent.click(submitButton);

            // Wait for success message which indicates submission was successful
            await waitFor(() => {
                expect(screen.getByText(/success!/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            // Verify console.log was called with registration data
            expect(consoleSpy).toHaveBeenCalledWith(
                'Player registration data:',
                expect.objectContaining({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    password: 'Password123!',
                    gender: 'male',
                    sport: 'basketball',
                    position: 'Point Guard',
                    gpa: 3.5,
                    country: 'USA',
                    state: 'CA',
                })
            );

            consoleSpy.mockRestore();
        });
    });

    describe('Styling Consistency', () => {
        it('uses consistent background with login page', () => {
            const { container } = render(<PlayerRegisterPage />);

            const backgroundDiv = container.querySelector('.bg-sky-200');
            expect(backgroundDiv).toBeInTheDocument();
        });

        it('uses consistent form styling', () => {
            const { container } = render(<PlayerRegisterPage />);

            const form = container.querySelector('form');
            expect(form).toHaveClass('bg-white/90', 'rounded-3xl', 'shadow-2xl');
        });
    });
});
