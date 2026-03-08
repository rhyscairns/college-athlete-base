import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import { PlayerRegisterPage } from '@/authentication/pages/PlayerRegisterPage';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock the SplitScreenLayout component
jest.mock('@/authentication/components/SplitScreenLayout', () => ({
    SplitScreenLayout: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="split-screen-layout">
            {children}
        </div>
    ),
}));

// Mock fetch
global.fetch = jest.fn();

describe('PlayerRegisterPage', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
        (global.fetch as jest.Mock).mockClear();
    });

    describe('Page Rendering', () => {
        it('renders page heading', () => {
            render(<PlayerRegisterPage />);

            expect(screen.getByText('Create your account')).toBeInTheDocument();
        });

        it('renders PlayerRegistrationForm', () => {
            render(<PlayerRegisterPage />);

            expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
        });

        it('renders sign in link', () => {
            render(<PlayerRegisterPage />);

            const signInLink = screen.getByText('Sign in');
            expect(signInLink).toBeInTheDocument();
            expect(signInLink.closest('a')).toHaveAttribute('href', '/login');
        });
    });

    describe('Navigation', () => {
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
            // Mock successful API response
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    message: 'Player registered successfully',
                    playerId: '123e4567-e89b-12d3-a456-426614174000',
                }),
            });

            render(<PlayerRegisterPage />);

            await fillValidForm();

            const submitButton = screen.getByRole('button', { name: /create account/i });
            fireEvent.click(submitButton);

            // Wait for the async submission to complete and success message to appear
            await waitFor(() => {
                expect(screen.getByText(/success!/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            expect(screen.getByText(/registration successful! redirecting to login\.\.\./i)).toBeInTheDocument();
        });

        it('redirects to login after successful registration', async () => {
            // Mock successful API response
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    message: 'Player registered successfully',
                    playerId: '123e4567-e89b-12d3-a456-426614174000',
                }),
            });

            render(<PlayerRegisterPage />);

            await fillValidForm();

            const submitButton = screen.getByRole('button', { name: /create account/i });
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

        it('calls API with correct data', async () => {
            // Mock successful API response
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    message: 'Player registered successfully',
                    playerId: '123e4567-e89b-12d3-a456-426614174000',
                }),
            });

            render(<PlayerRegisterPage />);

            await fillValidForm();

            const submitButton = screen.getByRole('button', { name: /create account/i });
            fireEvent.click(submitButton);

            // Wait for API call
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/auth/register/player',
                    expect.objectContaining({
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: expect.any(String),
                    })
                );
            });

            // Verify the body contains correct data with sex instead of gender
            const callArgs = (global.fetch as jest.Mock).mock.calls[0];
            const body = JSON.parse(callArgs[1].body);
            expect(body).toEqual({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!',
                sex: 'male', // Should be sex, not gender
                sport: 'basketball',
                position: 'Point Guard',
                gpa: 3.5,
                country: 'USA',
                state: 'CA',
            });
        });

        it('displays validation errors from API', async () => {
            // Mock API validation error response
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({
                    success: false,
                    errors: [
                        { field: 'email', message: 'Email is already registered' },
                        { field: 'gpa', message: 'GPA must be between 0.0 and 4.0' },
                    ],
                }),
            });

            render(<PlayerRegisterPage />);

            await fillValidForm();

            const submitButton = screen.getByRole('button', { name: /create account/i });
            fireEvent.click(submitButton);

            // Wait for error message to appear
            await waitFor(() => {
                expect(screen.getByText(/registration error/i)).toBeInTheDocument();
            });

            expect(screen.getByText(/email: Email is already registered, gpa: GPA must be between 0\.0 and 4\.0/i)).toBeInTheDocument();
        });

        it('displays duplicate email error', async () => {
            // Mock duplicate email error response
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({
                    success: false,
                    message: 'Email already registered',
                }),
            });

            render(<PlayerRegisterPage />);

            await fillValidForm();

            const submitButton = screen.getByRole('button', { name: /create account/i });
            fireEvent.click(submitButton);

            // Wait for error message to appear
            await waitFor(() => {
                expect(screen.getByText(/registration error/i)).toBeInTheDocument();
            });

            expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
        });

        it('displays network error message', async () => {
            // Mock network error
            (global.fetch as jest.Mock).mockRejectedValueOnce(new TypeError('Failed to fetch'));

            render(<PlayerRegisterPage />);

            await fillValidForm();

            const submitButton = screen.getByRole('button', { name: /create account/i });
            fireEvent.click(submitButton);

            // Wait for error message to appear
            await waitFor(() => {
                expect(screen.getByText(/registration error/i)).toBeInTheDocument();
            });

            expect(screen.getByText(/network error\. please check your connection and try again\./i)).toBeInTheDocument();
        });

        it('displays generic error for unexpected errors', async () => {
            // Mock unexpected error
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Something went wrong'));

            render(<PlayerRegisterPage />);

            await fillValidForm();

            const submitButton = screen.getByRole('button', { name: /create account/i });
            fireEvent.click(submitButton);

            // Wait for error message to appear
            await waitFor(() => {
                expect(screen.getByText(/registration error/i)).toBeInTheDocument();
            });

            expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
        });

        it('clears previous error when submitting again', async () => {
            // First submission fails
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({
                    success: false,
                    message: 'Email already registered',
                }),
            });

            render(<PlayerRegisterPage />);

            await fillValidForm();

            const submitButton = screen.getByRole('button', { name: /create account/i });
            fireEvent.click(submitButton);

            // Wait for error message
            await waitFor(() => {
                expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
            });

            // Second submission succeeds
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    message: 'Player registered successfully',
                    playerId: '123e4567-e89b-12d3-a456-426614174000',
                }),
            });

            // Change email and submit again
            fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new.email@example.com' } });
            fireEvent.click(submitButton);

            // Error should be cleared and success message should appear
            await waitFor(() => {
                expect(screen.queryByText(/email already registered/i)).not.toBeInTheDocument();
                expect(screen.getByText(/success!/i)).toBeInTheDocument();
            });
        });
    });

    describe('Layout', () => {
        it('renders with SplitScreenLayout', () => {
            render(<PlayerRegisterPage />);

            expect(screen.getByTestId('split-screen-layout')).toBeInTheDocument();
        });
    });
});
